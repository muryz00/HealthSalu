//menstruacao.js
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
  atualizarCalendario();
});

document.getElementById("cardBtn").addEventListener("click", salvarRegistroMenstruacao);

function salvarRegistroMenstruacao() {
  const fluxo = document.getElementById("fluxo").value;
  const observacoes = document.getElementById("observacoes").value;
  const cpfPaciente = localStorage.getItem("cpfPaciente");

  if (diasSelecionados.size === 0 || !fluxo || !cpfPaciente) {
    alert("Selecione os dias da menstruação, o fluxo e certifique-se que o CPF está salvo.");
    return;
  }

  const dias = Array.from(diasSelecionados).sort();
  const dataInicio = dias[0];
  const dataFim = dias[dias.length - 1];
  const duracao = dias.length;

  const registro = {
    data_inicio: dataInicio,
    data_fim: dataFim,
    duracao,
    fluxo,
    observacoes,
    cpf: cpfPaciente
  };

  fluxoHistorico.push(registro);
  salvarRegistroFirestore(registro);

  diasSelecionados.clear();
  atualizarDatasSelecionadasNoCalendario();
  gerarGraficoFluxo();
  calcularPrevisoes();
  atualizarCalendario();
}

function toggleDataSelecionada(data) {
  const jaSelecionado = diasSelecionados.has(data);
  if (jaSelecionado) {
    if (confirm("Deseja remover esta data da seleção?")) {
      diasSelecionados.delete(data);
      atualizarDatasSelecionadasNoCalendario();
    }
    return;
  }

  const fluxo = prompt("Qual o fluxo para este dia? (leve, moderado, intenso)");
  if (!fluxo || !["leve", "moderado", "intenso"].includes(fluxo.toLowerCase())) {
    alert("Fluxo inválido. Digite: leve, moderado ou intenso.");
    return;
  }

  const cpfPaciente = localStorage.getItem("cpfPaciente");
  if (!cpfPaciente) {
    alert("CPF do paciente não encontrado.");
    return;
  }

  const registro = {
    data_inicio: data,
    data_fim: data,
    duracao: 1,
    fluxo: fluxo.toLowerCase(),
    observacoes: "",
    cpf: cpfPaciente
  };

  fluxoHistorico.push(registro);
  salvarRegistroFirestore(registro);

  calcularPrevisoes();
  gerarGraficoFluxo();
  atualizarCalendario();
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
  const intervalos = ordenado.slice(1).map((curr, i) => {
    const anterior = new Date(ordenado[i].data_inicio);
    const atual = new Date(curr.data_inicio);
    return (atual - anterior) / (1000 * 60 * 60 * 24);
  });

  const mediaDuracaoCiclo = intervalos.reduce((acc, d) => acc + d, 0) / intervalos.length;
  const mediaMenstruacao = ordenado.reduce((acc, r) => acc + r.duracao, 0) / ordenado.length;

  const ultimo = new Date(ordenado.at(-1).data_inicio);
  const proximaMenstruacao = new Date(ultimo);
  proximaMenstruacao.setDate(proximaMenstruacao.getDate() + Math.round(mediaDuracaoCiclo));

  const fimProximaMenstruacao = new Date(proximaMenstruacao);
  fimProximaMenstruacao.setDate(fimProximaMenstruacao.getDate() + Math.round(mediaMenstruacao));

  const fertilInicio = new Date(proximaMenstruacao);
  fertilInicio.setDate(proximaMenstruacao.getDate() - 14);
  const fertilFim = new Date(fertilInicio);
  fertilFim.setDate(fertilInicio.getDate() + 5);

  atualizarCalendario(proximaMenstruacao, fimProximaMenstruacao, fertilInicio, fertilFim);
}

function atualizarCalendario(menstruacaoPrevista = null, fimMenstruacaoPrevista = null, fertilInicio = null, fertilFim = null) {
  const eventos = [];

  fluxoHistorico.forEach(entry => {
    eventos.push({
      title: `Menstruação (${entry.fluxo})`,
      start: entry.data_inicio,
      end: new Date(new Date(entry.data_fim).getTime() + 86400000).toISOString().split("T")[0],
      color: "#f44336"
    });
  });

  if (fertilInicio && fertilFim) {
    let atual = new Date(fertilInicio);
    while (atual <= fertilFim) {
      eventos.push({
        title: "Período fértil",
        start: atual.toISOString().split("T")[0],
        color: "#03a9f4"
      });
      atual.setDate(atual.getDate() + 1);
    }
  }

  if (menstruacaoPrevista && fimMenstruacaoPrevista) {
    let atual = new Date(menstruacaoPrevista);
    while (atual <= fimMenstruacaoPrevista) {
      eventos.push({
        title: "Próxima Menstruação Prevista",
        start: atual.toISOString().split("T")[0],
        color: "#880e4f"
      });
      atual.setDate(atual.getDate() + 1);
    }
  }

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
