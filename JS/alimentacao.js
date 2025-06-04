// alimentacao.js
export { gerarGraficoCalorias2, gerarGraficoIMC2 };

let alimentoAtual = null;
export let alimentoHistorico = [];
export let historicoIMC2 = [];
let caloriesgainedChart = null;
let imcAlimentoChart = null;

const apiKey = "ZKPY7YXFvogSwg71sUB2nzpwvMt5Ij5JcutPrNao";

// Tradução
async function traduzirTexto(texto, origem, destino) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${origem}&tl=${destino}&dt=t&q=${encodeURIComponent(texto)}`;
    const resposta = await fetch(url);
    const dados = await resposta.json();
    return dados[0][0][0];
}

// Busca alimento ao digitar
document.getElementById("alimento").addEventListener("input", () => {
    if (document.getElementById("alimento").value.length >= 3) {
        buscarAlimentos();
    }
});

// Busca na API
async function buscarAlimentos() {
    const alimento = document.getElementById("alimento").value.trim();
    const alimentoIngles = await traduzirTexto(alimento, "pt", "en");

    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(alimentoIngles)}&api_key=${apiKey}`;
    const resposta = await fetch(url);
    if (!resposta.ok) {
        console.error("Erro ao buscar dados");
        return;
    }

    const dados = await resposta.json();
    if (dados.foods.length > 0) {
        const info = dados.foods[0];
        const nomeTraduzido = await traduzirTexto(info.description, "en", "pt");

        alimentoAtual = {
            nome: nomeTraduzido,
            calorias: info.foodNutrients.find(n => n.nutrientId === 1008)?.value || 0,
            gordura: info.foodNutrients.find(n => n.nutrientId === 1004)?.value || 0,
            proteina: info.foodNutrients.find(n => n.nutrientId === 1003)?.value || 0,
            carboidrato: info.foodNutrients.find(n => n.nutrientId === 1005)?.value || 0
        };
        atualizarExibicao();
    }
}

window.atualizarExibicao = async function () {
    if (!alimentoAtual) return;
    const quantidade = parseFloat(document.getElementById("quantidade").value) || 100;
    const fator = quantidade / 100;

    document.getElementById("nome-alimento").textContent = alimentoAtual.nome;
    document.getElementById("calorias").textContent = (alimentoAtual.calorias * fator).toFixed(2);
    document.getElementById("gordura").textContent = (alimentoAtual.gordura * fator).toFixed(2);
    document.getElementById("proteina").textContent = (alimentoAtual.proteina * fator).toFixed(2);
    document.getElementById("carboidrato").textContent = (alimentoAtual.carboidrato * fator).toFixed(2);
}

document.getElementById("quantidade").addEventListener("input", atualizarExibicao);

function gerarGraficoCalorias2() {
    const ctx = document.getElementById("caloriesgainedChart").getContext("2d");
    if (caloriesgainedChart) caloriesgainedChart.destroy();

    caloriesgainedChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: alimentoHistorico.map(t => t.alimento),
            datasets: [
                {
                    label: "Calorias",
                    data: alimentoHistorico.map(t => t.calorias),
                    backgroundColor: "rgba(255, 99, 132, 0.5)",
                    borderColor: "rgba(255, 99, 132, 1)",
                    borderWidth: 2
                },
                {
                    label: "Gordura",
                    data: alimentoHistorico.map(t => t.gordura),
                    backgroundColor: "rgba(54, 162, 235, 0.5)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 2
                },
                {
                    label: "Proteínas",
                    data: alimentoHistorico.map(t => t.proteina),
                    backgroundColor: "rgba(75, 192, 75, 0.5)",
                    borderColor: "rgba(75, 192, 75, 1)",
                    borderWidth: 2
                },
                {
                    label: "Carboidratos",
                    data: alimentoHistorico.map(t => t.carboidrato),
                    backgroundColor: "rgba(255, 159, 64, 0.5)",
                    borderColor: "rgba(255, 159, 64, 1)",
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function gerarGraficoIMC2() {
    const ctx = document.getElementById("imcChart2").getContext("2d");
    if (imcAlimentoChart) imcAlimentoChart.destroy();

    imcAlimentoChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: historicoIMC2.map(entry => entry.data),
            datasets: [{
                label: "Evolução do IMC",
                data: historicoIMC2.map(entry => entry.imc),
                borderColor: "#36e4b0",
                backgroundColor: "rgba(76, 175, 80, 0.2)",
                borderWidth: 2,
                fill: true,
                pointRadius: 5,
                pointBackgroundColor: "#2E7D32"
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { ticks: { color: "white" } },
                y: { beginAtZero: false, ticks: { color: "white" } }
            }
        }
    });
}
