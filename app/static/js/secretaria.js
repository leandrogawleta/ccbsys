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
        const dados = await resposta.json();
        const tabela = document.getElementById("tabelaIgrejas");
        tabela.innerHTML = dados.length ? dados.map(i => `
            <tr>
                <td>${i.nome}</td>
                <td>${i.cidade}</td>
                <td>${i.setor}</td>
                <td>${i.endereco || 'Não informado'}</td>
                <td>
                    <button class="btn btn-warning btn-sm me-1" onclick="editarIgreja(${i.id}, '${i.nome}', '${i.cidade}', '${i.setor}', '${i.endereco}')">
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

    // Capturar valores corretamente
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
            carregarIgrejas();
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
        const dados = await resposta.json();
        const tabela = document.getElementById("tabelaNatureza");
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

    const form = event.target;
    const naturezaId = document.getElementById("naturezaId").value;
    const dados = Object.fromEntries(new FormData(form));
    const url = naturezaId ? `${API_BASE_URL}/natureza/${naturezaId}` : `${API_BASE_URL}/natureza`;
    const metodo = naturezaId ? "PUT" : "POST";

    try {
        const resposta = await fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();
        alert(resultado.message || resultado.error);

        if (!resultado.error) {
            form.reset();
            document.getElementById("naturezaId").value = "";
            fecharModal("modalCadastroNatureza");
            carregarNaturezas();
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
    const modal = bootstrap.Modal.getInstance(document.getElementById(idModal));
    if (modal) modal.hide();

    // 🔹 Remover backdrop manualmente para evitar bug
    document.body.classList.remove("modal-open");
    document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());
}


