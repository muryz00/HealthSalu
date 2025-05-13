let examesBanco = []; // Banco de exames temporário

function exibirArquivos() {
    const input = document.getElementById('fileUpload');
    const novosArquivos = Array.from(input.files);
  
    examesBanco = examesBanco.concat(novosArquivos);
  
    const container = document.getElementById('examesContainer');
    container.innerHTML = '';
  
    examesBanco.forEach((file, index) => {
      const card = document.createElement('div');
      card.className = 'exame-card';
  
      const ext = file.name.split('.').pop().toLowerCase();
      let iconSrc = '';
  
      if (ext === 'pdf') {
        iconSrc = 'https://cdn-icons-png.flaticon.com/512/337/337946.png';
      } else {
        iconSrc = 'https://cdn-icons-png.flaticon.com/512/136/136524.png';
      }
  
      card.innerHTML = `
        <img src="${iconSrc}" alt="Ícone do arquivo" width="40" height="40" />
        <h4>${file.name}</h4>
        <button class="btnAbrir dashboardFuncionalidades" onclick="abrirArquivo(${index})">Abrir</button>
        <button class="btnExcluir dashboardFuncionalidades" onclick="excluirArquivo(${index})">Excluir</button>
      `;
  
      container.appendChild(card);
    });
  
    input.value = '';
  }

    function excluirArquivo(index) {
        examesBanco.splice(index, 1); // Remove o item do array
        exibirArquivos();             // Atualiza a lista exibida
    }
  
  

    function abrirArquivo(index) {
    const file = examesBanco[index];
    const url = URL.createObjectURL(file);
    window.open(url, '_blank');
    }
