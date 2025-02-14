document.addEventListener('DOMContentLoaded', function () {
    const imprimirBtn = document.getElementById('imprimirLista');
    if (imprimirBtn) {
        imprimirBtn.addEventListener('click', function () {
            // Coleta os dados de todas as tabelas
            const tabelas = {
                batismos: getTableData('batismosTable'),
                ensaios: getTableData('ensaiosTable'),
                mocidade: getTableData('mocidadeTable'),
                ministerial: getTableData('ministerialTable'),
                outrasReunioes: getTableData('outrasReunioesTable')
            };

            // Combina "Reuniões Ministeriais" e "Outras Reuniões" em um único array
            const reunioesCombinadas = [
                ...tabelas.ministerial,
                ...tabelas.outrasReunioes
            ];

            // Ordena as reuniões combinadas por data (assumindo que a data está na primeira coluna)
            reunioesCombinadas.sort((a, b) => new Date(a[0]) - new Date(b[0]));

            // Coleta os textos dos editores
            const textos = {
                coletas: document.querySelector('#editor-coletas .ql-editor').innerHTML,
                tss: document.querySelector('#editor-tss .ql-editor').innerHTML,
                avisos: document.querySelector('#editor-avisos .ql-editor').innerHTML
            };

            const dataInicio = document.getElementById('dataInicio').value || 'Data não especificada';
            const dataFim = document.getElementById('dataFim').value || 'Data não especificada';

            const novaJanela = window.open('', '_blank');
            novaJanela.document.write(`
                <!DOCTYPE html>
                <html lang="pt-br">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Relatório - Lista de Batismo e Serviços Diversos</title>
                    <style>
                        @page { size: A4; margin: 5mm; }
                        body { font-family: Arial, sans-serif; color: #333; line-height: 1.5; }
                        .a4 { width: 210mm; min-height: 297mm; margin: auto; padding: 10mm; background: #fff; }
                        .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
                        .header img { max-width: 60px; height: auto; margin-right: 15px; }
                        .header .title { font-size: 18px; font-weight: bold; color: #007bff; }
                        .header .subtitle { font-size: 16px; font-weight: bold; color: #333; }
                        .header .period { font-size: 14px; color: #555; font-weight: bold; }
                        h2 { font-size: 16px; font-weight: bold; color: #007bff; margin: 15px 0 10px; }
                        table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px; }
                        table, th, td { border: 1px solid #ddd; }
                        th, td { padding: 5px; text-align: center; word-break: break-word; }
                        th { background: #f0f0f0; font-weight: bold; }
                        .text-sections { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }
                        .text-sections .half-width { flex: 1; min-width: calc(50% - 5px); display: flex; flex-direction: column; }
                        .text-sections .full-width { width: 100%; }
                        .content-box { border: 1px solid #ddd; padding: 5px; background: #f9f9f9; } /* Removido flex: 1 */
                        .formatted-content { font-size: 12px; text-align: left; color: #333; line-height: 1; margin: 0; } /* Ajustado line-height */
                        .footer { text-align: center; font-size: 12px; color: #777; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="a4">
                        <div class="header">
                            <img src="/static/logo.png" alt="Logo">
                            <div>
                                <div class="title">Congregação Cristã no Brasil - Araucária, Contenda e Lapa - PR</div>
                                <div class="subtitle">Relatório - Lista de Batismo e Serviços Diversos</div>
                                <div class="period">Período: ${dataInicio} a ${dataFim}</div>
                            </div>
                        </div>
                        ${generateSection('Batismos', tabelas.batismos)}
                        ${generateSection('Ensaios Regionais', tabelas.ensaios)}
                        ${generateSection('Reunião de Mocidade', tabelas.mocidade)}
                        ${generateSection('Reuniões Ministeriais e Outras Reuniões', reunioesCombinadas)}
                        <div class="text-sections">
                            <div class="half-width">
                                <h2>Coletas</h2>
                                <div class="content-box">
                                    <div class="formatted-content">${textos.coletas}</div>
                                </div>
                            </div>
                            <div class="half-width">
                                <h2>Cultos com Tradução Simultânea de Sinais (TSS)</h2>
                                <div class="content-box">
                                    <div class="formatted-content">${textos.tss}</div>
                                </div>
                            </div>
                            <div class="full-width">
                                <h2>Avisos / Observações</h2>
                                <div class="content-box">
                                    <div class="formatted-content">${textos.avisos}</div>
                                </div>
                            </div>
                        </div>
                        <div class="footer">Rua Bonifacio Kaiut, 89 - Fazenda Velha, Araucária-PR</div>
                    </div>
                </body>
                </html>
            `);
            novaJanela.document.close();
            novaJanela.print();
        });
    }

    function getTableData(tabelaId) {
        const tabela = document.getElementById(tabelaId);
        if (!tabela) return [];
        return [...tabela.querySelectorAll('tbody tr')]
            .filter(tr => tr.style.display !== 'none')
            .map(tr => [...tr.querySelectorAll('td')].map(td => td.innerText.trim()));
    }

    function generateTableHTML(dados) {
        if (!dados.length) return '';
        const headers = '<tr><th>Data</th><th>Hora</th><th>Natureza</th><th>Local</th><th>Atendimento</th></tr>';
        const rows = dados.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('');
        return `<table>${headers}${rows}</table>`;
    }

    function generateSection(title, data) {
        return data.length ? `<section><h2>${title}</h2>${generateTableHTML(data)}</section>` : '';
    }
});














