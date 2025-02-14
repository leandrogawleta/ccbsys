document.addEventListener('DOMContentLoaded', function () {
    console.log("Página carregada com sucesso!");

    // Função para validar o formato da data (dd/mm/yyyy)
    function validarData(data) {
        const regex = /^\d{2}\/\d{2}\/\d{4}$/;
        return regex.test(data);
    }

    // Função para converter string de data (dd/mm/yyyy) para objeto Date
    function converterData(dataString) {
        const [dia, mes, ano] = dataString.split('/');
        return new Date(ano, mes - 1, dia); // Meses no JavaScript começam do índice 0
    }

    // Função para formatar data de yyyy-mm-dd para dd/mm/yyyy
    function formatarData(data) {
        if (!data) return '';
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    // Função para formatar hora de HH:mm:ss para HH:mm
    function formatarHora(hora) {
        if (!hora) return '';
        const [horas, minutos] = hora.split(':');
        return `${horas}:${minutos}`;
    }

    // Função para aplicar filtro por intervalo de datas
    function aplicarFiltro() {
        const dataInicioInput = document.getElementById('dataInicio').value;
        const dataFimInput = document.getElementById('dataFim').value;

        if (!validarData(dataInicioInput) || !validarData(dataFimInput)) {
            alert('Por favor, insira datas válidas no formato dd/mm/yyyy.');
            return;
        }

        const dataInicio = converterData(dataInicioInput);
        const dataFim = converterData(dataFimInput);

        const tabelas = [
            'batismosTable',
            'ensaiosTable',
            'mocidadeTable',
            'ministerialTable',
            'outrasReunioesTable',
        ];

        tabelas.forEach(tabelaId => {
            const tabela = document.getElementById(tabelaId);
            if (!tabela) {
                console.warn(`Tabela com ID "${tabelaId}" não encontrada.`);
                return;
            }

            const linhas = tabela.querySelectorAll('tbody tr');
            linhas.forEach(linha => {
                const dataTexto = linha.querySelector('td:first-child')?.innerText.trim();
                if (!dataTexto) {
                    linha.style.display = 'none';
                    return;
                }

                const dataLinha = converterData(dataTexto);
                if (dataLinha >= dataInicio && dataLinha <= dataFim) {
                    linha.style.display = '';
                } else {
                    linha.style.display = 'none';
                }
            });
        });

        console.log(`Registros filtrados entre ${dataInicioInput} e ${dataFimInput}.`);
    }

    // Configuração do Quill.js
    const quillConfig = {
        modules: {
            toolbar: [
                [{ 'size': [] }],
                ['bold', 'italic', 'underline'],
                [{ 'align': [] }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['clean']
            ]
        },
        theme: 'snow',
        formats: ['size', 'bold', 'italic', 'underline', 'align', 'list']
    };

    // Texto padrão para os editores
    const textosPadrao = {
        coletas: "Coleta única: Piedade, Construção e Diversos",
        tss: "Araucária - Central: Todos os Sábados<br>Araucária - Thomaz Coelho: Todos os domingos<br>Araucária - Jardim Iguaçu: Todos os domingos",
        avisos: "Araucária - Central: cultos todas as quintas-feiras - 14:00<br>Curitiba - Portão: cultos todas as segundas-feiras - 19:30<br>Araucária - Central: Espaço Infantil todos os sábados - 19:00"
    };

    // Inicializar os editores com texto padrão
    const editorColetas = new Quill('#editor-coletas', quillConfig);    
    editorColetas.root.innerHTML = textosPadrao.coletas;

    const editorTss = new Quill('#editor-tss', quillConfig);
    editorTss.root.innerHTML = textosPadrao.tss;

    const editorAvisos = new Quill('#editor-avisos', quillConfig);
    editorAvisos.root.innerHTML = textosPadrao.avisos;

    console.log("Editores inicializados com texto padrão.");

    // Evento de clique no botão de filtro
    const filtrarBtn = document.getElementById('filtrarRegistros');
    if (filtrarBtn) {
        filtrarBtn.addEventListener('click', aplicarFiltro);
    }

    // Aplicar filtro ao pressionar Enter no campo dataFim
    const dataFimInput = document.getElementById('dataFim');
    if (dataFimInput) {
        dataFimInput.addEventListener('keypress', function (event) {
            if (event.key === 'Enter') {
                aplicarFiltro();
            }
        });
    }

    // Função para carregar dados da tabela Outras Reuniões
    function carregarOutrasReunioes() {
        fetch('/outras_reunioes/listar')
            .then(response => response.json())
            .then(reunioes => {
                console.log("Registros recebidos:", reunioes);
    
                const tabela = document.getElementById('outrasReunioesTable').querySelector('tbody');
                tabela.innerHTML = '';
    
                if (reunioes.length === 0) {
                    tabela.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum registro encontrado</td></tr>';
                    return;
                }
    
                reunioes.forEach(reuniao => {
                    // Concatenar "tipo" e "obs" para a coluna "natureza"
                    const natureza = `${reuniao.tipo} - ${reuniao.obs}`.trim().replace(/-\s*$/, '');

                    // Formatar a data antes de exibir
                    const dataFormatada = formatarData(reuniao.data);

                    const linha = `
                        <tr>
                            <td>${dataFormatada}</td>
                            <td>${reuniao.hora || '-'}</td>
                            <td>${natureza || '-'}</td>
                            <td>${reuniao.local || '-'}</td>
                            <td>${reuniao.atendimento || '-'}</td>
                        </tr>
                    `;
                    tabela.innerHTML += linha;
                });
            })
            .catch(error => console.error('Erro ao carregar outras reuniões:', error));
    }     

    // Carregar os registros de Outras Reuniões ao iniciar
    carregarOutrasReunioes();
});







