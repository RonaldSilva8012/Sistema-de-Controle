const { createClient } = supabase;
const supabaseUrl = 'https://rdhrpspqrrxrbceduwao.supabase.co';
const supabaseKey = 'sb_publishable_WUs9ISlOBD6r1oNexYrskw_6IRJfoS6';
const _supabase = createClient(supabaseUrl, supabaseKey);

const tabela = document.querySelector('table');
const tbody = document.getElementById('lista-funcionarios');
const adicionarFuncionarioBtn = document.getElementById('adicionar-funcionario');
const totalDisplay = document.getElementById('valor-total');
const btnCalcular = document.getElementById('btn-calcular');

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
    todosInputs.forEach(input => (input.disabled = false));
    inputNome.focus();
    if (icone) icone.textContent = 'check';
    if (botaoEditContainer) botaoEditContainer.setAttribute('data-tooltip', 'Salvar alterações');
  } else {
    const nomePreenchido = inputNome.value.trim() !== '';

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

    inputNome.value = inputNome.value.trim().toUpperCase();

    if (generoTag) {
      generoTag.textContent = '...';
      const iconeHtml = await descobrirSexo(inputNome.value);
      generoTag.innerHTML = iconeHtml;
    }

    todosInputs.forEach(input => (input.disabled = true));
    if (icone) icone.textContent = 'edit_square';
    if (botaoEditContainer) botaoEditContainer.setAttribute('data-tooltip', 'Editar funcionário');

    atualizarValorTotal();
  }
}

// Adiciona nova linha (apenas se o botão existir na página)
if (adicionarFuncionarioBtn && tbody) {
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
}

// Eventos da tabela de cadastro (apenas se a tabela existir)
if (tabela) {
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

  tabela.addEventListener('input', function (event) {
    if (event.target.classList.contains('input-quantidade')) {
      const linha = event.target.closest('tr');
      ajustarCamposDeValor(linha);
    }

    if (event.target.classList.contains('input-valor')) {
      atualizarValorTotal();
    }
  });

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
}

// Envio dos dados para o Supabase
if (btnCalcular) {
  btnCalcular.addEventListener('click', async function () {
    const listaFuncionarios = [];
    const linhas = document.querySelectorAll('.linha-dado');

    linhas.forEach(linha => {
      const inputNome = linha.querySelector('.input-nome');
      const nome = inputNome ? inputNome.value.trim() : '';

      const inputQtd = linha.querySelector('.input-quantidade');
      const quantidadeOnibus = inputQtd ? parseInt(inputQtd.value, 10) : 0;

      const inputsValor = linha.querySelectorAll('.input-valor');
      let totalLinha = 0;

      inputsValor.forEach(input => {
        const valor = parseFloat(input.value);
        if (!isNaN(valor)) {
          totalLinha += valor;
        }
      });

      if (nome !== '') {
        listaFuncionarios.push({
          nome: nome,
          quantidade_onibus: quantidadeOnibus,
          valor_total: totalLinha
        });
      }
    });

    if (listaFuncionarios.length === 0) {
      alert('Adicione e salve pelo menos um funcionário antes de calcular.');
      return;
    }

    try {
      const { data, error } = await _supabase
        .from('funcionarios_vt')
        .insert(listaFuncionarios);

      if (error) {
        console.error('Erro retornado pelo Supabase:', error);
        alert('Erro ao salvar no banco de dados: ' + error.message);
        return;
      }

      console.log('Dados salvos com sucesso no Supabase!', data);
      window.location.href = 'calculo.html';

    } catch (err) {
      console.error('Falha na comunicação com o Supabase:', err);
    }
  });
}
// Função para buscar os dados no Supabase e renderizar em calculo.html
async function carregarDadosCalculo() {
  const tbodyResultado = document.getElementById('tabela-resultado');
  
  // Se esse elemento não existir, significa que não estamos em calculo.html
  if (!tbodyResultado) return;

  try {
    // 1. Busca todos os registros da tabela ordenados pelos mais recentes
    const { data: funcionarios, error } = await _supabase
      .from('funcionarios_vt')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar dados:', error);
      tbodyResultado.innerHTML = `<tr><td colspan="2">Erro ao carregar dados do banco.</td></tr>`;
      return;
    }

    // 2. Verifica se a tabela está vazia
    if (!funcionarios || funcionarios.length === 0) {
      tbodyResultado.innerHTML = `<tr><td colspan="2">Nenhum registro encontrado.</td></tr>`;
      return;
    }

    // 3. Limpa o placeholder atual
    tbodyResultado.innerHTML = '';

    // 4. Percorre os funcionários retornados
    funcionarios.forEach(func => {
      const linha = document.createElement('tr');
      linha.innerHTML = `
        <td>${func.nome}</td>
        <td>R$ ${Number(func.valor_total).toFixed(2).replace('.', ',')}</td>
      `;
      tbodyResultado.appendChild(linha);
    });

    console.log('Dados carregados com sucesso:', funcionarios);

  } catch (err) {
    console.error('Falha ao conectar no Supabase:', err);
  }
}

// Dispara a consulta assim que a página terminar de carregar
document.addEventListener('DOMContentLoaded', carregarDadosCalculo);

