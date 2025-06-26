import { buscarDadosUsuario, redefinirSenha, logout } from './FirebaseConfiguracoes.js';

// Evento botão Perfil
document.getElementById('btnPerfil').addEventListener('click', async () => {
  const main = document.getElementById('mainConfig');
  main.innerHTML = '<p style="color: white;">Carregando informações...</p>';

  try {
    const usuario = await buscarDadosUsuario();

    main.innerHTML = `
      <div class="dashboardFuncionalidades">
        <div class="cardFuncionalidades">
          <div class="perfil-info">
            <img src="https://via.placeholder.com/120" alt="Foto de perfil" class="foto-perfil" id="fotoPerfil" />
            <input type="file" id="inputFoto" accept="image/*" style="display: none;" />
            <div>
              <div class="stats">
                <div class="cardFuncionalidades">
                  <h1 class="perfil-nome">${usuario.nome}</h1>
                  <p class="perfil-descricao">${usuario.tipo === 'medico' ? 'Médico' : 'Paciente'} no Sistema de Saúde<br>Health Salu</p>
                </div>
                <div class="cardFuncionalidades">
                  <h2>Informações de Contato</h2>
                  <p>Email: ${usuario.email}</p>
                  <p>Telefone: ${usuario.telefone || 'Não informado'}</p>
                </div>
              </div>
              <div class="cardFuncionalidades">
                <h2>Dados Pessoais</h2>
                <p>CPF: ${usuario.cpf || 'Não informado'}</p>
                <p>Data de Nascimento: ${usuario.dataNascimento || 'Não informado'}</p>
                <p>Idade: ${usuario.idade || 'Não informado'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Upload de foto
    const foto = document.getElementById('fotoPerfil');
    const inputFoto = document.getElementById('inputFoto');
    foto.addEventListener('click', () => inputFoto.click());

    inputFoto.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          foto.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  } catch (erro) {
    main.innerHTML = `<p style="color: red;">Erro: ${erro.message || erro}</p>`;
  }
});

// Evento botão Alterar Senha
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
        <button class="botao-salvar" id="btnSalvarSenha">Salvar Senha</button>
      </div>
    </div>
  `;

  setTimeout(() => {
    document.getElementById('btnSalvarSenha').addEventListener('click', async () => {
      const senhaAtual = document.getElementById('senhaAtual').value;
      const novaSenha = document.getElementById('novaSenha').value;
      const confirmarSenha = document.getElementById('confirmarSenha').value;

      if (!senhaAtual || !novaSenha || !confirmarSenha) {
        alert("Por favor, preencha todos os campos.");
        return;
      }

      if (novaSenha !== confirmarSenha) {
        alert("As senhas não coincidem.");
        return;
      }

      if (novaSenha.length < 6) {
        alert("A nova senha deve conter pelo menos 6 caracteres.");
        return;
      }

      try {
        await redefinirSenha(novaSenha, senhaAtual);
        alert("Senha alterada com sucesso!");
      } catch (erro) {
        console.error("Erro ao alterar senha:", erro);
        let mensagemErro = "Erro inesperado. Tente novamente mais tarde.";

        switch (erro.message) {
          case "Firebase: Error (auth/invalid-credential).":
            mensagemErro = "Senha atual incorreta. Tente novamente.";
            break;
          case "Firebase: Error (auth/weak-password).":
            mensagemErro = "A nova senha é muito fraca. Use pelo menos 6 caracteres.";
            break;
          case "Firebase: Error (auth/requires-recent-login).":
            mensagemErro = "Por segurança, você precisa sair e entrar novamente para trocar a senha.";
            break;
          case "Firebase: Error (auth/user-not-found).":
            mensagemErro = "Usuário não encontrado. Faça login novamente.";
            break;
          case "Firebase: Error (auth/too-many-requests).":
            mensagemErro = "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
            break;
        }

        alert(mensagemErro);
      }
    });
  }, 100);
});

// Evento botão Sair
document.getElementById('btnSair').addEventListener('click', async () => {
  const confirmacao = confirm("Você realmente deseja sair da conta?");

  if (confirmacao) {
    try {
      await logout();
      document.getElementById('mainConfig').innerHTML = `
        <h2 style="color: white;">Você saiu do sistema.</h2>
        <p style="color: white;">Redirecionando para a página de login...</p>
      `;

      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
    } catch (erro) {
      alert("Erro ao sair: " + (erro.message || erro));
    }
  }
});
