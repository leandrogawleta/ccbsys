// =============================
// FUNÇÕES DE FORMATAÇÃO
// =============================

// Função para formatar a data no formato DD-MM-YYYY
function formatarData(dateStr) {
    if (!dateStr.includes("-")) return dateStr; // Retorna sem alteração se não contiver "-"
    const partes = dateStr.split("-"); // Divide a string em [YYYY, MM, DD]
    if (partes.length === 3) {
        return `${partes[2]}-${partes[1]}-${partes[0]}`;  // Converte para DD-MM-YYYY
    }
    return dateStr;
}

// Função para formatar a hora no formato HH:MM
function formatarHora(timeStr) {
    if (!timeStr.includes(":")) return timeStr; // Retorna sem alteração se já estiver correto
    return timeStr.substring(0, 5); // Remove segundos caso existam (exemplo: "12:30:45" → "12:30")
}

// =============================
// VARIÁVEL GLOBAL PARA ARMAZENAR REUNIÕES
// =============================
let todasReunioes = []; // Mantém todas as reuniões carregadas para uso no filtro e ordenação

// =============================
// FUNÇÕES DE ORDENAÇÃO E FILTRAGEM
// =============================

// Converte a data para um formato ordenável (yyyy-mm-dd)
function converterDataParaOrdenacao(dateStr) {
    const partes = dateStr.split("-");
    if (partes.length === 3) {
        return `${partes[2]}-${partes[1]}-${partes[0]}`;  // Retorna formato yyyy-mm-dd para correta ordenação
    }
    return dateStr;
}

// Ordena reuniões por data e hora
function ordenarReunioes(reunioes) {
    return reunioes.sort((a, b) => {
        const dataA = converterDataParaOrdenacao(a.data);
        const dataB = converterDataParaOrdenacao(b.data);
        const horaA = a.hora;
        const horaB = b.hora;

        if (dataA < dataB) return -1;
        if (dataA > dataB) return 1;
        return horaA.localeCompare(horaB); // Compara horas como string
    });
}

// ✅ Função para filtrar a tabela conforme o texto digitado
function filtrarTabela() {
    const termo = document.getElementById('filtroTabela').value.toLowerCase();
    const linhas = document.querySelectorAll('#tabela-reunioes tbody tr');

    linhas.forEach(linha => {
        const textoLinha = linha.innerText.toLowerCase();
        linha.style.display = textoLinha.includes(termo) ? '' : 'none';
    });
}

// ✅ Adiciona o evento de input para filtrar conforme o usuário digita
document.getElementById('filtroTabela').addEventListener('input', filtrarTabela);


// =============================
// FUNÇÕES PARA CARREGAR A TABELA
// =============================

// Carrega reuniões via AJAX e armazena para filtragem
function carregarReunioes() {
    fetch('/api/reunioes')
        .then(response => response.json())
        .then(reunioes => {
            console.log("Dados recebidos do Backend:", reunioes);

            // Armazena as reuniões ordenadas na variável global
            todasReunioes = ordenarReunioes(reunioes);

            // Atualiza a tabela com os dados ordenados
            atualizarTabela(todasReunioes);
        })
        .catch(error => {
            console.error("Erro ao carregar reuniões:", error);
            document.getElementById("tabela-corpo").innerHTML = `<tr><td colspan="6" class="text-center text-danger">Erro ao carregar os dados.</td></tr>`;
        });
}

// Atualiza a tabela com uma lista de reuniões fornecida
function atualizarTabela(reunioes) {
    const tbody = document.getElementById("tabela-corpo");
    tbody.innerHTML = "";

    if (reunioes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Nenhuma reunião encontrada.</td></tr>`;
        return;
    }

    reunioes.forEach(reuniao => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td data-label="Data"><span class="data-formatada">${reuniao.data}</span></td>
            <td data-label="Hora" class="text-center">${reuniao.hora}</td>
            <td data-label="Natureza">${reuniao.natureza}</td>
            <td data-label="Local">${reuniao.local}</td>
            <td data-label="Atendimento" class="text-center">${reuniao.atendimento}</td>
            
        `;

        tbody.appendChild(row);
    });
}

// =============================
// GERAR CALENDÁRIO ANUAL
// =============================

// Garante que o evento de clique só é adicionado quando o DOM está carregado
document.addEventListener("DOMContentLoaded", function () {
    // Captura o botão "Gerar Calendário" e adiciona o evento de clique
    const botaoGerarCalendario = document.getElementById("botaoGerarCalendario");
    if (botaoGerarCalendario) {
        botaoGerarCalendario.addEventListener("click", function () {
            const anoInput = document.getElementById("anoCalendario").value.trim(); // Obtém o valor do campo

            if (anoInput && !isNaN(anoInput) && anoInput.length === 4) { // Verifica se é um ano válido
                window.location.href = `/reunioes/calendario/${anoInput}`; // Redireciona para a página do calendário
            } else {
                alert("Por favor, insira um ano válido!"); // Exibe um alerta se o ano for inválido
            }
        });
    } else {
        console.error("Erro: Elemento 'botaoGerarCalendario' não encontrado.");
    }

    // Captura o campo de pesquisa e adiciona evento de input
    const searchInput = document.querySelector('.input-group input');
    if (searchInput) {
        searchInput.addEventListener('input', filtrarTabela);
    }

    // Carrega as reuniões ao iniciar a página
    carregarReunioes();
});