// 1. Algoritmo para calcular a menor quantidade de cédulas e moedas
function calcularTroco(valorReais) {
  // Converte para centavos inteiros
  let centavos = Math.round(valorReais * 100);

  // Lista de denominações em centavos
  const denominacoes = [
    { nome: 'R$ 100', valor: 10000, tipo: 'nota' },
    { nome: 'R$ 50',  valor: 5000,  tipo: 'nota' },
    { nome: 'R$ 20',  valor: 2000,  tipo: 'nota' },
    { nome: 'R$ 10',  valor: 1000,  tipo: 'nota' },
    { nome: 'R$ 5',   valor: 500,   tipo: 'nota' },
    { nome: 'R$ 2',   valor: 200,   tipo: 'nota' },
    { nome: 'R$ 1',   valor: 100,   tipo: 'moeda' },
    { nome: 'R$ 0,50', valor: 50,   tipo: 'moeda' },
    { nome: 'R$ 0,25', valor: 25,   tipo: 'moeda' },
    { nome: 'R$ 0,10', valor: 10,   tipo: 'moeda' },
    { nome: 'R$ 0,05', valor: 5,    tipo: 'moeda' }
  ];

  const resultado = [];

  denominacoes.forEach(item => {
    if (centavos >= item.valor) {
      const qtd = Math.floor(centavos / item.valor);
      centavos = centavos % item.valor; // O que sobrou para as próximas notas/moedas

      resultado.push({
        rotulo: item.nome,
        quantidade: qtd,
        tipo: item.tipo
      });
    }
  });

  return resultado;
}

// 2. Busca os dados no Supabase e renderiza com a distribuição detalhada
async function carregarDadosCalculo() {
  const tbodyResultado = document.getElementById('tabela-resultado');
  if (!tbodyResultado) return;

  try {
    const { data: funcionarios, error } = await _supabase
      .from('funcionarios_vt')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar dados:', error);
      tbodyResultado.innerHTML = `<tr><td colspan="2">Erro ao carregar dados.</td></tr>`;
      return;
    }

    if (!funcionarios || funcionarios.length === 0) {
      tbodyResultado.innerHTML = `<tr><td colspan="2">Nenhum registro encontrado.</td></tr>`;
      return;
    }

    tbodyResultado.innerHTML = '';

    funcionarios.forEach(func => {
      // Executa o algoritmo do troco para cada funcionário
      const distribuicao = calcularTroco(func.valor_total);

      // Formata a lista visual de notas/moedas
      const textoDistribuicao = distribuicao
        .map(d => `${d.quantidade}x ${d.rotulo}`)
        .join(', ');

      const linha = document.createElement('tr');
      linha.innerHTML = `
        <td><strong>${func.nome}</strong></td>
        <td>
          <div><strong>Total:</strong> R$ ${Number(func.valor_total).toFixed(2).replace('.', ',')}</div>
          <small style="color: #666;">${textoDistribuicao}</small>
        </td>
      `;
      tbodyResultado.appendChild(linha);
    });

  } catch (err) {
    console.error('Falha de conexão com o Supabase:', err);
  }
}

document.addEventListener('DOMContentLoaded', carregarDadosCalculo);

// 2. Busca os dados no Supabase em ordem alfabética e renderiza
async function carregarDadosCalculo() {
  const tbodyResultado = document.getElementById('tabela-resultado');
  if (!tbodyResultado) return;

  try {
    // .order('nome', { ascending: true }) ordena de A a Z
    const { data: funcionarios, error } = await _supabase
      .from('funcionarios_vt')
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao buscar dados:', error);
      tbodyResultado.innerHTML = `<tr><td colspan="3">Erro ao carregar dados.</td></tr>`;
      return;
    }

    if (!funcionarios || funcionarios.length === 0) {
      tbodyResultado.innerHTML = `<tr><td colspan="3">Nenhum registro encontrado.</td></tr>`;
      return;
    }

    tbodyResultado.innerHTML = '';

    funcionarios.forEach(func => {
      const distribuicao = calcularTroco(func.valor_total);
      const textoDistribuicao = distribuicao
        .map(d => `${d.quantidade}x ${d.rotulo}`)
        .join(', ');

      const linha = document.createElement('tr');
      linha.setAttribute('data-id', func.id); // Guarda o ID do banco na linha

      linha.innerHTML = `
        <td><strong>${func.nome}</strong></td>
        <td>
          <div><strong>Total:</strong> R$ ${Number(func.valor_total).toFixed(2).replace('.', ',')}</div>
          <small style="color: #666;">${textoDistribuicao}</small>
        </td>
        <td style="text-align: center;">
          <span class="tooltip-container" data-tooltip="Remover do banco">
            <span class="material-symbols-outlined icone-delete-db" style="cursor: pointer; color: #dc3545;">delete</span>
          </span>
        </td>
      `;
      tbodyResultado.appendChild(linha);
    });

  } catch (err) {
    console.error('Falha de conexão com o Supabase:', err);
  }
}

// 3. Listener para remover o registro diretamente do Supabase
const tbodyResultado = document.getElementById('tabela-resultado');
if (tbodyResultado) {
  tbodyResultado.addEventListener('click', async function (event) {
    const botaoDelete = event.target.closest('.icone-delete-db');
    if (!botaoDelete) return;

    const linha = botaoDelete.closest('tr');
    const idRegistro = linha.getAttribute('data-id');

    const confirmacao = confirm('Deseja realmente excluir este funcionário do banco de dados?');
    if (!confirmacao) return;

    try {
      // Deleta a linha onde a coluna id for igual ao id guardado no HTML
      const { error } = await _supabase
        .from('funcionarios_vt')
        .delete()
        .eq('id', idRegistro);

      if (error) {
        alert('Erro ao excluir: ' + error.message);
        return;
      }

      // Remove visualmente a linha da tabela
      linha.remove();

      // Se a tabela ficar vazia após remover
      if (tbodyResultado.children.length === 0) {
        tbodyResultado.innerHTML = `<tr><td colspan="3">Nenhum registro encontrado.</td></tr>`;
      }

    } catch (err) {
      console.error('Erro na requisição de exclusão:', err);
    }
  });
}