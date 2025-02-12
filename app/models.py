from app import db
from werkzeug.security import generate_password_hash


# Modelo de Usuário
class Usuario(db.Model):
    __tablename__ = 'usuario'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    departamento = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    senha = db.Column(db.String(200), nullable=False)  # Armazena o hash da senha
    nivel = db.Column(db.String(20), nullable=False)

    @staticmethod
    def criar_usuario(nome, departamento, email, senha, nivel):
        hashed_senha = generate_password_hash(senha)
        return Usuario(
            nome=nome,
            departamento=departamento,
            email=email,
            senha=hashed_senha,
            nivel=nivel
        )


# Modelo de Natureza (usado nas reuniões)
class Natureza(db.Model):
    __tablename__ = 'natureza'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    descricao = db.Column(db.String(100), nullable=False)

    def __repr__(self):
        return f'<Natureza {self.descricao}>'


# Modelo de Igreja
class Igreja(db.Model):
    __tablename__ = 'igreja'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Nome = db.Column(db.String(100), nullable=False)
    Cidade = db.Column(db.String(100), nullable=False)
    Setor = db.Column(db.String(100), nullable=False)
    Endereco = db.Column(db.String(200))

    def __repr__(self):
        return f'<Igreja {self.Nome} - {self.Cidade}>'


# Modelo de Reunião
class Reuniao(db.Model):
    __tablename__ = 'reuniao'
    id = db.Column(db.Integer, primary_key=True)
    natureza = db.Column(db.String(200), nullable=False)
    sigla = db.Column(db.String(10), nullable=False)
    participantes = db.Column(db.String(100), nullable=False)
    periodicidade = db.Column(db.String(20), nullable=False)
    local = db.Column(db.String(100), nullable=False)
    calendario = db.Column(db.String(100))
    observacoes = db.Column(db.String(600))
    lb = db.Column(db.String(1), nullable=False, default='F')  # V ou F
    cl = db.Column(db.String(1), nullable=False, default='F')  # V ou F
    tipo = db.Column(db.String(50), nullable=True)
    status = db.Column(db.String(1), nullable=False, default='F')  # V ou F

    # Relacionamento com ReuniaoData
    datas = db.relationship('ReuniaoData', back_populates='reuniao', cascade='all, delete-orphan')


# Modelo de Datas de Reunião
class ReuniaoData(db.Model):
    __tablename__ = 'reuniao_data'
    id = db.Column(db.Integer, primary_key=True)
    reuniao_id = db.Column(db.Integer, db.ForeignKey('reuniao.id'), nullable=False)
    data = db.Column(db.Date, nullable=False)
    hora = db.Column(db.Time, nullable=False)
    obs = db.Column(db.String(100))
    atendimento = db.Column(db.String(100), nullable=True)

    reuniao = db.relationship('Reuniao', back_populates='datas')


# Modelo de Coleta Especial
class ColetaEspecial(db.Model):
    __tablename__ = 'coleta_especial'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    data = db.Column(db.String(30), nullable=False)
    hora = db.Column(db.String(30))
    local = db.Column(db.String(50), nullable=False)
    atendente = db.Column(db.String(100))

    def __repr__(self):
        return f'<ColetaEspecial {self.local}>'


# Modelo de Santa Ceia
class SantaCeia(db.Model):
    __tablename__ = 'santaceia'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    data = db.Column(db.String(10), nullable=False)
    hora = db.Column(db.String(5), nullable=False)
    local = db.Column(db.String(100), nullable=False)
    atendimento = db.Column(db.String(100), nullable=False)

    def __repr__(self):
        return f"<SantaCeia {self.local} - {self.data}>"


# Modelo de Outras Reuniões
class OutrasReunioes(db.Model):
    __tablename__ = 'outras_reunioes'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True, nullable=False)
    data = db.Column(db.String, nullable=False)
    hora = db.Column(db.String, nullable=False)
    local = db.Column(db.String, nullable=False)
    atendimento = db.Column(db.String)
    tipo = db.Column(db.String, nullable=False)
    obs = db.Column(db.String)

    def to_dict(self):
        return {
            'id': self.id,
            'data': self.data,
            'hora': self.hora,
            'local': self.local,
            'atendimento': self.atendimento,
            'tipo': self.tipo,
            'obs': self.obs
        }



# ==============================
# 📌 TABELA RSD (Reuniões e Serviços Diversos)
# ==============================
class RSD(db.Model):
    __tablename__ = 'rsd'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    igreja_id = db.Column(db.Integer, db.ForeignKey('igreja.id'), nullable=False)
    anotacoes = db.Column(db.String(500))

    
class RSDItem(db.Model):
    __tablename__ = "rsd_item"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)    
    tipo = db.Column(db.String(100), nullable=False)
    data = db.Column(db.Date, nullable=False)
    hora = db.Column(db.Time, nullable=False)
    descricao = db.Column(db.String(255), nullable=False)
    atendimento = db.Column(db.String(255))
    igreja = db.Column(db.String(255), nullable=False)
    lb = db.Column(db.String(50))  # Nova coluna LB
    cl = db.Column(db.String(50))  # Nova coluna CL


    

