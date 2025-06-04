// firebaseAlimentacao.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";

import {
  gerarGraficoCalorias2,
  gerarGraficoIMC2,
  alimentoHistorico,
  historicoIMC2
} from "./alimentacao.js";

// 🔥 Configuração do Firebase
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

// Em vez de onAuthStateChanged, lê direto do localStorage:
let cpfPacienteGlobal = localStorage.getItem("cpfPaciente") || null;

// Se não houver CPF no localStorage, dá um return silencioso — o usuário precisa fazer login
if (!cpfPacienteGlobal) {
  alert("Usuário não autenticado. Faça login novamente.");
  window.location.href = "login.html";
}

// Carrega todos os dados antigos assim que esse arquivo for importado (antes mesmo de clicar em “Calcular”)
carregarDadosAntigos();

function validarCampos() {
  const nomeAlimento = document.getElementById("nome-alimento").textContent.trim();
  const calorias     = parseFloat(document.getElementById("calorias").textContent);
  const gordura      = parseFloat(document.getElementById("gordura").textContent);
  const carboidrato  = parseFloat(document.getElementById("carboidrato").textContent);
  const proteina     = parseFloat(document.getElementById("proteina").textContent);
  const peso         = parseFloat(document.getElementById("peso").value.replace(",", "."));
  const altura       = parseFloat(document.getElementById("altura").value.replace(",", "."));
  const quantidade   = parseFloat(document.getElementById("quantidade").value);
  const dataAlimento = document.getElementById("dataAlimento").value;

  let mensagensErro = [];

  if (nomeAlimento === "-" || nomeAlimento === "") {
    mensagensErro.push("Selecione um alimento válido.");
  }
  if (isNaN(calorias)   || isNaN(gordura) || isNaN(carboidrato) || isNaN(proteina)) {
    mensagensErro.push("Busque um alimento para obter os valores nutricionais.");
  }
  if (isNaN(quantidade) || quantidade <= 0) {
    mensagensErro.push("Digite uma quantidade válida em gramas.");
  }
  if (isNaN(peso)       || peso <= 0) {
    mensagensErro.push("Digite um peso válido.");
  }
  if (isNaN(altura)     || altura <= 0) {
    mensagensErro.push("Digite uma altura válida.");
  }
  if (!dataAlimento) {
    mensagensErro.push("Selecione uma data válida para a alimentação.");
  }

  if (mensagensErro.length > 0) {
    alert(mensagensErro.join("\n"));
    return false;
  }
  return true;
}

// 🚀 Função principal (invocada ao clicar em “Calcular”)
window.calcularGraficos = async function () {
  const nomeAlimento = document.getElementById("nome-alimento").textContent.trim();
  const calorias     = parseFloat(document.getElementById("calorias").textContent);
  const gordura      = parseFloat(document.getElementById("gordura").textContent);
  const carboidrato  = parseFloat(document.getElementById("carboidrato").textContent);
  const proteina     = parseFloat(document.getElementById("proteina").textContent);
  const peso         = parseFloat(document.getElementById("peso").value.replace(",", "."));
  const altura       = parseFloat(document.getElementById("altura").value.replace(",", "."));
  const quantidade   = parseFloat(document.getElementById("quantidade").value);
  const dataAlimento = document.getElementById("dataAlimento").value;

  if (!validarCampos()) {
    return;
  }

  // 🧠 Cálculo IMC
  const imc         = peso / (altura * altura);
  const descricaoImc = getDescricaoIMC(imc);

  // 📦 Dados a salvar no Firestore
  const dados = {
    nomeAlimento,
    calorias:   calorias * (quantidade / 100),
    gordura:    gordura * (quantidade / 100),
    carboidrato:carboidrato * (quantidade / 100),
    proteina:   proteina * (quantidade / 100),
    quantidade,
    peso,
    altura,
    imc,
    descricaoImc,
    dataAlimento,
    cpfPaciente: cpfPacienteGlobal,
    dataRegistro: Timestamp.now()
  };

  // 💾 Salvar no Firebase
  try {
    await addDoc(collection(db, "alimentacao"), dados);
    adicionarNaTabela(dados);
    alert("Dados de alimentação registrados com sucesso!");
  } catch (erro) {
    console.error("Erro ao salvar alimentação:", erro);
    alert("Erro ao salvar alimentação.");
    return;
  }

  // 📊 Atualizar gráficos e históricos em memória
  alimentoHistorico.push({
    alimento:   dados.nomeAlimento,
    calorias:   dados.calorias,
    gordura:    dados.gordura,
    proteina:   dados.proteina,
    carboidrato:dados.carboidrato
  });
  historicoIMC2.push({
    imc:  dados.imc,
    data: dados.dataAlimento
  });

  gerarGraficoCalorias2();
  gerarGraficoIMC2();
};

// 🔥 Descrição de IMC
function getDescricaoIMC(imc) {
  if (imc < 18.5) return "Abaixo do peso";
  if (imc < 24.9) return "Peso normal";
  if (imc < 29.9) return "Sobrepeso";
  return "Obesidade";
}

// 🏷️ Insere uma nova linha na tabela HTML com os dados recém-salvos
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

// 🔄 Carrega e popula na tabela + gráficos todos os registros antigos
async function carregarDadosAntigos() {
  if (!cpfPacienteGlobal) return; // Se não tiver CPF, sai

  try {
    const q = query(
      collection(db, "alimentacao"),
      where("cpfPaciente", "==", cpfPacienteGlobal)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) return; // Sem dados antigos, apenas retorna

    snapshot.forEach((doc) => {
      const dados = doc.data();

      // Preenche o array de histórico de calorias
      alimentoHistorico.push({
        alimento:   dados.nomeAlimento,
        calorias:   dados.calorias,
        gordura:    dados.gordura,
        proteina:   dados.proteina,
        carboidrato:dados.carboidrato
      });

      // Preenche o array de histórico de IMC
      historicoIMC2.push({
        imc:  dados.imc,
        data: dados.dataAlimento
      });

      // Insere na tabela
      adicionarNaTabela(dados);
    });

    // Depois de popular os arrays, desenha os gráficos
    gerarGraficoCalorias2();
    gerarGraficoIMC2();
  } catch (error) {
    console.error("Erro ao carregar dados antigos de alimentação:", error);
  }
}
