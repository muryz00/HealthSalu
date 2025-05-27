import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";

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

let cpfPacienteGlobal = null;

// 🔥 Salvar CPF automaticamente no localStorage
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const pacienteRef = collection(db, "pacientes");
    const q = query(pacienteRef, where("uid", "==", user.uid));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const pacienteData = snapshot.docs[0].data();
      cpfPacienteGlobal = pacienteData.cpf;
      localStorage.setItem('cpfPaciente', cpfPacienteGlobal); // <-- 🔥 Salva aqui
      console.log("CPF do paciente:", cpfPacienteGlobal);
    } else {
      alert("Paciente não encontrado.");
    }
  } else {
    alert("Usuário não autenticado.");
    window.location.href = "login.html";
  }
});


// ====================== FUNÇÃO PARA CADASTRAR EXERCÍCIOS ============================
window.calcularDados = async function () {
  const tipo = document.getElementById("tipo-exercicio").value;
  const duracao = parseFloat(document.getElementById("duracao").value);
  const peso = parseFloat(document.getElementById("peso").value);
  const altura = parseFloat(document.getElementById("altura").value);

  if (!tipo || !duracao || !peso || !altura || !cpfPacienteGlobal) {
    alert("Preencha todos os campos.");
    return;
  }

  const imc = peso / (altura * altura);
  const calorias = calcularCalorias(tipo, duracao, peso);
  const descricaoImc = getDescricaoIMC(imc);

  const dados = {
    tipo,
    duracao,
    peso,
    altura,
    imc,
    descricaoImc,
    calorias,
    data: Timestamp.now(),
    cpfPaciente: cpfPacienteGlobal
  };

  try {
    await addDoc(collection(db, "exercicios"), dados);
    adicionarNaTabela(dados);
    alert("Exercício registrado com sucesso!");
  } catch (erro) {
    console.error("Erro ao salvar exercício:", erro);
    alert("Erro ao salvar exercício.");
  }
};

// ========================== CÁLCULOS ==============================

function calcularCalorias(tipo, duracao, peso) {
  const METs = {
    corrida: 9.8,
    natação: 8.3,
    ciclismo: 7.5,
    musculação: 6.0
  };

  const met = METs[tipo] || 6.0;
  return ((met * 3.5 * peso) / 200) * duracao;
}

function getDescricaoIMC(imc) {
  if (imc < 18.5) return "Abaixo do peso";
  if (imc < 24.9) return "Peso normal";
  if (imc < 29.9) return "Sobrepeso";
  return "Obesidade";
}

// ======================== TABELA ==========================

function adicionarNaTabela(dados) {
  const tabela = document.getElementById("tableExercicio");
  const novaLinha = tabela.insertRow();

  novaLinha.innerHTML = `
    <td>${dados.tipo}</td>
    <td>${dados.duracao} min</td>
    <td>${dados.calorias.toFixed(2)} kcal</td>
    <td>${dados.descricaoImc}</td>
  `;
}
