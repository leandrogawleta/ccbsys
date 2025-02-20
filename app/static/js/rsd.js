document.addEventListener("DOMContentLoaded", function () {
    carregarIgrejas();

    document.getElementById("igrejaRSD").addEventListener("change", atualizarTabelaRegistros);
    document.getElementById("formAdicionarRegistro").addEventListener("submit", adicionarRegistro);
    document.getElementById("btnAdicionarRegistro").addEventListener("click", verificarIgrejaAntesDeAbrirModal);
});

// ===========================
// 🔹 Atualizar Tabela ao Selecionar Igreja
// ===========================
function atualizarTabelaRegistros() {
    const selectIgreja = document.getElementById("igrejaRSD");
    const igrejaId = selectIgreja.value;
    const igrejaNome = selectIgreja.options[selectIgreja.selectedIndex].text;

    if (!igrejaId) {
        alert("Por favor, selecione uma igreja.");
        return;
    }

    console.log(`🔹 Buscando registros para a igreja: ${igrejaNome}`);

    fetch(`/rsd/listar_registros?igreja=${encodeURIComponent(igrejaNome)}`)
        .then(response => response.json())
        .then(registros => {
            const tabela = document.getElementById("tabelaRegistros").getElementsByTagName("tbody")[0];

            tabela.innerHTML = "";

            if (!registros || registros.length === 0) {
                tabela.innerHTML = `<tr><td colspan="9" class="text-center text-muted">Nenhum registro encontrado.</td></tr>`;
                return;
            }

            registros.forEach(registro => {
                let novaLinha = tabela.insertRow();

                novaLinha.innerHTML = `
                    <td contenteditable="true" onFocus="armazenarValorOriginal(this)" data-original="${registro.tipo}">${registro.tipo}</td>
                    <td contenteditable="true" onFocus="armazenarValorOriginal(this)" data-original="${registro.data}">${registro.data}</td>
                    <td contenteditable="true" onFocus="armazenarValorOriginal(this)" data-original="${registro.hora}">${registro.hora}</td>
                    <td contenteditable="true" onFocus="armazenarValorOriginal(this)" data-original="${registro.descricao}">${registro.descricao}</td>
                    <td contenteditable="true" onFocus="armazenarValorOriginal(this)" data-original="${registro.atendimento || "-"}">${registro.atendimento || "-"}</td>
                    <td contenteditable="true" onFocus="armazenarValorOriginal(this)" data-original="${registro.lb || "Sim"}">${registro.lb || "Sim"}</td>
                    <td contenteditable="true" onFocus="armazenarValorOriginal(this)" data-original="${registro.cl || "Sim"}">${registro.cl || "Sim"}</td>
                    <td>
                        <button class="btn btn-success btn-sm me-2" onclick="salvarEdicao(${registro.id}, this)">
                            <i class="bi bi-check2-circle"></i>
                        </button>
                        <button class="btn btn-warning btn-sm me-2" onclick="duplicarRegistro(${registro.id})">
                            <i class="bi bi-files"></i> <!-- Ícone de duplicação -->
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="excluirRegistro(${registro.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                `;
            });
        })
        .catch(error => console.error("❌ Erro ao buscar registros:", error));
}

// função para duplicarRegistro

