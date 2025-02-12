// Função para formatar a data no formato dd/mm/yyyy
function formatarData(dataStr) {
    if (!dataStr || !dataStr.includes('-')) {
        return 'Data Inválida';
    }
    const [year, month, day] = dataStr.split('-');
    return `${day}/${month}/${year}`; // Retorna no formato dd/mm/yyyy
}

// Função para converter a data para o formato yyyy-mm-dd (usado no input date)
function formatarDataParaInput(dataStr) {
    if (!dataStr || !dataStr.includes('/')) {
        return '';
    }
    const [day, month, year] = dataStr.split('/');
    return `${year}-${month}-${day}`; // Retorna no formato yyyy-mm-dd
}

// Função para formatar a hora no formato HH:mm
function formatarHora(horaStr) {
    if (!horaStr || typeof horaStr !== 'string') {
        return '-'; // Retorna traço se estiver inválido ou vazio
    }
    horaStr = horaStr.trim(); // Remove espaços extras
    if (/^\d{2}:\d{2}$/.test(horaStr)) {
        return horaStr; // Retorna a hora se estiver no formato correto
    }
    return '-'; // Retorna traço se o formato não for válido
}

// Função para carregar registros da Santa Ceia na tabela
function carregarSantaCeia() {
    fetch('/santa_ceia/listar')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar registros.');
            }
            return response.json();
        })
        .then(registros => {
            console.log('Dados recebidos do backend:', registros); // Verifica o conteúdo retornado
            const tabela = document.getElementById('santaCeiaTable').querySelector('tbody');
            tabela.innerHTML = ''; // Limpa a tabela antes de preenchê-la

            if (registros.length === 0) {
                tabela.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum registro encontrado</td></tr>';
                return;
            }

            // Ordenar registros por data
            registros.sort((a, b) => {
                const dataA = new Date(a.data.split('/').reverse().join('-'));
                const dataB = new Date(b.data.split('/').reverse().join('-'));
                return dataA - dataB;
            });

            // Preencher a tabela com os registros
            registros.forEach(registro => {
                const dataFormatada = registro.data; // Assume que já vem formatada como dd/mm/yyyy
                console.log('Hora recebida:', registro.hora);
                const horaFormatada = formatarHora(registro.hora); // Formata a hora corretamente

                const linha = `
                    <tr>
                        <td>${dataFormatada}</td>
                        <td>${horaFormatada}</td>
                        <td>${registro.local || '-'}</td>
                        <td>${registro.atendimento || '-'}</td>
                        <td class="text-center">
                            <button class="btn btn-danger btn-sm" onclick="excluirSantaCeia(${registro.id})">
                                <i class="bi bi-trash-fill"></i> Excluir
                            </button>
                        </td>
                    </tr>
                `;
                tabela.innerHTML += linha;
            });
        })
        .catch(error => console.error('Erro ao carregar registros:', error));
}

// Função para salvar Santa Ceia via AJAX
document.getElementById('formSantaCeia').addEventListener('submit', function (event) {
    event.preventDefault();

    const data = document.getElementById('data').value; // dd/mm/yyyy
    const hora = document.getElementById('hora').value; // HH:mm
    const local = document.getElementById('local').value;
    const atendimento = document.getElementById('ministro').value;

    // Validação básica da data e hora
    if (!data.match(/^\d{2}\/\d{2}\/\d{4}$/) || !hora.match(/^\d{2}:\d{2}$/)) {
        alert('Por favor, insira uma data ou hora válida.');
        return;
    }

    fetch('/santa_ceia/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            data: data,        // dd/mm/yyyy
            hora: hora,        // HH:mm
            local: local,
            atendimento: atendimento
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert('Santa Ceia salva com sucesso!');
            location.reload();
        } else {
            alert('Erro ao salvar Santa Ceia: ' + result.error);
        }
    })
    .catch(error => {
        console.error('Erro ao salvar Santa Ceia:', error);
        alert('Erro ao salvar Santa Ceia.');
    });
});


// Função para excluir Santa Ceia
function excluirSantaCeia(id) {
    if (!confirm('Tem certeza que deseja excluir esta Santa Ceia?')) return;

    fetch(`/santa_ceia/excluir/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao excluir registro.');
        }
        return response.json();
    })
    .then(result => {
        if (result.success) {
            alert('Santa Ceia excluída com sucesso!');
            location.reload();
        } else {
            alert('Erro ao excluir Santa Ceia: ' + result.error);
        }
    })
    .catch(error => {
        console.error('Erro ao excluir Santa Ceia:', error);
        alert('Erro ao excluir Santa Ceia.');
    });
}

// Função para aplicar filtro na tabela
function aplicarFiltro() {
    const filtroValor = document.getElementById('filtroNome').value.toLowerCase();
    const linhas = document.querySelectorAll('#santaCeiaTable tbody tr');

    // Iterar pelas linhas da tabela e verificar se o filtro corresponde ao local ou atendimento
    linhas.forEach(linha => {
        const local = linha.children[2].textContent.toLowerCase();
        const atendimento = linha.children[3].textContent.toLowerCase();

        if (local.includes(filtroValor) || atendimento.includes(filtroValor)) {
            linha.style.display = ''; // Exibe a linha
        } else {
            linha.style.display = 'none'; // Oculta a linha
        }
    });
}

// Carregar registros ao abrir a página
document.addEventListener('DOMContentLoaded', carregarSantaCeia);
