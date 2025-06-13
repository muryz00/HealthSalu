function selecionar(tipoUsuario) {
  document.getElementById("tipo").value = tipoUsuario;

  const btnPaciente = document.getElementById("paciente");
  const btnMedico = document.getElementById("medico");
  const bdLogin = document.getElementById("bdLogin");
  const imgLogin = document.querySelector(".asideLogin img");
  const loginExtras = document.getElementById("cadastroExtras");
  const btnEntrar = document.getElementById("btnEntrar");
  const linkCadastro = document.getElementById("linkCadastro");

  // Remove campos específicos do médico, se existirem
  const campoEspecialidade = document.getElementById("atendimento");
  const campoCRM = document.getElementById("identificador");
  if (campoEspecialidade) campoEspecialidade.remove();
  if (campoCRM) campoCRM.remove();

  btnEntrar.classList.remove("hover-verde", "hover-vermelho");
  linkCadastro.classList.remove("efeitos-link", "efeitos-link-verde");

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

    // Cria os campos somente se ainda não existem
    if (!document.getElementById("atendimento")) {
      const inputEspecialidade = document.createElement("select");
      inputEspecialidade.id = "atendimento";
      inputEspecialidade.classList.add("select");

      const placeholderOption = document.createElement("option");
      placeholderOption.value = "";
      placeholderOption.textContent = "Escolha uma especialidade";
      placeholderOption.disabled = true;
      placeholderOption.selected = true;
      inputEspecialidade.appendChild(placeholderOption);

      const opcoes = [
        { value: "clinico", texto: "Clínico Geral" },
        { value: "cardiologia", texto: "Cardiologia" },
        { value: "dermatologia", texto: "Dermatologia" },
        { value: "ortopedia", texto: "Ortopedia" }
      ];

      opcoes.forEach(op => {
        const option = document.createElement("option");
        option.value = op.value;
        option.textContent = op.texto;
        inputEspecialidade.appendChild(option);
      });

      loginExtras.appendChild(inputEspecialidade);
    }

    if (!document.getElementById("identificador")) {
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

window.onload = () => selecionar("paciente");