function duplicarRegistro(id) {
    if (!confirm("Deseja duplicar este registro?")) {
        return;
    }

    let novaData = prompt("Informe a nova data (dd-mm-yyyy):");
    if (!novaData || !/^\d{2}-\d{2}-\d{4}$/.test(novaData)) {
        alert("Data inválida. Use o formato dd-mm-yyyy.");
        return;
    }

    let novaHora = prompt("Informe a nova hora (HH:mm):");
    if (!novaHora || !/^\d{2}:\d{2}$/.test(novaHora)) {
        alert("Hora inválida. Use o formato HH:mm.");
        return;
    }

    console.log(`🔹 Duplicando registro ID ${id} para ${novaData} às ${novaHora}`);

    fetch(`/rsd/duplicar_item/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: novaData, hora: novaHora })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert("Erro ao duplicar: " + data.error);
        } else {
            alert("Registro duplicado com sucesso!");
            atualizarTabelaRegistros();
        }
    })
    .catch(error => console.error("❌ Erro ao duplicar registro:", error));
}

// ===========================
// 🔹 Salvar Edição ao Selecionar Igreja
// ===========================

function salvarEdicao(id, botao) {
    let linha = botao.closest("tr");
    let colunas = linha.getElementsByTagName("td");

    let novoRegistro = {
        tipo: colunas[0].innerText.trim(),
        data: colunas[1].innerText.trim(),
        hora: colunas[2].innerText.trim(),
        descricao: colunas[3].innerText.trim(),
        atendimento: colunas[4].innerText.trim(),
        lb: colunas[5].innerText.trim(),  // ✅ Incluído LB
        cl: colunas[6].innerText.trim()   // ✅ Incluído CL
    };

    // Comparar com valores originais para evitar edições desnecessárias
    let valoresOriginais = Array.from(colunas).map(td => td.getAttribute("data-original"));

    if (Object.values(novoRegistro).every((valor, index) => valor === valoresOriginais[index])) {
        alert("Nenhuma alteração foi feita.");
        return;
    }

    // ✅ Exibir uma mensagem de confirmação antes de salvar a edição
    if (!confirm("Tem certeza que deseja salvar as alterações?")) {
        return;
    }

    console.log(`🔹 Atualizando ID ${id}:`, novoRegistro);

    fetch(`/rsd/editar_item_inline/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoRegistro)
    })
    .then(response => response.json())
    .then(data => {
        console.log("✅ Resposta do backend:", data);

        if (data.error) {
            alert("Erro ao atualizar: " + data.error);
            return;
        }

        alert("Registro atualizado com sucesso!");

        // Atualizar os valores originais para evitar mensagens desnecessárias
        Object.keys(novoRegistro).forEach((key, index) => {
            colunas[index].setAttribute("data-original", novoRegistro[key]);
        });

    })
    .catch(error => console.error("❌ Erro ao atualizar registro:", error));
}
// ===========================
// 🔹 Excluir Registro da Tabela e do Banco de Dados
// ===========================
function excluirRegistro(id) {
    if (!confirm("Tem certeza que deseja excluir este registro?")) {
        return;
    }

    console.log(`🔹 Excluindo registro ID: ${id}`);

    fetch(`/rsd/excluir_item/${id}`, {
        method: "DELETE",
    })
    .then(response => response.json())
    .then(data => {
        console.log("✅ Resposta do backend:", data);

        if (data.error) {
            alert("Erro ao excluir: " + data.error);
            return;
        }

        alert("Registro excluído com sucesso!");

        // ✅ Atualizar automaticamente a tabela após a exclusão
        atualizarTabelaRegistros();

    })
    .catch(error => console.error("❌ Erro ao excluir registro:", error));
}

// ===========================
// 🔹 Verificar se uma igreja foi selecionada antes de abrir o modal
// ===========================
function verificarIgrejaAntesDeAbrirModal() {
    const igrejaId = document.getElementById("igrejaRSD").value;
    console.log("Igreja selecionada:", igrejaId); // Debug

    if (!igrejaId) {
        alert("Por favor, selecione uma igreja antes de adicionar um registro.");
        return;
    }

    // Verificar se o modal existe no DOM
    const modalElement = document.getElementById("modalAdicionarRegistro");
    if (!modalElement) {
        console.error("Erro: Modal não encontrado no DOM!");
        return;
    }

    // Carregar as opções antes de abrir o modal
    fetch("/rsd/naturezas")
        .then(response => response.json())
        .then(data => {
            const tipoSelect = document.getElementById("tipoRegistro");
            tipoSelect.innerHTML = ""; // Limpa quaisquer opções existentes
            data.forEach(natureza => {
                const option = document.createElement("option");
                option.value = natureza.descricao;
                option.textContent = natureza.descricao;
                tipoSelect.appendChild(option);
            });

            // Criar e abrir o modal corretamente
            try {
                let modal = new bootstrap.Modal(modalElement);
                modal.show();
            } catch (error) {
                console.error("Erro ao abrir o modal:", error);
            }
        })
        .catch(error => console.error("Erro ao carregar naturezas:", error));
}

// ===========================
// 🔹 Converter Data para Banco (YYYY-MM-DD) e Exibir no Frontend (DD-MM-YYYY)
// ===========================
function formatarDataParaBanco(dataInput) {
    if (!dataInput) return null; // Retorna null se não houver data selecionada

    let partes = dataInput.split("-");
    if (partes.length === 3) {
        return `${partes[2]}-${partes[1]}-${partes[0]}`; // Retorna no formato YYYY-MM-DD
    }
    return null;
}

// 🔹 Exibir Data Formatada no Input (DD-MM-YYYY)
function formatarDataParaExibicao(dataBanco) {
    if (!dataBanco) return "";
    let partes = dataBanco.split("-");
    return `${partes[2]}-${partes[1]}-${partes[0]}`; // Retorna no formato DD-MM-YYYY
}

// 🔹 Garantir que a Data no Modal sempre exiba DD-MM-YYYY
document.getElementById("dataRegistro").addEventListener("focus", function() {
    let dataAtual = this.value;
    if (dataAtual) {
        this.value = formatarDataParaExibicao(dataAtual);
    }
});

