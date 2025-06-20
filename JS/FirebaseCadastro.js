import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";

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
getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

document.getElementById("formLogin").addEventListener("submit", async function(e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;
  const confirmSenha = document.getElementById("confirmSenha").value;
  const nome = document.getElementById("nome").value.trim();
  const cpf = document.getElementById("cpf").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const dataNascimento = document.getElementById("dataNascimento").value;
  const tipo = document.getElementById("tipo").value;

  const crm = tipo === "medico" ? document.getElementById("identificador")?.value.trim() || "" : undefined;
  const especialidade = tipo === "medico" ? document.getElementById("atendimento")?.value || "" : undefined;

  function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function validarCPF(cpf) {
    const re = /^\d{11}$/;
    return re.test(cpf);
  }

  function validarTelefone(tel) {
    const re = /^\d{10,11}$/;
    return re.test(tel);
  }

  function calcularIdade(dataNasc) {
    const hoje = new Date();
    const nasc = new Date(dataNasc);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
      idade--;
    }
    return idade;
  }

  // Validações do formulário
  if (!nome) {
    alert("Por favor, preencha o nome.");
    return;
  }

  if (!validarEmail(email)) {
    alert("Por favor, insira um email válido.");
    return;
  }

  if (!senha) {
    alert("Por favor, insira uma senha.");
    return;
  }

  if (senha.length < 6) {
    alert("A senha deve ter no mínimo 6 caracteres.");
    return;
  }

  if (senha !== confirmSenha) {
    alert("As senhas não coincidem!");
    return;
  }

  if (!cpf) {
    alert("Por favor, preencha o CPF.");
    return;
  }

  if (!validarCPF(cpf)) {
    alert("CPF inválido! Insira 11 dígitos numéricos, sem pontos ou traços.");
    return;
  }

  if (!telefone) {
    alert("Por favor, preencha o telefone.");
    return;
  }

  if (!validarTelefone(telefone)) {
    alert("Telefone inválido! Insira apenas números, entre 10 e 11 dígitos.");
    return;
  }

  if (!dataNascimento) {
    alert("Por favor, preencha a data de nascimento.");
    return;
  }

  if (tipo === "paciente") {
    const idade = calcularIdade(dataNascimento);
    if (idade < 18) {
      alert("Você precisa ter pelo menos 18 anos para se cadastrar como paciente.");
      return;
    }
  }

  if (tipo === "medico") {
    if (!crm) {
      alert("Por favor, digite seu CRM.");
      return;
    }

    if (!especialidade) {
      alert("Por favor, escolha uma especialidade.");
      return;
    }
  }

  // Verifica se já existe usuário com mesmo CPF ou email no Firestore (coleção correta)
  try {
    const collectionName = tipo === 'paciente' ? 'pacientes' : 'medicos';

    // Checa CPF duplicado
    const cpfQuery = query(collection(db, collectionName), where("cpf", "==", cpf));
    const cpfSnapshot = await getDocs(cpfQuery);
    if (!cpfSnapshot.empty) {
      alert("Este CPF já está cadastrado.");
      return;
    }

    // Checa email duplicado na mesma coleção Firestore (por segurança, mas o auth já bloqueia)
    const emailQuery = query(collection(db, collectionName), where("email", "==", email));
    const emailSnapshot = await getDocs(emailQuery);
    if (!emailSnapshot.empty) {
      alert(`Este email já está cadastrado como ${tipo}.`);
      return;
    }

  } catch (dbError) {
    console.error("Erro ao verificar dados duplicados no Firestore:", dbError);
    alert("Erro ao verificar dados duplicados. Tente novamente mais tarde.");
    return;
  }

  // Cria usuário no Firebase Auth e salva dados no Firestore
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    const collectionName = tipo === 'paciente' ? 'pacientes' : 'medicos';

    const userData = {
      uid: user.uid, // Adiciona o UID aqui
      email,
      nome,
      cpf,
      telefone,
      dataNascimento,
    };

    if (tipo === "medico") {
      userData.crm = crm;
      userData.especialidade = especialidade;
    }

    await addDoc(collection(db, collectionName), userData);

    alert(`Cadastro realizado com sucesso!\nBem-vindo, ${nome}!`);
    window.location.href = "login.html";

  } catch (error) {
    // Tratamento dos erros comuns Firebase Auth
    if (error.code === 'auth/email-already-in-use') {
      alert("Este email já está em uso. Por favor, utilize outro email.");
    } else if (error.code === 'auth/weak-password') {
      alert("A senha é muito fraca. Use no mínimo 6 caracteres.");
    } else if (error.code === 'auth/invalid-email') {
      alert("Email inválido.");
    } else {
      alert("Erro ao cadastrar: " + error.message);
    }
    console.error("Erro Firebase:", error);
  }
});
