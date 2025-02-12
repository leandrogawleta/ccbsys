from flask import Blueprint, request, jsonify, render_template
from app import db
from app.models import ColetaEspecial
from datetime import datetime

coleta_especial_bp = Blueprint('coleta_especial', __name__)

# Página Coleta Especial
@coleta_especial_bp.route('/coletas_especial', methods=['GET'])
def pagina_coletas_especial():
    return render_template('coletas_especial.html')

# CRUD

@coleta_especial_bp.route('/coleta_especial/criar', methods=['POST'])
def criar_coleta():
    data = request.json
    nova_coleta = ColetaEspecial(
        data=data['data'],
        hora=data['hora'],
        local=data['local'],
        atendente=data['atendente']
    )
    db.session.add(nova_coleta)
    db.session.commit()
    return jsonify({'success': True})

# Editar Coleta Especial
@coleta_especial_bp.route('/coletas_especial/<int:id>/editar', methods=['PUT'])
def editar_coleta_especial(id):
    coleta = ColetaEspecial.query.get_or_404(id)
    data = request.json
    coleta.data = data['data']
    coleta.hora = data.get('hora')
    coleta.local = data['local']
    coleta.atendente = data.get('atendente')
    db.session.commit()
    return jsonify({'success': True})

@coleta_especial_bp.route('/coleta_especial/excluir/<int:id>', methods=['DELETE'])
def excluir_coleta(id):
    coleta = ColetaEspecial.query.get_or_404(id)
    db.session.delete(coleta)
    db.session.commit()
    return jsonify({'success': True})


# Listar Coletas Especiais
@coleta_especial_bp.route('/coletas_especial/listar', methods=['GET'])
def listar_coletas_especial():
    try:
        coletas = ColetaEspecial.query.order_by(ColetaEspecial.data.asc()).all()
        resultado = []
        for coleta in coletas:
            # Converte o formato da data de dd/mm/yyyy para yyyy-mm-dd
            data_formatada = datetime.strptime(coleta.data, '%d/%m/%Y').strftime('%Y-%m-%d') if coleta.data else None
            resultado.append({
                'id': coleta.id,
                'data': data_formatada,
                'hora': coleta.hora,
                'local': coleta.local,
                'atendente': coleta.atendente
            })
        return jsonify(resultado), 200
    except Exception as e:
        print(f"Erro ao listar coletas especiais: {e}")
        return jsonify({'error': str(e)}), 500




# Adicionar Coleta Especial
@coleta_especial_bp.route('/coletas_especial', methods=['POST'])
def adicionar_coleta_especial():
    data = request.json
    nova_coleta = ColetaEspecial(
        data=data['data'],
        hora=data.get('hora'),
        local=data['local'],
        atendente=data.get('atendente')
    )
    db.session.add(nova_coleta)
    db.session.commit()
    return jsonify({'success': True})

# Excluir Coleta Especial
@coleta_especial_bp.route('/coletas_especial/<int:id>/deletar', methods=['POST'])
def excluir_coleta_especial(id):
    coleta = ColetaEspecial.query.get_or_404(id)
    db.session.delete(coleta)
    db.session.commit()
    return jsonify({'success': True})
