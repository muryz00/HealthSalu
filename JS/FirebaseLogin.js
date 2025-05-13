import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";

// Firebase config
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

document.getElementById("formLogin").addEventListener("submit", async function(e) {
  e.preventDefault();

  const identificador = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  const tipo = document.getElementById("tipo").value;

  const colecao = tipo === "paciente" ? "pacientes" : "medicos";
  const campo = tipo === "paciente" ? "cpf" : "crm";

  try {
    const q = query(collection(db, colecao), where(campo, "==", identificador));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      alert(`${campo.toUpperCase()} não encontrado.`);
      return;
    }

    const docData = querySnapshot.docs[0].data();
    const email = docData.email;

    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    alert("Login realizado com sucesso!");

    // Redireciona para a página correta
    if (tipo === "paciente") {
      window.location.href = "index.html";
    } else {
      window.location.href = "indexMedico.html";
    }

  } catch (error) {
    alert("Erro ao fazer login: " + error.message);
    console.error("Erro Firebase:", error);
  }
});
