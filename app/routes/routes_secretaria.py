from flask import Blueprint, request, jsonify
from app import db
from app.models import Igreja, Natureza

# Criando o Blueprint
bp = Blueprint("secretaria", __name__, url_prefix="/secretaria")

# ==============================
# 📌 CRUD - IGREJAS
# ==============================

@bp.route("/igrejas", methods=["GET"])
def listar_igrejas():
    """Retorna todas as igrejas cadastradas"""
    igrejas = Igreja.query.all()
    return jsonify([
        {"id": i.id, "nome": i.Nome, "cidade": i.Cidade, "setor": i.Setor, "endereco": i.Endereco or ""}
        for i in igrejas
    ])

@bp.route("/igreja", methods=["POST"])
def criar_igreja():
    """Cria uma nova igreja"""
    data = request.get_json()  # ✅ Garante que os dados sejam recebidos corretamente

    # 🔹 Verifica se os campos necessários foram preenchidos
    nome = data.get("nome")
    cidade = data.get("cidade")
    setor = data.get("setor")
    endereco = data.get("endereco", "")

    if not nome or not cidade or not setor:
        return jsonify({"error": "⚠️ Nome, cidade e setor são obrigatórios!"}), 400

    try:
        nova_igreja = Igreja(Nome=nome, Cidade=cidade, Setor=setor, Endereco=endereco)
        db.session.add(nova_igreja)
        db.session.commit()
        return jsonify({"message": "✅ Igreja cadastrada com sucesso!"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"❌ Erro ao cadastrar igreja: {str(e)}"}), 500

@bp.route("/igreja/<int:id>", methods=["PUT"])
def editar_igreja(id):
    """Edita uma igreja existente"""
    igreja = Igreja.query.get(id)
    if not igreja:
        return jsonify({"error": "❌ Igreja não encontrada!"}), 404

    data = request.json
    igreja.Nome = data.get("nome", igreja.Nome)
    igreja.Cidade = data.get("cidade", igreja.Cidade)
    igreja.Setor = data.get("setor", igreja.Setor)
    igreja.Endereco = data.get("endereco", igreja.Endereco)

    try:
        db.session.commit()
        return jsonify({"message": "✅ Igreja atualizada com sucesso!"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"❌ Erro ao atualizar igreja: {str(e)}"}), 500

@bp.route("/igreja/<int:id>", methods=["DELETE"])
def excluir_igreja(id):
    """Exclui uma igreja"""
    igreja = Igreja.query.get(id)
    if not igreja:
        return jsonify({"error": "❌ Igreja não encontrada!"}), 404

    try:
        db.session.delete(igreja)
        db.session.commit()
        return jsonify({"message": "✅ Igreja excluída com sucesso!"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"❌ Erro ao excluir igreja: {str(e)}"}), 500

# ==============================
# 📌 CRUD - NATUREZAS
# ==============================

@bp.route("/naturezas", methods=["GET"])
def listar_naturezas():
    """Retorna todas as naturezas cadastradas"""
    naturezas = Natureza.query.all()
    return jsonify([
        {"id": n.id, "descricao": n.descricao}
        for n in naturezas
    ])

@bp.route("/natureza", methods=["POST"])
def criar_natureza():
    """Cria uma nova natureza"""
    data = request.json
    if not data.get("descricao"):
        return jsonify({"error": "⚠️ O campo descrição é obrigatório!"}), 400

    try:
        nova_natureza = Natureza(descricao=data["descricao"])
        db.session.add(nova_natureza)
        db.session.commit()
        return jsonify({"message": "✅ Natureza cadastrada com sucesso!"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"❌ Erro ao cadastrar natureza: {str(e)}"}), 500

@bp.route("/natureza/<int:id>", methods=["PUT"])
def editar_natureza(id):
    """Edita uma natureza"""
    natureza = Natureza.query.get(id)
    if not natureza:
        return jsonify({"error": "❌ Natureza não encontrada!"}), 404

    data = request.json
    natureza.descricao = data.get("descricao", natureza.descricao)

    try:
        db.session.commit()
        return jsonify({"message": "✅ Natureza atualizada com sucesso!"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"❌ Erro ao atualizar natureza: {str(e)}"}), 500

@bp.route("/natureza/<int:id>", methods=["DELETE"])
def excluir_natureza(id):
    """Exclui uma natureza"""
    natureza = Natureza.query.get(id)
    if not natureza:
        return jsonify({"error": "❌ Natureza não encontrada!"}), 404

    try:
        db.session.delete(natureza)
        db.session.commit()
        return jsonify({"message": "✅ Natureza excluída com sucesso!"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"❌ Erro ao excluir natureza: {str(e)}"}), 500


