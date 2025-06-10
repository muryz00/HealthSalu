// firebaseDashboard.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";

// ==========================
// 1) Configuração do Firebase
// ==========================
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
const db  = getFirestore(app);

// ==========================
// 2) Ao carregar a página, pega o CPF diretamente do localStorage
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  const cpfPaciente = localStorage.getItem("cpfPaciente");
  if (!cpfPaciente) {
    console.warn("CPF do paciente não encontrado. Faça login novamente.");
    alert("Faça login antes de acessar o dashboard.");
    window.location.href = "login.html";
    return;
  }

  carregarGraficoExercicio(cpfPaciente);
  carregarGraficoAlimentacao(cpfPaciente);
  carregarGraficoFluxoMenstrual(cpfPaciente);
});
let caloriesChart        = null;
let caloriesGainedChart  = null;

// ==========================
// 3) Função para carregar Gráfico de Exercícios
// ==========================
async function carregarGraficoExercicio(cpf) {
  try {
    // 3.1) Faz a query na coleção "exercicios", filtrando por "cpfPaciente"
    const exerciciosRef = collection(db, "exercicios");
    const qExerc = query(exerciciosRef, where("cpfPaciente", "==", cpf));
    const snapshotExerc = await getDocs(qExerc);

    // 3.2) Agrupa calorias por tipo de exercício
    const dadosPorTipo = {};
    snapshotExerc.forEach((doc) => {
      const exerc = doc.data();
      const tipo      = exerc.tipo;                          // nome do tipo (por ex: "corrida")
      const calorias  = Number(exerc.calorias) || 0;         // converte para Number

      if (!tipo) return;   // Se não tiver campo "tipo", pula esse documento

      if (dadosPorTipo[tipo]) {
        dadosPorTipo[tipo] += calorias;
      } else {
        dadosPorTipo[tipo] = calorias;
      }
    });

    // 3.3) Extrai labels e valores para passar ao Chart.js
    const labels = Object.keys(dadosPorTipo);              // ex: ["corrida", "natação"]
    const dados  = Object.values(dadosPorTipo);             // ex: [300, 120]

    gerarGraficoExercicios(labels, dados);
  } catch (error) {
    console.error("Erro ao carregar dados de exercícios:", error);
  }
}

function gerarGraficoExercicios(labels, dados) {
  // 3.4) Gera o gráfico de barras em cima de <canvas id="caloriesChart">
  const ctx = document.getElementById("caloriesChart").getContext("2d");
  if (caloriesChart) {
    caloriesChart.destroy();
  }

  caloriesChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Calorias Gastas por Tipo de Exercício",
          data: dados,
          backgroundColor: "rgba(60, 208, 163, 0.5)",
          borderColor: "#3cd0a3",
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: "white" }
        }
      },
      scales: {
        x: {
          ticks: { color: "white" }
        },
        y: {
          beginAtZero: true,
          ticks: { color: "white" }
        }
      }
    }
  });
}

// ==========================
// 4) Função para carregar Gráfico de Alimentação
// ==========================
async function carregarGraficoAlimentacao(cpf) {
  try {
    // 4.1) Faz a query na coleção "alimentacao", filtrando por "cpfPaciente"
    const alimentacaoRef = collection(db, "alimentacao");
    const qAlim = query(alimentacaoRef, where("cpfPaciente", "==", cpf));
    const snapshotAlim = await getDocs(qAlim);

    // 4.2) Agrupa calorias por “nome do alimento”
    const dadosPorAlimento = {};
    snapshotAlim.forEach((doc) => {
      const dado = doc.data();

      const alimento = dado.nomeAlimento;           // <— ajuste conforme seu Firestore
      const calorias = Number(dado.calorias) || 0;

      if (!alimento) return;  // pula se tiver undefined ou string vazia

      if (dadosPorAlimento[alimento]) {
        dadosPorAlimento[alimento] += calorias;
      } else {
        dadosPorAlimento[alimento] = calorias;
      }
    });

    // 4.3) Extrai arrays de labels e dados
    const labels = Object.keys(dadosPorAlimento);
    const dados  = Object.values(dadosPorAlimento);

    gerarGraficoAlimentacao(labels, dados);
  } catch (error) {
    console.error("Erro ao carregar dados de alimentação:", error);
  }
}

function gerarGraficoAlimentacao(labels, dados) {
  // 4.4) Gera o gráfico de barras em cima de <canvas id="caloriesgainedChart">
  const ctx = document.getElementById("caloriesgainedChart").getContext("2d");
  if (caloriesGainedChart) {
    caloriesGainedChart.destroy();
  }

  caloriesGainedChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Calorias Consumidas por Alimento",
          data: dados,
          backgroundColor: "rgba(255, 99, 132, 0.5)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: "white" }
        }
      },
      scales: {
        x: {
          ticks: { color: "white" }
        },
        y: {
          beginAtZero: true,
          ticks: { color: "white" }
        }
      }
    }
  });
}

let fluxoChart = null;

async function carregarGraficoFluxoMenstrual(cpf) {
  try {
    const menstruacoesRef = collection(db, "menstruacoes");
    const q = query(menstruacoesRef, where("cpf", "==", cpf));
    const snapshot = await getDocs(q);

    const contagemFluxo = {
      leve: 0,
      moderado: 0,
      intenso: 0
    };

    snapshot.forEach(doc => {
      const { fluxo } = doc.data();
      if (["leve", "moderado", "intenso"].includes(fluxo)) {
        contagemFluxo[fluxo]++;
      }
    });

    const labels = ["Leve", "Moderado", "Intenso"];
    const dados = [
      contagemFluxo.leve,
      contagemFluxo.moderado,
      contagemFluxo.intenso
    ];

    gerarGraficoFluxo(labels, dados);

  } catch (error) {
    console.error("Erro ao carregar gráfico de fluxo menstrual:", error);
  }
}

function gerarGraficoFluxo(labels, dados) {
  const ctx = document.getElementById("fluxoChart").getContext("2d");
  if (fluxoChart) fluxoChart.destroy();

  fluxoChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [{
        data: dados,
        backgroundColor: ["#81d4fa", "#ffb74d", "#e57373"],
        borderColor: "#ffffff",
        borderWidth: 2,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '65%',
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "white",
            boxWidth: 12,
            padding: 15
          }
        },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.label}: ${ctx.raw} ocorrência(s)`
          }
        }
      }
    }
  });
}


