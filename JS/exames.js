const SUPABASE_URL = 'https://nseewbdwgamswancctns.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZWV3YmR3Z2Ftc3dhbmNjdG5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMjEyMTIsImV4cCI6MjA2MzU5NzIxMn0.FNt4IFs2eFeB-eXEpBIrrx2_-9z2UjQhKStjsHEkTeU';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let examesBanco = [];


// 🔥 Carregar arquivos existentes no Supabase Storage
async function carregarArquivos() {
    const { data, error } = await supabase
        .storage
        .from('images')
        .list('', { limit: 100 });

    if (error) {
        console.error('Erro ao carregar arquivos:', error.message);
        return;
    }

    examesBanco = data.map(file => {
        const { publicUrl } = supabase
            .storage
            .from('images')
            .getPublicUrl(file.name);

        return {
            nome: file.name.split('_').slice(1).join('_'), // Remove o timestamp
            url: publicUrl,
            ext: file.name.split('.').pop().toLowerCase()
        };
    });

    atualizarLista();
}


// 🔥 Upload de novos arquivos
function exibirArquivos() {
    const input = document.getElementById('fileUpload');
    const novosArquivos = Array.from(input.files);

    novosArquivos.forEach(async (file) => {
        const fileName = `${Date.now()}_${file.name}`; 

        const { data, error } = await supabase
            .storage
            .from('images')
            .upload(fileName, file);

        if (error) {
            alert(`Erro ao enviar ${file.name}: ${error.message}`);
            console.error(error);
        } else {
            const { publicUrl } = supabase
                .storage
                .from('images')
                .getPublicUrl(fileName);

            examesBanco.push({
                nome: file.name,
                url: publicUrl,
                ext: file.name.split('.').pop().toLowerCase()
            });

            atualizarLista();
        }
    });

    input.value = '';
}


// 🔥 Atualizar lista na tela
function atualizarLista() {
    const container = document.getElementById('examesContainer');
    container.innerHTML = '';

    examesBanco.forEach((file, index) => {
        let iconSrc = file.ext === 'pdf'
            ? 'https://cdn-icons-png.flaticon.com/512/337/337946.png'
            : 'https://cdn-icons-png.flaticon.com/512/136/136524.png';

        const card = document.createElement('div');
        card.className = 'exame-card';

        card.innerHTML = `
            <img src="${iconSrc}" alt="Ícone do arquivo" width="40" height="40" />
            <h4>${file.nome}</h4>
            <button class="btnAbrir dashboardFuncionalidades" onclick="abrirArquivo(${index})">Abrir</button>
            <button class="btnExcluir dashboardFuncionalidades" onclick="excluirArquivo(${index})">Excluir</button>
        `;

        container.appendChild(card);
    });
}


// 🔥 Abrir arquivo
function abrirArquivo(index) {
    const file = examesBanco[index];
    window.open(file.url, '_blank');
}


// 🔥 Excluir arquivo
async function excluirArquivo(index) {
  const arquivo = examesBanco[index];

  if (!arquivo) {
      alert('Arquivo não encontrado!');
      return;
  }

  const fileName = arquivo.url.split('/').pop().split('?')[0];

  const { error } = await supabase
      .storage
      .from('images')
      .remove([fileName]);

  if (error) {
      alert(`Erro ao excluir ${arquivo.nome}: ${error.message}`);
      console.error(error);
  } else {
      examesBanco.splice(index, 1);
      atualizarLista();
  }
}


// 🔥 Ao carregar a página, busque os arquivos existentes
window.addEventListener('DOMContentLoaded', carregarArquivos);
