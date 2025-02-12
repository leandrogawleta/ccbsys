from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from app import db
from app.models import Usuario

usuarios_bp = Blueprint("usuarios", __name__)

# ✅ Rota para listar todos os usuários
@usuarios_bp.route("/listar", methods=["GET"])
def listar_usuarios():
    usuarios = Usuario.query.all()
    if not usuarios:
        return jsonify([])
    
    return jsonify([{
        "id": u.id, 
        "nome": u.nome, 
        "departamento": u.departamento,
        "email": u.email, 
        "nivel": u.nivel
    } for u in usuarios])

# ✅ Rota para buscar um usuário específico
@usuarios_bp.route("/<int:id>", methods=["GET"])
def buscar_usuario(id):
    usuario = Usuario.query.get_or_404(id)
    return jsonify({
        "id": usuario.id, 
        "nome": usuario.nome, 
        "departamento": usuario.departamento,
        "email": usuario.email, 
        "nivel": usuario.nivel
    })

# ✅ Rota para adicionar um novo usuário
@usuarios_bp.route("/adicionar", methods=["POST"])
def adicionar_usuario():
    dados = request.get_json()
    
    print("Recebendo dados para cadastro:", dados)  # <-- Adiciona um log para debug
    
    if not dados or "nome" not in dados or "email" not in dados or "senha" not in dados:
        return jsonify({"mensagem": "Dados incompletos!"}), 400

    # Verifica se o e-mail já existe no banco
    if Usuario.query.filter_by(email=dados["email"]).first():
        return jsonify({"mensagem": "E-mail já cadastrado!"}), 400

    novo_usuario = Usuario(
        nome=dados["nome"],
        departamento=dados["departamento"],
        email=dados["email"],
        senha=generate_password_hash(dados["senha"]),  # Senha hash
        nivel=dados["nivel"]
    )

    db.session.add(novo_usuario)
    db.session.commit()

    return jsonify({"mensagem": "Usuário cadastrado com sucesso!"})


# ✅ Rota para editar um usuário
@usuarios_bp.route("/editar/<int:id>", methods=["PUT"])
def editar_usuario(id):
    usuario = Usuario.query.get_or_404(id)
    dados = request.get_json()

    usuario.nome = dados["nome"]
    usuario.departamento = dados["departamento"]
    usuario.email = dados["email"]
    usuario.nivel = dados["nivel"]
    
    db.session.commit()
    
    return jsonify({"mensagem": "Usuário atualizado com sucesso!"})

# ✅ Rota para excluir um usuário
@usuarios_bp.route("/excluir/<int:id>", methods=["DELETE"])
def excluir_usuario(id):
    usuario = Usuario.query.get_or_404(id)

    db.session.delete(usuario)
    db.session.commit()
    
    return jsonify({"mensagem": "Usuário excluído com sucesso!"})
