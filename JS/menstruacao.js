import { salvarRegistroFirestore, buscarRegistrosFirestore } from "./firebaseMenstruacao.js";

const fluxoHistorico = [];
const fluxoParaValor = { leve: 1, moderado: 2, intenso: 3 };
const diasSelecionados = new Set();
let fluxoChart, calendar;

window.addEventListener("DOMContentLoaded", async () => {
  const registros = await buscarRegistrosFirestore();
  fluxoHistorico.push(...registros);
  gerarGraficoFluxo();
  calcularPrevisoes(); 
});


document.getElementById("cardBtn").addEventListener("click", salvarRegistroMenstruacao);

async function salvarRegistroMenstruacao() {
  const cpfPaciente = localStorage.getItem("cpfPaciente");
  const observacoes = document.getElementById("observacoes").value;
  const fluxoInput = document.getElementById("fluxo").value;
  const dataInicioInput = document.getElementById("dataInicio").value;
  const dataFimInput = document.getElementById("dataFim").value;

  let dataInicio, dataFim, fluxo;

  if (dataInicioInput && dataFimInput) {
    dataInicio = dataInicioInput;
    dataFim = dataFimInput;
    fluxo = fluxoInput;
  } else if (diasSelecionados.size > 0) {
    const dias = Array.from(diasSelecionados).sort();
    dataInicio = dias[0];
    dataFim = dias[dias.length - 1];
    fluxo = prompt("Informe o fluxo menstrual (leve, moderado ou intenso):")?.toLowerCase();

    if (!["leve", "moderado", "intenso"].includes(fluxo)) {
      alert("Fluxo inválido. Use: leve, moderado ou intenso.");
      return;
    }
  } else {
    alert("Preencha as datas ou selecione os dias no calendário.");
    return;
  }

  if (!cpfPaciente) {
    alert("CPF do paciente não encontrado.");
    return;
  }

  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);
  if (fim < inicio) {
    alert("A data de fim deve ser após a data de início.");
    return;
  }

  const duracao = Math.floor((fim - inicio) / (1000 * 60 * 60 * 24)) + 1;

  const registro = {
    data_inicio: dataInicio,
    data_fim: dataFim,
    duracao,
    fluxo,
    observacoes,
    cpf: cpfPaciente
  };

  try {
    await salvarRegistroFirestore(registro);

    // Recarrega os dados atualizados do Firestore
    const registrosAtualizados = await buscarRegistrosFirestore();
    fluxoHistorico.length = 0;
    fluxoHistorico.push(...registrosAtualizados);

    diasSelecionados.clear();
    document.getElementById("dataInicio").value = "";
    document.getElementById("dataFim").value = "";
    document.getElementById("observacoes").value = "";

    atualizarDatasSelecionadasNoCalendario();
    gerarGraficoFluxo();
    calcularPrevisoes(); // Já chama atualizarCalendario internamente

  } catch (e) {
    console.error("Erro ao salvar ou atualizar visualização:", e);
    alert("Houve um erro ao salvar. Tente novamente.");
  }
}



function toggleDataSelecionada(data) {
  if (diasSelecionados.has(data)) {
    if (confirm("Deseja remover esta data da seleção?")) {
      diasSelecionados.delete(data);
    }
  } else {
    diasSelecionados.add(data);
  }
  atualizarDatasSelecionadasNoCalendario();
}

function atualizarDatasSelecionadasNoCalendario() {
  if (!calendar) return;

  calendar.getEvents().forEach(ev => {
    if (ev.extendedProps.tipo === 'selecao') {
      ev.remove();
    }
  });

  diasSelecionados.forEach(data => {
    calendar.addEvent({
      title: "Selecionado",
      start: data,
      allDay: true,
      color: "#90caf9",
      tipo: "selecao"
    });
  });
}

