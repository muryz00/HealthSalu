// firebaseLogin.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";

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

document.getElementById("formLogin").addEventListener("submit", async function (e) {
  e.preventDefault();

  const identificador = document.getElementById("email").value.trim();
  const senha        = document.getElementById("senha").value.trim();
  const tipo         = document.getElementById("tipo").value; // "paciente" ou "medico"

  // Determina a coleção e o campo para pesquisa (CPF para paciente, CRM para médico)
  const colecao = tipo === "paciente" ? "pacientes" : "medicos";
  const campo   = tipo === "paciente" ? "cpf"       : "crm";

  try {
    // 1) Faz uma query para ver se o CPF/CRM existe na coleção certa
    const q = query(collection(db, colecao), where(campo, "==", identificador));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      alert(`${campo.toUpperCase()} não encontrado.`);
      return;
    }

    // 2) Se encontrou, extrai o e-mail do documento
    const docData = querySnapshot.docs[0].data();
    const email   = docData.email;
    if (!email) {
      alert("E-mail não cadastrado para este usuário.");
      return;
    }

    // 3) Tenta fazer login com esse e-mail + senha
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    // 4) Se deu certo, guardamos no localStorage:
    //    - o tipo ("paciente" ou "medico")
    //    - o identificador (CPF ou CRM) para uso posterior nos dashboards
    localStorage.setItem("tipo", tipo);
    if (tipo === "paciente") {
      localStorage.setItem("cpfPaciente", identificador);
    } else {
      localStorage.setItem("crmMedico", identificador);
    }

    alert("Login realizado com sucesso!");

    // 5) Redireciona para a página correta
    if (tipo === "paciente") {
      window.location.href = "dashboard.html";
    } else {
      window.location.href = "dashboardMedico.html";
    }

  } catch (error) {
    alert("Erro ao fazer login: " + error.message);
    console.error("Erro Firebase:", error);
  }
});
