document.getElementById('btnPerfil').addEventListener('click', () => {
    document.getElementById('mainConfig').innerHTML = `
      <div class="dashboardFuncionalidades">
        <div class="cardFuncionalidades">
          <div class="perfil-info">
            <img src="https://via.placeholder.com/120" alt="Foto de perfil" class="foto-perfil" id="fotoPerfil" />
            <input type="file" id="inputFoto" accept="image/*" style="display: none;" />
            <div>
              <div class="stats">
                <div class="cardFuncionalidades">
                    <h1 class="perfil-nome">Bruna</h1>
                    <p class="perfil-descricao">Paciente no Sistema de Saúde<br>Health Salu</p>
                </div>
                <div class="cardFuncionalidades">
                  <h2>Informações de Contato</h2>
                  <p>Email: bruna@email.com</p>
                  <p>Telefone: (92) 91234-5678</p>
                </div>
              </div>
                  <div class="cardFuncionalidades">
                    <h2>Dados Pessoais</h2>
                    <p>Idade: 27 anos</p>
                    <p>Nacionalidade: Brasileiro(a)</p>
                </div>
            </div>
          </div>
        </div>
      </div>
    `;
  
    // Ativa o clique na imagem para abrir o seletor
    setTimeout(() => {
      const foto = document.getElementById('fotoPerfil');
      const inputFoto = document.getElementById('inputFoto');
  
      foto.addEventListener('click', () => inputFoto.click());
  
      inputFoto.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = function (e) {
            foto.src = e.target.result;
          };
          reader.readAsDataURL(file);
        }
      });
    }, 100); // Pequeno delay para garantir que os elementos já foram renderizados
  });
  
  document.getElementById('btnSenha').addEventListener('click', () => {
    document.getElementById('mainConfig').innerHTML = `
    <div class="dashboardConfig">
      <div class="cardFuncionalidades cardSenha">
        <h2 class="perfil-nome">Alterar Senha</h2>
        <label class="labelConfig" for="senhaAtual">Senha Atual</label>
        <input type="password" id="senhaAtual" placeholder="Digite sua senha atual" class="input-config" />
    
        <label class="labelConfig" for="novaSenha">Nova Senha</label>
        <input type="password" id="novaSenha" placeholder="Digite sua nova senha" class="input-config" />
    
        <label class="labelConfig" for="confirmarSenha">Confirmar Nova Senha</label>
        <input type="password" id="confirmarSenha" placeholder="Confirme sua nova senha" class="input-config" />
    
        <button class="botao-salvar">Salvar Senha</button>
      </div>
    </div>
    `;
  });
  
  document.getElementById('btnSair').addEventListener('click', () => {
    const confirmacao = confirm("Você realmente deseja sair da conta?");
    
    if (confirmacao) {
      document.getElementById('mainConfig').innerHTML = `
        <h2 style="color: white;">Você saiu do sistema.</h2>
        <p style="color: white;">Redirecionando para a página de login...</p>
      `;
  
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
    }
  });
  