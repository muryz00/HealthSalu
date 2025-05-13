const fluxoHistorico = [];

const fluxoParaValor = {
    leve: 1,
    moderado: 2,
    intenso: 3
};

let fluxoChart; // Referência ao gráfico para recriar quando atualizar

function salvarRegistroMenstruacao() {
    const dataInicio = document.getElementById("dataInicio").value;
    const dataFim = document.getElementById("dataFim").value;
    const fluxo = document.getElementById("fluxo").value;
    const observacoes = document.getElementById("observacoes").value;

    if (!dataInicio || !dataFim || !fluxo) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
    }

    fluxoHistorico.push({
        data_inicio: dataInicio,
        fluxo: fluxo,
        observacoes: observacoes
    });

    gerarGraficoFluxo();
}

function gerarGraficoFluxo() {
    const ctx = document.getElementById("fluxoChart").getContext("2d");

    // Destroi o gráfico anterior, se existir
    if (fluxoChart) fluxoChart.destroy();

    fluxoChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: fluxoHistorico.map(e => e.data_inicio),
            datasets: [{
                label: "Intensidade do Fluxo",
                data: fluxoHistorico.map(e => fluxoParaValor[e.fluxo]),
                backgroundColor: fluxoHistorico.map(e => {
                    if (e.fluxo === "leve") return "rgba(153, 102, 255, 0.6)";
                    if (e.fluxo === "moderado") return "rgba(255, 206, 86, 0.6)";
                    return "rgba(255, 99, 132, 0.6)";
                }),
                borderColor: "rgba(0,0,0,0.2)",
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        callback: function (value) {
                            return ["", "Leve", "Moderado", "Intenso"][value];
                        }
                    },
                    title: {
                        display: true,
                        text: 'Fluxo Menstrual'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const val = context.raw;
                            return "Fluxo: " + ["", "Leve", "Moderado", "Intenso"][val];
                        }
                    }
                }
            }
        }
    });
}
