import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
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

// Função para carregar prescrições e colocar na tabela
async function carregarPrescricoes() {
  const tbody = document.getElementById('tbodyPrescricoes');
  tbody.innerHTML = ''; // Limpa tabela antes de carregar

  try {
    const querySnapshot = await getDocs(collection(db, "prescricoes"));

    querySnapshot.forEach(doc => {
      const data = doc.data();

      // Converter timestamp para data legível, se existir
      const dataPrescricao = data.dataPrescricao?.toDate().toLocaleDateString() || "";
      // Se não tem campo horario, pode usar dataPrescricao para horário ou ajustar conforme seu banco
      const horario = data.horario || "";

      // Monta linha da tabela
      const linha = `
        <tr>
          <td>${data.dosagem || ""}</td>
          <td>${dataPrescricao}</td>
          <td>${horario}</td>
          <td>${data.recomendacoes || ""}</td>
        </tr>
      `;

      tbody.insertAdjacentHTML('beforeend', linha);
    });

  } catch (error) {
    console.error("Erro ao carregar prescrições:", error);
  }
}

// Executa ao carregar a página
window.addEventListener('DOMContentLoaded', carregarPrescricoes);
