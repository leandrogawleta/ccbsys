document.addEventListener("DOMContentLoaded", () => {
    carregarIgrejas();
    carregarNaturezas();

    document.getElementById("formIgreja").addEventListener("submit", salvarIgreja);
    document.getElementById("formNatureza").addEventListener("submit", salvarNatureza);
});

const API_BASE_URL = "/secretaria";

// ================================
// ✅ Função: Carregar Igrejas
// ================================
async function carregarIgrejas() {
    try {
        const resposta = await fetch(`${API_BASE_URL}/igrejas`);
        if (!resposta.ok) throw new Error(`Erro HTTP! Status: ${resposta.status}`);
        
        const dados = await resposta.json();
        const tabela = document.getElementById("tabelaIgrejas");
        
        if (!tabela) {
            console.error("Elemento #tabelaIgrejas não encontrado!");
            return;
        }

        tabela.innerHTML = dados.length ? dados.map(i => `
            <tr>
                <td>${i.nome}</td>
                <td>${i.cidade}</td>
                <td>${i.setor}</td>
                <td>${i.endereco || 'Não informado'}</td>
                <td>
                    <button class="btn btn-warning btn-sm me-1" onclick="editarIgreja(${i.id}, '${i.nome}', '${i.cidade}', '${i.setor}', '${i.endereco || ''}')">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="excluirIgreja(${i.id})">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </td>
            </tr>`).join("") : `<tr><td colspan="5" class="text-center">Nenhuma igreja cadastrada.</td></tr>`;
        
    } catch (error) {
        console.error("❌ Erro ao carregar igrejas:", error);
    }
}

// ================================
// ✅ Função: Salvar Igreja
// ================================
async function salvarIgreja(event) {
    event.preventDefault();

    const igrejaId = document.getElementById("igrejaId").value;
    const nome = document.getElementById("nomeIgreja").value.trim();
    const cidade = document.getElementById("cidadeIgreja").value.trim();
    const setor = document.getElementById("setorIgreja").value.trim();
    const endereco = document.getElementById("enderecoIgreja").value.trim();

    if (!nome || !cidade || !setor) {
        alert("⚠️ Nome, cidade e setor são obrigatórios!");
        return;
    }

    const url = igrejaId ? `${API_BASE_URL}/igreja/${igrejaId}` : `${API_BASE_URL}/igreja`;
    const metodo = igrejaId ? "PUT" : "POST";

    try {
        const resposta = await fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, cidade, setor, endereco })
        });

        const resultado = await resposta.json();
        alert(resultado.message || resultado.error);

        if (!resultado.error) {
            document.getElementById("formIgreja").reset();
            document.getElementById("igrejaId").value = "";
            fecharModal("modalCadastroIgreja");
            carregarIgrejas();  // 🚀 Atualiza a tabela após salvar!
        }
    } catch (error) {
        console.error("❌ Erro ao salvar igreja:", error);
    }
}

// ================================
// ✅ Função: Editar Igreja
// ================================
function editarIgreja(id, nome, cidade, setor, endereco) {
    document.getElementById("igrejaId").value = id;
    document.getElementById("nomeIgreja").value = nome;
    document.getElementById("cidadeIgreja").value = cidade;
    document.getElementById("setorIgreja").value = setor;
    document.getElementById("enderecoIgreja").value = endereco || "";

    abrirModal("modalCadastroIgreja");
}

// ================================
// ✅ Função: Excluir Igreja
// ================================
async function excluirIgreja(id) {
    if (confirm("⚠️ Tem certeza que deseja excluir esta igreja?")) {
        try {
            const resposta = await fetch(`${API_BASE_URL}/igreja/${id}`, { method: "DELETE" });
            const resultado = await resposta.json();
            alert(resultado.message || resultado.error);
            carregarIgrejas();
        } catch (error) {
            console.error("❌ Erro ao excluir igreja:", error);
        }
    }
}

// ================================
// ✅ Função: Carregar Naturezas
// ================================
async function carregarNaturezas() {
    try {
        const resposta = await fetch(`${API_BASE_URL}/naturezas`);
        if (!resposta.ok) throw new Error(`Erro HTTP! Status: ${resposta.status}`);

        const dados = await resposta.json();
        const tabela = document.getElementById("tabelaNatureza");

        if (!tabela) {
            console.error("Elemento #tabelaNatureza não encontrado!");
            return;
        }

        tabela.innerHTML = dados.length ? dados.map(n => `
            <tr>
                <td>${n.descricao}</td>
                <td>
                    <button class="btn btn-warning btn-sm me-1" onclick="editarNatureza(${n.id}, '${n.descricao}')">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="excluirNatureza(${n.id})">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </td>
            </tr>`).join("") : `<tr><td colspan="2" class="text-center">Nenhuma natureza cadastrada.</td></tr>`;
    } catch (error) {
        console.error("❌ Erro ao carregar naturezas:", error);
    }
}

