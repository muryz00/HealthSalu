const apiKey = "ZKPY7YXFvogSwg71sUB2nzpwvMt5Ij5JcutPrNao";
let alimentoAtual = null;
let alimentoHistorico = [];
let historicoIMC2 = [];
let caloriesgainedChart = null;
let imcAlimentoChart = null;

async function traduzirTexto(texto, origem, destino) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${origem}&tl=${destino}&dt=t&q=${encodeURIComponent(texto)}`;
    const resposta = await fetch(url);
    const dados = await resposta.json();
    return dados[0][0][0];
}

async function buscarAlimentos() {
    const alimentoInput = document.getElementById("alimento");
    let alimento = alimentoInput.value.trim();
    if (alimento.length < 3) return;

    const alimentoIngles = await traduzirTexto(alimento, "pt", "en");
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(alimentoIngles)}&api_key=${apiKey}`;
    const resposta = await fetch(url);
    if (!resposta.ok) {
        console.error("Erro ao buscar dados");
        return;
    }

    const dados = await resposta.json();
    if (dados.foods.length > 0) {
        const alimentoInfo = dados.foods[0];
        const nomeTraduzido = await traduzirTexto(alimentoInfo.description, "en", "pt");
        
        alimentoAtual = {
            nome: nomeTraduzido,
            calorias: alimentoInfo.foodNutrients.find(n => n.nutrientId === 1008)?.value || 0,
            gordura: alimentoInfo.foodNutrients.find(n => n.nutrientId === 1004)?.value || 0,
            proteina: alimentoInfo.foodNutrients.find(n => n.nutrientId === 1003)?.value || 0,
            carboidrato: alimentoInfo.foodNutrients.find(n => n.nutrientId === 1005)?.value || 0
        };
        atualizarExibicao();
    }
}

function atualizarExibicao() {
    if (!alimentoAtual) return;
    const quantidade = parseFloat(document.getElementById("quantidade").value) || 100;
    const fator = quantidade / 100;

    document.getElementById("nome-alimento").textContent = alimentoAtual.nome;
    document.getElementById("calorias").textContent = (alimentoAtual.calorias * fator).toFixed(2) + " kcal";
    document.getElementById("gordura").textContent = (alimentoAtual.gordura * fator).toFixed(2) + " g";
    document.getElementById("proteina").textContent = (alimentoAtual.proteina * fator).toFixed(2) + " g";
    document.getElementById("carboidrato").textContent = (alimentoAtual.carboidrato * fator).toFixed(2) + " g";
}

document.getElementById("quantidade").addEventListener("input", atualizarExibicao);

function calcularIMC(peso, altura) {
    return altura > 0 ? (peso / (altura * altura)).toFixed(2) : null;
}

function calcularGraficos() {
    const alimento = document.getElementById("nome-alimento").textContent;
    const peso = parseFloat(document.getElementById("peso").value);
    const altura = parseFloat(document.getElementById("altura").value);
    const dataAlimento = document.getElementById("dataAlimento").value;
    if (!alimento || isNaN(peso) || isNaN(altura) || !dataAlimento) {
        alert("Preencha todos os campos corretamente!");
        return;
    }

    const imc = calcularIMC(peso, altura);
    const descricaoIMC = classificarIMC(imc);

    const table = document.getElementById("tableAlimento");
    const newRow = table.insertRow();
    newRow.innerHTML = `
        <td>${alimento}</td>
        <td>${document.getElementById("quantidade").value} g</td>
        <td>${document.getElementById("calorias").textContent}</td>
        <td>${document.getElementById("gordura").textContent}</td>
        <td>${document.getElementById("proteina").textContent}</td>
        <td>${document.getElementById("carboidrato").textContent}</td>
        <td>${descricaoIMC}</td>
        <td>${dataAlimento}</td>
    `;

    alimentoHistorico.push({ alimento, calorias: parseFloat(document.getElementById("calorias").textContent), 
                             gordura:  parseFloat(document.getElementById("gordura").textContent),
                             proteina: parseFloat(document.getElementById("gordura").textContent),
                             carboidrato: parseFloat(document.getElementById("carboidrato").textContent)});

    historicoIMC2.push({ data: dataAlimento, imc: parseFloat(imc) });

    gerarGraficoCalorias2();
    gerarGraficoIMC2();
    gerarObservacao();
}

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
                    backgroundColor: "rgba(255, 99, 132, 0.5)", // Vermelho
                    borderColor: "rgba(255, 99, 132, 1)",
                    borderWidth: 2
                },
                {
                    label: "Gordura",
                    data: alimentoHistorico.map(t => t.gordura),
                    backgroundColor: "rgba(54, 162, 235, 0.5)", // Azul
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 2
                },
                {
                    label: "Proteínas",
                    data: alimentoHistorico.map(t => t.proteina),
                    backgroundColor: "rgba(75, 192, 75, 0.5)", // Verde
                    borderColor: "rgba(75, 192, 75, 1)",
                    borderWidth: 2
                },
                {
                    label: "Carboidratos",
                    data: alimentoHistorico.map(t => t.carboidrato),
                    backgroundColor: "rgba(255, 159, 64, 0.5)", // Laranja
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
        options: { responsive: true, scales: { x: { ticks: { color: "white" } }, y: { beginAtZero: false, ticks: { color: "white" } } } }
    });
}

function gerarObservacao() {
    const observacaoLista = document.getElementById("observacao");
    observacaoLista.innerHTML = ""; // Remove a observação anterior

    if (!alimentoAtual) return;

    let mensagem = `O alimento <strong>${alimentoAtual.nome}</strong> possui `;
    let recomendacao = [];

    if (alimentoAtual.calorias > 200) {
        recomendacao.push("alto teor calórico, consuma com moderação.");
    }
    if (alimentoAtual.gordura > 10) {
        recomendacao.push("muita gordura, pode impactar sua saúde.");
    }
    if (alimentoAtual.proteina > 15) {
        recomendacao.push("boa quantidade de proteína, ideal para ganho muscular.");
    }
    if (alimentoAtual.carboidrato > 30) {
        recomendacao.push("alto teor de carboidrato, importante para energia.");
    }

    if (recomendacao.length === 0) {
        mensagem += "um perfil nutricional equilibrado.";
    } else {
        mensagem += recomendacao.join(" ");
    }

    const novaObservacao = document.createElement("li");
    novaObservacao.innerHTML = mensagem;
    observacaoLista.appendChild(novaObservacao);
}

function atualizarObservacoes() {
    const observacaoLista = document.getElementById("observacao");
    observacaoLista.innerHTML = ""; // Limpa observações anteriores
    
    alimentoHistorico.forEach(alimento => {
        let li = document.createElement("li");
        li.textContent = `${alimento.alimento}: ${gerarObservacao(alimento)}`;
        observacaoLista.appendChild(li);
    });
}