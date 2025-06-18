// firebaseDashboard.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";

// alimentacao.js ou FirebaseDashboard.js
export { gerarGraficoCalorias2, gerarGraficoIMC2, alimentoHistorico, historicoIMC2 };

let alimentoAtual = null;
export let alimentoHistorico = [];
export let historicoIMC2 = [];


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

async function carregarGraficoExercicio(cpf) {
  try {
    const exerciciosRef = collection(db, "exercicios");
    const qExerc = query(exerciciosRef, where("cpfPaciente", "==", cpf));
    const snapshotExerc = await getDocs(qExerc);

    const dadosPorTipo = {};
    snapshotExerc.forEach((doc) => {
      const exerc = doc.data();
      const tipo      = exerc.tipo;                          
      const calorias  = Number(exerc.calorias) || 0;        

      if (!tipo) return;   

      if (dadosPorTipo[tipo]) {
        dadosPorTipo[tipo] += calorias;
      } else {
        dadosPorTipo[tipo] = calorias;
      }
    });

    const labels = Object.keys(dadosPorTipo);            
    const dados  = Object.values(dadosPorTipo);        

    gerarGraficoExercicios(labels, dados);
  } catch (error) {
    console.error("Erro ao carregar dados de exercícios:", error);
  }
}

function gerarGraficoExercicios(labels, dados) {
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

async function carregarGraficoAlimentacao(cpf) {
  try {
    const alimentacaoRef = collection(db, "alimentacao");
    const qAlim = query(alimentacaoRef, where("cpfPaciente", "==", cpf));
    const snapshotAlim = await getDocs(qAlim);

    const dadosPorAlimento = {};
    snapshotAlim.forEach((doc) => {
      const dado = doc.data();

      const alimento = dado.nomeAlimento;         
      const calorias = Number(dado.calorias) || 0;

      if (!alimento) return; 

      if (dadosPorAlimento[alimento]) {
        dadosPorAlimento[alimento] += calorias;
      } else {
        dadosPorAlimento[alimento] = calorias;
      }
    });

    const labels = Object.keys(dadosPorAlimento);
    const dados  = Object.values(dadosPorAlimento);

    gerarGraficoAlimentacao(labels, dados);
  } catch (error) {
    console.error("Erro ao carregar dados de alimentação:", error);
  }
}

function gerarGraficoAlimentacao(labels, dados) {
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




