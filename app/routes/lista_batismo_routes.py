from flask import Blueprint, jsonify, render_template, current_app, request
from app import db
from sqlalchemy.sql import text
from app.models import Reuniao, ReuniaoData, OutrasReunioes, RSDItem
from datetime import datetime, date, time
from pytz import timezone

BR_TZ = timezone("America/Sao_Paulo")

# Define o Blueprint
lista_batismo_bp = Blueprint('lista_batismo', __name__)

# ==========================
# 🔹 Funções de Formatação
# ==========================
def formatar_data(data):
    """Formata a data para dd/mm/yyyy."""
    if isinstance(data, str):
        try:
            data = datetime.strptime(data, "%Y-%m-%d").date()
        except ValueError:
            return data
    return data.strftime('%d/%m/%Y') if isinstance(data, (datetime, date)) else data

def formatar_hora(hora):
    """Formata a hora para HH:MM (24h)."""
    if isinstance(hora, str):
        try:
            hora = datetime.strptime(hora, "%H:%M:%S").time()
        except ValueError:
            return hora
    return hora.strftime('%H:%M') if isinstance(hora, time) else hora

# ==========================
# 🔹 Rota Principal - Exibir Página
# ==========================
@lista_batismo_bp.route("/", methods=["GET"])
def listar_batismos_page():
    try:
        # 🔹 Buscar registros das tabelas existentes
        batismos = consulta_registros("Batismo")
        ensaios = consulta_registros("Ensaio Regional")
        mocidade = consulta_registros("Reunião da Mocidade")
        ministerial = consulta_registros("Reunião Ministerial")
        outras_reunioes = get_outras_reunioes()

        # 🔹 Buscar registros de RSDItem onde lb = 'Sim'
        registros_rsd = RSDItem.query.filter(RSDItem.lb == 'Sim').order_by(RSDItem.data, RSDItem.hora).all()

        # 🔹 Criar conjunto para evitar duplicação na lista final
        registros_adicionados = set()

        # ✅ Garantir que todos os tipos de reuniões sejam adicionados
        for registro in registros_rsd:
            chave = (
                formatar_data(registro.data), 
                formatar_hora(registro.hora), 
                registro.tipo, 
                registro.igreja, 
                registro.atendimento
            )

            if chave not in registros_adicionados:
                registro_formatado = {
                    "data": formatar_data(registro.data),
                    "hora": formatar_hora(registro.hora),
                    "natureza": registro.descricao,
                    "local": registro.igreja,
                    "atendimento": registro.atendimento
                }

                # ✅ Adicionar o registro ao seu tipo correspondente
                if registro.tipo == "Batismo":
                    batismos.append(registro_formatado)
                elif registro.tipo == "Ensaios Regionais":
                    ensaios.append(registro_formatado)
                elif registro.tipo == "Reunião da Mocidade":
                    mocidade.append(registro_formatado)
                elif registro.tipo == "Reunião Ministerial":
                    ministerial.append(registro_formatado)
                else:
                    outras_reunioes.append(registro_formatado)

                registros_adicionados.add(chave)  # Marca o registro como adicionado

        return render_template(
            "lista_batismo.html",
            batismos=batismos,
            ensaios=ensaios,
            mocidade=mocidade,
            ministerial=ministerial,
            outras_reunioes=outras_reunioes,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==========================
# 🔹 Rota para Filtrar Registros
# ==========================
@lista_batismo_bp.route('/filtrar', methods=['GET'])
def filtrar_registros():
    try:
        data_inicio = request.args.get('dataInicio')
        data_fim = request.args.get('dataFim')

        if not data_inicio or not data_fim:
            return jsonify({'error': 'Datas inválidas.'}), 400

        data_inicio = datetime.strptime(data_inicio, '%d/%m/%Y')
        data_fim = datetime.strptime(data_fim, '%d/%m/%Y')

        def buscar_registros(tipo):
            registros_reuniao = db.session.query(
                ReuniaoData.data,
                ReuniaoData.hora,
                Reuniao.natureza,
                Reuniao.local,
                ReuniaoData.atendimento
            ).join(Reuniao).filter(
                Reuniao.tipo == tipo,
                ReuniaoData.data.between(data_inicio, data_fim),
                Reuniao.lb == 'V'
            ).order_by(ReuniaoData.data, ReuniaoData.hora).all()

            registros_rsd = db.session.query(
                RSDItem.data,
                RSDItem.hora,
                RSDItem.descricao.label("natureza"),  # Agora carrega "descricao"
                RSDItem.igreja.label("local"),
                RSDItem.atendimento
            ).filter(
                RSDItem.tipo == tipo,
                RSDItem.lb == 'Sim',
                RSDItem.data.between(data_inicio, data_fim)
            ).order_by(RSDItem.data, RSDItem.hora).all()

            registros = registros_reuniao + registros_rsd
            registros.sort(key=lambda reg: (reg.data, reg.hora))

            return [
                {
                    'data': formatar_data(reg.data),
                    'hora': formatar_hora(reg.hora),
                    'natureza': reg.natureza,
                    'local': reg.local,
                    'atendimento': reg.atendimento
                } for reg in registros
            ]

        return jsonify({
            'batismos': buscar_registros('Batismo'),
            'ensaios': buscar_registros('Ensaio Regional'),
            'mocidade': buscar_registros('Reunião de Mocidade'),
            'ministerial': buscar_registros('Reunião Ministerial')
        })

    except Exception as e:
        current_app.logger.error(f"Erro na rota '/filtrar': {e}")
        return jsonify({'error': str(e)}), 500

# ==========================
# 🔹 Função Auxiliar - Consulta Registros por Tipo
# ==========================
def consulta_registros(tipo):
    """Consulta registros nas tabelas ReuniaoData e RSDItem."""
    try:
        registros_reuniao = db.session.query(
            ReuniaoData.data,
            ReuniaoData.hora,
            Reuniao.natureza,
            Reuniao.local,
            ReuniaoData.atendimento
        ).join(Reuniao).filter(
            Reuniao.tipo == tipo,
            Reuniao.lb == 'V'
        ).order_by(ReuniaoData.data, ReuniaoData.hora).all()

        registros = []
        registros_adicionados = set()

        # ✅ Adicionar registros de ReuniaoData sem duplicar
        for reg in registros_reuniao:
            chave = (formatar_data(reg.data), formatar_hora(reg.hora), reg.natureza, reg.local, reg.atendimento)
            if chave not in registros_adicionados:
                registros.append({
                    'data': formatar_data(reg.data),
                    'hora': formatar_hora(reg.hora),
                    'natureza': reg.natureza,
                    'local': reg.local,
                    'atendimento': reg.atendimento
                })
                registros_adicionados.add(chave)

        return registros

    except Exception as e:
        current_app.logger.error(f"Erro ao consultar registros de tipo {tipo}: {e}")
        return []

# ==========================
# 🔹 Função Auxiliar - Outras Reuniões
# ==========================
def get_outras_reunioes():
    """Consulta registros da tabela OutrasReunioes."""
    try:
        outras_reunioes = db.session.query(
            OutrasReunioes.data,
            OutrasReunioes.hora,
            OutrasReunioes.local,
            OutrasReunioes.atendimento,
            OutrasReunioes.tipo,
            OutrasReunioes.obs
        ).all()

        return [
            {
                'data': formatar_data(reuniao.data),
                'hora': formatar_hora(reuniao.hora),
                'natureza': f"{reuniao.tipo or ''} - {reuniao.obs or ''}".strip(" - "),
                'local': reuniao.local,
                'atendimento': reuniao.atendimento
            }
            for reuniao in outras_reunioes
        ]

    except Exception as e:
        current_app.logger.error(f"Erro ao consultar Outras Reuniões: {e}")
        return []

# ==========================
# 🔹 Função Auxiliar - Outras Reuniões
# ==========================
def get_outras_reunioes():
    """Consulta registros da tabela OutrasReunioes."""
    try:
        outras_reunioes = db.session.query(
            OutrasReunioes.data,
            OutrasReunioes.hora,
            OutrasReunioes.local,
            OutrasReunioes.atendimento,
            OutrasReunioes.tipo,
            OutrasReunioes.obs
        ).all()

        return [
            {
                'data': formatar_data(reuniao.data),
                'hora': formatar_hora(reuniao.hora),
                'natureza': f"{reuniao.tipo or ''} - {reuniao.obs or ''}".strip(" - "),
                'local': reuniao.local,
                'atendimento': reuniao.atendimento
            }
            for reuniao in outras_reunioes
        ]

    except Exception as e:
        current_app.logger.error(f"Erro ao consultar Outras Reuniões: {e}")
        return []

