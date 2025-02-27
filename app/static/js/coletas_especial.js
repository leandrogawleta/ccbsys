document.addEventListener('DOMContentLoaded', function () {
    carregarColetasEspeciais();
    carregarIgrejas();
});

// ✅ Função para exibir mensagens de alerta
function mostrarAlerta(tipo, mensagem) {
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    alerta.innerHTML = `${mensagem} <button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
    document.body.appendChild(alerta);
    setTimeout(() => alerta.remove(), 3000);
}

// ✅ Função para carregar coletas especiais
function carregarColetasEspeciais() {
    const tabelaBody = document.getElementById('coletaEspecialTableBody');
    tabelaBody.innerHTML = '<tr><td colspan="5" class="text-center">Carregando...</td></tr>';

    fetch('/coletas_especial/listar')
        .then(response => response.json())
        .then(coletas => {
            tabelaBody.innerHTML = '';
            if (coletas.length === 0) {
                tabelaBody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum registro encontrado</td></tr>';
                return;
            }
            coletas.forEach(coleta => {
                const row = `<tr>
                    <td>${coleta.data || '-'}</td>
                    <td>${coleta.hora || '-'}</td>
                    <td>${coleta.local || '-'}</td>
                    <td>${coleta.atendente || '-'}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-primary" onclick="preencherModalEdicao(${coleta.id})"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="excluirColeta(${coleta.id})"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>`;
                tabelaBody.innerHTML += row;
            });
        })
        .catch(error => mostrarAlerta('danger', 'Erro ao carregar coletas especiais!'));
}

// ✅ Função para preencher o modal de edição
function preencherModalEdicao(id) {
    console.log(`Tentando editar coleta ID: ${id}`); // Debug

    fetch(`/coletas_especial/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro ao obter dados da coleta ID ${id}`);
            }
            return response.json();
        })
        .then(coleta => {
            console.log("Coleta carregada:", coleta); // Debug

            document.getElementById('data').value = coleta.data;
            document.getElementById('hora').value = coleta.hora;
            document.getElementById('local').value = coleta.local;
            document.getElementById('atendente').value = coleta.atendente;
            document.getElementById('formColetaEspecial').setAttribute('data-id', coleta.id);

            let modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalColetaEspecial'));
            modal.show();
        })
        .catch(error => {
            console.error("Erro ao carregar coleta para edição:", error);
            mostrarAlerta('danger', 'Erro ao carregar dados para edição!');
        });
}

// ✅ Função para salvar ou atualizar coleta
document.getElementById('formColetaEspecial').addEventListener('submit', function (event) {
    event.preventDefault();
    console.log('Botão salvar clicado!'); // Debugging

    const form = document.getElementById('formColetaEspecial');
    const id = form.getAttribute('data-id') || null;
    const data = document.getElementById('data').value;
    const hora = document.getElementById('hora').value;
    const local = document.getElementById('local').value;
    const atendente = document.getElementById('atendente').value;

    console.log(`Salvando Coleta - ID: ${id || 'Novo Registro'}`); // Debugging

    if (!data || !hora || !local) {
        mostrarAlerta('danger', 'Todos os campos obrigatórios devem ser preenchidos.');
        return;
    }

    const metodo = id ? 'PUT' : 'POST';
    const url = id ? `/coletas_especial/${id}/editar` : '/coletas_especial';

    fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, hora, local, atendente })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            mostrarAlerta('success', id ? 'Coleta atualizada com sucesso!' : 'Coleta cadastrada com sucesso!');
            form.reset();
            form.removeAttribute('data-id');
            carregarColetasEspeciais();

            // Fechamento do modal
            let modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalColetaEspecial'));
            modal.hide();
        } else {
            mostrarAlerta('danger', result.error || 'Erro ao salvar coleta!');
        }
    })
    .catch(error => {
        console.error('Erro na requisição:', error);
        mostrarAlerta('danger', 'Erro no servidor!');
    });
});

// ✅ Função para excluir coleta
function excluirColeta(id) {
    if (!confirm('Deseja realmente excluir esta coleta?')) return;
    
    fetch(`/coletas_especial/${id}/deletar`, { method: 'DELETE' })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            mostrarAlerta('success', 'Coleta excluída com sucesso!');
            carregarColetasEspeciais();
        } else {
            mostrarAlerta('danger', result.error || 'Erro ao excluir coleta!');
        }
    })
    .catch(error => mostrarAlerta('danger', 'Erro no servidor!'));
}

// ✅ Função para carregar igrejas no dropdown
function carregarIgrejas() {
    fetch('/igrejas/listar')
        .then(response => response.json())
        .then(igrejas => {
            const select = document.getElementById('local');
            select.innerHTML = '<option value="">Selecione</option>';
            igrejas.forEach(igreja => {
                const option = document.createElement('option');
                option.value = igreja.nome;
                option.textContent = igreja.nome;
                select.appendChild(option);
            });
        })
        .catch(error => mostrarAlerta('danger', 'Erro ao carregar igrejas!'));
}










