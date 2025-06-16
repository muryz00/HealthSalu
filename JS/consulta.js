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

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Horários padrão
const horariosPadrao = [
  "08:00", "09:00", "10:00", "11:00",
  "13:00", "14:00", "15:00", "16:00", "17:00"
];

// Evento para atualizar horários disponíveis ao selecionar uma data
document.getElementById("dataConsulta").addEventListener("change", carregarHorariosDisponiveis);

async function carregarHorariosDisponiveis() {
  const dataConsulta = document.getElementById("dataConsulta").value;
  const selectHorario = document.getElementById("horarioConsulta");
  selectHorario.innerHTML = '<option value="">Carregando horários...</option>';

  if (!dataConsulta) return;

  const diaSelecionado = new Date(`${dataConsulta}T00:00`).getDay();

  if (diaSelecionado === 0 || diaSelecionado === 6) {
    selectHorario.innerHTML = '<option value="">Nenhum horário disponível (fim de semana)</option>';
    return;
  }

  const consultasRef = collection(db, "consultas");
  const q = query(consultasRef, where("dataConsulta", "==", dataConsulta));
  const querySnapshot = await getDocs(q);

  const horariosOcupados = [];
  querySnapshot.forEach((doc) => {
    horariosOcupados.push(doc.data().horarioConsulta);
  });

  const horariosDisponiveis = horariosPadrao.filter(horario => !horariosOcupados.includes(horario));

  if (horariosDisponiveis.length === 0) {
    selectHorario.innerHTML = '<option value="">Nenhum horário disponível</option>';
  } else {
    selectHorario.innerHTML = '<option value="">Selecione um horário</option>';
    horariosDisponiveis.forEach(horario => {
      const option = document.createElement("option");
      option.value = horario;
      option.textContent = horario;
      selectHorario.appendChild(option);
    });
  }
}

async function agendarConsulta() {
  const cpf = localStorage.getItem("cpfPaciente");
  if (!cpf) {
    alert("CPF do paciente não encontrado. Faça login novamente.");
    return;
  }

  const nome = document.getElementById("nome").value.trim();
  const especialidade = document.getElementById("atendimento").value;
  const dataConsulta = document.getElementById("dataConsulta").value;
  const horarioConsulta = document.getElementById("horarioConsulta").value;

  if (!nome || !especialidade || !dataConsulta || !horarioConsulta) {
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
    // 🔍 Buscar um médico pela especialidade
    const medicosRef = collection(db, "medicos");
    const q = query(medicosRef, where("especialidade", "==", especialidade));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      alert("Nenhum médico disponível para essa especialidade.");
      return;
    }

    // Selecionar o primeiro médico disponível (você pode depois randomizar ou usar outro critério)
    const medicoData = querySnapshot.docs[0].data();
    const nomeMedico = medicoData.nome;

    await addDoc(collection(db, "consultas"), {
      cpf,
      nome,
      especialidade,
      nomeMedico,
      dataConsulta,
      horarioConsulta,
      timestamp: new Date()
    });

    alert(`Consulta marcada com o(a) Dr(a). ${nomeMedico} com sucesso!`);
    document.getElementById("nome").value = "";
    document.getElementById("atendimento").selectedIndex = 0;
    document.getElementById("dataConsulta").value = "";
    document.getElementById("horarioConsulta").innerHTML = '<option value="">Selecione um horário</option>';
    carregarConsulta();
    carregarHorariosDisponiveis();

  } catch (erro) {
    console.error("Erro ao salvar consulta:", erro);
    alert("Erro ao salvar a consulta. Tente novamente mais tarde.");
  }
}

document.getElementById("cardBtn").addEventListener("click", agendarConsulta);

// ... (restante do código permanece o mesmo acima da função carregarConsulta)

async function carregarConsulta() {
  const container = document.getElementById('listaConsultas');
  container.innerHTML = '';

  const cpf = localStorage.getItem("cpfPaciente");
  if (!cpf) {
    console.warn("CPF não encontrado no localStorage.");
    return;
  }

  try {
    const consultasRef = collection(db, "consultas");
    const q = query(consultasRef, where("cpf", "==", cpf));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      container.innerHTML = `<p style="color: white;">Nenhuma consulta encontrada.</p>`;
      return;
    }

    querySnapshot.forEach(docSnap => {
      const data = docSnap.data();
      const id = docSnap.id;

      const cardHTML = `
      <div class="cardPrescricao" data-id="${id}">
        <h2><i class="fas fa-calendar-check"></i> Nome do Paciente: <span>${data.nome}</span></h2>
        <p><strong>CPF:</strong> ${data.cpf}</p>
        <p><strong>Data da Consulta:</strong> ${data.dataConsulta}</p>
        <p><strong>Horário da Consulta:</strong> ${data.horarioConsulta}</p>
        <p><strong>Especialidade:</strong> ${data.especialidade}</p>
        <p><strong>Médico Responsável:</strong> ${data.nomeMedico || "Não informado"}</p>
        <button class="btn-remarcar">Remarcar</button>
        <button class="btn-desmarcar">Desmarcar</button>
      </div>
    `;    
      container.insertAdjacentHTML('beforeend', cardHTML);
    });

    // Adicionar eventos aos botões
    document.querySelectorAll('.btn-desmarcar').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const card = e.target.closest('.cardPrescricao');
        const id = card.getAttribute('data-id');
        const dataConsulta = card.querySelector('p:nth-of-type(2)').textContent.split(': ')[1];

        await deleteDoc(doc(db, "consultas", id));
        alert("Consulta desmarcada com sucesso!");

        carregarConsulta();

        // Recarrega horários disponíveis se a data da consulta excluída for a mesma selecionada
        if (document.getElementById("dataConsulta").value === dataConsulta) {
          carregarHorariosDisponiveis();
        }
      });
    });

    document.querySelectorAll('.btn-remarcar').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const card = e.target.closest('.cardPrescricao');
        const id = card.getAttribute('data-id');
        const dataAntiga = card.querySelector('p:nth-of-type(2)').textContent.split(': ')[1];

        const novaData = prompt("Nova data (YYYY-MM-DD):");
        const novoHorario = prompt("Novo horário (HH:mm):");

        if (!novaData || !novoHorario) return;

        await updateDoc(doc(db, "consultas", id), {
          dataConsulta: novaData,
          horarioConsulta: novoHorario
        });

        alert("Consulta remarcada com sucesso!");
        carregarConsulta();

        // Se a data atual no input é igual à data nova ou à antiga, atualizar horários
        const dataAtualInput = document.getElementById("dataConsulta").value;
        if (dataAtualInput === novaData || dataAtualInput === dataAntiga) {
          carregarHorariosDisponiveis();
        }
      });
    });

  } catch (error) {
    console.error("Erro ao carregar consultas:", error);
    container.innerHTML = `<p style="color: red;">Erro ao carregar consultas. Tente novamente mais tarde.</p>`;
  }
}

window.addEventListener('DOMContentLoaded', carregarConsulta);
