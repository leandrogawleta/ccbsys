from flask import Blueprint, request, jsonify, render_template
from app.models import OutrasReunioes, db, Natureza
from datetime import datetime, date

# Criação do Blueprint
outras_reunioes_bp = Blueprint('outras_reunioes', __name__)

# 🔹 Função para converter data de dd/mm/yyyy para yyyy-mm-dd
def converter_data(data_str):
    try:
        return datetime.strptime(data_str, '%d/%m/%Y').date()  # Retorna um objeto date
    except ValueError:
        raise ValueError("Formato de data inválido. Use dd/mm/yyyy.")

# 🔹 Função para converter hora de HH:MM para objeto time
def converter_hora(hora_str):
    try:
        return datetime.strptime(hora_str, '%H:%M').time()  # Retorna um objeto time
    except ValueError:
        raise ValueError("Formato de hora inválido. Use HH:MM.")

# 🔹 Página principal de Outras Reuniões
@outras_reunioes_bp.route('/outras_reunioes', methods=['GET'])
def pagina_outras_reunioes():
    return render_template('outras_reunioes.html')

# 🔹 Rota para listar reuniões (ordenadas corretamente)
@outras_reunioes_bp.route('/outras_reunioes/listar', methods=['GET'])
def listar_reunioes():
    reunioes = OutrasReunioes.query.order_by(OutrasReunioes.data.asc(), OutrasReunioes.hora.asc()).all()
    reunioes_formatadas = [
        {
            "id": r.id,
            "data": r.data.strftime('%Y-%m-%d'),  # Converte para yyyy-mm-dd
            "hora": formatar_hora(r.hora),  # ✅ Convertendo hora para string
            "tipo": r.tipo,
            "local": r.local,
            "atendimento": r.atendimento,
            "obs": r.obs
        }
        for r in reunioes
    ]
    return jsonify(reunioes_formatadas)

# 🔹 Rota para criar uma nova reunião
@outras_reunioes_bp.route('/outras_reunioes/criar', methods=['POST'])
def criar_reuniao():
    try:
        data = request.json

        # 🔥 Se um ID for enviado na requisição, bloquear a inserção
        if 'id' in data and data['id']:
            return jsonify({'success': False, 'error': 'Tentativa de sobrescrever registro!'}), 400

        # 🔹 Converter data e hora
        data_formatada = converter_data(data['data'])
        hora_formatada = converter_hora(data['hora'])

        # 🔹 Verificar se a natureza existe
        natureza = Natureza.query.get(data['tipo'])
        if not natureza:
            return jsonify({'success': False, 'error': 'Natureza não encontrada!'}), 400

        nova_reuniao = OutrasReunioes(
            data=data_formatada.strftime('%Y-%m-%d'),
            hora=hora_formatada.strftime('%H:%M:%S'),
            local=data['local'],
            atendimento=data.get('atendimento', ''),
            tipo=natureza.descricao,  # Armazena a descrição na tabela OutrasReunioes
            obs=data.get('obs', '')
        )

        db.session.add(nova_reuniao)
        db.session.commit()

        return jsonify({'success': True, 'message': 'Reunião cadastrada com sucesso!'})

    except Exception as e:
        print(f"Erro ao criar reunião: {e}")
        return jsonify({'success': False, 'error': 'Erro interno do servidor'}), 500


# 🔹 Rota para excluir reunião
@outras_reunioes_bp.route('/outras_reunioes/<int:id>/excluir', methods=['DELETE'])
def excluir_reuniao(id):
    try:
        reuniao = OutrasReunioes.query.get_or_404(id)
        db.session.delete(reuniao)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Reunião excluída com sucesso!'})
    
    except Exception as e:
        return jsonify({'success': False, 'error': f"Erro ao excluir reunião: {str(e)}"}), 500


# 🔹 Função para formatar a data corretamente
def formatar_data(data):
    if isinstance(data, date):  # Se for objeto `date`
        return data.strftime('%d/%m/%Y')
    elif isinstance(data, str):  # Se for string, tenta converter
        try:
            return datetime.strptime(data, '%Y-%m-%d').strftime('%d/%m/%Y')
        except ValueError:
            return "Sem Data"
    return "Sem Data"

# ✅ Corrigindo erro de serialização da hora
def formatar_hora(hora):
    return hora.strftime('%H:%M') if hora else "00:00"

# 🔹 Rota para obter uma reunião específica (usada para edição)
@outras_reunioes_bp.route('/outras_reunioes/<int:id>', methods=['GET'])
def obter_reuniao(id):
    reuniao = OutrasReunioes.query.get(id)
    if not reuniao:
        return jsonify({'success': False, 'error': 'Reunião não encontrada'}), 404

    # 🔹 Buscar o ID da natureza correspondente pela descrição armazenada
    natureza = Natureza.query.filter_by(descricao=reuniao.tipo).first()
    natureza_id = natureza.id if natureza else None  # Retorna None se não encontrar

    return jsonify({
        "id": reuniao.id,
        "data": reuniao.data.strftime('%Y-%m-%d'),
        "hora": reuniao.hora.strftime('%H:%M') if reuniao.hora else "00:00",
        "local": reuniao.local,
        "atendimento": reuniao.atendimento,
        "tipo": natureza_id,  # Retorna o ID da natureza
        "obs": reuniao.obs
    })


# 🔹 Rota para editar uma reunião
@outras_reunioes_bp.route('/outras_reunioes/<int:id>/editar', methods=['PUT'])
def editar_reuniao(id):
    try:
        reuniao = OutrasReunioes.query.get_or_404(id)
        data = request.json

        # Converter data e hora para os formatos corretos
        reuniao.data = converter_data(data['data'])
        reuniao.hora = converter_hora(data['hora'])
        reuniao.local = data['local']
        reuniao.atendimento = data.get('atendimento', '')

        # 🔥 Buscar a descrição da natureza pelo ID
        natureza = Natureza.query.get(data['tipo'])
        if not natureza:
            return jsonify({'success': False, 'error': 'Natureza não encontrada!'}), 400

        reuniao.tipo = natureza.descricao  # Armazena a descrição na tabela OutrasReunioes
        reuniao.obs = data.get('obs', '')

        db.session.commit()
        return jsonify({'success': True, 'message': 'Reunião atualizada com sucesso!'})

    except Exception as e:
        return jsonify({'success': False, 'error': f"Erro ao editar reunião: {str(e)}"}), 500

    
    # 🔹 Rota para listar naturezas (para preencher o campo "Tipo")
@outras_reunioes_bp.route('/natureza/listar', methods=['GET'])
def listar_naturezas():
    try:
        naturezas = Natureza.query.all()
        resultado = [{'id': nat.id, 'descricao': nat.descricao} for nat in naturezas]
        return jsonify(resultado), 200
    except Exception as e:
        print(f"Erro ao listar naturezas: {e}")
        return jsonify({'error': 'Erro ao obter naturezas'}), 500

