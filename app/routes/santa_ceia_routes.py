from flask import Blueprint, render_template, request, jsonify
from app import db
from app.models import SantaCeia
from datetime import datetime

# Definindo o Blueprint
santa_ceia_bp = Blueprint('santa_ceia', __name__)

# Rota para a página Santa Ceia
@santa_ceia_bp.route('/santa_ceia')
def pagina_santa_ceia():
    return render_template('santa_ceia.html')

# Rota para listar todas as Santa Ceias
# Rota para listar todas as Santa Ceias
@santa_ceia_bp.route('/santa_ceia/listar', methods=['GET'])
def listar_santa_ceia():
    registros = SantaCeia.query.order_by(SantaCeia.data.asc()).all()

    def formatar_hora(hora_str):
        if not hora_str:
            return None  # Retorna None se estiver vazio
        try:
            # Verifica e formata a hora no formato HH:MM
            return datetime.strptime(hora_str, '%H:%M:%S').strftime('%H:%M')
        except ValueError:
            # Caso o formato seja HH:MM (sem segundos), retorna diretamente
            if ':' in hora_str and len(hora_str.split(':')) == 2:
                return hora_str
            return None  # Retorna None se não puder corrigir

    return jsonify([{
        'id': registro.id,
        'data': datetime.strptime(registro.data, '%Y-%m-%d').strftime('%d/%m/%Y') if registro.data else None,
        'hora': formatar_hora(registro.hora),  # Formata a hora corretamente
        'local': registro.local,
        'atendimento': registro.atendimento
    } for registro in registros])

# Rota para criar um novo registro de Santa Ceia
@santa_ceia_bp.route('/santa_ceia/criar', methods=['POST'])
def criar_santa_ceia():
    try:
        data = request.json  # Dados recebidos no formato JSON
        # Converte a data do formato dd/mm/yyyy para o formato do banco (yyyy-mm-dd)
        data_convertida = datetime.strptime(data['data'], '%d/%m/%Y').strftime('%Y-%m-%d')

        nova_ceia = SantaCeia(
            data=data_convertida,
            hora=data['hora'],  # Assume que a hora já está no formato HH:mm
            local=data['local'],
            atendimento=data['atendimento']
        )
        db.session.add(nova_ceia)
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        print(f"Erro ao criar Santa Ceia: {e}")  # Loga o erro no console do servidor
        return jsonify({'success': False, 'error': str(e)}), 500

# Rota para excluir um registro de Santa Ceia
@santa_ceia_bp.route('/santa_ceia/excluir/<int:id>', methods=['DELETE'])
def excluir_santa_ceia(id):
    ceia = SantaCeia.query.get_or_404(id)
    db.session.delete(ceia)
    db.session.commit()
    return jsonify({'success': True})