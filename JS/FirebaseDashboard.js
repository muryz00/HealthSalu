import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";

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
const db = getFirestore(app);
const auth = getAuth(app);

// Aguarda usuário logado para buscar dados
onAuthStateChanged(auth, user => {
  if (user) {
    const uid = user.uid;
    gerarGraficos(uid);
  } else {
    console.warn("Usuário não autenticado. Redirecionando para login.");
    window.location.href = "login.html";
  }
});

async function gerarGraficos(uid) {
  try {
    // ============ ALIMENTAÇÃO ============
    const alimentosQuery = query(collection(db, "alimentacao"), where("id_paciente", "==", uid));
    const alimentosSnap = await getDocs(alimentosQuery);
    const alimentosData = {};

    alimentosSnap.forEach(doc => {
      const { data_registro, calorias } = doc.data();
      const dia = data_registro.split("T")[0]; // yyyy-mm-dd
      alimentosData[dia] = (alimentosData[dia] || 0) + (calorias || 0);
    });

    const labelsAlimentos = Object.keys(alimentosData);
    const valoresAlimentos = Object.values(alimentosData);

    new Chart(document.getElementById("caloriesgainedChart"), {
      type: "bar",
      data: {
        labels: labelsAlimentos,
        datasets: [{
          label: "Calorias Consumidas",
          data: valoresAlimentos,
          backgroundColor: "#36e4b0"
        }]
      },
      options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });

    // ============ EXERCÍCIOS ============
    const exerciciosQuery = query(collection(db, "exercicios"), where("id_paciente", "==", uid));
    const exerciciosSnap = await getDocs(exerciciosQuery);
    const exerciciosData = {};

    exerciciosSnap.forEach(doc => {
      const { data, calorias } = doc.data();
      const dia = data.split("T")[0];
      exerciciosData[dia] = (exerciciosData[dia] || 0) + (calorias || 0);
    });

    const labelsExercicios = Object.keys(exerciciosData);
    const valoresExercicios = Object.values(exerciciosData);

    new Chart(document.getElementById("caloriesChart"), {
      type: "line",
      data: {
        labels: labelsExercicios,
        datasets: [{
          label: "Calorias Gastas",
          data: valoresExercicios,
          borderColor: "#36e4b0",
          backgroundColor: "rgba(54, 228, 176, 0.2)",
          tension: 0.3
        }]
      },
      options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });

    // ============ MENSTRUAÇÃO ============
    const menstruacaoQuery = query(collection(db, "menstruacao"), where("id_paciente", "==", uid));
    const menstruacaoSnap = await getDocs(menstruacaoQuery);

    const fluxoMap = { leve: 1, moderado: 2, intenso: 3 };
    const menstruacaoData = {};

    menstruacaoSnap.forEach(doc => {
      const { data_inicio, fluxo } = doc.data();
      const dia = data_inicio;
      menstruacaoData[dia] = fluxoMap[fluxo] || 0;
    });

    new Chart(document.getElementById("fluxoChart"), {
      type: "bar",
      data: {
        labels: Object.keys(menstruacaoData),
        datasets: [{
          label: "Fluxo Menstrual",
          data: Object.values(menstruacaoData),
          backgroundColor: "#ff6384"
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: value => {
                return { 1: 'Leve', 2: 'Moderado', 3: 'Intenso' }[value] || value;
              }
            }
          }
        }
      }
    });

  } catch (err) {
    console.error("Erro ao gerar gráficos:", err);
  }
}