function gerarGraficoFluxo() {
  const ctx = document.getElementById("fluxoChart").getContext("2d");
  if (fluxoChart) fluxoChart.destroy();

  fluxoChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: fluxoHistorico.map(e => e.data_inicio),
      datasets: [{
        label: "Intensidade do Fluxo",
        data: fluxoHistorico.map(e => fluxoParaValor[e.fluxo]),
        backgroundColor: fluxoHistorico.map(e => {
          if (e.fluxo === "leve") return "#81d4fa";
          if (e.fluxo === "moderado") return "#ffb74d";
          return "#e57373";
        }),
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
            callback: val => ["", "Leve", "Moderado", "Intenso"][val]
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => "Fluxo: " + ["", "Leve", "Moderado", "Intenso"][ctx.raw]
          }
        }
      }
    }
  });
}

function calcularPrevisoes() {
  if (fluxoHistorico.length < 2) return;

  const ordenado = [...fluxoHistorico].sort((a, b) => new Date(a.data_inicio) - new Date(b.data_inicio));

  // Calcula os intervalos entre ciclos
  const intervalos = ordenado.slice(1).map((curr, i) => {
    const anterior = new Date(ordenado[i].data_inicio);
    const atual = new Date(curr.data_inicio);
    return (atual - anterior) / (1000 * 60 * 60 * 24);
  });

  const mediaDuracaoCiclo = intervalos.reduce((acc, d) => acc + d, 0) / intervalos.length;
  const mediaMenstruacao = ordenado.reduce((acc, r) => acc + r.duracao, 0) / ordenado.length;

  // Previsão próxima menstruação
  const ultimo = new Date(ordenado.at(-1).data_inicio);
  const proximaMenstruacao = new Date(ultimo);
  proximaMenstruacao.setDate(proximaMenstruacao.getDate() + Math.round(mediaDuracaoCiclo));

  const fimProximaMenstruacao = new Date(proximaMenstruacao);
  fimProximaMenstruacao.setDate(fimProximaMenstruacao.getDate() + Math.round(mediaMenstruacao));

  // Período fértil: ~14 dias antes da próxima menstruação, durando 6 dias
  const fertilInicio = new Date(proximaMenstruacao);
  fertilInicio.setDate(proximaMenstruacao.getDate() - 14);

  const fertilFim = new Date(fertilInicio);
  fertilFim.setDate(fertilInicio.getDate() + 5);

  atualizarCalendario(proximaMenstruacao, fimProximaMenstruacao, fertilInicio, fertilFim);
}


function atualizarCalendario(menstruacaoPrevista = null, fimMenstruacaoPrevista = null, fertilInicio = null, fertilFim = null) {
  const eventos = [];

  // Menstruações anteriores
  fluxoHistorico.forEach(entry => {
    eventos.push({
      title: `Menstruação (${entry.fluxo})`,
      start: entry.data_inicio,
      end: new Date(new Date(entry.data_fim).getTime() + 86400000).toISOString().split("T")[0],
      color: "#f44336"
    });
  });

  // Período fértil (em azul claro)
  if (fertilInicio && fertilFim) {
    let atual = new Date(fertilInicio);
    while (atual <= fertilFim) {
      eventos.push({
        title: "Período fértil",
        start: atual.toISOString().split("T")[0],
        allDay: true,
        color: "#03a9f4"
      });
      atual.setDate(atual.getDate() + 1);
    }
  }

  // Próxima menstruação prevista (em roxo escuro)
  if (menstruacaoPrevista && fimMenstruacaoPrevista) {
    let atual = new Date(menstruacaoPrevista);
    while (atual <= fimMenstruacaoPrevista) {
      eventos.push({
        title: "Próxima Menstruação Prevista",
        start: atual.toISOString().split("T")[0],
        allDay: true,
        color: "#880e4f"
      });
      atual.setDate(atual.getDate() + 1);
    }
  }

  // Renderiza no calendário
  if (!calendar) {
    calendar = new FullCalendar.Calendar(document.getElementById("calendarioMenstrual"), {
      initialView: "dayGridMonth",
      locale: "pt-br",
      height: 500,
      selectable: true,
      unselectAuto: false,
      dateClick: function(info) {
        toggleDataSelecionada(info.dateStr);
      },
      events: eventos
    });
    calendar.render();
  } else {
    calendar.removeAllEvents();
    eventos.forEach(ev => calendar.addEvent(ev));
  }

  atualizarDatasSelecionadasNoCalendario();
}