// ================================
// ✅ Função: Salvar Natureza
// ================================
async function salvarNatureza(event) {
    event.preventDefault();

    const naturezaId = document.getElementById("naturezaId").value;
    const descricao = document.getElementById("descricaoNatureza").value.trim();

    if (!descricao) {
        alert("⚠️ A descrição da natureza é obrigatória!");
        return;
    }

    const url = naturezaId ? `${API_BASE_URL}/natureza/${naturezaId}` : `${API_BASE_URL}/natureza`;
    const metodo = naturezaId ? "PUT" : "POST";

    try {
        const resposta = await fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ descricao })
        });

        const resultado = await resposta.json();
        alert(resultado.message || resultado.error);

        if (!resultado.error) {
            document.getElementById("formNatureza").reset();
            document.getElementById("naturezaId").value = "";
            fecharModal("modalCadastroNatureza");
            carregarNaturezas();  // 🚀 Atualiza a tabela após salvar!
        }
    } catch (error) {
        console.error("❌ Erro ao salvar natureza:", error);
    }
}

// ================================
// ✅ Função: Editar Natureza
// ================================
function editarNatureza(id, descricao) {
    document.getElementById("naturezaId").value = id;
    document.getElementById("descricaoNatureza").value = descricao;

    abrirModal("modalCadastroNatureza");
}

// ================================
// ✅ Função: Excluir Natureza
// ================================
async function excluirNatureza(id) {
    if (confirm("⚠️ Tem certeza que deseja excluir esta natureza?")) {
        try {
            const resposta = await fetch(`${API_BASE_URL}/natureza/${id}`, { method: "DELETE" });
            const resultado = await resposta.json();
            alert(resultado.message || resultado.error);
            carregarNaturezas();
        } catch (error) {
            console.error("❌ Erro ao excluir natureza:", error);
        }
    }
}

// ================================
// ✅ Funções de Manipulação de Modal
// ================================
function abrirModal(idModal) {
    const modal = new bootstrap.Modal(document.getElementById(idModal));
    modal.show();
}

function fecharModal(idModal) {
    const modalElement = document.getElementById(idModal);
    if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
        modal.hide();
    }
    document.body.classList.remove("modal-open");
    document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());
}

document.addEventListener("DOMContentLoaded", () => {
    carregarFiltroAno();
    carregarEstatisticas();
    carregarGraficoReunioes();
    carregarGraficoReunioesMes();
    carregarReunioesSemana();
});

async function carregarEstatisticas() {
    const ano = document.getElementById("filtroAno").value;
    const resposta = await fetch(`/secretaria/estatisticas?ano=${ano}`); // Enviamos o ano como parâmetro
    const dados = await resposta.json();

    document.getElementById("totalReunioes").innerText = dados.total_reunioes;
    document.getElementById("reunioesConcluidas").innerText = dados.reunioes_concluidas;
    document.getElementById("reunioesPendentes").innerText = dados.total_reunioes - dados.reunioes_concluidas;
}


async function carregarGraficoReunioesMes() {
    const ano = document.getElementById("filtroAno").value;
    const resposta = await fetch(`/secretaria/por_mes?ano=${ano}`);
    const dados = await resposta.json();

    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const valores = new Array(12).fill(0);

    Object.keys(dados).forEach(mes => {
        const index = parseInt(mes) - 1;
        valores[index] = dados[mes];
    });

    const ctx = document.getElementById("graficoReunioesMes").getContext("2d");

    if (window.graficoLinhas) {
        window.graficoLinhas.destroy();
    }

    window.graficoLinhas = new Chart(ctx, {
        type: "line",
        data: {
            labels: meses,
            datasets: [{
                label: "Reuniões por Mês",
                data: valores,
                borderColor: "#007bff",
                backgroundColor: "rgba(0, 123, 255, 0.2)",
                borderWidth: 2,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: "top"
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Quantidade"
                    }
                }
            }
        }
    });
}


