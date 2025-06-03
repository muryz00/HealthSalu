function agendarConsulta(){
    const nome = document.getElementById("nome").value;
    const dataNascimento = document.getElementById("dataNascimentoimento").value;
    const atendimento = document.getElementById("atendimento").value;
    const dataSelecionada = document.getElementById("dataConsulta").value;

      // Verificação de campos obrigatórios
  if (!nome || !dataNascimento || !atendimento || !dataSelecionada) {
    alert("Por favor, preencha todos os campos para agendar a consulta.");
    return;
  }
  
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  const idade = hoje.getFullYear() - nascimento.getFullYear();
  const aniversarioEsteAno = new Date(hoje.getFullYear(), nascimento.getMonth(), nascimento.getDate());

  const maiorDeIdade = idade > 18 || (idade === 18 && hoje >= aniversarioEsteAno);

  if (!maiorDeIdade) {
    alert("Você precisa ter pelo menos 18 anos para agendar uma consulta.");
    return;
  }}