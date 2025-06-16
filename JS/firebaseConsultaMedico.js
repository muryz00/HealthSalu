import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

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

// Horários padrão
const horariosPadrao = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

let especialidadeMedicoGlobal = "";
let nomeMedicoGlobal = "";

// Carrega especialidade do médico logado
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const emailMedico = user.email;
    const q = query(collection(db, "medicos"), where("email", "==", emailMedico));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const dados = snapshot.docs[0].data();
      especialidadeMedicoGlobal = dados.especialidade || "Não definida";
      nomeMedicoGlobal = dados.nome || "Dr(a). Não informado";

      const especialidadeInput = document.getElementById("especialidadeMedico");
      if (especialidadeInput) {
        especialidadeInput.value = especialidadeMedicoGlobal;
        especialidadeInput.setAttribute("readonly", true);
      }

      carregarConsultasMedico();
    } else {
      alert("Médico não encontrado na base de dados.");
    }
  } else {
    alert("Usuário não autenticado.");
  }
});

document.getElementById("dataConsultaAgendamento").addEventListener("change", carregarHorariosDisponiveis);

async function carregarHorariosDisponiveis() {
  const dataConsulta = document.getElementById("dataConsultaAgendamento").value;
  const selectHorario = document.getElementById("horarioConsultaAgendamento");
  selectHorario.innerHTML = '<option value="">Carregando horários...</option>';

  if (!dataConsulta) return;

  const diaSelecionado = new Date(`${dataConsulta}T00:00`).getDay();
  if (diaSelecionado === 0 || diaSelecionado === 6) {
    selectHorario.innerHTML = '<option value="">Fim de semana - indisponível</option>';
    return;
  }

  const consultasRef = collection(db, "consultas");
  const q = query(consultasRef, where("dataConsulta", "==", dataConsulta));
  const snapshot = await getDocs(q);

  const horariosOcupados = snapshot.docs.map(doc => doc.data().horarioConsulta);
  const horariosDisponiveis = horariosPadrao.filter(h => !horariosOcupados.includes(h));

  selectHorario.innerHTML = '<option value="">Selecione um horário</option>';
  horariosDisponiveis.forEach(horario => {
    const opt = document.createElement("option");
    opt.value = opt.textContent = horario;
    selectHorario.appendChild(opt);
  });
}

document.getElementById("cardBtn").addEventListener("click", agendarConsulta);

async function agendarConsulta() {
  const nome = document.getElementById("nomePacienteAgendamento").value.trim();
  const cpf = document.getElementById("cpfPacienteAgendamento").value.trim();
  const dataConsulta = document.getElementById("dataConsultaAgendamento").value;
  const horarioConsulta = document.getElementById("horarioConsultaAgendamento").value;

  if (!nome || !cpf || !especialidadeMedicoGlobal || !dataConsulta || !horarioConsulta) {
    alert("Por favor, preencha todos os campos!");
    return;
  }

  const dataHoje = new Date();
  const dataSelecionada = new Date(`${dataConsulta}T00:00`);
  if (dataSelecionada < dataHoje.setHours(0, 0, 0, 0)) {
    alert("A data da consulta não pode ser anterior a hoje.");
    return;
  }

  try {
    await addDoc(collection(db, "consultas"), {
      nome,
      cpf,
      especialidade: especialidadeMedicoGlobal,
      nomeMedico: nomeMedicoGlobal,
      dataConsulta,
      horarioConsulta,
      timestamp: new Date()
    });

    alert("Consulta marcada com sucesso!");

    document.getElementById("nomePacienteAgendamento").value = "";
    document.getElementById("cpfPacienteAgendamento").value = "";
    document.getElementById("dataConsultaAgendamento").value = "";
    document.getElementById("horarioConsultaAgendamento").innerHTML = '<option value="">Selecione uma data primeiro</option>';
    carregarConsultasMedico();

  } catch (erro) {
    console.error("Erro ao marcar consulta:", erro);
    alert("Erro ao marcar consulta.");
  }
}

async function carregarConsultasMedico() {
  const container = document.getElementById("containerConsultasMedico");
  container.innerHTML = "";

  const q = query(collection(db, "consultas"),
    where("especialidade", "==", especialidadeMedicoGlobal),
    where("nomeMedico", "==", nomeMedicoGlobal)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    container.innerHTML = `<p style="color: white;">Nenhuma consulta encontrada.</p>`;
    return;
  }

  snapshot.forEach(docSnap => {
    const consulta = docSnap.data();
    const id = docSnap.id;

    const cardHTML = `
      <div class="cardPrescricao" data-id="${id}">
        <h2><i class="fas fa-calendar-check"></i> Paciente: <span>${consulta.nome}</span></h2>
        <p><strong>CPF:</strong> ${consulta.cpf}</p>
        <p><strong>Data:</strong> ${consulta.dataConsulta}</p>
        <p><strong>Horário:</strong> ${consulta.horarioConsulta}</p>
        <p><strong>Especialidade:</strong> ${consulta.especialidade}</p>
        <p><strong>Médico:</strong> ${consulta.nomeMedico}</p>
        <button class="btn-remarcar">Remarcar</button>
        <button class="btn-desmarcar">Desmarcar</button>
      </div>
    `;
    container.insertAdjacentHTML("beforeend", cardHTML);
  });

  document.querySelectorAll(".btn-desmarcar").forEach(btn => {
    btn.addEventListener("click", async e => {
      const card = e.target.closest(".cardPrescricao");
      const id = card.getAttribute("data-id");
      await deleteDoc(doc(db, "consultas", id));
      alert("Consulta desmarcada com sucesso!");
      carregarConsultasMedico();
    });
  });

  document.querySelectorAll(".btn-remarcar").forEach(btn => {
    btn.addEventListener("click", async e => {
      const card = e.target.closest(".cardPrescricao");
      const id = card.getAttribute("data-id");

      const novaData = prompt("Nova data (YYYY-MM-DD):");
      const novoHorario = prompt("Novo horário (HH:mm):");

      if (!novaData || !novoHorario) return;

      await updateDoc(doc(db, "consultas", id), {
        dataConsulta: novaData,
        horarioConsulta: novoHorario
      });

      alert("Consulta remarcada com sucesso!");
      carregarConsultasMedico();
    });
  });
}

window.addEventListener("DOMContentLoaded", () => {
  // Aguardando dados do médico via onAuthStateChanged
});
