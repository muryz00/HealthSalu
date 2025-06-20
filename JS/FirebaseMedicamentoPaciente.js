import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";
import {
    getFirestore,
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";

// Configuração do Firebase
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

async function carregarPrescricoes() {
    const container = document.getElementById('containerPrescricoes');
    container.innerHTML = '';

    const cpfPacienteRaw = localStorage.getItem('cpfPaciente');
    const cpfPaciente = cpfPacienteRaw?.replace(/\D/g, ''); 

    if (!cpfPaciente) {
        console.error("CPF do paciente não encontrado no localStorage.");
        container.innerHTML = '<p>CPF do paciente não encontrado.</p>';
        return;
    }

    try {

        const prescricoesRef = collection(db, "prescricoes");
        const q = query(prescricoesRef, where("pacienteCpf", "==", cpfPaciente));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            container.innerHTML = '<p>Nenhuma prescrição encontrada para este CPF.</p>';
            return;
        }

        querySnapshot.forEach(doc => {
            const data = doc.data();
            const dataPrescricao = data.dataPrescricao?.toDate().toLocaleDateString() || "";

            const cardHTML = `
                <div class="cardPrescricao">
                    <h2><i class="fas fa-capsules"></i> Medicamento: <span>${data.nomeMedicamento || ""}</span></h2>
                    <p><strong>Dosagem:</strong> ${data.dosagem || ""}</p>
                    <p><strong>Frequência Diária:</strong> ${data.frequenciaDiaria || ""}</p>
                    <p><strong>Duração (dias):</strong> ${data.duracaoDias || ""}</p>
                    <p><strong>Intervalo (horas):</strong> ${data.intervaloHoras || ""}</p>
                    <p><strong>Data da Prescrição:</strong> ${dataPrescricao}</p>
                    <p><strong>Nome do Médico:</strong> Dr(a). ${data.nomeMedico || "Não informado"}</p>
                </div>
            `;

            container.insertAdjacentHTML('beforeend', cardHTML);
        });

    } catch (error) {
        console.error("Erro ao carregar prescrições:", error);
        container.innerHTML = '<p>Erro ao carregar prescrições.</p>';
    }
}

window.addEventListener('DOMContentLoaded', carregarPrescricoes);
