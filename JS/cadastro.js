function selecionar(tipoUsuario) {
  document.getElementById("tipo").value = tipoUsuario;

  const btnPaciente = document.getElementById("paciente");
  const btnMedico = document.getElementById("medico");
  const bdLogin = document.getElementById("bdLogin");
  const imgLogin = document.querySelector(".asideLogin img");
  const loginExtras = document.getElementById("cadastroExtras");
  const btnEntrar = document.getElementById("btnEntrar");
  const linkCadastro = document.getElementById("linkCadastro");

  btnEntrar.classList.remove("hover-verde", "hover-vermelho");
  linkCadastro.classList.remove("efeitos-link", "efeitos-link-verde");

  // Estilização dinâmica
  if (tipoUsuario === "paciente") {
    btnPaciente.classList.add("selected");
    btnMedico.classList.remove("selected");

    bdLogin.style.background = "linear-gradient(50deg, #3cd0a3 0%, #273469 70%)";
    imgLogin.src = "IMG/imgLogin.png";
    btnEntrar.classList.add("hover-verde");
    btnEntrar.style.border = "2px solid #3cd0a3";
    btnEntrar.style.backgroundColor = "";

    btnPaciente.style.backgroundColor = "#3cd0a3";
    btnMedico.style.backgroundColor = "#273469";
    linkCadastro.classList.add("efeitos-link-verde");
  } else {
    btnMedico.classList.add("selected");
    btnPaciente.classList.remove("selected");

    bdLogin.style.background = "linear-gradient(50deg, #1e2749 0%, #3cd0a3 70%)";
    imgLogin.src = "IMG/imgLogin2.png";
    btnEntrar.classList.add("hover-vermelho");
    btnEntrar.style.border = "2px solid #273469";
    btnEntrar.style.backgroundColor = "transparent";

    btnMedico.style.backgroundColor = "#273469";
    btnPaciente.style.backgroundColor = "#3cd0a3";
    linkCadastro.classList.add("efeitos-link");
  }

  // Cria o campo dinamicamente
  if (loginExtras) {
    loginExtras.innerHTML = "";

    if (tipoUsuario === "medico") {
      const inputEspecialidade = document.createElement("input");
      inputEspecialidade.type = "text";
      inputEspecialidade.name = "especialidade";
      inputEspecialidade.id = "especialidade";
      inputEspecialidade.classList.add("txtCard");
      inputEspecialidade.classList.add("tipo-funcionalidades");
      inputEspecialidade.placeholder = "Digite sua especialidade médica";
      loginExtras.appendChild(inputEspecialidade);

    const inputIdentificador = document.createElement("input");
    inputIdentificador.type = "text";
    inputIdentificador.name = "identificador";
    inputIdentificador.id = "identificador";
    inputIdentificador.classList.add("txtCard");
    inputIdentificador.placeholder = "Digite seu CRM";
    loginExtras.appendChild(inputIdentificador);
    }

  }
  

  
}

// Inicializa com o campo de paciente por padrão
window.onload = () => selecionar("paciente");
