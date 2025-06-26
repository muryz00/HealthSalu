import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import {
  getAuth,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDDcP6Iji3mIl5zmBWC95DwmXdWOcPXx68",
  authDomain: "api-cadastro-5ab06.firebaseapp.com",
  projectId: "api-cadastro-5ab06",
  storageBucket: "api-cadastro-5ab06.appspot.com",
  messagingSenderId: "1090059146851",
  appId: "1:1090059146851:web:9731938ed7b23952b3ca56",
  measurementId: "G-0FYR4JFV44"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.languageCode = 'pt-BR'; // Define o idioma dos emails

const db = getFirestore(app);

const btnBuscarEmail = document.getElementById("btnBuscarEmail");
const btnEnviarLink = document.getElementById("btnEnviarLink");
const emailEncontrado = document.getElementById("emailEncontrado");

let emailReal = "";

btnBuscarEmail.addEventListener("click", async () => {
  const tipoUsuario = document.querySelector('input[name="tipoUsuario"]:checked').value;
  const cpf = document.getElementById("cpf").value.trim();

  if (!cpf) {
    alert("Por favor, insira o CPF ou CRM.");
    return;
  }

  const colecao = tipoUsuario === "paciente" ? "pacientes" : "medicos";
  const campo = tipoUsuario === "paciente" ? "cpf" : "crm";

  try {
    const q = query(collection(db, colecao), where(campo, "==", cpf));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      emailEncontrado.textContent = "Usuário não encontrado.";
      btnEnviarLink.style.display = "none";
      return;
    }

    const usuario = snapshot.docs[0].data();
    emailReal = usuario.email;

    const emailMascarado = mascararEmail(emailReal);
    emailEncontrado.textContent = `O link será enviado para: ${emailMascarado}`;
    btnEnviarLink.style.display = "inline-block";
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    emailEncontrado.textContent = "Erro ao buscar o email. Tente novamente.";
  }
});

btnEnviarLink.addEventListener("click", async () => {
  if (!emailReal) return;

  try {
    await sendPasswordResetEmail(auth, emailReal);
    alert(
      "Um link de redefinição foi enviado para o seu email.\n\n" +
      "⚠️ Caso não encontre na caixa de entrada, verifique também a pasta de SPAM ou Lixo eletrônico."
    );
  } catch (error) {
    console.error("Erro ao enviar o link:", error);
    alert("Erro ao enviar o link. Verifique se o email é válido ou tente novamente.");
  }
});

// Função para mascarar email
function mascararEmail(email) {
  const [nome, dominio] = email.split("@");
  const visivel = nome.substring(0, 3);
  const asteriscos = "*".repeat(nome.length - 3);
  return `${visivel}${asteriscos}@${dominio}`;
}
