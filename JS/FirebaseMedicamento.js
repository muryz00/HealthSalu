import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";

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

document.getElementById('btnPrescricao').addEventListener('click', salvarPrescricao);

async function salvarPrescricao() {
  const medico = auth.currentUser;
  if (!medico) {
    alert("Usuário não autenticado.");
    return;
  }

  // Buscar nome do médico na coleção "medico"
  const medicoRef = collection(db, "medicos");
  const medicoQuery = query(medicoRef, where("uid", "==", medico.uid));
  const medicoSnapshot = await getDocs(medicoQuery);

  if (medicoSnapshot.empty) {
    alert("Dados do médico não encontrados.");
    return;
  }

  const medicoData = medicoSnapshot.docs[0].data();
  const nomeMedico = medicoData.nome;

  // Verificação do CPF do paciente
  const cpfPaciente = document.getElementById("cpfPaciente").value;
  if (!cpfPaciente) {
    alert("CPF do paciente é obrigatório.");
    return;
  }

  const pacientesRef = collection(db, "pacientes");
  const q = query(pacientesRef, where("cpf", "==", cpfPaciente));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    alert("Paciente não encontrado.");
    return;
  }

  const pacienteDoc = querySnapshot.docs[0];
  const pacienteId = pacienteDoc.id;

  const dadosPrescricao = {
    pacienteCpf: cpfPaciente,
    pacienteId: pacienteId,
    nomeMedicamento: document.getElementById("nomeMedicamento").value,
    dosagem: document.getElementById("dosagem").value,
    frequenciaDiaria: document.getElementById("frequenciaDiaria").value,
    duracaoDias: document.getElementById("duracaoDias").value,
    intervaloHoras: document.getElementById("intervaloHoras").value,
    dataPrescricao: Timestamp.now(),
    medicoId: medico.uid,
    nomeMedico: nomeMedico // ← nome preenchido automaticamente
  };

  try {
    await addDoc(collection(db, "prescricoes"), dadosPrescricao);
    alert("Prescrição salva com sucesso!");
    document.getElementById("formPrescricao").reset();
  } catch (erro) {
    console.error("Erro ao salvar prescrição:", erro);
    alert("Erro ao salvar prescrição.");
  }
}
