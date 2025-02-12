from flask import Blueprint, request, jsonify, render_template
from app.models import OutrasReunioes, db
from datetime import datetime


# Criação do Blueprint
outras_reunioes_bp = Blueprint('outras_reunioes', __name__)

# Função para converter data no formato dd/mm/yyyy para yyyy-mm-dd
def converter_data(data_str):
    try:
        return datetime.strptime(data_str, '%d/%m/%Y').date()  # Retorna um objeto date
    except ValueError:
        raise ValueError("Formato de data inválido. Use dd/mm/yyyy.")

# Rota para exibir a página
@outras_reunioes_bp.route('/outras_reunioes', methods=['GET'])
def pagina_outras_reunioes():
    return render_template('outras_reunioes.html')

# Rota para listar as reuniões
@outras_reunioes_bp.route('/outras_reunioes/listar', methods=['GET'])
def listar_reunioes():
    reunioes = OutrasReunioes.query.order_by(OutrasReunioes.data.asc()).all()
    return jsonify([reuniao.to_dict() for reuniao in reunioes])

# Rota para criar uma nova reunião
@outras_reunioes_bp.route('/outras_reunioes/criar', methods=['POST'])
def criar_reuniao():
    try:
        data = request.json

        # Validação e conversão da data recebida em dd/mm/yyyy para yyyy-mm-dd
        try:
            data_formatada = datetime.strptime(data['data'], '%d/%m/%Y').date()
        except ValueError:
            return jsonify({'success': False, 'error': 'Formato de data inválido. Use dd/mm/yyyy.'})

        # Validação e conversão da hora
        try:
            hora_formatada = datetime.strptime(data['hora'], '%H:%M').time()
        except ValueError:
            return jsonify({'success': False, 'error': 'Formato de hora inválido. Use HH:MM.'})

        # Convertendo para strings para evitar erro de tipo no SQLite
        data_str = data_formatada.strftime('%Y-%m-%d')
        hora_str = hora_formatada.strftime('%H:%M:%S')

        # Criação do registro
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

        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

    
# Rota para excluir uma reunião
@outras_reunioes_bp.route('/outras_reunioes/excluir/<int:id>', methods=['DELETE'])
def excluir_reuniao(id):
    reuniao = OutrasReunioes.query.get_or_404(id)
    db.session.delete(reuniao)
    db.session.commit()
    return jsonify({'success': True})

