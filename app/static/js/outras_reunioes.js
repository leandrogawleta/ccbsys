// Função para carregar registros de Outras Reuniões
function carregarOutrasReunioes() {
    fetch('/outras_reunioes/listar')
        .then(response => response.json())
        .then(reunioes => {
            const tabela = document.getElementById('outrasReunioesTable').querySelector('tbody');
            tabela.innerHTML = '';

            if (reunioes.length === 0) {
                tabela.innerHTML = '<tr><td colspan="7" class="text-center">Nenhum registro encontrado</td></tr>';
                return;
            }

            // Ordenar registros por data (do menor para o maior)
            reunioes.sort((a, b) => new Date(a.data.split('/').reverse().join('-')) - new Date(b.data.split('/').reverse().join('-')));

            reunioes.forEach(reuniao => {
                const linha = `
                    <tr>
                        <td>${formatarData(reuniao.data)}</td>
                        <td>${reuniao.hora}</td>
                        <td>${reuniao.local}</td>
                        <td>${reuniao.atendimento || '-'}</td>
                        <td>${reuniao.tipo}</td>
                        <td>${reuniao.obs || '-'}</td>
                        <td class="text-center">
                            <button class="btn btn-danger btn-sm" onclick="excluirReuniao(${reuniao.id})">
                                <i class="bi bi-trash-fill"></i> Excluir
                            </button>
                        </td>
                    </tr>
                `;
                tabela.innerHTML += linha;
            });
        })
        .catch(error => console.error('Erro ao carregar reuniões:', error));
}

// Função para formatar a data no formato dd/mm/yyyy
function formatarData(data) {
    if (!data) return '-';
    const partes = data.split('-'); // Supondo que o formato recebido seja yyyy-mm-dd
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// Função para salvar uma nova reunião
document.getElementById('formOutrasReunioes').addEventListener('submit', function (event) {
    event.preventDefault();

    const data = document.getElementById('data').value; // dd/mm/yyyy
    const hora = document.getElementById('hora').value;
    const local = document.getElementById('local').value.trim();
    const tipo = document.getElementById('tipo').value;

    // Verificar campos obrigatórios
    if (!data || !hora || !local || !tipo) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    const reuniao = {
        data: data,
        hora: hora,
        local: local,
        atendimento: document.getElementById('atendimento').value || '',
        tipo: tipo,
        obs: document.getElementById('obs').value || ''
    };

    fetch('/outras_reunioes/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reuniao)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Reunião registrada com sucesso!');
                carregarOutrasReunioes();
                document.getElementById('formOutrasReunioes').reset();
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalOutrasReunioes'));
                modal.hide();
            } else {
                alert(`Erro ao registrar reunião: ${data.error}`);
            }
        })
        .catch(error => console.error('Erro ao registrar reunião:', error));
});


// Função para excluir uma reunião
function excluirReuniao(id) {
    if (confirm('Deseja realmente excluir este registro?')) {
        fetch(`/outras_reunioes/excluir/${id}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Reunião excluída com sucesso!');
                    carregarOutrasReunioes();
                } else {
                    alert(`Erro ao excluir reunião: ${data.error}`);
                }
            })
            .catch(error => console.error('Erro ao excluir reunião:', error));
    }
}

// Tipos de reuniões pré-definidos
const tiposReunioes = ['Culto para Mocidade', 'Culto de Evangelização', 'Ensaio Técnico Musical', 'Treinamento'];

function carregarTipos() {
    const tipoSelect = document.getElementById('tipo');
    tipoSelect.innerHTML = '';

    tiposReunioes.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo;
        option.textContent = tipo;
        tipoSelect.appendChild(option);
    });
}

function adicionarTipo() {
    const novoTipo = prompt('Informe o novo tipo de reunião:');
    if (novoTipo && !tiposReunioes.includes(novoTipo)) {
        tiposReunioes.push(novoTipo);
        carregarTipos();
    } else {
        alert('Tipo já existente ou inválido.');
    }
}

function removerTipo() {
    const tipoSelect = document.getElementById('tipo');
    const tipoSelecionado = tipoSelect.value;

    if (tiposReunioes.includes(tipoSelecionado)) {
        const confirmacao = confirm(`Deseja realmente remover o tipo "${tipoSelecionado}"?`);
        if (confirmacao) {
            const index = tiposReunioes.indexOf(tipoSelecionado);
            tiposReunioes.splice(index, 1);
            carregarTipos();
        }
    } else {
        alert('Selecione um tipo válido para remover.');
    }
}

// Inicializa o carregamento de reuniões e tipos de reuniões
document.addEventListener('DOMContentLoaded', function () {
    carregarOutrasReunioes();
    carregarTipos();
});
