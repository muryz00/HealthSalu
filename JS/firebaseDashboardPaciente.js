import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";

// ========== CONFIG FIREBASE ==========
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

// Preenche o bloco com os dados
async function carregarDadosPaciente() {
  const cpfPaciente = localStorage.getItem("cpfPaciente");
  if (!cpfPaciente) return;

  const q = query(collection(db, "pacientes"), where("cpf", "==", cpfPaciente));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    const paciente = doc.data();

    const dadosContainer = document.getElementById("dashboard-header");

    dadosContainer.innerHTML = `
      <div id="dashboard-header">
        <i class="fas fa-user"></i>
        <div class="dados-paciente-texto">
          <h1><strong>Nome:</strong> ${paciente.nome}</h1>
          <p><strong>Email:</strong> ${paciente.email}</p>
          <p><strong>CPF:</strong> ${paciente.cpf}</p>
          <p><strong>Telefone:</strong> ${paciente.telefone}</p>
          <p><strong>Data de Nascimento:</strong> ${paciente.dataNascimento || paciente.dataNasc || "Não informado"}</p>
        </div>
      </div>
    `;

  } else {
    console.error("Paciente não encontrado.");
  }
}


// ========== VARIÁVEIS GLOBAIS ==========
let alimentoHistorico = [];
let historicoIMC2 = [];

let cpfPaciente = localStorage.getItem("cpfPaciente");

if (!cpfPaciente) {
  alert("Nenhum paciente foi selecionado.");
  window.location.href = "buscaPacientes.html";
}

// ========== VERIFICA USUÁRIO LOGADO ==========
onAuthStateChanged(auth, (user) => {
if (user && cpfPaciente) {
  carregarDadosPaciente(); 
  carregarHistoricoAlimentacao();
  carregarHistoricoExercicios();
  } else {
    alert("Você precisa estar logado.");
    window.location.href = "login.html";
  }
});

// ========== HISTÓRICO DE ALIMENTAÇÃO ==========
async function carregarHistoricoAlimentacao() {
  const q = query(collection(db, "alimentacao"), where("cpfPaciente", "==", cpfPaciente));
  const querySnapshot = await getDocs(q);

  const tabela = document.getElementById("tableAlimento");
  if (tabela) {
    while (tabela.rows.length > 1) tabela.deleteRow(1);
  }

  querySnapshot.forEach(doc => {
    const data = doc.data();

    alimentoHistorico.push({
      alimento: data.nomeAlimento,
      calorias: data.calorias,
      gordura: data.gordura,
      proteina: data.proteina,
      carboidrato: data.carboidrato
    });

    historicoIMC2.push({
      data: new Date(data.dataRegistro.seconds * 1000).toLocaleDateString("pt-BR"),
      imc: data.imc
    });

    const novaLinha = tabela.insertRow();
    novaLinha.innerHTML = `
      <td>${data.nomeAlimento}</td>
      <td>${data.quantidade}</td>
      <td>${data.calorias.toFixed(2)} kcal</td>
      <td>${data.gordura.toFixed(2)} g</td>
      <td>${data.proteina.toFixed(2)} g</td>
      <td>${data.carboidrato.toFixed(2)} g</td>
      <td>${data.descricaoImc || "-"}</td>
      <td>${new Date(data.dataRegistro.seconds * 1000).toLocaleDateString("pt-BR")}</td>
    `;
  });

  gerarGraficoCalorias2();
  gerarGraficoIMC2();
}

// ========== HISTÓRICO DE EXERCÍCIOS ==========
async function carregarHistoricoExercicios() {
  const q = query(collection(db, "exercicios"), where("cpfPaciente", "==", cpfPaciente));
  const querySnapshot = await getDocs(q);

  const tabela = document.getElementById("tableExercicio");
  if (tabela) {
    while (tabela.rows.length > 1) tabela.deleteRow(1);
  }

  const treinoHistorico = [];

  querySnapshot.forEach(doc => {
    const data = doc.data();

    treinoHistorico.push({
      tipo: data.tipo,
      duracao: data.duracao,
      calorias: data.calorias
    });

    const novaLinha = tabela.insertRow();
    novaLinha.innerHTML = `
      <td>${data.tipo}</td>
      <td>${data.duracao} min</td>
      <td>${data.calorias.toFixed(2)} kcal</td>
      <td>${data.descricaoImc}</td>
    `;
  });

  gerarGraficoExercicio(treinoHistorico);
}

function gerarGraficoCalorias2() {
  const ctx = document.getElementById("caloriesgainedChart").getContext("2d");
  if (window.caloriesgainedChart instanceof Chart) {
    window.caloriesgainedChart.destroy();
  }
 
  const caloriasPorAlimento = {};

  alimentoHistorico.forEach(item => {
    if (!caloriasPorAlimento[item.alimento]) {
      caloriasPorAlimento[item.alimento] = 0;
    }
    caloriasPorAlimento[item.alimento] += item.calorias;
  });

  const labels = Object.keys(caloriasPorAlimento);
  const dados = Object.values(caloriasPorAlimento);

  window.caloriesgainedChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Calorias Ganhas por Alimento",
        data: dados,
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "#ff6384",
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function gerarGraficoExercicio(treinos) {
  const ctx = document.getElementById("caloriesChart").getContext("2d");
  if (window.caloriesChart instanceof Chart) {
    window.caloriesChart.destroy();
  }

  const caloriasPorExercicio = {};

  treinos.forEach(t => {
    if (!caloriasPorExercicio[t.tipo]) {
      caloriasPorExercicio[t.tipo] = 0;
    }
    caloriasPorExercicio[t.tipo] += t.calorias;
  });

  const labels = Object.keys(caloriasPorExercicio);
  const dados = Object.values(caloriasPorExercicio);

  window.caloriesChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Calorias Perdidas por Exercício",
        data: dados,
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "#36e4b0",
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}


function gerarGraficoIMC2() {
  const ctx = document.getElementById("imcChart").getContext("2d");
  if (window.imcChart instanceof Chart) {
    window.imcChart.destroy();
  }

  window.imcChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: historicoIMC2.map(item => item.data),
      datasets: [{
        label: 'IMC',
        data: historicoIMC2.map(item => item.imc),
        borderColor: '#3cd0a3',
        backgroundColor: 'rgba(60, 208, 163, 0.2)',
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'IMC'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Data'
          }
        }
      }
    }
  });
}

