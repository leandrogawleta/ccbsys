document.addEventListener('DOMContentLoaded', function () {
    carregarOutrasReunioes();
    carregarNaturezas(); // 🔹 Garantir que a lista de naturezas seja carregada
});

// ✅ Função para carregar registros da tabela corretamente
function carregarOutrasReunioes() {
    fetch('/outras_reunioes/listar')
        .then(response => response.json())
        .then(reunioes => {
            console.log("🔍 Registros recebidos:", reunioes);

            const tabela = document.getElementById('outrasReunioesTable').querySelector('tbody');
            tabela.innerHTML = ''; // Limpa a tabela antes de preenchê-la

            if (reunioes.length === 0) {
                tabela.innerHTML = '<tr><td colspan="7" class="text-center">Nenhum registro encontrado</td></tr>';
                return;
            }

            reunioes.forEach(reuniao => {
                const dataFormatada = formatarData(reuniao.data); // Converter yyyy-mm-dd para dd/mm/yyyy
                const horaFormatada = reuniao.hora || '-';
                const local = reuniao.local || '-';
                const atendimento = reuniao.atendimento || '-';
                const tipo = reuniao.tipo || '-';
                const observacoes = reuniao.obs || '-';

                const linha = `
                    <tr>
                        <td>${dataFormatada}</td>
                        <td>${horaFormatada}</td>
                        <td>${local}</td>
                        <td>${atendimento}</td>
                        <td>${tipo}</td>
                        <td>${observacoes}</td>
                        <td class="text-center">
                            <button class="btn btn-sm btn-primary" onclick="preencherModalEdicao(${reuniao.id})">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="excluirReuniao(${reuniao.id})">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
                tabela.innerHTML += linha;
            });
        })
        .catch(error => console.error('❌ Erro ao carregar outras reuniões:', error));
}

// ✅ Função para preencher o modal de edição
function preencherModalEdicao(id) {
    fetch(`/outras_reunioes/${id}`)
        .then(response => response.json())
        .then(reuniao => {
            document.getElementById('reuniaoId').value = reuniao.id;
            document.getElementById('data').value = formatarData(reuniao.data);
            document.getElementById('hora').value = reuniao.hora;
            document.getElementById('local').value = reuniao.local;
            document.getElementById('atendimento').value = reuniao.atendimento;
            document.getElementById('obs').value = reuniao.obs;

            // 🔹 Buscar naturezas antes de definir a opção correta
            fetch('/natureza/listar')
                .then(response => response.json())
                .then(naturezas => {
                    const tipoSelect = document.getElementById('tipo');
                    tipoSelect.innerHTML = '<option value="">Selecione uma opção</option>';
                    naturezas.forEach(natureza => {
                        const option = document.createElement('option');
                        option.value = natureza.id;
                        option.textContent = natureza.descricao;
                        if (natureza.id == reuniao.tipo) {
                            option.selected = true;
                        }
                        tipoSelect.appendChild(option);
                    });
                })
                .catch(error => console.error('Erro ao carregar naturezas:', error));

            let modal = new bootstrap.Modal(document.getElementById('modalOutrasReunioes'));
            modal.show();
        })
        .catch(error => console.error('Erro ao carregar dados para edição:', error));
}

// ✅ Função para salvar ou editar uma reunião
document.getElementById('formOutrasReunioes').addEventListener('submit', function (event) {
    event.preventDefault();

    const id = document.getElementById('reuniaoId').value.trim();
    const data = document.getElementById('data').value;
    const hora = document.getElementById('hora').value;
    const local = document.getElementById('local').value;
    const atendimento = document.getElementById('atendimento').value;
    const tipo = document.getElementById('tipo').value;
    const obs = document.getElementById('obs').value;

    if (!data || !hora || !local || !tipo) {
        mostrarAlerta('danger', 'Preencha todos os campos obrigatórios.');
        return;
    }

    const reuniao = { data, hora, local, atendimento, tipo, obs };
    
    const metodo = id ? 'PUT' : 'POST';
    const url = id ? `/outras_reunioes/${id}/editar` : '/outras_reunioes/criar';

    fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reuniao)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            mostrarAlerta('success', id ? 'Reunião atualizada com sucesso!' : 'Reunião cadastrada com sucesso!');
            document.getElementById('formOutrasReunioes').reset();
            document.getElementById('reuniaoId').value = '';
            carregarOutrasReunioes();

            let modal = bootstrap.Modal.getInstance(document.getElementById('modalOutrasReunioes'));
            modal.hide();
        } else {
            mostrarAlerta('danger', 'Erro ao salvar reunião!');
        }
    })
    .catch(error => mostrarAlerta('danger', 'Erro no servidor!'));
});

// ✅ Função para excluir reunião
function excluirReuniao(id) {
    if (!confirm('Deseja realmente excluir esta reunião?')) return;

    fetch(`/outras_reunioes/${id}/excluir`, { method: 'DELETE' })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            mostrarAlerta('success', 'Reunião excluída com sucesso!');
            carregarOutrasReunioes();
        } else {
            mostrarAlerta('danger', 'Erro ao excluir reunião!');
        }
    })
    .catch(error => mostrarAlerta('danger', 'Erro no servidor!'));
}

// ✅ Função para carregar naturezas no campo "Tipo"
function carregarNaturezas() {
    fetch('/natureza/listar')
        .then(response => response.json())
        .then(naturezas => {
            const tipoSelect = document.getElementById('tipo');
            tipoSelect.innerHTML = '<option value="">Selecione uma opção</option>';
            naturezas.forEach(natureza => {
                const option = document.createElement('option');
                option.value = natureza.id;
                option.textContent = natureza.descricao;
                tipoSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Erro ao carregar naturezas:', error));
}

// ✅ Função para formatar a data corretamente (yyyy-mm-dd → dd/mm/yyyy)
function formatarData(data) {
    if (!data || typeof data !== 'string') return 'Sem Data';
    try {
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    } catch (error) {
        return 'Sem Data';
    }
}

// ✅ Mostrar alertas de erro/sucesso
function mostrarAlerta(tipo, mensagem) {
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    alerta.innerHTML = `${mensagem} <button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
    document.body.appendChild(alerta);
    setTimeout(() => alerta.remove(), 3000);
}



