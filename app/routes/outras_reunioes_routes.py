from flask import Blueprint, request, jsonify, render_template
from app.models import OutrasReunioes, db
from datetime import datetime

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
            "data": formatar_data(r.data),  # 🔹 Agora a conversão sempre retorna dd/mm/yyyy
            "hora": r.hora.strftime('%H:%M') if isinstance(r.hora, datetime) else r.hora,  # Corrigindo hora
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

        # 🔹 Validação e conversão da data e hora
        data_formatada = converter_data(data['data'])
        hora_formatada = converter_hora(data['hora'])

        # 🔹 Convertendo para strings (evita erro no SQLite)
        data_str = data_formatada.strftime('%Y-%m-%d')
        hora_str = hora_formatada.strftime('%H:%M:%S')

        # 🔹 Criando e salvando a nova reunião
        nova_reuniao = OutrasReunioes(
            data=data_str,
            hora=hora_str,
            local=data['local'],
            atendimento=data.get('atendimento', ''),
            tipo=data['tipo'],
            obs=data.get('obs', '')
        )

        db.session.add(nova_reuniao)
        db.session.commit()

        return jsonify({'success': True, 'message': 'Reunião cadastrada com sucesso!'})
    
    except ValueError as ve:
        return jsonify({'success': False, 'error': str(ve)}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': f"Erro interno: {str(e)}"}), 500

# 🔹 Rota para excluir uma reunião
@outras_reunioes_bp.route('/outras_reunioes/excluir/<int:id>', methods=['DELETE'])
def excluir_reuniao(id):
    try:
        reuniao = OutrasReunioes.query.get_or_404(id)
        db.session.delete(reuniao)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Reunião excluída com sucesso!'})
    
    except Exception as e:
        return jsonify({'success': False, 'error': f"Erro ao excluir: {str(e)}"}), 500


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