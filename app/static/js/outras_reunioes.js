function carregarOutrasReunioes() {
    fetch('/outras_reunioes/listar')
        .then(response => response.json())
        .then(reunioes => {
            console.log("Registros recebidos:", reunioes); // Debug no console

            const tabela = document.getElementById('outrasReunioesTable').querySelector('tbody');
            tabela.innerHTML = '';

            if (reunioes.length === 0) {
                tabela.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum registro encontrado</td></tr>';
                return;
            }

            reunioes.forEach(reuniao => {
                // Concatenar "tipo" e "obs" para a coluna "natureza"
                const natureza = `${reuniao.tipo} - ${reuniao.obs}`.trim().replace(/-\s*$/, '');

                // Garantindo que a data formatada seja exibida corretamente
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

// ✅ Corrigido para validar a entrada e evitar "undefined/undefined/Sem Data"
function formatarData(data) {
    if (!data || typeof data !== 'string') return 'Sem Data';

    const partes = data.split('/');
    if (partes.length === 3) {
        return `${partes[0]}/${partes[1]}/${partes[2]}`;  // Mantendo dd/mm/yyyy
    }

    return 'Sem Data';
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
