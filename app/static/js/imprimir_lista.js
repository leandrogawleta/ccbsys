document.addEventListener('DOMContentLoaded', function () {
    const imprimirBtn = document.getElementById('imprimirLista');
    if (imprimirBtn) {
        imprimirBtn.addEventListener('click', function () {
            // Obtendo os dados das tabelas
            const tabelas = {
                batismos: getTableData('batismosTable'),
                ensaios: getTableData('ensaiosTable'),
                mocidade: getTableData('mocidadeTable'),
                ministerial: getTableData('ministerialTable'),
                outrasReunioes: getTableData('outrasReunioesTable')
            };

            // Obtendo os textos dos editores
            const textos = {
                coletas: document.querySelector('#editor-coletas .ql-editor').innerHTML,
                tss: document.querySelector('#editor-tss .ql-editor').innerHTML,
                avisos: document.querySelector('#editor-avisos .ql-editor').innerHTML
            };

            // Obtendo as datas de filtro
            const dataInicio = document.getElementById('dataInicio').value || 'Data não especificada';
            const dataFim = document.getElementById('dataFim').value || 'Data não especificada';

            // Abrindo uma nova janela para exibir o relatório
            const novaJanela = window.open('', '_blank');
            novaJanela.document.write(`
                <!DOCTYPE html>
                <html lang="pt-br">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Relatório - Lista de Batismo e Serviços Diversos</title>
                    <style>
                        /* Configuração de impressão para A4 */
                        @page {
                            size: A4;
                            margin: 1mm 1mm 1mm 1mm;
                        }
                        /* Estilo geral */
                        body {
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 0;
                            color: #333;
                            line-height: 1.2; /* Reduz espaçamento entre linhas */
                        }
                        .a4 {
                            width: 210mm;
                            min-height: 297mm;
                            margin: auto;
                            padding: 10mm;
                            box-sizing: border-box;
                            background-color: #fff;
                        }
                        /* Cabeçalho */
                        .header {
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            margin-bottom: 10px;
                        }
                        .header img {
                            max-width: 50px;
                            margin-right: 10px;
                        }
                        .header div {
                            flex: 1;
                            text-align: center;
                        }
                        .header .title {
                            font-size: 18px;
                            margin: 0;
                            color: #007bff;
                            font-weight: bold;
                        }
                        .header .subtitle {
                            font-size: 16px;
                            margin: 0;
                            font-weight: bold;
                            color: #333;
                        }
                        .header .period {
                            font-size: 12px;
                            margin: 5px 0 0;
                            color: #555;
                        }
                        /* Títulos das seções */
                        h2 {
                            margin: 10px 0; /* Espaçamento entre as seções */
                            padding: 0;
                            font-size: 14px;
                            font-weight: bold;
                            color: #007bff;
                        }
                        /* Tabelas */
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 10px;
                            font-size: 12px;
                        }
                        table, th, td {
                            border: 1px solid #ddd;
                        }
                        th, td {
                            padding: 4px;
                            text-align: center;
                            word-wrap: break-word;
                            overflow-wrap: break-word;
                        }
                        th {
                            background-color: #f0f8ff;
                            font-weight: bold;
                        }
                        /* Caixa de texto */
                        .content-box {
                            border: 1px solid #ddd;
                            border-radius: 5px;
                            padding: 8px;
                            background-color: #f9f9f9;
                            margin-top: 10px; /* Espaço entre caixas */
                        }
                        /* Conteúdo formatado */
                        .formatted-content {
                            font-size: 12px !important; /* Força o tamanho fixo de 12 */
                            line-height: 1; /* Remove espaçamento entre as linhas */
                            text-align: left;
                            color: #333;
                        }
                        /* Largura das colunas */
                        th:nth-child(1), td:nth-child(1) { /* Data */
                            width: 12%;
                        }
                        th:nth-child(2), td:nth-child(2) { /* Hora */
                            width: 10%;
                        }
                        th:nth-child(3), td:nth-child(3) { /* Natureza */
                            width: 35%;
                        }
                        th:nth-child(4), td:nth-child(4) { /* Local */
                            width: 23%;
                        }
                        th:nth-child(5), td:nth-child(5) { /* Atendimento */
                            width: 20%;
                        }

                        /* Rodapé */
                        .footer {
                            text-align: center;
                            margin-top: 10px;
                            font-size: 10px;
                            color: #777;
                        }
                    </style>
                </head>
                <body>
                    <div class="a4">
                        <!-- Cabeçalho -->
                        <div class="header">
                            <img src="/static/logo.png" alt="Logo">
                            <div>
                                <div class="title">Congregação Cristã no Brasil - Araucária, Contenda e Lapa - PR</div>
                                <div class="subtitle">Relatório - Lista de Batismo e Serviços Diversos</div>
                                <div class="period">Período: ${dataInicio} a ${dataFim}</div>
                            </div>
                        </div>
                        <!-- Títulos e tabelas -->
                        ${generateSection('Batismos', tabelas.batismos)}
                        ${generateSection('Ensaios Regionais', tabelas.ensaios)}
                        ${generateSection('Reunião de Mocidade', tabelas.mocidade)}
                        ${generateSection('Reuniões Ministeriais', tabelas.ministerial)}
                        ${generateSection('Outras Reuniões', tabelas.outrasReunioes)}
                        ${generateTextSection('Coletas', textos.coletas)}
                        ${generateTextSection('Cultos com Tradução Simultânea de Sinais (TSS)', textos.tss)}
                        ${generateTextSection('Avisos / Observações', textos.avisos)}
                        <!-- Rodapé -->
                        <div class="footer">
                            Rua Bonifacio Kaiut, 89 - Fazenda Velha, Araucária-PR
                        </div>
                    </div>
                </body>
                </html>
            `);
            novaJanela.document.close();
            novaJanela.print();
        });
    }

    // Função para capturar os dados da tabela
    function getTableData(tabelaId) {
        const tabela = document.getElementById(tabelaId);
        if (!tabela) return [];
        const linhas = tabela.querySelectorAll('tbody tr');
        const dados = [];
        linhas.forEach(linha => {
            const colunas = linha.querySelectorAll('td');
            if (colunas.length > 0 && linha.style.display !== 'none') {
                dados.push([...colunas].map(coluna => coluna.innerText.trim()));
            }
        });
        return dados;
    }

    // Função para gerar HTML das tabelas
    function generateTableHTML(dados) {
        if (dados.length === 0) return '';
        const cabecalho = '<tr><th>Data</th><th>Hora</th><th>Natureza</th><th>Local</th><th>Atendimento</th></tr>';
        const linhas = dados.map(linha => `<tr>${linha.map(celula => `<td>${celula}</td>`).join('')}</tr>`).join('');
        return `<table>${cabecalho}${linhas}</table>`;
    }

    // Função para criar seções de tabelas
    function generateSection(title, data) {
        if (data.length === 0) return '';
        return `
            <section class="section">
                <h2>${title}</h2>
                ${generateTableHTML(data)}
            </section>
        `;
    }

    // Função para criar seções de texto
    function generateTextSection(title, content) {
        if (!content.trim()) return '';
        return `
            <section class="section">
                <h2>${title}</h2>
                <div class="content-box">
                    <div class="formatted-content">${content}</div>
                </div>
            </section>
        `;
    }
});


















