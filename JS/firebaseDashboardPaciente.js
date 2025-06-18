import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";
import { gerarGraficoCalorias2, gerarGraficoIMC2, alimentoHistorico, historicoIMC2 } from "./FirebaseDashboard.js";

// Config Firebase
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

let cpfPaciente = localStorage.getItem("cpfPaciente");

onAuthStateChanged(auth, (user) => {
  if (user && cpfPaciente) {
    carregarHistoricoAlimentacao();
    carregarHistoricoExercicios();
  } else {
    alert("Você precisa estar logado.");
    window.location.href = "login.html";
  }
});

// ================= HISTÓRICO DE ALIMENTAÇÃO ==================

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
      alimento: data.alimento,
      calorias: data.calorias,
      gordura: data.gordura,
      proteina: data.proteina,
      carboidrato: data.carboidrato
    });

    historicoIMC2.push({
      data: new Date(data.timestamp?.seconds * 1000).toLocaleDateString("pt-BR"),
      imc: data.imc
    });

    const novaLinha = tabela.insertRow();
    novaLinha.innerHTML = `
      <td>${data.alimento}</td>
      <td>${data.quantidade}</td>
      <td>${data.calorias.toFixed(2)} kcal</td>
      <td>${data.gordura.toFixed(2)} g</td>
      <td>${data.proteina.toFixed(2)} g</td>
      <td>${data.carboidrato.toFixed(2)} g</td>
      <td>${data.descricaoImc || "-"}</td>
      <td>${new Date(data.timestamp?.seconds * 1000).toLocaleDateString("pt-BR")}</td>
    `;
  });

  gerarGraficoCalorias2();
  gerarGraficoIMC2();
}

// ================= HISTÓRICO DE EXERCÍCIOS ==================

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

// ================ GERAÇÃO DO GRÁFICO DE EXERCÍCIOS ==================

function gerarGraficoExercicio(treinos) {
  const ctx = document.getElementById("caloriesChart").getContext("2d");
  if (window.caloriesChart) window.caloriesChart.destroy();

  window.caloriesChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: treinos.map(t => t.tipo),
      datasets: [{
        label: "Calorias Perdidas",
        data: treinos.map(t => t.calorias),
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
