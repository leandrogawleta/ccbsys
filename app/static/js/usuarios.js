$(document).ready(function () {
    carregarUsuarios();

    // Submissão do formulário para adicionar ou editar usuário
    $("#usuarioForm").submit(function (e) {
        e.preventDefault();
        let id = $("#usuarioId").val();
        let usuarioData = {
            nome: $("#nome").val().trim(),
            departamento: $("#departamento").val().trim(),
            email: $("#email").val().trim(),
            senha: $("#senha").val().trim(),
            nivel: $("#nivel").val()
        };
    
        console.log("Enviando dados para cadastro:", usuarioData); // <-- Adiciona um log para debug
    
        let url = id ? `/usuarios/editar/${id}` : "/usuarios/adicionar";
        let metodo = id ? "PUT" : "POST";
    
        $.ajax({
            url: url,
            type: metodo,
            contentType: "application/json",
            data: JSON.stringify(usuarioData),
            success: function (response) {
                alert(response.mensagem);
                $("#usuarioModal").modal("hide");
                $("#usuarioForm")[0].reset();
                carregarUsuarios();
            },
            error: function (xhr) {
                alert("Erro ao salvar usuário: " + xhr.responseJSON.mensagem);
            }
        });
    });
    
});

// Função para carregar os usuários via AJAX
function carregarUsuarios() {
    $.ajax({
        url: "/usuarios/listar",
        type: "GET",
        success: function (usuarios) {
            $("#usuariosLista").empty();
            if (usuarios.length === 0) {
                $("#usuariosLista").append("<tr><td colspan='5' class='text-center'>Nenhum usuário cadastrado.</td></tr>");
            } else {
                usuarios.forEach(function (usuario) {
                    $("#usuariosLista").append(`
                        <tr>
                            <td>${usuario.nome}</td>
                            <td>${usuario.departamento}</td>
                            <td>${usuario.email}</td>
                            <td>${usuario.nivel}</td>
                            <td class="text-center">
                                <button class="btn btn-warning btn-sm me-2" onclick="editarUsuario(${usuario.id})"><i class="bi bi-pencil"></i></button>
                                <button class="btn btn-danger btn-sm" onclick="excluirUsuario(${usuario.id})"><i class="bi bi-trash"></i></button>
                            </td>
                        </tr>
                    `);
                });
            }
        },
        error: function () {
            alert("Erro ao carregar usuários.");
        }
    });
}

// Função para carregar os dados no modal de edição
function editarUsuario(id) {
    $.ajax({
        url: `/usuarios/${id}`,
        type: "GET",
        success: function (usuario) {
            $("#usuarioId").val(usuario.id);
            $("#nome").val(usuario.nome);
            $("#departamento").val(usuario.departamento);
            $("#email").val(usuario.email);
            $("#nivel").val(usuario.nivel);
            $("#usuarioModal").modal("show");
        },
        error: function () {
            alert("Erro ao carregar dados do usuário.");
        }
    });
}

// Função para excluir um usuário
function excluirUsuario(id) {
    if (confirm("Tem certeza que deseja excluir este usuário?")) {
        $.ajax({
            url: `/usuarios/excluir/${id}`,
            type: "DELETE",
            success: function (response) {
                alert(response.mensagem);
                carregarUsuarios();
            },
            error: function () {
                alert("Erro ao excluir usuário.");
            }
        });
    }
}
