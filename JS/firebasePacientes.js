import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

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

const inputBusca = document.getElementById("inputBusca");
const botaoPesquisar = document.getElementById("cardBtn");
const container = document.getElementById("containerPacientes");

// Evento de clique no botão de busca
botaoPesquisar.addEventListener("click", buscarPacientes);

async function buscarPacientes() {
  const termo = inputBusca.value.trim().toLowerCase();
  container.innerHTML = "";

  if (termo.length < 2) {
    container.innerHTML = "<p style='color: white;'>Digite ao menos 2 caracteres.</p>";
    return;
  }

  try {
    const pacientesRef = collection(db, "pacientes");
    const snapshot = await getDocs(pacientesRef);

    const pacientesFiltrados = snapshot.docs
      .map(doc => doc.data())
      .filter(p =>
        p.nome?.toLowerCase().includes(termo) ||
        p.cpf?.toLowerCase().includes(termo)
      );

    if (pacientesFiltrados.length === 0) {
      container.innerHTML = "<p style='color: white;'>Nenhum paciente encontrado.</p>";
      return;
    }

    container.innerHTML = snapshot.docs
    .filter(doc => {
      const p = doc.data();
      return p.nome?.toLowerCase().includes(termo) || p.cpf?.toLowerCase().includes(termo);
    })
    .map(doc => {
      const p = doc.data();
      const id = doc.id;
      return `
        <div class="cardPrescricao" 
             data-id="${id}" 
             data-cpf="${p.cpf}" 
             data-nome="${p.nome}"
             style="cursor: pointer; border: 1px solid #ccc; margin-bottom: 10px; padding: 10px;">
          <h2><i class="fas fa-user"></i> Nome do Paciente: <span>${p.nome}</span></h2>
          <p><strong>CPF:</strong> ${p.cpf}</p>
          <p><strong>Data de Nascimento:</strong> ${p.dataNascimento}</p>
          <p><strong>Email:</strong> ${p.email}</p>
          <p><strong>Telefone:</strong> ${p.telefone}</p>
        </div>
      `;
    }).join("");
      
    container.addEventListener("click", (event) => {
      const card = event.target.closest(".cardPrescricao");
      if (card) {
        const cpf = card.dataset.cpf;
        const nome = card.dataset.nome;

        localStorage.setItem("cpfPaciente", cpf);
        localStorage.setItem("nomePaciente", nome);

        console.log("CPF salvo:", cpf);
        console.log("Nome salvo:", nome);
        alert(`Paciente selecionado:\nNome: ${nome}\nCPF: ${cpf}`);
        
        // Redireciona apenas uma vez
        window.location.href = "dashboardPaciente.html";
      }
    });


  } catch (erro) {
    console.error("Erro ao buscar pacientes:", erro);
    container.innerHTML = "<p style='color: red;'>Erro ao buscar pacientes.</p>";
  }
}
