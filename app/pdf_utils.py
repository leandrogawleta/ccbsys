from fpdf import FPDF
import calendar


class CalendarioPDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 12)
        self.cell(0, 10, 'Calendário de Reuniões', 0, 1, 'C')

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Página {self.page_no()}', 0, 0, 'C')

    def draw_calendar(self, mes, ano, reunioes):
        self.set_font('Arial', 'B', 10)
        self.cell(0, 10, f'Calendário de {calendar.month_name[mes]} {ano}', 0, 1, 'C')

        # Dias da semana
        dias_semana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
        for dia in dias_semana:
            self.cell(25, 10, dia, 1, 0, 'C')
        self.ln()

        # Criar o calendário do mês
        cal = calendar.Calendar()
        semanas = cal.monthdayscalendar(ano, mes)

        for semana in semanas:
            for dia in semana:
                if dia == 0:
                    self.cell(25, 10, '', 1)  # Dia vazio
                else:
                    reunioes_dia = [r for r in reunioes if r.data.day == dia]
                    if reunioes_dia:
                        self.set_fill_color(200, 220, 255)
                        self.cell(25, 10, str(dia), 1, 0, 'C', fill=True)
                    else:
                        self.cell(25, 10, str(dia), 1, 0, 'C')
            self.ln()

    def add_month_page(self, mes, ano, reunioes):
        self.add_page()
        self.set_font('Arial', 'B', 16)
        self.cell(0, 10, f'{calendar.month_name[mes]} {ano}', 0, 1, 'C')
        self.ln(5)

        # Desenhar o calendário do mês
        self.draw_calendar(mes, ano, reunioes)

        # Adicionar a tabela de reuniões
        self.ln(5)
        self.set_font('Arial', 'B', 12)
        self.cell(20, 10, 'Dia', 1, 0, 'C')
        self.cell(30, 10, 'Hora', 1, 0, 'C')
        self.cell(60, 10, 'Natureza', 1, 0, 'C')
        self.cell(70, 10, 'Local', 1, 1, 'C')

        self.set_font('Arial', '', 12)
        for reuniao in sorted(reunioes, key=lambda r: (r.data.year, r.data.month, r.data.day)):
            self.cell(20, 10, str(reuniao.data.day), 1)
            self.cell(30, 10, reuniao.hora.strftime('%H:%M'), 1)
            self.cell(60, 10, reuniao.reuniao.natureza, 1)
            self.cell(70, 10, reuniao.reuniao.local, 1)
            self.ln(10)


def gerar_calendario_pdf(reunioes, ano, caminho_arquivo):
    meses = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ]

    pdf = CalendarioPDF()
    pdf.set_auto_page_break(auto=True, margin=15)

    for i, mes in enumerate(meses, start=1):
        reunioes_mes = [r for r in reunioes if r.data.month == i]
        if reunioes_mes:
            pdf.add_month_page(i, ano, reunioes_mes)

    pdf.output(caminho_arquivo, 'F')




