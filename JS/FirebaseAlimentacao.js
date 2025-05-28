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


// ✅ Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDDcP6Iji3mIl5zmBWC95DwmXdWOcPXx68",
  authDomain: "api-cadastro-5ab06.firebaseapp.com",
  projectId: "api-cadastro-5ab06",
  storageBucket: "api-cadastro-5ab06.appspot.com",
  messagingSenderId: "1090059146851",
  appId: "1:1090059146851:web:9731938ed7b23952b3ca56",
  measurementId: "G-0FYR4JFV44"
};

// ✅ Inicialização
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let cpfPacienteGlobal = null;

// ✅ Observa autenticação e captura CPF do paciente
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const q = query(collection(db, "pacientes"), where("uid", "==", user.uid));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();
      cpfPacienteGlobal = data.cpf;
      localStorage.setItem('cpfPaciente', cpfPacienteGlobal);
      console.log("CPF do paciente:", cpfPacienteGlobal);
    } else {
      alert("Paciente não encontrado.");
    }
  } else {
    alert("Usuário não autenticado.");
    window.location.href = "login.html";
  }
});

// ✅ Exporta variáveis para outros arquivos JS
export { app, auth, db, cpfPacienteGlobal };


// Autenticação e obtenção do CPF
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const q = query(collection(db, "pacientes"), where("uid", "==", user.uid));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();
      cpfPacienteGlobal = data.cpf;
      localStorage.setItem('cpfPaciente', cpfPacienteGlobal);
    } else {
      alert("Paciente não encontrado.");
    }
  } else {
    alert("Usuário não autenticado.");
    window.location.href = "login.html";
  }
});

// ================== CALCULAR E SALVAR ALIMENTAÇÃO =======================
window.calcularGraficos = async function () {
  const nomeAlimento = document.getElementById("nome-alimento").textContent;
  const calorias = parseFloat(document.getElementById("calorias").textContent);
  const gordura = parseFloat(document.getElementById("gordura").textContent);
  const carboidrato = parseFloat(document.getElementById("carboidrato").textContent);
  const proteina = parseFloat(document.getElementById("proteina").textContent);
  const peso = parseFloat(document.getElementById("peso").value);
  const altura = parseFloat(document.getElementById("altura").value);
  const quantidade = parseFloat(document.getElementById("quantidade").value);
  const dataAlimento = document.getElementById("dataAlimento").value;

  if (!nomeAlimento || isNaN(calorias) || isNaN(gordura) || isNaN(carboidrato) || isNaN(proteina)
      || !peso || !altura || !quantidade || !dataAlimento || !cpfPacienteGlobal) {
    alert("Preencha todos os campos corretamente.");
    return;
  }

  const imc = peso / (altura * altura);
  const descricaoImc = getDescricaoIMC(imc);

  const dados = {
    nomeAlimento,
    calorias: calorias * (quantidade / 100),
    gordura: gordura * (quantidade / 100),
    carboidrato: carboidrato * (quantidade / 100),
    proteina: proteina * (quantidade / 100),
    quantidade,
    peso,
    altura,
    imc,
    descricaoImc,
    dataAlimento,
    cpfPaciente: cpfPacienteGlobal,
    dataRegistro: Timestamp.now()
  };

  try {
    await addDoc(collection(db, "alimentacao"), dados);
    adicionarNaTabela(dados);
    alert("Dados de alimentação registrados com sucesso!");
  } catch (erro) {
    console.error("Erro ao salvar alimentação:", erro);
    alert("Erro ao salvar alimentação.");
  }
};

// ================= DESCRIÇÃO DO IMC =================
function getDescricaoIMC(imc) {
  if (imc < 18.5) return "Abaixo do peso";
  if (imc < 24.9) return "Peso normal";
  if (imc < 29.9) return "Sobrepeso";
  return "Obesidade";
}

// ================= ADICIONAR NA TABELA =================
function adicionarNaTabela(dados) {
  const tabela = document.getElementById("tableAlimento");
  const novaLinha = tabela.insertRow();

  novaLinha.innerHTML = `
    <td>${dados.nomeAlimento}</td>
    <td>${dados.quantidade}g</td>
    <td>${dados.calorias.toFixed(2)} kcal</td>
    <td>${dados.gordura.toFixed(2)} g</td>
    <td>${dados.proteina.toFixed(2)} g</td>
    <td>${dados.carboidrato.toFixed(2)} g</td>
    <td>${dados.descricaoImc}</td>
    <td>${dados.dataAlimento}</td>
  `;
}