// ===========================
// 🔹 Carregar Igrejas no Listbox
// ===========================
function carregarIgrejas() {
    fetch("/rsd/listar_igrejas")
        .then(response => response.json())
        .then(igrejas => {
            const selectIgreja = document.getElementById("igrejaRSD");
            selectIgreja.innerHTML = '<option value="" disabled selected>Selecione a Igreja</option>';

            igrejas.forEach(igreja => {
                let option = document.createElement("option");
                option.value = igreja.id;
                option.textContent = igreja.nome;
                selectIgreja.appendChild(option);
            });
        })
        .catch(error => console.error("Erro ao carregar igrejas:", error));
}

// ===========================
// 🔹 Adicionar Registro ao Banco de Dados
// ===========================
function adicionarRegistro(event) {
    event.preventDefault();

    const selectIgreja = document.getElementById("igrejaRSD");
    const igrejaId = selectIgreja.value;
    const igrejaNome = selectIgreja.options[selectIgreja.selectedIndex].text; // ✅ Obtém o nome correto

    if (!igrejaId) {
        alert("Por favor, selecione uma igreja antes de adicionar um registro.");
        return;
    }

    // ✅ Pegar a data no formato correto
    const dataInput = document.getElementById("dataRegistro").value;
    const dataFormatada = formatarDataParaBanco(dataInput);

    if (!dataFormatada) {
        alert("Por favor, selecione uma data válida.");
        return;
    }

    // ✅ Capturar valores dos novos campos LB e CL
    const lbSelecionado = document.getElementById("lbRegistro").value || "Sim";
    const clSelecionado = document.getElementById("clRegistro").value || "Sim";

    // ✅ Criar o objeto do novo registro
    const novoRegistro = {
        tipo: document.getElementById("tipoRegistro").value,
        data: dataFormatada,  
        hora: document.getElementById("horaRegistro").value,
        descricao: document.getElementById("descricaoRegistro").value,
        atendimento: document.getElementById("atendimentoRegistro").value,
        igreja: igrejaNome,
        lb: lbSelecionado,  // ✅ Incluído LB
        cl: clSelecionado   // ✅ Incluído CL
    };

    console.log("🔹 Enviando dados para o backend:", JSON.stringify(novoRegistro));

    fetch("/rsd/adicionar_item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoRegistro)
    })
    .then(response => response.json())
    .then(data => {
        console.log("✅ Resposta do backend:", data);

        if (data.error) {
            alert("Erro ao salvar: " + data.error);
            return;
        }

        alert("Registro adicionado com sucesso!");

        // ✅ Limpar formulário
        document.getElementById("formAdicionarRegistro").reset();

        // ✅ Fechar modal
        let modal = bootstrap.Modal.getInstance(document.getElementById("modalAdicionarRegistro"));
        modal.hide();

        // ✅ Atualizar automaticamente a tabela de registros
        atualizarTabelaRegistros();

    })
    .catch(error => console.error("❌ Erro ao salvar registro:", error));
}

// ===========================
// 🔹 Enviar os Dados Editados para o Backend
// ===========================
document.getElementById("formEditarRegistro").addEventListener("submit", function (event) {
    event.preventDefault();

    const id = document.getElementById("registroId").value;

    const registroAtualizado = {
        tipo: document.getElementById("editarTipoRegistro").value,
        data: formatarDataParaExibicao(document.getElementById("editarDataRegistro").value), // Formato DD-MM-YYYY
        hora: document.getElementById("editarHoraRegistro").value,
        descricao: document.getElementById("editarDescricaoRegistro").value,
        atendimento: document.getElementById("editarAtendimentoRegistro").value
    };

    console.log(`🔹 Enviando atualização para o registro ID: ${id}`);

    fetch(`/rsd/editar_item/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registroAtualizado)
    })
    .then(response => response.json())
    .then(data => {
        console.log("✅ Resposta do backend:", data);

        if (data.error) {
            alert("Erro ao atualizar: " + data.error);
            return;
        }

        alert("Registro atualizado com sucesso!");

        // ✅ Fechar modal
        let modal = bootstrap.Modal.getInstance(document.getElementById("modalEditarRegistro"));
        modal.hide();

        // ✅ Atualizar automaticamente a tabela
        atualizarTabelaRegistros();
    })
    .catch(error => console.error("❌ Erro ao atualizar registro:", error));
});


document.addEventListener("DOMContentLoaded", function() {
    const modalAdicionarRegistro = new bootstrap.Modal(document.getElementById("modalAdicionarRegistro"));

    fetch("/rsd/naturezas")
        .then(response => response.json())
        .then(data => {
            const tipoSelect = document.getElementById("tipoRegistro");
            tipoSelect.innerHTML = ""; // Limpa quaisquer opções existentes
            data.forEach(natureza => {
                const option = document.createElement("option");
                option.value = natureza.descricao;
                option.textContent = natureza.descricao;
                tipoSelect.appendChild(option);
            });

            // Abra o modal após carregar as opções
           // modalAdicionarRegistro.show();
        })
        .catch(error => console.error("Erro ao carregar naturezas:", error));
});