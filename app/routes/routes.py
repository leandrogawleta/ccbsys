from flask import Blueprint, render_template, request, redirect, url_for, flash, session, jsonify, make_response, send_file
from app import db
from datetime import datetime
from docx.shared import Pt, Inches
from app.models import Usuario, Reuniao, ReuniaoData
from app.routes.lista_batismo_routes import lista_batismo_bp
from sqlalchemy import text
import pandas as pd


from io import BytesIO
from docx import Document

import os
import calendar


from docx.enum.text import WD_PARAGRAPH_ALIGNMENT  # Importação correta
from docx.oxml import OxmlElement


calendar.setfirstweekday(calendar.SUNDAY)

from werkzeug.security import check_password_hash, generate_password_hash


main_bp = Blueprint('main', __name__)

# Página de login
@main_bp.route('/', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        usuario = Usuario.query.filter_by(email=username).first()
        if usuario and check_password_hash(usuario.senha, password):
            session['usuario'] = usuario.nome
            session['nivel'] = usuario.nivel
            flash(f'Bem-vindo, {usuario.nome}!', 'success')
            return redirect(url_for('main.dashboard'))
        flash('Usuário ou senha inválidos.', 'danger')
    return render_template('login.html')

# Logout
@main_bp.route('/logout')
def logout():
    session.clear()
    flash('Você foi desconectado com sucesso.', 'info')
    return redirect(url_for('main.login')) 

# Dashboard
@main_bp.route('/dashboard')
def dashboard():
    if 'usuario' not in session:
        flash('Por favor, faça login para acessar o sistema.', 'warning')
        return redirect(url_for('main.login'))

    usuario_conectado = session.get('usuario', 'Usuário Desconhecido')
    data_hora_acesso = datetime.now().strftime('%d/%m/%Y %H:%M:%S')

    return render_template(
        'dashboard.html',
        usuario_conectado=usuario_conectado,
        data_hora_acesso=data_hora_acesso
    )

@main_bp.route('/secretaria')
def secretaria():
    # Verifica se o usuário está autenticado
    if 'usuario' not in session:
        flash('Por favor, faça login para acessar o sistema.', 'warning')
        return redirect(url_for('main.login'))

    usuario_conectado = session.get('usuario', 'Usuário Desconhecido')
    data_hora_acesso = datetime.now().strftime('%d/%m/%Y %H:%M:%S')

    return render_template(
        'secretaria.html',
        usuario_conectado=usuario_conectado,
        data_hora_acesso=data_hora_acesso
    )

@main_bp.route('/reunioes/<int:reuniao_id>/datas', methods=['GET'])
def listar_datas_reuniao(reuniao_id):
    datas = ReuniaoData.query.filter_by(reuniao_id=reuniao_id).all()
    datas_formatadas = [
        {
            'id': data.id,
            'data': data.data.isoformat(),
            'hora': data.hora.strftime('%H:%M'),
            'atendimento': data.atendimento,
            'obs': data.obs
        } for data in datas
    ]
    return jsonify(datas_formatadas)


@main_bp.route('/reunioes', methods=['GET', 'POST'])
def reunioes():
    if request.method == 'POST':
        try:
            data = request.json

            nova_reuniao = Reuniao(
                natureza=data.get('natureza'),
                sigla=data.get('sigla'),
                participantes=data.get('participantes'),
                periodicidade=data.get('periodicidade'),
                local=data.get('local'),
                calendario=data.get('calendario', ''),
                observacoes=data.get('observacoes', ''),
                lb=data.get('LB', 'F'),
                cl=data.get('CL', 'F'),
                tipo=data.get('tipo'),  # Corrigido para 'tipo' (minúsculo)
                status='V' if data.get('status', 'Inativo') == 'Ativo' else 'F'
            )
            db.session.add(nova_reuniao)
            db.session.commit()
            return jsonify({'success': True}), 200
        except Exception as e:
            print(f"Erro ao salvar reunião: {e}")
            return jsonify({'success': False, 'error': str(e)}), 400


    # GET: Renderizar a página com a lista de reuniões
    reunioes = Reuniao.query.all()
    return render_template('reunioes.html', reunioes=reunioes)

# rota gerar calendário HTML

@main_bp.route('/reunioes/calendario/<int:ano>', methods=['GET'])
def calendario_html(ano):
    calendar.setfirstweekday(calendar.SUNDAY)  # Define domingo como primeiro dia da semana

    # Executa a consulta SQL com UNION para buscar todas as reuniões do ano
    query = text("""
        SELECT data, hora, tipo AS natureza, local, atendimento, obs FROM outras_reunioes
        UNION
        SELECT Data, Hora, Tipo AS natureza, igreja AS local, Atendimento, Descricao AS obs FROM rsd_item
    """)

    resultados = db.session.execute(query).fetchall()

    # Formata os dados e filtra apenas reuniões do ano especificado
    def formatar_data(data):
        if isinstance(data, str):
            partes = data.split("-")
            if len(partes) == 3:
                return datetime(int(partes[0]), int(partes[1]), int(partes[2]))
        return data

    reunioes = [
        {
            'data': formatar_data(str(row[0])),
            'hora': row[1],
            'natureza': row[2],
            'local': row[3],
            'atendimento': row[4],
            'obs': row[5]
        }
        for row in resultados
        if formatar_data(str(row[0])).year == ano  # Filtra reuniões do ano especificado
    ]

    # Organiza reuniões por mês
    meses = []
    for mes in range(1, 13):
        dias_no_mes = calendar.monthrange(ano, mes)[1]
        primeiro_dia = calendar.monthrange(ano, mes)[0]

        semanas = []
        semana_atual = [''] * ((primeiro_dia + 1) % 7)

        for dia in range(1, dias_no_mes + 1):
            reunioes_dia = [r for r in reunioes if r['data'].day == dia and r['data'].month == mes]
            dia_str = f"{dia} 📌" if reunioes_dia else str(dia)

            semana_atual.append(dia_str)
            if len(semana_atual) == 7:
                semanas.append(semana_atual)
                semana_atual = []

        if semana_atual:
            semanas.append(semana_atual + [''] * (7 - len(semana_atual)))

        reunioes_mes = sorted(
            [r for r in reunioes if r['data'].month == mes],
            key=lambda r: (r['data'].day, r['hora'])
        )

        mes_data = {
            "nome": calendar.month_name[mes],
            "semanas": semanas,
            "reunioes": [
                {
                    "dia": r['data'].strftime('%d'),
                    "hora": r['hora'][:5],
                    "natureza": r['natureza'],
                    "local": r['local'],
                    "atendimento": r['atendimento']
                }
                for r in reunioes_mes
            ]
        }

        meses.append(mes_data)

    return render_template('calendario.html', ano=ano, meses=meses, datetime=datetime)



@main_bp.route('/api/reunioes', methods=['GET'])
def api_reunioes():
    query = text("""
        SELECT 
            data, hora, tipo AS natureza, local, atendimento, obs
        FROM outras_reunioes
        UNION
        SELECT 
            Data, Hora, Tipo AS natureza, igreja AS local, Atendimento, Descricao AS obs
        FROM rsd_item
    """)

    resultados = db.session.execute(query).fetchall()

    def formatar_data(data):
        if isinstance(data, str):  
            partes = data.split("-")
            if len(partes) == 3:
                return f"{partes[2]}-{partes[1]}-{partes[0]}"  # yyyy-mm-dd → dd-mm-yyyy
        elif data is not None:
            return data.strftime('%d-%m-%Y')  # Para objetos datetime
        return ''

    def formatar_hora(hora):
        if isinstance(hora, str):
            return hora[:5]  # Remove segundos caso existam
        return hora.strftime('%H:%M') if hora else ''

    reunioes = [
        {
            'data': formatar_data(str(row[0])),  # Converte para string e formata corretamente
            'hora': formatar_hora(row[1]),
            'natureza': row[2] or '',
            'local': row[3] or '',
            'atendimento': row[4] or '',
            'obs': row[5] or ''
        }
        for row in resultados
    ]

    return jsonify(reunioes)

# print.html

@main_bp.route('/imprimir/<int:ano>', methods=['GET'])
def imprimir_calendario(ano):
    import calendar
    from datetime import datetime
    from sqlalchemy.sql import text

    # Consulta SQL para buscar reuniões do ano especificado
    query = text("""
        SELECT data, hora, tipo AS natureza, local, atendimento, obs FROM outras_reunioes
        UNION
        SELECT Data, Hora, Tipo AS natureza, igreja AS local, Atendimento, Descricao AS obs FROM rsd_item
    """)

    resultados = db.session.execute(query).fetchall()

    # Formata os dados e filtra apenas reuniões do ano especificado
    def formatar_data(data):
        if isinstance(data, str):
            partes = data.split("-")
            if len(partes) == 3:
                return datetime(int(partes[0]), int(partes[1]), int(partes[2]))
        return data

    reunioes = [
        {
            'data': formatar_data(str(row[0])),
            'hora': row[1],
            'natureza': row[2],
            'local': row[3],
            'atendimento': row[4],
            'obs': row[5]
        }
        for row in resultados
        if formatar_data(str(row[0])).year == ano
    ]

    # Organiza reuniões por mês e garante que todos os meses sejam exibidos
    meses = []
    for mes in range(1, 13):
        dias_no_mes = calendar.monthrange(ano, mes)[1]
        primeiro_dia = calendar.monthrange(ano, mes)[0]

        semanas = []
        semana_atual = [''] * ((primeiro_dia + 1) % 7)

        for dia in range(1, dias_no_mes + 1):
            reunioes_dia = [r for r in reunioes if r['data'].day == dia and r['data'].month == mes]
            dia_str = f"{dia} 📌" if reunioes_dia else str(dia)

            semana_atual.append(dia_str)
            if len(semana_atual) == 7:
                semanas.append(semana_atual)
                semana_atual = []

        if semana_atual:
            semanas.append(semana_atual + [''] * (7 - len(semana_atual)))

        reunioes_mes = sorted(
            [r for r in reunioes if r['data'].month == mes],
            key=lambda r: (r['data'].day, r['hora'])
        )

        mes_data = {
            "nome": calendar.month_name[mes],
            "semanas": semanas,
            "reunioes": [
                {
                    "dia": r['data'].strftime('%d'),
                    "hora": r['hora'][:5],
                    "natureza": r['natureza'],
                    "local": r['local'],
                    "atendimento": r['atendimento']
                }
                for r in reunioes_mes
            ]
        }

        meses.append(mes_data)

    return render_template('print.html', ano=ano, meses=meses, datetime=datetime)


    