async function carregarReunioesSemana() {
    try {
        const resposta = await fetch("/secretaria/semana");
        if (!resposta.ok) throw new Error(`Erro HTTP! Status: ${resposta.status}`);

        const dados = await resposta.json();
        const tabela = document.getElementById("tabelaReunioesSemana").getElementsByTagName("tbody")[0];

        if (!tabela) {
            console.error("❌ Elemento #tabelaReunioesSemana não encontrado!");
            return;
        }

        // 🔹 Formatar Data e Hora corretamente antes de exibir na tabela
        const formatarData = (dataString) => {
            if (!dataString) return "Sem data";
            if (dataString.includes("-")) { // Se for formato YYYY-MM-DD
                const [ano, mes, dia] = dataString.split("-");
                return `${dia}/${mes}/${ano}`;
            }
            return dataString; // Se já estiver no formato correto DD/MM/YYYY
        };

        const formatarHora = (horaString) => {
            if (!horaString) return "Sem hora";
            return horaString.substring(0, 5); // Pega apenas HH:mm
        };

        // 🔹 Ordenar os dados manualmente por segurança (caso o backend falhe)
        dados.sort((a, b) => {
            const dataA = a.data.split("/").reverse().join("-"); // Converte para YYYY-MM-DD
            const dataB = b.data.split("/").reverse().join("-");

            if (dataA !== dataB) {
                return dataA.localeCompare(dataB);
            }
            return a.hora.localeCompare(b.hora);
        });

        tabela.innerHTML = dados.length
            ? dados.map(r => `
                <tr>
                    <td>${formatarData(r.data)}</td>
                    <td>${formatarHora(r.hora)}</td>
                    <td>${r.descricao || "Sem descrição"}</td>
                    <td>${r.atendimento || "Sem atendimento"}</td>
                    <td>${r.igreja || "Sem local"}</td>
                </tr>
            `).join("")
            : `<tr><td colspan="5" class="text-center">Nenhuma reunião programada para esta semana.</td></tr>`;

    } catch (error) {
        console.error("❌ Erro ao carregar reuniões da semana:", error);
    }
}




async function carregarGraficoReunioes() {
    const ano = document.getElementById("filtroAno").value;
    const resposta = await fetch(`/secretaria/por_tipo?ano=${ano}`); // Envia o ano no parâmetro
    const dados = await resposta.json();

    const ctx = document.getElementById("graficoReunioes").getContext("2d");
    
    // Se já existir um gráfico, destrói para recriar
    if (window.graficoPizza) {
        window.graficoPizza.destroy();
    }

    window.graficoPizza = new Chart(ctx, {
        type: "pie",
        data: {
            labels: Object.keys(dados),
            datasets: [{
                label: "Reuniões por Tipo",
                data: Object.values(dados),
                backgroundColor: [
                    "#007bff", "#28a745", "#dc3545", "#ffc107", "#17a2b8",
                    "#6610f2", "#e83e8c", "#20c997", "#fd7e14", "#6c757d"
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: "right"
                }
            }
        }
    });
}


function carregarFiltroAno() {
    const filtroAno = document.getElementById("filtroAno");
    const anoAtual = new Date().getFullYear();

    // Define o ano mínimo para 2020
    const anoInicio = 2020;

    // Limpa as opções antes de adicionar novas
    filtroAno.innerHTML = "";

    for (let ano = anoAtual; ano >= anoInicio; ano--) {
        const option = document.createElement("option");
        option.value = ano;
        option.textContent = ano;
        filtroAno.appendChild(option);
    }

    filtroAno.value = anoAtual; // Define o ano atual como padrão
}


function atualizarGraficos() {
    carregarEstatisticas();  // ✅ Atualiza Total de Reuniões, Concluídas e Pendentes
    carregarGraficoReunioes();  // ✅ Atualiza o gráfico de Pizza por Tipo
    carregarGraficoReunioesMes();  // ✅ Atualiza o gráfico de Linhas por Mês
    carregarReunioesSemana();  // ✅ Atualiza a Tabela de Reuniões da Semana
}

document.addEventListener("DOMContentLoaded", () => {
    carregarFiltroAno();
    atualizarGraficos();  // ✅ Carrega estatísticas e gráficos com o ano padrão

    // 🚀 Adiciona evento para atualizar os gráficos ao trocar o ano
    document.getElementById("filtroAno").addEventListener("change", atualizarGraficos);
});
