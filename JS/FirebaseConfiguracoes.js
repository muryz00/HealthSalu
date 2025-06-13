// Importações Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import {
  getAuth,
  updatePassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-analytics.js";

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
getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Buscar dados do usuário autenticado
export async function buscarDadosUsuario() {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) return reject(new Error("Usuário não autenticado."));

      const tipo = localStorage.getItem("tipoUsuario"); // 'medico' ou 'paciente'
      const identificador = tipo === "medico"
        ? localStorage.getItem("crmMedico")
        : localStorage.getItem("cpfPaciente");

      if (!tipo || !identificador) {
        return reject(new Error("Dados de autenticação incompletos."));
      }

      const colecao = tipo === "medico" ? "medicos" : "pacientes";
      const campo = tipo === "medico" ? "crm" : "cpf";

      try {
        const q = query(collection(db, colecao), where(campo, "==", identificador));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          return reject(new Error("Usuário não encontrado no banco."));
        }

        const docSnap = querySnapshot.docs[0];
        const dados = docSnap.data();

        return resolve({
          nome: dados.nome || "Sem nome",
          email: user.email,
          telefone: dados.telefone || null,
          idade: dados.idade || null,
          cpf: dados.cpf || null,
          crm: dados.crm || null,
          dataNascimento: dados.dataNascimento || null,
          tipo
        });

      } catch (erro) {
        console.error("Erro ao buscar dados:", erro);
        return reject(new Error("Erro ao buscar dados do usuário."));
      }
    });
  });
}

// Redefinir senha
export async function redefinirSenha(novaSenha) {
  const user = auth.currentUser;

  if (!user) throw new Error("Usuário não está autenticado.");

  try {
    await updatePassword(user, novaSenha);
  } catch (error) {
    console.error("Erro ao redefinir a senha:", error);
    throw new Error(error.message || "Erro ao atualizar a senha.");
  }
}

// Logout
export async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Erro ao sair:", error);
    throw new Error(error.message || "Erro ao sair.");
  }
}
  