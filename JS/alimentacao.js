import { db, cpfPacienteGlobal } from './FirebaseAlimentacao.js';
import { 
    getFirestore, 
    collection, 
    query, 
    where, 
    getDocs 
  } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";
  

  let historicoAlimentacao = [];
  
  async function carregarHistoricoAlimentacao(cpfPaciente) {
    const q = query(collection(db, "alimentacao"), where("cpfPaciente", "==", cpfPaciente));
    const querySnapshot = await getDocs(q);
  
    historicoAlimentacao = [];
  
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      historicoAlimentacao.push({
        refeicao: data.refeicao,
        data: data.data,
        calorias: data.calorias,
        carboidratos: data.carboidratos,
        proteinas: data.proteinas,
        gorduras: data.gorduras
      });
    });
  
    gerarGraficoCaloriasPorDia();
    gerarGraficoMacronutrientes();
  }

  function gerarGraficoCaloriasPorDia() {
    const ctx = document.getElementById('caloriesgainedChart').getContext('2d');
  
    const datas = [...new Set(historicoAlimentacao.map(item => item.data))];
  
    const caloriasPorDia = datas.map(date => {
      return historicoAlimentacao
        .filter(item => item.data === date)
        .reduce((total, item) => total + item.calorias, 0);
    });
  
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: datas,
        datasets: [{
          label: 'Calorias Consumidas',
          data: caloriasPorDia,
          backgroundColor: 'rgba(255, 159, 64, 0.5)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  function gerarGraficoMacronutrientes() {
    const ctx = document.getElementById('macroChart').getContext('2d');
  
    const totalCarbo = historicoAlimentacao.reduce((sum, item) => sum + item.carboidratos, 0);
    const totalProteina = historicoAlimentacao.reduce((sum, item) => sum + item.proteinas, 0);
    const totalGordura = historicoAlimentacao.reduce((sum, item) => sum + item.gorduras, 0);
  
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Carboidratos', 'Proteínas', 'Gorduras'],
        datasets: [{
          data: [totalCarbo, totalProteina, totalGordura],
          backgroundColor: ['#36a2eb', '#4bc0c0', '#ff6384'],
          borderColor: '#fff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true
      }
    });
  }
  