document.addEventListener('DOMContentLoaded', function () {
    console.log("📌 Página carregada com sucesso!");

    // ✅ Função para validar se uma data está no formato dd/mm/yyyy
    function validarData(data) {
        const regex = /^\d{2}\/\d{2}\/\d{4}$/;
        return regex.test(data);
    }

    // ✅ Função para converter data (yyyy-mm-dd) para (dd/mm/yyyy)
    function formatarData(data) {
        if (!data || typeof data !== 'string') return 'Sem Data';
        if (data.includes('-')) {
            const [ano, mes, dia] = data.split('-');
            return `${dia}/${mes}/${ano}`;
        }
        return data;
    }

    // ✅ Função para converter string de data (dd/mm/yyyy) para objeto Date
    function converterData(dataString) {
        const [dia, mes, ano] = dataString.split('/');
        return new Date(ano, mes - 1, dia);
    }

    // ✅ Função para formatar hora de HH:mm:ss para HH:mm
    function formatarHora(hora) {
        if (!hora) return '-';
        const [horas, minutos] = hora.split(':');
        return `${horas}:${minutos}`;
    }

    // ✅ Aplica filtro por intervalo de datas
    function aplicarFiltro() {
        const dataInicioInput = document.getElementById('dataInicio').value;
        const dataFimInput = document.getElementById('dataFim').value;

        if (!validarData(dataInicioInput) || !validarData(dataFimInput)) {
            alert('⚠️ Por favor, insira datas válidas no formato dd/mm/yyyy.');
            return;
        }

        const dataInicio = converterData(dataInicioInput);
        const dataFim = converterData(dataFimInput);

        ['batismosTable', 'ensaiosTable', 'mocidadeTable', 'ministerialTable', 'outrasReunioesTable'].forEach(tabelaId => {
            const tabela = document.getElementById(tabelaId);
            if (tabela) {
                tabela.querySelectorAll('tbody tr').forEach(linha => {
                    const dataTexto = linha.querySelector('td:first-child')?.innerText.trim();
                    linha.style.display = (dataTexto && converterData(dataTexto) >= dataInicio && converterData(dataTexto) <= dataFim) ? '' : 'none';
                });
            }
        });

        console.log(`🔍 Registros filtrados entre ${dataInicioInput} e ${dataFimInput}.`);
    }

      // ✅ Configuração do Quill.js SEM sobrescrever o HTML
    const quillConfig = {
        modules: { toolbar: false },
        theme: 'snow'
    };

    // ✅ Inicializa os editores Quill.js corretamente sem remover o conteúdo fixo
    document.querySelectorAll('.quill-editor').forEach(editor => {
        new Quill(editor, quillConfig);
    });

    console.log("✅ Editores inicializados com sucesso.");

    // ✅ Eventos
    document.getElementById('filtrarRegistros')?.addEventListener('click', aplicarFiltro);
    document.getElementById('dataFim')?.addEventListener('keypress', event => {
        if (event.key === 'Enter') aplicarFiltro();
    });

    // ✅ Carregar registros da tabela "Outras Reuniões"
    function carregarOutrasReunioes() {
        const tabela = document.getElementById('outrasReunioesTable')?.querySelector('tbody');
        if (!tabela) return;

        tabela.innerHTML = '<tr><td colspan="5" class="text-center">Carregando...</td></tr>';

        fetch('/outras_reunioes/listar')
            .then(response => response.json())
            .then(reunioes => {
                console.log("📌 Registros recebidos da API:", reunioes);

                tabela.innerHTML = reunioes.length === 0
                    ? '<tr><td colspan="5" class="text-center">Nenhum registro encontrado</td></tr>'
                    : reunioes.map(reuniao => {
                        const dataFormatada = formatarData(reuniao.data);
                        const horaFormatada = formatarHora(reuniao.hora);
                        let natureza = `${reuniao.tipo || ''} - ${reuniao.obs || ''}`.trim();
                        natureza = natureza.replace(/-$/, '').trim();

                        return `
                            <tr>
                                <td>${dataFormatada}</td>
                                <td>${horaFormatada}</td>
                                <td>${natureza || '-'}</td>
                                <td>${reuniao.local || '-'}</td>
                                <td>${reuniao.atendimento || '-'}</td>
                            </tr>
                        `;
                    }).join('');
            })
            .catch(error => {
                console.error('❌ Erro ao carregar outras reuniões:', error);
                tabela.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Erro ao carregar registros.</td></tr>';
            });
    }
    carregarOutrasReunioes();
});







