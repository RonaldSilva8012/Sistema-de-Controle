// Inicialização segura do cliente Supabase
const supabaseUrl = 'https://rdhrpspqrrxrbceduwao.supabase.co';
const supabaseKey = 'sb_publishable_WUs9ISlOBD6r1oNexYrskw_6IRJfoS6';

// Pega a função createClient do escopo global da CDN
const createClientFunc = window.supabase?.createClient || window.supabaseJs?.createClient;
const _supabase = createClientFunc(supabaseUrl, supabaseKey);

// Algoritmo para decomposição em cédulas e moedas
function calcularTroco(valorReais) {
  let centavos = Math.round(valorReais * 100);

  const denominacoes = [
    { nome: 'R$ 100', valor: 10000 },
    { nome: 'R$ 50',  valor: 5000 },
    { nome: 'R$ 20',  valor: 2000 },
    { nome: 'R$ 10',  valor: 1000 },
    { nome: 'R$ 5',   valor: 500 },
    { nome: 'R$ 2',   valor: 200 },
    { nome: 'R$ 1',   valor: 100 },
    { nome: 'R$ 0,50', valor: 50 },
    { nome: 'R$ 0,25', valor: 25 },
    { nome: 'R$ 0,10', valor: 10 },
    { nome: 'R$ 0,05', valor: 5 }
  ];

  const resultado = [];

  denominacoes.forEach(item => {
    if (centavos >= item.valor) {
      const qtd = Math.floor(centavos / item.valor);
      centavos = centavos % item.valor;
      resultado.push(`${qtd}x ${item.nome}`);
    }
  });

  return resultado.join(', ');
}

// Função isolada para atualizar a soma geral no Card
function atualizarSomaCard(funcionarios) {
  const elTotal = document.getElementById('card-valor-total');
  if (!elTotal) return;

  const total = funcionarios.reduce((acc, func) => {
    const val = Number(func.valor_total ?? 0);
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  elTotal.textContent = total.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }); 
}

// Carregamento principal da tabela do Admin Pai
async function carregarPainelPai() {
  const tbody = document.getElementById('tabela-admins');
  if (!tbody) return;

  try {
    const [resFuncionarios, resUsuarios] = await Promise.all([
      _supabase.from('funcionarios_vt').select('*').order('nome', { ascending: true }),
      _supabase.from('usuarios').select('*')
    ]);

    if (resFuncionarios.error) {
      tbody.innerHTML = `<tr><td colspan="5">Erro ao carregar dados: ${resFuncionarios.error.message}</td></tr>`;
      return;
    }

    const funcionarios = resFuncionarios.data || [];
    const usuarios = resUsuarios.data || [];

    // Atualiza a soma no Card
    atualizarSomaCard(funcionarios);

    const mapaUsuarios = {};
    usuarios.forEach(u => {
      if (u.id) mapaUsuarios[u.id] = u.nome || u.email;
    });

    tbody.innerHTML = '';

    if (funcionarios.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">Nenhum funcionário cadastrado.</td></tr>`;
      return;
    }

    funcionarios.forEach(func => {
      const tr = document.createElement('tr');
      tr.setAttribute('data-id', func.id);
      tr.style.cursor = 'pointer';

      const nomeFuncionario = func.nome || 'Não informado';
      const cadastradoPor = mapaUsuarios[func.user_id] || 'Não identificado';
      const valorBruto = Number(func.valor_total ?? 0);
      const valorFormatado = `R$ ${valorBruto.toFixed(2)}`;
      const dataCriacao = func.created_at ? new Date(func.created_at).toLocaleDateString('pt-BR') : '-';
      const distribuicaoTroco = calcularTroco(valorBruto);

      tr.innerHTML = `
        <td><strong>${nomeFuncionario}</strong></td>
        <td title="${cadastradoPor}">${cadastradoPor}</td>
        <td>
          <div><strong>${valorFormatado}</strong></div>
          <small class="detalhe-distribuicao" style="display: none; color: #0d6efd; font-weight: 600; margin-top: 4px;">
            ${distribuicaoTroco || 'Sem detalhamento'}
          </small>
        </td>
        <td>${dataCriacao}</td>
        <td style="text-align: center;">
          <span class="btn-editar-db" style="cursor: pointer; color: #0d6efd; margin-right: 10px;" title="Editar">
            <span class="material-symbols-outlined">edit</span>
          </span>
          <span class="btn-excluir-db" style="cursor: pointer; color: #dc3545;" title="Excluir">
            <span class="material-symbols-outlined">delete</span>
          </span>
        </td>
      `;

      // Clique na linha para exibir/ocultar a distribuição das notas
      tr.addEventListener('click', (e) => {
        if (e.target.closest('.btn-editar-db') || e.target.closest('.btn-excluir-db')) return;
        const detalhe = tr.querySelector('.detalhe-distribuicao');
        if (detalhe) {
          detalhe.style.display = detalhe.style.display === 'none' ? 'block' : 'none';
        }
      });

      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error('Erro de conexão:', err);
    tbody.innerHTML = `<tr><td colspan="5">Falha na conexão com o servidor.</td></tr>`;
  }
}

// Ações Globais: Exclusão e Edição
document.addEventListener('click', async (e) => {
  const btnExcluir = e.target.closest('.btn-excluir-db');
  const btnEditar = e.target.closest('.btn-editar-db');

  // Excluir funcionário
  if (btnExcluir) {
    const tr = btnExcluir.closest('tr');
    const id = tr.getAttribute('data-id');

    if (confirm('Deseja realmente remover este funcionário?')) {
      const { error } = await _supabase.from('funcionarios_vt').delete().eq('id', id);
      if (error) {
        alert('Erro ao excluir: ' + error.message);
      } else {
        // Recarrega o painel e recalcula a soma
        carregarPainelPai();
      }
    }
    return;
  }

  // Abrir modal de edição
  if (btnEditar) {
    const tr = btnEditar.closest('tr');
    const id = tr.getAttribute('data-id');

    const { data: func, error } = await _supabase.from('funcionarios_vt').select('*').eq('id', id).single();
    if (func && !error) {
      document.getElementById('edit-id-funcionario').value = func.id;
      document.getElementById('edit-nome-funcionario').value = func.nome;
      document.getElementById('edit-valor-funcionario').value = func.valor_total;
      document.getElementById('modal-editar').style.display = 'flex';
    }
  }
});

// Botões do Modal
document.getElementById('btn-cancelar-modal')?.addEventListener('click', () => {
  document.getElementById('modal-editar').style.display = 'none';
});

document.getElementById('btn-salvar-modal')?.addEventListener('click', async () => {
  const id = document.getElementById('edit-id-funcionario').value;
  const nome = document.getElementById('edit-nome-funcionario').value.trim();
  const valor_total = parseFloat(document.getElementById('edit-valor-funcionario').value);

  if (!nome || isNaN(valor_total)) {
    alert('Preencha os campos corretamente.');
    return;
  }

  const { error } = await _supabase
    .from('funcionarios_vt')
    .update({ nome, valor_total })
    .eq('id', id);

  if (error) {
    alert('Erro ao atualizar: ' + error.message);
  } else {
    document.getElementById('modal-editar').style.display = 'none';
    carregarPainelPai();
  }
});

// Evento de Inicialização
document.addEventListener('DOMContentLoaded', carregarPainelPai);