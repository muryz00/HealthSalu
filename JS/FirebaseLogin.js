import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";

// Configuração Firebase
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
const db = getFirestore(app);

// Traduz mensagens de erro do Firebase
function traduzirErroFirebase(erro) {
  let codigo = erro.code || extrairCodigoErro(erro.message);

  if (codigo === "auth/invalid-credential") {
    codigo = "auth/wrong-password";
  }

  const erros = {
    "auth/user-not-found": "Usuário não encontrado. Verifique seu CPF/CRM.",
    "auth/wrong-password": "Senha incorreta. Tente novamente.",
    "auth/user-disabled": "Essa conta foi desativada.",
    "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde.",
    "auth/network-request-failed": "Erro de conexão. Verifique sua internet.",
  };

  return erros[codigo] || "Ocorreu um erro inesperado. Tente novamente.";
}

function extrairCodigoErro(mensagem) {
  const match = mensagem.match(/\(auth\/([^)]+)\)/);
  return match ? `auth/${match[1]}` : null;
}

document.getElementById("formLogin").addEventListener("submit", async function (e) {
  e.preventDefault();

  const identificador = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();
  const tipo = document.getElementById("tipo").value;

  if (!identificador || !senha || !tipo) {
    alert("Preencha todos os campos corretamente.");
    return;
  }

  const colecao = tipo === "paciente" ? "pacientes" : "medicos";
  const campo = tipo === "paciente" ? "cpf" : "crm";

  try {
    // Verifica se CPF/CRM existe
    const q = query(collection(db, colecao), where(campo, "==", identificador));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      alert(`${campo.toUpperCase()} não encontrado. Verifique suas informações.`);
      return;
    }

    const userData = querySnapshot.docs[0].data();
    const email = userData.email;

    if (!email) {
      alert("E-mail não cadastrado para este usuário.");
      return;
    }

    // Autentica com Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    // Armazena no localStorage
    localStorage.setItem("tipoUsuario", tipo);
    if (tipo === "medico") {
      localStorage.setItem("crmMedico", identificador);
    } else {
      localStorage.setItem("cpfPaciente", identificador);
    }

    alert("Login realizado com sucesso!");

    // Redireciona para o dashboard
    window.location.href = tipo === "paciente" ? "dashboard.html" : "dashboardMedico.html";

  } catch (error) {
    console.error("Erro Firebase:", error);
    const mensagemAmigavel = traduzirErroFirebase(error);
    alert("Erro ao fazer login: " + mensagemAmigavel);
  }
});
