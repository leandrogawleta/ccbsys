function abrirImpressao() {
    const ano = new Date().getFullYear();
    let iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.src = `/imprimir/${ano}`;
    document.body.appendChild(iframe);
    
    iframe.onload = function() {
        iframe.contentWindow.print();
        setTimeout(function() {
            document.body.removeChild(iframe);
        }, 2000);
    };
}
f
