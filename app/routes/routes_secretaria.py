from flask import Blueprint, request, jsonify
from app import db
from app.models import Igreja, Natureza, OutrasReunioes, RSDItem
from datetime import datetime, timedelta
from sqlalchemy import text


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

# ==============================
# 📌 Retornar estatísticas gerais
# ==============================

@bp.route("/estatisticas", methods=["GET"])
def obter_estatisticas():
    """Retorna estatísticas gerais das reuniões com filtro por ano"""
    
    ano = request.args.get("ano", datetime.today().year, type=int)  # Ano padrão = ano atual

    consulta_total = text("""
        SELECT COUNT(*) FROM rsd_item WHERE strftime('%Y', data) = :ano
        UNION ALL
        SELECT COUNT(*) FROM outras_reunioes WHERE strftime('%Y', data) = :ano
    """)
    total_reunioes = sum(row[0] for row in db.session.execute(consulta_total, {"ano": str(ano)}).fetchall())

    consulta_concluidas = text("""
        SELECT COUNT(*) FROM rsd_item WHERE strftime('%Y', data) = :ano AND data < :hoje
        UNION ALL
        SELECT COUNT(*) FROM outras_reunioes WHERE strftime('%Y', data) = :ano AND data < :hoje
    """)
    reunioes_concluidas = sum(row[0] for row in db.session.execute(consulta_concluidas, {"ano": str(ano), "hoje": datetime.today().date()}).fetchall())

    return jsonify({
        "total_reunioes": total_reunioes,
        "reunioes_concluidas": reunioes_concluidas
    })


# ==============================
# 📌 Retornar quantidade de reuniões por tipo
# ==============================

@bp.route("/por_tipo", methods=["GET"])
def obter_reunioes_por_tipo():
    """Retorna a quantidade de reuniões agrupadas por tipo (descrição) com filtro de ano"""

    ano = request.args.get("ano", datetime.today().year, type=int)  # Ano padrão = ano atual

    consulta = text("""
        SELECT descricao, COUNT(*) as total FROM (
            SELECT r.Descricao as descricao FROM rsd_item r WHERE strftime('%Y', r.data) = :ano
            UNION ALL
            SELECT o.tipo as descricao FROM outras_reunioes o WHERE strftime('%Y', o.data) = :ano
        ) AS reunioes
        GROUP BY descricao
        ORDER BY total DESC
        LIMIT 10  -- Exibir apenas os 10 principais tipos
    """)

    resultados = db.session.execute(consulta, {"ano": str(ano)}).fetchall()

    reunioes_por_tipo = {row[0]: row[1] for row in resultados}
    return jsonify(reunioes_por_tipo)



# ==============================
# 📌 Retornar reuniões da semana
# ==============================
@bp.route("/semana", methods=["GET"])
def obter_reunioes_semana():
    """Retorna as reuniões que acontecerão nos próximos 7 dias"""
    hoje = datetime.today().date()
    proxima_semana = hoje + timedelta(days=7)

    consulta = text("""
        SELECT data, hora, descricao, atendimento, igreja FROM rsd_item 
        WHERE data BETWEEN :hoje AND :proxima_semana
        UNION ALL
        SELECT data, hora, tipo as descricao, atendimento, local FROM outras_reunioes
        WHERE data BETWEEN :hoje AND :proxima_semana
    """)

    try:
        resultados = db.session.execute(consulta, {"hoje": hoje, "proxima_semana": proxima_semana}).fetchall()

        if not resultados:
            print("🔹 Nenhuma reunião encontrada para a semana.")

        reunioes_semana = []
        for r in resultados:
            data_str = r[0] if isinstance(r[0], str) else r[0].strftime("%d/%m/%Y")
            hora_str = r[1] if isinstance(r[1], str) else r[1].strftime("%H:%M")

            print(f"📌 Reunião encontrada: {r}")  # LOG para depuração
            reunioes_semana.append({
                "data": data_str,
                "hora": hora_str,
                "descricao": r[2] if r[2] else "Sem descrição",
                "atendimento": r[3] if r[3] else "Sem atendimento",
                "igreja": r[4] if r[4] else "Sem local"
            })

        return jsonify(reunioes_semana)

    except Exception as e:
        print(f"❌ Erro ao obter reuniões da semana: {e}")  # LOG de erro
        return jsonify({"error": f"Erro ao buscar reuniões da semana: {str(e)}"}), 500


# ==============================
# 📌 Retornar quantidade de reuniões por mês
# ==============================
@bp.route("/por_mes", methods=["GET"])
def obter_reunioes_por_mes():
    """Retorna a quantidade de reuniões agrupadas por mês com filtro de ano"""
    
    ano = request.args.get("ano", datetime.today().year, type=int)  # Ano padrão = ano atual

    consulta = text("""
        SELECT 
            strftime('%m', data) as mes, COUNT(*) as total 
        FROM (
            SELECT r.data FROM rsd_item r WHERE strftime('%Y', r.data) = :ano
            UNION ALL
            SELECT o.data FROM outras_reunioes o WHERE strftime('%Y', o.data) = :ano
        ) AS reunioes
        GROUP BY mes
        ORDER BY mes
    """)

    resultados = db.session.execute(consulta, {"ano": str(ano)}).fetchall()

    reunioes_por_mes = {row[0]: row[1] for row in resultados}
    
    return jsonify(reunioes_por_mes)

