document.addEventListener("DOMContentLoaded", function () {
    carregarIgrejas();
    carregarNaturezas();

    document.getElementById("formIgreja").addEventListener("submit", salvarIgreja);
    document.getElementById("formNatureza").addEventListener("submit", salvarNatureza);
});

const API_BASE_URL = "/secretaria";  // ✅ Definir o prefixo correto

// ================================
// ✅ Função: Carregar Igrejas
// ================================
function carregarIgrejas() {
    fetch(`${API_BASE_URL}/igrejas`)
        .then(response => response.json())
        .then(data => {
            let tabela = document.getElementById("tabelaIgrejas");
            tabela.innerHTML = "";
            data.forEach(igreja => {
                tabela.innerHTML += `
                    <tr>
                        <td>${igreja.Nome}</td>
                        <td>${igreja.Cidade}</td>
                        <td>${igreja.Setor}</td>
                        <td>${igreja.Endereco || 'Não informado'}</td>
                        <td>
                            <button class="btn btn-warning btn-sm me-1" onclick="editarIgreja(${igreja.id}, '${igreja.Nome}', '${igreja.Cidade}', '${igreja.Setor}', '${igreja.Endereco}')">
                                <i class="bi bi-pencil-square"></i>
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="excluirIgreja(${igreja.id})">
                                <i class="bi bi-trash-fill"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
        })
        .catch(error => console.error("❌ Erro ao carregar igrejas:", error));
}

// ================================
// ✅ Função: Salvar Igreja
// ================================
function salvarIgreja(event) {
    event.preventDefault();

    let igrejaId = document.getElementById("igrejaId").value;
    let nome = document.getElementById("nomeIgreja").value;
    let cidade = document.getElementById("cidadeIgreja").value;
    let setor = document.getElementById("setorIgreja").value;
    let endereco = document.getElementById("enderecoIgreja").value;

    let url = igrejaId ? `${API_BASE_URL}/igreja/${igrejaId}/editar` : `${API_BASE_URL}/igreja`;
    let metodo = igrejaId ? "PUT" : "POST";

    fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Nome: nome, Cidade: cidade, Setor: setor, Endereco: endereco })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(`❌ Erro: ${data.error}`);
            return;
        }

        alert(data.message);

        // ✅ Resetar formulário e ID
        document.getElementById("formIgreja").reset();
        document.getElementById("igrejaId").value = "";

        // ✅ Fechar modal automaticamente
        let modal = bootstrap.Modal.getInstance(document.getElementById("modalCadastroIgreja"));
        if (modal) modal.hide();

        // ✅ Corrigir problema de página desativada (remove classe `modal-open` e `backdrop`)
        document.body.classList.remove("modal-open");
        document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());

        // ✅ Atualizar lista de igrejas sem recarregar a página
        carregarIgrejas();
    })
    .catch(error => console.error("❌ Erro ao salvar igreja:", error));
}

// ✅ Função: Editar Igreja
function editarIgreja(id, nome, cidade, setor, endereco) {
    document.getElementById("igrejaId").value = id;
    document.getElementById("nomeIgreja").value = nome;
    document.getElementById("cidadeIgreja").value = cidade;
    document.getElementById("setorIgreja").value = setor;
    document.getElementById("enderecoIgreja").value = endereco || "";

    // 🔹 Exibir o modal corretamente
    let modal = new bootstrap.Modal(document.getElementById("modalCadastroIgreja"));
    modal.show();
}

// ================================
// 🔹 Função: Excluir Igreja
// ================================
function excluirIgreja(id) {
    if (confirm("⚠️ Tem certeza que deseja excluir esta igreja?")) {
        fetch(`${API_BASE_URL}/igreja/${id}/excluir`, { method: "DELETE" })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(`❌ Erro: ${data.error}`);
                    return;
                }

                alert(data.message);
                carregarIgrejas(); // 🔹 Atualiza a lista após excluir
            })
            .catch(error => console.error("❌ Erro ao excluir igreja:", error));
    }
}

// ================================
// ✅ Função: Carregar Naturezas
// ================================
function carregarNaturezas() {
    fetch(`${API_BASE_URL}/naturezas`)
        .then(response => response.json())
        .then(data => {
            let tabela = document.getElementById("tabelaNatureza");
            if (!tabela) {
                console.error("⚠️ Erro: Elemento 'tabelaNatureza' não encontrado.");
                return;
            }

            tabela.innerHTML = ""; // Limpa a tabela antes de recarregar os dados

            if (data.length === 0) {
                tabela.innerHTML = `<tr><td colspan="2" class="text-center">Nenhuma natureza cadastrada.</td></tr>`;
                return;
            }

            data.forEach(natureza => {
                let linha = document.createElement("tr");
                linha.innerHTML = `
                    <td>${natureza.descricao}</td>
                    <td>
                        <button class="btn btn-warning btn-sm me-1" onclick="editarNatureza(${natureza.id}, '${natureza.descricao}')">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="excluirNatureza(${natureza.id})">
                            <i class="bi bi-trash-fill"></i>
                        </button>
                    </td>
                `;
                tabela.appendChild(linha);
            });
        })
        .catch(error => console.error("❌ Erro ao carregar naturezas:", error));
}

// ================================
// ✅ Função: Salvar Natureza (Criar ou Editar)
// ================================
function salvarNatureza(event) {
    event.preventDefault();

    let naturezaId = document.getElementById("naturezaId").value;
    let descricao = document.getElementById("descricaoNatureza").value.trim();

    if (!descricao) {
        alert("⚠️ A descrição da Natureza não pode estar vazia!");
        return;
    }

    let url = naturezaId ? `${API_BASE_URL}/natureza/${naturezaId}/editar` : `${API_BASE_URL}/natureza`;
    let metodo = naturezaId ? "PUT" : "POST";

    fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descricao })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(`❌ Erro: ${data.error}`);
            return;
        }

        alert(data.message);

        // ✅ Resetar formulário e ID para nova inserção
        document.getElementById("formNatureza").reset();
        document.getElementById("naturezaId").value = "";

        // ✅ Fechar modal corretamente
        let modal = bootstrap.Modal.getInstance(document.getElementById("modalCadastroNatureza"));
        if (modal) modal.hide();

        // ✅ Corrigir problema de página desativada (remove `modal-open` e `backdrop`)
        document.body.classList.remove("modal-open");
        document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());

        // ✅ Atualizar lista de naturezas sem precisar de refresh
        carregarNaturezas();
    })
    .catch(error => console.error("❌ Erro ao salvar natureza:", error));
}

// ================================
// ✅ Função: Editar Natureza (Preencher Modal)
// ================================
function editarNatureza(id, descricao) {
    document.getElementById("naturezaId").value = id;
    document.getElementById("descricaoNatureza").value = descricao;

    // 🔹 Exibir o modal corretamente
    let modal = new bootstrap.Modal(document.getElementById("modalCadastroNatureza"));
    modal.show();
}

// ================================
// ✅ Função: Excluir Natureza
// ================================
function excluirNatureza(id) {
    if (confirm("⚠️ Tem certeza que deseja excluir esta natureza?")) {
        fetch(`${API_BASE_URL}/natureza/${id}/excluir`, { method: "DELETE" })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(`❌ Erro: ${data.error}`);
                    return;
                }

                alert(data.message);
                carregarNaturezas(); // 🔹 Atualiza a lista após excluir
            })
            .catch(error => console.error("❌ Erro ao excluir natureza:", error));
    }
}

function salvarNatureza(event) {
    event.preventDefault();

    let naturezaId = document.getElementById("naturezaId").value;
    let descricao = document.getElementById("descricaoNatureza").value.trim();

    if (!descricao) {
        alert("⚠️ A descrição da Natureza não pode estar vazia!");
        return;
    }

    let url = naturezaId ? `${API_BASE_URL}/natureza/${naturezaId}/editar` : `${API_BASE_URL}/natureza`;
    let metodo = naturezaId ? "PUT" : "POST";

    fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descricao })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(`❌ Erro: ${data.error}`);
            return;
        }

        alert(data.message);

        // ✅ Resetar formulário e ID
        document.getElementById("formNatureza").reset();
        document.getElementById("naturezaId").value = "";

        // ✅ Fechar modal automaticamente
        let modal = bootstrap.Modal.getInstance(document.getElementById("modalCadastroNatureza"));
        if (modal) modal.hide();

        // ✅ Atualizar lista após salvar
        carregarNaturezas();
    })
    .catch(error => console.error("❌ Erro ao salvar natureza:", error));
}

