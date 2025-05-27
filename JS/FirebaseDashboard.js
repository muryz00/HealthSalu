import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs
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
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
    const cpfPaciente = localStorage.getItem('cpfPaciente');

    if (!cpfPaciente) {
        console.warn("CPF do paciente não encontrado.");
        return;
    }

    carregarGraficoExercicio(cpfPaciente);
});

async function carregarGraficoExercicio(cpf) {
    try {
        const exerciciosRef = collection(db, "exercicios");
        const q = query(exerciciosRef, where("cpfPaciente", "==", cpf));
        const querySnapshot = await getDocs(q);

        const dados = [];
        const labels = [];

        querySnapshot.forEach(doc => {
            const dado = doc.data();
            labels.push(dado.tipo);
            dados.push(dado.calorias);
        });

        gerarGraficoExercicios(labels, dados);
    } catch (error) {
        console.error("Erro ao carregar dados de exercícios:", error);
    }
}

let caloriesChart = null;

function gerarGraficoExercicios(labels, dados) {
    const ctx = document.getElementById("caloriesChart").getContext("2d");

    if (caloriesChart) {
        caloriesChart.destroy();
    }

    caloriesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Calorias Gastas',
                data: dados,
                backgroundColor: 'rgba(60, 208, 163, 0.5)',
                borderColor: '#3cd0a3',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: { color: 'white' }
                }
            },
            scales: {
                x: {
                    ticks: { color: 'white' }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: 'white' }
                }
            }
        }
    });
}
