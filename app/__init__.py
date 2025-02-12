import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# Inicializa o banco de dados SQLAlchemy
db = SQLAlchemy()

def create_app():
    app = Flask(__name__)

    # Configuração do caminho do banco de dados SQLite
    basedir = os.path.abspath(os.path.dirname(__file__))
    db_path = os.path.join(basedir, 'database', 'app.db')

    # Configurações da aplicação
    app.config['SECRET_KEY'] = '84347900'
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Inicializa o SQLAlchemy
    db.init_app(app)

    # Importa os modelos antes de criar as tabelas
    from app.models import Usuario, Igreja, Natureza

    # Garante que o banco de dados e o diretório sejam criados
    with app.app_context():
        database_dir = os.path.join(basedir, 'database')
        if not os.path.exists(database_dir):
            os.makedirs(database_dir)
        db.create_all()
        print("Banco de dados inicializado com sucesso!")

    # Importa e registra os Blueprints
    from app.routes.routes import main_bp
    from app.routes.lista_batismo_routes import lista_batismo_bp
    from app.routes.coleta_especial_routes import coleta_especial_bp
    from app.routes.santa_ceia_routes import santa_ceia_bp
    from app.routes.outras_reunioes_routes import outras_reunioes_bp
    from app.routes.routes_secretaria import bp as secretaria_bp  # Importando o Blueprint da secretaria
    from app.routes.routes_rsd import bp_rsd  # Importando o Blueprint de RSD
    from app.routes.usuarios import usuarios_bp


    # Registro dos Blueprints
    app.register_blueprint(main_bp)
    app.register_blueprint(lista_batismo_bp, url_prefix='/lista_batismo')  # Use o prefixo
    app.register_blueprint(coleta_especial_bp)
    app.register_blueprint(santa_ceia_bp)
    app.register_blueprint(outras_reunioes_bp)
    app.register_blueprint(bp_rsd) 
    app.register_blueprint(secretaria_bp, url_prefix='/secretaria')  # ✅ Blueprint com prefixo correto
    app.register_blueprint(usuarios_bp, url_prefix="/usuarios")

    
    return app


