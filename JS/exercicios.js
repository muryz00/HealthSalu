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

// Visual state
let cpfPacienteGlobal = null;
let treinoHistorico = [];
let historicoIMC = [];
let caloriesChart = null;
let imcChart = null;

const caloriasPorMinuto = {
  corrida: 10,
  natação: 8,
  ciclismo: 6,
  musculação: 5
};

// Ao logar, busca o CPF e carrega histórico
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const pacienteSnap = await getDocs(query(collection(db, "pacientes"), where("uid", "==", user.uid)));

    if (!pacienteSnap.empty) {
      cpfPacienteGlobal = pacienteSnap.docs[0].data().cpf;
      carregarHistoricoExercicios(); // Carregar histórico visual
    } else {
      alert("Paciente não encontrado.");
    }
  } else {
    alert("Você precisa estar logado.");
    window.location.href = "login.html";
  }
});

async function carregarHistoricoExercicios() {
  const exerciciosSnap = await getDocs(query(collection(db, "exercicios"), where("cpfPaciente", "==", cpfPacienteGlobal)));

  exerciciosSnap.forEach(doc => {
    const data = doc.data();
    const imc = data.imc.toFixed(2);
    const descricaoIMC = data.descricaoImc;

    // Atualizar arrays
    treinoHistorico.push({
      exercise: data.tipo,
      duration: data.duracao,
      calorias: data.calorias
    });

    historicoIMC.push({
      treino: data.tipo,
      imc: parseFloat(imc)
    });

    // Atualizar tabela
    atualizarTabela(data.tipo, data.duracao, data.calorias, descricaoIMC);
  });

  // Gerar gráficos
  gerarGraficoCalorias();
  gerarGraficoIMC();
}

// Funções reutilizadas
function calcularIMC(peso, altura) {
  return (peso / (altura * altura)).toFixed(2);
}

function classificarIMC(imc) {
  if (imc < 18.5) return "Abaixo do peso";
  if (imc >= 18.5 && imc < 24.9) return "Peso normal";
  if (imc >= 25 && imc < 29.9) return "Sobrepeso";
  if (imc >= 30 && imc < 34.9) return "Obesidade grau 1";
  if (imc >= 35 && imc < 39.9) return "Obesidade grau 2";
  return "Obesidade grau 3";
}

window.calcularDados = async function () {
  let tipoExercicio = document.getElementById("tipo-exercicio").value;
  let duracao = parseInt(document.getElementById("duracao").value);
  let peso = parseFloat(document.getElementById("peso").value);
  let altura = parseFloat(document.getElementById("altura").value);

  if (isNaN(duracao) || duracao <= 0 || isNaN(peso) || isNaN(altura) || peso <= 0 || altura <= 0 || !cpfPacienteGlobal) {
    alert("Preencha todos os campos corretamente!");
    return;
  }

  const calorias = caloriasPorMinuto[tipoExercicio] * duracao;
  const imc = calcularIMC(peso, altura);
  const descricaoIMC = classificarIMC(imc);

  const dados = {
    tipo: tipoExercicio,
    duracao,
    peso,
    altura,
    imc,
    descricaoImc: descricaoIMC,
    calorias,
    data: Timestamp.now(),
    cpfPaciente: cpfPacienteGlobal
  };

  try {
    // Salvar no Firebase
    await addDoc(collection(db, "exercicios"), dados);

    // Atualizar arrays locais
    treinoHistorico.push({ exercise: tipoExercicio, duration: duracao, calorias });
    historicoIMC.push({ treino: tipoExercicio, imc: parseFloat(imc) });

    // Atualizar tabela
    atualizarTabela(tipoExercicio, duracao, calorias, descricaoIMC);

    // Atualizar gráficos imediatamente
    gerarGraficoCalorias();
    gerarGraficoIMC();

    // Gerar observação automática
    gerarObservacao(tipoExercicio, duracao);

  } catch (error) {
    console.error("Erro ao salvar os dados no Firebase:", error);
    alert("Erro ao salvar os dados. Tente novamente.");
  }
};

function atualizarTabela(exercise, duration, calorias, descricaoIMC) {
  const table = document.getElementById('tableExercicio');
  const newRow = table.insertRow();
  newRow.innerHTML = `<td>${exercise}</td><td>${duration} min</td><td>${calorias.toFixed(2)} kcal</td><td>${descricaoIMC}</td>`;
}

function gerarGraficoCalorias() {
  const ctx = document.getElementById('caloriesChart').getContext('2d');
  if (caloriesChart) caloriesChart.destroy();

  caloriesChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: treinoHistorico.map(t => t.exercise),
      datasets: [{
        label: 'Calorias Perdidas',
        data: treinoHistorico.map(t => t.calorias),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: '#36e4b0',
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

function gerarGraficoIMC() {
  const ctx = document.getElementById("imcChart").getContext("2d");
  if (imcChart) imcChart.destroy();

  imcChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: historicoIMC.map(entry => entry.treino),
      datasets: [{
        label: 'Evolução do IMC',
        data: historicoIMC.map(entry => entry.imc),
        borderColor: '#36e4b0',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        borderWidth: 2,
        fill: true,
        pointRadius: 5,
        pointBackgroundColor: '#2E7D32'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: 'white' } }
      },
      scales: {
        x: { ticks: { color: 'white' } },
        y: { beginAtZero: false, ticks: { color: 'white' } }
      }
    }
  });
}

function gerarObservacao(exercise, duration) {
  let obs = "";
  if (duration >= 60) {
    obs = `Ótimo treino! Seu treino de ${exercise} por ${duration} minutos ajudou bastante na resistência.`;
  } else if (duration >= 30) {
    obs = `Bom treino! ${duration} minutos de ${exercise} já traz bons benefícios à saúde.`;
  } else {
    obs = `Tente aumentar um pouco o tempo de treino para obter melhores resultados!`;
  }
  document.getElementById('observacoes').innerHTML += `<li>${obs}</li>`;
}
