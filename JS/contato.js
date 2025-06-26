document.getElementById("formFaleConosco").addEventListener("submit", function(e) {
    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;

    const btn = document.getElementById("btnEnviar");
    btn.disabled = true;
    btn.textContent = "Enviando...";

    // Simula carregamento
    setTimeout(() => {
        btn.textContent = "Enviar";
        btn.disabled = false;

        // Simula "e-mail enviado" visualmente
        alert(`Olá ${nome}, sua mensagem foi enviada com sucesso!\n\nAgradecemos o contato!`);

        // Limpa o formulário
        document.getElementById("formFaleConosco").reset();
    }, 2000);
});
