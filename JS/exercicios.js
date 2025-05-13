const caloriasPorMinuto = {
    corrida: 10,
    natação: 8,
    ciclismo: 6,
    musculação: 5
};

// Arrays para armazenar os dados do histórico
let treinoHistorico = [];
let historicoIMC = [];

let caloriesChart = null;
let imcChart = null;

// Função para calcular IMC
function calcularIMC(peso, altura) {
    return (peso / (altura * altura)).toFixed(2);
}

// Função para obter a classificação do IMC
function classificarIMC(imc) {
    if (imc < 18.5) return "Abaixo do peso";
    if (imc >= 18.5 && imc < 24.9) return "Peso normal";
    if (imc >= 25 && imc < 29.9) return "Sobrepeso";
    if (imc >= 30 && imc < 34.9) return "Obesidade grau 1";
    if (imc >= 35 && imc < 39.9) return "Obesidade grau 2";
    return "Obesidade grau 3";
}

// Função principal para calcular calorias e IMC
function calcularDados() {
    let tipoExercicio = document.getElementById("tipo-exercicio").value;
    let duracao = parseInt(document.getElementById("duracao").value);
    let peso = parseFloat(document.getElementById("peso").value);
    let altura = parseFloat(document.getElementById("altura").value);

    if (isNaN(duracao) || duracao <= 0 || isNaN(peso) || isNaN(altura) || peso <= 0 || altura <= 0) {
        alert("Preencha todos os campos corretamente!");
        return;
    }

    let caloriasPerdidas = caloriasPorMinuto[tipoExercicio] * duracao;
    let imc = calcularIMC(peso, altura);
    let descricaoIMC = classificarIMC(imc);

    // Adicionar ao histórico
    treinoHistorico.push({ exercise: tipoExercicio, duration: duracao, calorias: caloriasPerdidas });
    historicoIMC.push({ treino: tipoExercicio, imc: parseFloat(imc) });

    // Atualizar tabela
    atualizarTabela(tipoExercicio, duracao, caloriasPerdidas, descricaoIMC);

    // Atualizar gráficos
    gerarGraficoCalorias();
    gerarGraficoIMC();

    // Gerar observação automática
    gerarObservacao(tipoExercicio, duracao);
}

// Função para atualizar a tabela de histórico
function atualizarTabela(exercise, duration, calorias, descricaoIMC) {
    const table = document.getElementById('tableExercicio');
    const newRow = table.insertRow();
    newRow.innerHTML = `<td>${exercise}</td><td>${duration} min</td><td>${calorias} kcal</td><td>${descricaoIMC}</td>`;
}

// Função para gerar gráfico de calorias perdidas
function gerarGraficoCalorias() {
    const ctx = document.getElementById('caloriesChart').getContext('2d');

    if (caloriesChart) {
        caloriesChart.destroy();
    }

    caloriesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: treinoHistorico.map(t => t.exercise),
            datasets: [{
                label: 'Calorias Perdidas',
                data: treinoHistorico.map(t => t.calorias),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: '#36e4b0',
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

// Função para gerar gráfico de IMC
function gerarGraficoIMC() {
    const ctx = document.getElementById("imcChart").getContext("2d");

    if (imcChart) {
        imcChart.destroy();
    }

    imcChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: historicoIMC.map(entry => entry.treino),
            datasets: [{
                label: 'Evolução do IMC',
                data: historicoIMC.map(entry => entry.imc),
                borderColor: '#36e4b0',
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                borderWidth: 2,
                fill: true,
                pointRadius: 5,
                pointBackgroundColor: '#2E7D32'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: 'white' } }
            },
            scales: {
                x: { ticks: { color: 'white' } },
                y: { beginAtZero: false, ticks: { color: 'white' } }
            }
        }
    });
}

// Função para gerar observação automática
function gerarObservacao(exercise, duration) {
    let observacao = '';

    if (duration >= 60) {
        observacao = `Ótimo treino! Seu treino de ${exercise} por ${duration} minutos ajudou bastante na resistência.`;
    } else if (duration >= 30) {
        observacao = `Bom treino! ${duration} minutos de ${exercise} já traz bons benefícios à saúde.`;
    } else {
        observacao = `Tente aumentar um pouco o tempo de treino para obter melhores resultados!`;
    }

    document.getElementById('observacoes').innerHTML = `<li>${observacao}</li>`;
}
