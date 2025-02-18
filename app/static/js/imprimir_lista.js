document.addEventListener('DOMContentLoaded', function () {
    const imprimirBtn = document.getElementById('imprimirLista');
    if (imprimirBtn) {
        imprimirBtn.addEventListener('click', function () {
            const tabelas = {
                batismos: getTableData('batismosTable'),
                ensaios: getTableData('ensaiosTable'),
                mocidade: getTableData('mocidadeTable'),
                ministerial: getTableData('ministerialTable'),
                outrasReunioes: getTableData('outrasReunioesTable')
            };

            // Combina "Reuniões Ministeriais" e "Outras Reuniões" em um único array
            let reunioesCombinadas = [...tabelas.ministerial, ...tabelas.outrasReunioes];

            // 🔹 Normaliza o formato da hora (remove os segundos, se existirem)
            reunioesCombinadas = reunioesCombinadas.map(row => {
                const [data, hora, ...resto] = row;
                const horaNormalizada = hora.split(':').slice(0, 2).join(':'); // Remove os segundos
                return [data, horaNormalizada, ...resto];
            });

            // 🔹 Ordena a tabela por Data e depois por Hora
            reunioesCombinadas.sort((a, b) => {
                // Converte a data para o formato yyyy-mm-dd
                const dataA = new Date(a[0].split('/').reverse().join('-') + 'T' + a[1]);
                const dataB = new Date(b[0].split('/').reverse().join('-') + 'T' + b[1]);
                return dataA - dataB;
            });

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
                    <script src="https://kit.fontawesome.com/a076d05399.js" crossorigin="anonymous"></script>
                    <style>
                        @page { size: A4; margin: 5mm; }
                        body { font-family: Arial, sans-serif; color: #333; line-height: 1.2; }
                        .a4 { width: 210mm; min-height: 297mm; margin: auto; padding: 10mm; background: #fff; }
                        .header { text-align: center; margin-bottom: 20px; }
                        .header .title-main { font-size: 18px; font-weight: bold; text-transform: uppercase; }
                        .header .title-sub { font-size: 14px; font-weight: bold; margin-top: 5px; }
                        .header .period { font-size: 12px; font-weight: bold; margin-top: 5px; }
                        h2 { font-size: 14px; font-weight: bold; color: #000; margin: 10px 0 5px; display: flex; align-items: center; }
                        h2 i { margin-right: 8px; color: #000; }
                        table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 10px; table-layout: fixed; }
                        table, th, td { border: 1px solid #ddd; }
                        th, td { padding: 3px; text-align: center; word-break: break-word; line-height: 1; }
                        th { 
                            background: #bfbfbf; 
                            font-weight: bold; 
                            color: #000; 
                            -webkit-print-color-adjust: exact; 
                            print-color-adjust: exact;
                        }
                        th:nth-child(1) { width: 15%; }
                        th:nth-child(2) { width: 10%; }
                        th:nth-child(3) { width: 35%; text-align: left; }
                        th:nth-child(4) { width: 20%; }
                        th:nth-child(5) { width: 20%; }
                        td:nth-child(3) { text-align: left; }
                        .text-sections { display: flex; flex-direction: column; gap: 5px; margin-bottom: 10px; }
                        .content-box { border: 1px solid #ddd; padding: 3px; background: #f9f9f9; line-height: 1; }
                        .formatted-content { font-size: 11px; text-align: left; color: #333; line-height: 1; margin: 0; }
                        .formatted-content * { all: inherit; }
                        .footer { text-align: center; font-size: 11px; color: #777; margin-top: 10px; }
                    </style>
                </head>
                <body onload="setTimeout(() => { window.print(); window.close(); }, 500);">
                    <div class="a4">
                        <div class="header">
                            <div class="title-main">CONGREGAÇÃO CRISTÃ NO BRASIL</div>
                            <div class="title-sub">Lista de Batismo e Serviços Diversos - Araucária, Contenda e Lapa</div>
                            <div class="period">Período: ${dataInicio} a ${dataFim}</div>
                        </div>
                        ${generateSection('Batismos', tabelas.batismos, 'fa-water')}
                        ${generateSection('Ensaios Regionais', tabelas.ensaios, 'fa-music')}
                        ${generateSection('Reunião da Mocidade', tabelas.mocidade, 'fa-users')}
                        ${generateSection('Reuniões Ministeriais e Outros', reunioesCombinadas, 'fa-handshake')}
                        <div class="text-sections">
                            <h2><i class="fas fa-hand-holding-usd"></i> Coletas</h2>
                            <div class="content-box">
                                <div class="formatted-content">${textos.coletas}</div>
                            </div>
                            <h2><i class="fas fa-sign-language"></i> Cultos com Tradução Simultânea de Sinais (TSS)</h2>
                            <div class="content-box">
                                <div class="formatted-content">${textos.tss}</div>
                            </div>
                            <h2><i class="fas fa-bullhorn"></i> Avisos / Observações</h2>
                            <div class="content-box">
                                <div class="formatted-content">${textos.avisos}</div>
                            </div>
                        </div>
                        <div class="footer">Rua Bonifacio Kaiut, 89 - Fazenda Velha, Araucária-PR</div>
                    </div>
                </body>
                </html>
            `);

            novaJanela.document.close();
        });
    }

    function getTableData(tabelaId) {
        const tabela = document.getElementById(tabelaId);
        if (!tabela) return [];
        return [...tabela.querySelectorAll('tbody tr')]
            .filter(tr => tr.style.display !== 'none')
            .map(tr => [...tr.querySelectorAll('td')].map(td => td.innerHTML.trim()));
    }

    function generateTableHTML(dados) {
        if (!dados.length) return '';
        const headers = '<tr><th>Data</th><th>Hora</th><th>Natureza</th><th>Local</th><th>Atendimento</th></tr>';
        const rows = dados.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('');
        return `<table>${headers}${rows}</table>`;
    }

    function generateSection(title, data, icon) {
        return data.length ? `<section><h2><i class="fas ${icon}"></i> ${title}</h2>${generateTableHTML(data)}</section>` : '';
    }
});
















