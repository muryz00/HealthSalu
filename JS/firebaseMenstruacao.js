//firebaseMenstruacao.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";


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

export async function salvarRegistroFirestore(registro) {
  try {
    await addDoc(collection(db, "menstruacoes"), registro);
  } catch (e) {
    console.error("Erro ao salvar no Firestore:", e);
  }
}

export async function buscarRegistrosFirestore() {
  const cpfPaciente = localStorage.getItem("cpfPaciente");
  const registrosRef = collection(db, "menstruacoes");

  const q = query(registrosRef, where("cpf", "==", cpfPaciente));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => doc.data());
}

