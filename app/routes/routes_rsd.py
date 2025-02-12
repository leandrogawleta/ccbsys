from flask import Blueprint, request, jsonify, render_template
from app import db
from app.models import RSD, RSDItem, Igreja, Natureza
from datetime import datetime

# Definição do Blueprint SEM PREFIXO
bp_rsd = Blueprint("rsd", __name__, url_prefix="/rsd")

# ==============================
# RENDERIZAR A PÁGINA HTML
# ==============================
@bp_rsd.route("/")
def pagina_rsd():
    return render_template("rsd.html")


@bp_rsd.route("/listar_igrejas", methods=["GET"])
def listar_igrejas():
    igrejas = Igreja.query.all()
    resultado = [{"id": igreja.id, "nome": igreja.Nome} for igreja in igrejas]  # 🔹 Usa "Nome" correto
    return jsonify(resultado)

# ==============================
# ADICIONAR REGISTRO EM UM RSD
# ==============================
@bp_rsd.route("/adicionar_item", methods=["POST"])
def adicionar_rsd_item():
    data = request.json

    print("🔹 Dados recebidos:", data)  # ✅ Debug

    if not data:
        return jsonify({"error": "Nenhum dado recebido"}), 400

    igreja_nome = data.get("igreja")
    if not igreja_nome:
        print("⚠️ Erro: Nome da igreja não foi recebido")
        return jsonify({"error": "O nome da igreja é obrigatório"}), 400

    try:
        data_formatada = datetime.strptime(data["data"], "%d-%m-%Y").date()
        hora_formatada = datetime.strptime(data["hora"], "%H:%M").time()

        novo_item = RSDItem(
            tipo=data["tipo"],
            data=data_formatada,
            hora=hora_formatada,
            descricao=data["descricao"],
            atendimento=data.get("atendimento", ""),
            igreja=igreja_nome,
            lb=data.get("lb", ""),  # Novo campo LB
            cl=data.get("cl", "")   # Novo campo CL
        )

        db.session.add(novo_item)
        db.session.commit()

        print(f"✅ Registro salvo no banco! ID: {novo_item.id}")

        return jsonify({"message": "Registro adicionado com sucesso!", "id": novo_item.id})

    except Exception as e:
        print(f"❌ Erro ao salvar no banco: {e}")
        db.session.rollback()
        return jsonify({"error": "Erro ao salvar no banco", "details": str(e)}), 500


# ==============================
# EXCLUIR REGISTRO DE RSD_ITEM
# ==============================
@bp_rsd.route("/excluir_item/<int:id>", methods=["DELETE"])
def excluir_rsd_item(id):
    item = RSDItem.query.get(id)

    if not item:
        return jsonify({"error": "Registro não encontrado!"}), 404

    try:
        db.session.delete(item)
        db.session.commit()
        print(f"✅ Registro ID {id} excluído com sucesso!")

        return jsonify({"message": "Registro excluído com sucesso!"})

    except Exception as e:
        print(f"❌ Erro ao excluir registro: {e}")
        db.session.rollback()
        return jsonify({"error": "Erro ao excluir registro", "details": str(e)}), 500

# LISTAR REGISTROS 

@bp_rsd.route("/listar_registros", methods=["GET"])
def listar_registros():
    igreja_nome = request.args.get("igreja")

    if not igreja_nome:
        return jsonify({"error": "O nome da igreja é obrigatório"}), 400

    try:
        print(f"🔹 Buscando registros para a igreja: {igreja_nome}")

        registros = RSDItem.query.filter(RSDItem.igreja == igreja_nome).order_by(RSDItem.data, RSDItem.hora).all()

        resultado = [
            {
                "id": reg.id,
                "tipo": reg.tipo,
                "data": reg.data.strftime("%d-%m-%Y"),
                "hora": reg.hora.strftime("%H:%M"),
                "descricao": reg.descricao,
                "atendimento": reg.atendimento,
                "lb": reg.lb,  # Incluir LB na resposta
                "cl": reg.cl   # Incluir CL na resposta
            }
            for reg in registros
        ]

        print(f"✅ Registros encontrados: {len(resultado)}")

        return jsonify(resultado)

    except Exception as e:
        print(f"❌ Erro ao buscar registros: {e}")
        return jsonify({"error": "Erro ao buscar registros", "details": str(e)}), 500

@bp_rsd.route("/editar_item_inline/<int:id>", methods=["PUT"])
def editar_rsd_item_inline(id):
    data = request.json
    item = RSDItem.query.get(id)

    if not item:
        return jsonify({"error": "Registro não encontrado!"}), 404

    try:
        if "tipo" in data:
            item.tipo = data["tipo"]
        if "data" in data:
            item.data = datetime.strptime(data["data"], "%d-%m-%Y").date()
        if "hora" in data:
            item.hora = datetime.strptime(data["hora"], "%H:%M").time()
        if "descricao" in data:
            item.descricao = data["descricao"]
        if "atendimento" in data:
            item.atendimento = data["atendimento"]
        if "lb" in data:
            item.lb = data["lb"]  # Atualizar LB
        if "cl" in data:
            item.cl = data["cl"]  # Atualizar CL

        db.session.commit()
        print(f"✅ Registro ID {id} atualizado com sucesso!")

        return jsonify({"message": "Registro atualizado com sucesso!"})

    except Exception as e:
        print(f"❌ Erro ao atualizar registro: {e}")
        db.session.rollback()
        return jsonify({"error": "Erro ao atualizar registro", "details": str(e)}), 500


@bp_rsd.route("/naturezas", methods=["GET"])
def listar_naturezas():
    naturezas = Natureza.query.all()
    return jsonify([{"id": n.id, "descricao": n.descricao} for n in naturezas])



