const tabela = document.querySelector('table');
const tbody = document.getElementById('lista-funcionarios');
const adicionarFuncionarioBtn = document.getElementById('adicionar-funcionario');
const totalDisplay = document.getElementById('valor-total');

// Consulta de gênero via API externa com ícones
async function descobrirSexo(nomeCompleto) {
  const primeiroNome = nomeCompleto.trim().split(' ')[0].toLowerCase();

  try {
    const resposta = await fetch(`https://api.genderize.io?name=${primeiroNome}&country_id=BR`);
    const dados = await resposta.json();

    if (dados && dados.gender) {
      return dados.gender === 'female'
        ? '<span class="material-symbols-outlined icone-genero-f">woman</span>'
        : '<span class="material-symbols-outlined icone-genero-m">man</span>';
    }
    return '<span class="material-symbols-outlined icone-genero-indefinido">help</span>';
  } catch (erro) {
    console.error('Erro na consulta de gênero:', erro);
    return '<span class="material-symbols-outlined icone-genero-indefinido">help</span>';
  }
}

// Calcula e atualiza a soma acumulada de todos os campos de passagem
function atualizarValorTotal() {
  const inputsValores = document.querySelectorAll('.input-valor');
  let soma = 0;

  inputsValores.forEach(input => {
    const valor = parseFloat(input.value);
    if (!isNaN(valor)) {
      soma += valor;
    }
  });

  if (totalDisplay) {
    totalDisplay.textContent = soma.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }
}

// Cria ou remove campos de passagem conforme o número digitado em quantidade
function ajustarCamposDeValor(linha) {
  const inputQtd = linha.querySelector('.input-quantidade');
  const container = linha.querySelector('.container-valores');
  if (!inputQtd || !container) return;

  let quantidade = parseInt(inputQtd.value, 10);
  if (isNaN(quantidade) || quantidade < 1) quantidade = 1;

  const camposAtuais = container.querySelectorAll('.input-valor-group');
  const totalAtual = camposAtuais.length;

  if (quantidade > totalAtual) {
    for (let i = totalAtual; i < quantidade; i++) {
      const novoCard = document.createElement('div');
      novoCard.classList.add('input-valor-group');
      novoCard.style.marginTop = '6px';
      novoCard.innerHTML = `
        <span class="prefixo-moeda">R$</span>
        <input type="number" class="input-tabela input-valor" step="0.01" min="0" placeholder="0,00" />
      `;
      container.appendChild(novoCard);
    }
  } else if (quantidade < totalAtual) {
    for (let i = totalAtual; i > quantidade; i--) {
      container.lastElementChild.remove();
    }
  }

  atualizarValorTotal();
}

// Alterna entre edição e salvamento (com validação completa)
async function alternarEdicao(linha) {
  const inputNome = linha.querySelector('.input-nome');
  const generoTag = linha.querySelector('.genero-tag');
  const todosInputs = linha.querySelectorAll('.input-tabela');
  const inputsValor = linha.querySelectorAll('.input-valor');
  const botaoEditContainer = linha.querySelector('.btn-editar');
  const icone = botaoEditContainer ? botaoEditContainer.querySelector('.icone-edit') : null;

  if (!inputNome) return;

  const estaDesabilitado = inputNome.disabled;

  if (estaDesabilitado) {
    // Libera todos os campos para edição
    todosInputs.forEach(input => (input.disabled = false));
    inputNome.focus();
    if (icone) icone.textContent = 'check';
    if (botaoEditContainer) botaoEditContainer.setAttribute('data-tooltip', 'Salvar alterações');
  } else {
    // Validação do nome
    const nomePreenchido = inputNome.value.trim() !== '';

    // Validação de todos os campos de passagem gerados
    let valoresPreenchidos = inputsValor.length > 0;
    let primeiroInputVazio = null;

    inputsValor.forEach(input => {
      const valor = parseFloat(input.value);
      if (input.value.trim() === '' || isNaN(valor) || valor < 0) {
        valoresPreenchidos = false;
        if (!primeiroInputVazio) primeiroInputVazio = input;
      }
    });

    if (!nomePreenchido || !valoresPreenchidos) {
      alert('Por favor, preencha o nome do funcionário e todos os valores de passagem antes de salvar.');
      if (!nomePreenchido) inputNome.focus();
      else if (primeiroInputVazio) primeiroInputVazio.focus();
      return;
    }

    // Padroniza o nome em caixa alta
    inputNome.value = inputNome.value.trim().toUpperCase();

    // Consulta de gênero
    if (generoTag) {
      generoTag.textContent = '...';
      const iconeHtml = await descobrirSexo(inputNome.value);
      generoTag.innerHTML = iconeHtml;
    }

    // Trava todos os campos da linha
    todosInputs.forEach(input => (input.disabled = true));
    if (icone) icone.textContent = 'edit_square';
    if (botaoEditContainer) botaoEditContainer.setAttribute('data-tooltip', 'Editar funcionário');

    atualizarValorTotal();
  }
}

// Adiciona uma nova linha com estrutura de container e quantidade padrão 1
adicionarFuncionarioBtn.addEventListener('click', function () {
  const linhaBotao = document.querySelector('.linha-adicionar');

  const novaLinha = document.createElement('tr');
  novaLinha.classList.add('linha-dado');
  novaLinha.innerHTML = `
    <td>
      <input type="text" class="input-tabela input-nome" placeholder="Nome do funcionário" autocomplete="off" />
    </td>
    <td>
      <span class="genero-tag">-</span>
    </td>
    <td>
      <div class="container-valores">
        <div class="input-valor-group">
          <span class="prefixo-moeda">R$</span>
          <input type="number" class="input-tabela input-valor" step="0.01" min="0" placeholder="0,00" />
        </div>
      </div>
    </td>
    <td>
      <div class="input-valor-group">
        <input type="number" class="input-tabela input-quantidade" step="1" min="1" value="1" placeholder="1" />
      </div>
    </td>
    <td>
      <span class="tooltip-container" data-tooltip="Remover funcionário">
        <span class="material-symbols-outlined icone-delete">delete</span>
      </span>
      <span class="tooltip-container btn-editar" data-tooltip="Salvar alterações">
        <span class="material-symbols-outlined icone-edit">check</span>
      </span>
    </td>
  `;

  tbody.insertBefore(novaLinha, linhaBotao);
});

// Cliques para remoção ou edição
tabela.addEventListener('click', function (event) {
  const botaoDelete = event.target.closest('.icone-delete');
  if (botaoDelete) {
    const confirmacao = confirm('Realmente deseja remover o funcionário?');
    if (confirmacao) {
      const linha = botaoDelete.closest('tr');
      if (linha) {
        linha.remove();
        atualizarValorTotal();
      }
    }
    return;
  }

  const botaoEditContainer = event.target.closest('.btn-editar');
  if (botaoEditContainer) {
    const linha = botaoEditContainer.closest('tr');
    alternarEdicao(linha);
  }
});

// Eventos de digitação em tempo real
tabela.addEventListener('input', function (event) {
  // Ajusta quantidade de cards de passagem
  if (event.target.classList.contains('input-quantidade')) {
    const linha = event.target.closest('tr');
    ajustarCamposDeValor(linha);
  }

  // Recalcula total ao digitar valores
  if (event.target.classList.contains('input-valor')) {
    atualizarValorTotal();
  }
});

// Salvar linha ao pressionar Enter
tabela.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    const inputFocado = event.target.closest('.input-tabela');
    if (inputFocado) {
      event.preventDefault();
      const linha = inputFocado.closest('tr');
      alternarEdicao(linha);
    }
  }
});