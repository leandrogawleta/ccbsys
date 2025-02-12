// Função para formatar a data no formato dd/mm/yyyy
function formatarData(dataStr) {
    if (!dataStr || !dataStr.includes('-')) {
        return 'Data Inválida'; // Trata valores inesperados
    }
    const [year, month, day] = dataStr.split('-');
    return `${day}/${month}/${year}`;
}

// Função para obter o dia da semana em português
function obterDiaSemana(dataStr) {
    if (!dataStr || !dataStr.includes('-')) {
        return 'Dia Inválido'; // Trata valores inesperados
    }
    const [year, month, day] = dataStr.split('-');
    const data = new Date(year, month - 1, day); // O mês começa em 0
    const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    return diasSemana[data.getDay()] || 'Dia Inválido';
}

// Função para carregar registros de Coleta Especial e preencher a tabela
document.addEventListener('DOMContentLoaded', carregarColetasEspeciais);

function carregarColetasEspeciais() {
    fetch('/coletas_especial/listar')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar coletas especiais');
            }
            return response.json();
        })
        .then(coletas => {
            const tabelaBody = document.querySelector('#coletaEspecialTable tbody');
            tabelaBody.innerHTML = ''; // Limpa a tabela antes de preenchê-la

            if (coletas.length === 0) {
                tabelaBody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum registro encontrado</td></tr>';
                return;
            }

            coletas.forEach(coleta => {
                const dataFormatada = formatarData(coleta.data);
                const diaSemana = obterDiaSemana(coleta.data);

                const linha = `
                    <tr>
                        <td>${dataFormatada}</td>
                        <td>${diaSemana}</td>
                        <td>${coleta.hora || '-'}</td>
                        <td>${coleta.local || '-'}</td>
                        <td>${coleta.atendente || '-'}</td>
                        <td class="text-center">
                            <button class="btn btn-danger btn-sm" onclick="excluirColetaEspecial(${coleta.id})">
                                <i class="bi bi-trash-fill"></i>
                            </button>
                        </td>
                    </tr>
                `;
                tabelaBody.innerHTML += linha;
            });
        })
        .catch(error => console.error('Erro ao carregar coletas especiais:', error));
}

// Função para salvar Coleta Especial via AJAX
document.getElementById('formColetaEspecial').addEventListener('submit', function (event) {
    event.preventDefault();

    const coletaId = document.getElementById('coletaId').value;
    const data = document.getElementById('data').value;
    const hora = document.getElementById('hora').value;
    const local = document.getElementById('local').value;
    const atendente = document.getElementById('atendente').value;

    const url = coletaId ? `/coletas_especial/${coletaId}/editar` : '/coletas_especial';
    const method = coletaId ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            data: data,
            hora: hora,
            local: local,
            atendente: atendente
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert('Coleta Especial salva com sucesso!');
            location.reload();
        } else {
            alert('Erro ao salvar Coleta Especial: ' + result.error);
        }
    })
    .catch(error => {
        console.error('Erro ao salvar Coleta Especial:', error);
        alert('Erro ao salvar Coleta Especial.');
    });
});

// Função para excluir Coleta Especial
function excluirColetaEspecial(id) {
    if (!confirm('Tem certeza que deseja excluir esta coleta?')) return;

    fetch(`/coletas_especial/${id}/deletar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert('Coleta Especial excluída com sucesso!');
            location.reload();
        } else {
            alert('Erro ao excluir Coleta Especial: ' + result.error);
        }
    })
    .catch(error => {
        console.error('Erro ao excluir Coleta Especial:', error);
        alert('Erro ao excluir Coleta Especial.');
    });
}

// Função para aplicar filtro por Local ou Atendente
function aplicarFiltro() {
    const filtro = document.getElementById('filtro').value;
    const valorFiltro = document.getElementById('filtroValor').value.toLowerCase();

    const linhas = document.querySelectorAll('#coletaEspecialTable tr');
    linhas.forEach(linha => {
        const textoFiltro = linha.querySelector(`td:nth-child(${filtro === 'local' ? 4 : 5})`).textContent.toLowerCase();
        linha.style.display = textoFiltro.includes(valorFiltro) ? '' : 'none';
    });
}

// Adiciona evento ao input de filtro
document.getElementById('filtroValor').addEventListener('input', aplicarFiltro);


function formatarData(dataStr) {
    const [year, month, day] = dataStr.split('-');
    return `${day}/${month}/${year}`;
}

function obterDiaSemana(dataStr) {
    const [year, month, day] = dataStr.split('-');
    const data = new Date(year, month - 1, day);
    const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    return diasSemana[data.getDay()];
}

