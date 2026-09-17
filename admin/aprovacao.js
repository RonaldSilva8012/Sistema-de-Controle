const { createClient } = supabase;
const supabaseUrl = 'https://rdhrpspqrrxrbceduwao.supabase.co';
const supabaseKey = 'sb_publishable_WUs9ISlOBD6r1oNexYrskw_6IRJfoS6';

// Define na window para que o inline do HTML consiga acessar
window._supabase = createClient(supabaseUrl, supabaseKey);

async function carregarTodosUsuarios() {
  try {
    const tbodyPendentes = document.getElementById('tabela-pendentes');
    const tbodyAprovados = document.getElementById('tabela-aprovados');
    const tbodyRecusados = document.getElementById('tabela-recusados');

    // Interrompe se a página atual não contiver as tabelas de aprovação (ex: painel principal)
    if (!tbodyPendentes || !tbodyAprovados || !tbodyRecusados) return;

    const { data: usuarios, error } = await window._supabase
      .from('usuarios')
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao buscar dados:', error);
      return;
    }

    tbodyPendentes.innerHTML = '';
    tbodyAprovados.innerHTML = '';
    tbodyRecusados.innerHTML = '';

    let qtdPendentes = 0;
    let qtdAprovados = 0;
    let qtdRecusados = 0;

    usuarios.forEach(user => {
      const dataFormatada = new Date(user.created_at).toLocaleDateString('pt-BR');
      const linha = document.createElement('tr');

      if (user.status === 'pendente') {
        qtdPendentes++;
        linha.innerHTML = `
          <td><strong>${user.nome}</strong></td>
          <td>${user.email}</td>
          <td>${dataFormatada}</td>
          <td>
            <button class="btn btn-aprovar" onclick="alterarStatus('${user.id}', 'aprovado')">Aprovar</button>
            <button class="btn btn-recusar" onclick="alterarStatus('${user.id}', 'recusado')">Recusar</button>
          </td>
        `;
        tbodyPendentes.appendChild(linha);

      } else if (user.status === 'aprovado') {
        qtdAprovados++;
        linha.innerHTML = `
          <td><strong>${user.nome}</strong></td>
          <td>${user.email}</td>
          <td><span style="color: #28a745; font-weight: bold;">Aprovado</span></td>
          <td>
            <button class="btn btn-recusar" onclick="alterarStatus('${user.id}', 'recusado')">Bloquear Acesso</button>
            <button class="btn btn-pendente" onclick="alterarStatus('${user.id}', 'pendente')">Tornar Pendente</button>
          </td>
        `;
        tbodyAprovados.appendChild(linha);

      } else if (user.status === 'recusado') {
        qtdRecusados++;
        linha.innerHTML = `
          <td><strong>${user.nome}</strong></td>
          <td>${user.email}</td>
          <td><span style="color: #dc3545; font-weight: bold;">Recusado</span></td>
          <td>
            <button class="btn btn-aprovar" onclick="alterarStatus('${user.id}', 'aprovado')">Aprovar Acesso</button>
            <button class="btn btn-pendente" onclick="alterarStatus('${user.id}', 'pendente')">Tornar Pendente</button>
          </td>
        `;
        tbodyRecusados.appendChild(linha);
      }
    });

    if (qtdPendentes === 0) tbodyPendentes.innerHTML = '<tr><td colspan="4">Nenhuma solicitação pendente.</td></tr>';
    if (qtdAprovados === 0) tbodyAprovados.innerHTML = '<tr><td colspan="4">Nenhum usuário aprovado no momento.</td></tr>';
    if (qtdRecusados === 0) tbodyRecusados.innerHTML = '<tr><td colspan="4">Nenhum usuário recusado.</td></tr>';

    const elCountPendentes = document.getElementById('count-pendentes');
    const elCountAprovados = document.getElementById('count-aprovados');
    const elCountRecusados = document.getElementById('count-recusados');

    if (elCountPendentes) elCountPendentes.textContent = qtdPendentes;
    if (elCountAprovados) elCountAprovados.textContent = qtdAprovados;
    if (elCountRecusados) elCountRecusados.textContent = qtdRecusados;

  } catch (err) {
    console.error('Falha de conexão com o Supabase:', err);
  }
}

async function alterarStatus(idUsuario, novoStatus) {
  try {
    const { error } = await window._supabase
      .from('usuarios')
      .update({ status: novoStatus })
      .eq('id', idUsuario);

    if (error) {
      alert('Erro ao atualizar status: ' + error.message);
      return;
    }

    carregarTodosUsuarios();
  } catch (err) {
    console.error('Erro ao processar solicitação:', err);
  }
}

document.addEventListener('DOMContentLoaded', carregarTodosUsuarios);