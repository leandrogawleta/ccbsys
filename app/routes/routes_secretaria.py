from flask import Blueprint, request, jsonify
from app import db
from app.models import Igreja, Natureza

# 🔹 Criando o Blueprint com URL prefix
bp = Blueprint("secretaria", __name__, url_prefix="/secretaria")  # ✅ Certifique-se de que o prefixo está correto!

# ================================
# ✅ CRUD - IGREJA
# ================================

# ================================
# ✅ Rota para Listar Igrejas
# ================================
@bp.route("/igrejas", methods=["GET"])
def listar_igrejas():
    """Retorna todas as igrejas cadastradas."""
    igrejas = Igreja.query.all()
    return jsonify([{"id": i.id, "Nome": i.Nome, "Cidade": i.Cidade, "Setor": i.Setor, "Endereco": i.Endereco} for i in igrejas])

# ================================
# ✅ Rota para Criar Igreja
# ================================
@bp.route("/igreja", methods=["POST"])
def criar_igreja():
    """Cadastra uma nova igreja."""
    try:
        data = request.json
        nova_igreja = Igreja(
            Nome=data.get("Nome"),
            Cidade=data.get("Cidade"),
            Setor=data.get("Setor"),
            Endereco=data.get("Endereco")
        )
        db.session.add(nova_igreja)
        db.session.commit()
        return jsonify({"message": "✅ Igreja cadastrada com sucesso!"})
    except Exception as e:
        return jsonify({"error": f"Erro ao cadastrar igreja: {str(e)}"}), 500

@bp.route("/igreja/<int:id>/editar", methods=["PUT"])
def editar_igreja(id):
    """Edita uma igreja no banco de dados."""
    data = request.json
    igreja = Igreja.query.get(id)

    if not igreja:
        return jsonify({"error": "❌ Igreja não encontrada"}), 404

    # 🔹 Ajustando os nomes corretos das colunas do modelo
    igreja.Nome = data.get("Nome", igreja.Nome)
    igreja.Cidade = data.get("Cidade", igreja.Cidade)
    igreja.Setor = data.get("Setor", igreja.Setor)
    igreja.Endereco = data.get("Endereco", igreja.Endereco)

    db.session.commit()
    return jsonify({"message": "✅ Igreja atualizada com sucesso!"})


@bp.route("/igreja/<int:id>/excluir", methods=["DELETE"])
def excluir_igreja(id):
    """Exclui uma igreja do banco de dados."""
    igreja = Igreja.query.get(id)

    if not igreja:
        return jsonify({"error": "❌ Igreja não encontrada"}), 404

    db.session.delete(igreja)
    db.session.commit()
    return jsonify({"message": "✅ Igreja excluída com sucesso!"})


# ================================
# ✅ CRUD - NATUREZA
# ================================

@bp.route("/natureza/<int:id>/editar", methods=["PUT"])
def editar_natureza(id):
    """Edita uma Natureza no banco de dados."""
    data = request.json
    natureza = Natureza.query.get(id)

    if not natureza:
        return jsonify({"error": "❌ Natureza não encontrada"}), 404

    # 🔹 Atualiza somente os campos alterados
    natureza.descricao = data.get("descricao", natureza.descricao)

    db.session.commit()
    return jsonify({"message": "✅ Natureza atualizada com sucesso!"})

@bp.route("/naturezas", methods=["GET"])
def listar_naturezas():
    naturezas = Natureza.query.all()
    return jsonify([{"id": n.id, "descricao": n.descricao} for n in naturezas])

@bp.route("/natureza", methods=["POST"])
def criar_natureza():
    data = request.json

    if not data.get("descricao"):
        return jsonify({"error": "O campo descrição é obrigatório!"}), 400

    nova_natureza = Natureza(descricao=data["descricao"])

    db.session.add(nova_natureza)
    db.session.commit()
    return jsonify({"message": "Natureza cadastrada com sucesso!"})

@bp.route("/natureza/<int:id>/excluir", methods=["DELETE"])
def excluir_natureza(id):
    """Exclui uma Natureza do banco de dados."""
    natureza = Natureza.query.get(id)

    if not natureza:
        return jsonify({"error": "❌ Natureza não encontrada"}), 404

    db.session.delete(natureza)
    db.session.commit()
    return jsonify({"message": "✅ Natureza excluída com sucesso!"})

