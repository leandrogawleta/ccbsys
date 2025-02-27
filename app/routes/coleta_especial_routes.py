from flask import Blueprint, request, jsonify, render_template
from app import db
from app.models import ColetaEspecial, Igreja
from datetime import datetime

coleta_especial_bp = Blueprint('coleta_especial', __name__)

# ✅ Página principal
@coleta_especial_bp.route('/coletas_especial', methods=['GET'])
def pagina_coletas_especial():
    return render_template('coletas_especial.html')

# ✅ Criar Coleta Especial
@coleta_especial_bp.route('/coletas_especial', methods=['POST'])
def criar_coleta_especial():
    try:
        data = request.json
        if not data.get('data') or not data.get('hora') or not data.get('local'):
            return jsonify({'success': False, 'error': 'Todos os campos são obrigatórios!'}), 400

        # Formatação da data para o banco de dados
        data_formatada = datetime.strptime(data['data'], '%d/%m/%Y').strftime('%Y-%m-%d')
        nova_coleta = ColetaEspecial(
            data=data_formatada,
            hora=data['hora'],
            local=data['local'],
            atendente=data.get('atendente', '')
        )
        db.session.add(nova_coleta)
        db.session.commit()

        return jsonify({'success': True, 'message': 'Coleta Especial cadastrada com sucesso!'}), 201
    except Exception as e:
        print(f"Erro ao criar coleta especial: {e}")
        return jsonify({'success': False, 'error': 'Erro interno do servidor.'}), 500

# ✅ Editar Coleta Especial
@coleta_especial_bp.route('/coletas_especial/<int:id>/editar', methods=['PUT'])
def editar_coleta_especial(id):
    try:
        coleta = ColetaEspecial.query.get_or_404(id)
        data = request.json

        if 'data' not in data or not data['data'].strip():
            return jsonify({'success': False, 'error': 'A data é obrigatória!'}), 400

        # 🚀 Aceitar datas nos formatos "YYYY-MM-DD" e "DD/MM/YYYY"
        try:
            if '-' in data['data']:  # Se for no formato "YYYY-MM-DD"
                data_formatada = datetime.strptime(data['data'], '%Y-%m-%d').strftime('%Y-%m-%d')
            else:  # Se for no formato "DD/MM/YYYY"
                data_formatada = datetime.strptime(data['data'], '%d/%m/%Y').strftime('%Y-%m-%d')
        except ValueError:
            return jsonify({'success': False, 'error': 'Formato de data inválido!'}), 400

        coleta.data = data_formatada
        coleta.hora = data.get('hora', '')
        coleta.local = data.get('local', '')
        coleta.atendente = data.get('atendente', '')

        db.session.commit()
        return jsonify({'success': True, 'message': 'Coleta Especial atualizada com sucesso!'})

    except Exception as e:
        print(f"Erro ao editar coleta especial: {e}")
        return jsonify({'success': False, 'error': 'Erro interno do servidor.'}), 500

# ✅ Excluir Coleta Especial
@coleta_especial_bp.route('/coletas_especial/<int:id>/deletar', methods=['DELETE'])
def excluir_coleta_especial(id):
    try:
        coleta = ColetaEspecial.query.get_or_404(id)
        db.session.delete(coleta)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Coleta Especial excluída com sucesso!'})
    except Exception as e:
        print(f"Erro ao excluir coleta especial: {e}")
        return jsonify({'success': False, 'error': 'Erro interno do servidor.'}), 500

# ✅ Listar Coletas Especiais
@coleta_especial_bp.route('/coletas_especial/listar', methods=['GET'])
def listar_coletas_especial():
    try:
        coletas = ColetaEspecial.query.order_by(ColetaEspecial.data.asc()).all()
        resultado = []

        for coleta in coletas:
            try:
                if isinstance(coleta.data, str):
                    data_formatada = datetime.strptime(coleta.data, '%Y-%m-%d').strftime('%d/%m/%Y')
                else:
                    data_formatada = coleta.data.strftime('%d/%m/%Y')
            except ValueError:
                data_formatada = coleta.data

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
        return jsonify({'error': 'Erro interno do servidor.'}), 500

# ✅ Listar Igrejas para o campo "Local"
@coleta_especial_bp.route('/igrejas/listar', methods=['GET'])
def listar_igrejas():
    try:
        igrejas = Igreja.query.all()
        resultado = [{'id': igreja.id, 'nome': igreja.Nome} for igreja in igrejas]
        return jsonify(resultado), 200
    except Exception as e:
        print(f"Erro ao listar igrejas: {e}")
        return jsonify({'error': 'Erro interno do servidor.'}), 500


# ✅ Obter uma coleta pelo ID (necessário para edição)
@coleta_especial_bp.route('/coletas_especial/<int:id>', methods=['GET'])
def obter_coleta_especial(id):
    try:
        coleta = ColetaEspecial.query.get_or_404(id)

        # 🚀 Verificação antes de formatar a data para evitar o erro
        if isinstance(coleta.data, str):
            data_formatada = coleta.data  # Se já for string, mantém como está
        else:
            data_formatada = coleta.data.strftime('%d/%m/%Y')  # Converte se for datetime
        
        return jsonify({
            'id': coleta.id,
            'data': data_formatada,
            'hora': coleta.hora,
            'local': coleta.local,
            'atendente': coleta.atendente
        }), 200
    except Exception as e:
        print(f"Erro ao obter coleta especial: {e}")
        return jsonify({'error': 'Erro interno do servidor.'}), 500


