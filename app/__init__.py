import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# Inicializa o banco de dados SQLAlchemy
db = SQLAlchemy()

def create_app():
    app = Flask(__name__)

    # Configuração da chave secreta
    app.config['SECRET_KEY'] = '84347900'

    # 🔹 Obtém a URL do banco de dados a partir da variável de ambiente
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://neondb_owner:SUA_SENHA@ep-damp-recipe-ac31ipl1-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require')

    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Inicializa o SQLAlchemy
    db.init_app(app)

    # Importa os modelos antes de criar as tabelas
    from app.models import Usuario, Igreja, Natureza

    # 🔹 Verifica a conexão do banco de dados
    with app.app_context():
        db.create_all()
        print(f"✅ Banco de dados conectado: {app.config['SQLALCHEMY_DATABASE_URI']}")

    # Importa e registra os Blueprints
    from app.routes.routes import main_bp
    from app.routes.lista_batismo_routes import lista_batismo_bp
    from app.routes.coleta_especial_routes import coleta_especial_bp
    from app.routes.santa_ceia_routes import santa_ceia_bp
    from app.routes.outras_reunioes_routes import outras_reunioes_bp
    from app.routes.routes_secretaria import bp as secretaria_bp
    from app.routes.routes_rsd import bp_rsd
    from app.routes.usuarios import usuarios_bp

    # Registro dos Blueprints
    app.register_blueprint(main_bp)
    app.register_blueprint(lista_batismo_bp, url_prefix='/lista_batismo')
    app.register_blueprint(coleta_especial_bp)
    app.register_blueprint(santa_ceia_bp)
    app.register_blueprint(outras_reunioes_bp)
    app.register_blueprint(bp_rsd)
    app.register_blueprint(secretaria_bp, url_prefix='/secretaria')
    app.register_blueprint(usuarios_bp, url_prefix="/usuarios")

    return app



