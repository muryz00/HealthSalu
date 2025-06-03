import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";

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
getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

document.getElementById("formLogin").addEventListener("submit", async function(e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  const confirmSenha = document.getElementById("confirmSenha").value;
  const nome = document.getElementById("nome").value;
  const cpf = document.getElementById("cpf").value;
    const telefone = document.getElementById("telefone").value;
  const dataNascimento = document.getElementById("dataNascimento").value;
  const tipo = document.getElementById("tipo").value;

  const crm = tipo === "medico" ? document.getElementById("identificador")?.value || "" : undefined;
  const especialidade = tipo === "medico" ? document.getElementById("especialidade")?.value || "" : undefined;

  if (senha !== confirmSenha) {
    alert("As senhas não coincidem!");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    const collectionName = tipo === 'paciente' ? 'pacientes' : 'medicos';

    const userData = {
      email,
      nome,
      cpf,
      telefone,
      dataNascimento,
    };

    if (tipo === "medico") {
      userData.crm = crm;
      userData.telefone = telefone;
      userData.especialidade = especialidade;
    }

    await addDoc(collection(db, collectionName), userData);

    alert(`Cadastro realizado com sucesso!\nBem-vindo, ${nome}!`);
    window.location.href = "login.html";

  } catch (error) {
    alert("Erro ao cadastrar: " + error.message);
    console.error("Erro Firebase:", error);
  }
});
