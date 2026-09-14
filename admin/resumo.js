document.addEventListener('DOMContentLoaded', () => {
    const dadosSalvos = localStorage.getItem('dadosPassagens');
    
    if (!dadosSalvos) {
        document.getElementById('containerResumo').innerHTML = '<p>Nenhum dado encontrado.</p>';
        return;
    }

    const listaPassagens = JSON.parse(dadosSalvos);

    // Mapeamento das denominações em centavos para evitar erros de ponto flutuante
    const denominacoes = [
  { nome: 'R$ 100,00', valor: 10000, img: '../img/100_real.webp' },
  { nome: 'R$ 50,00',  valor: 5000,  img: '../img/50_reais.webp' },
  { nome: 'R$ 20,00',  valor: 2000,  img: '../img/20_reais.webp' },
  { nome: 'R$ 10,00',  valor: 1000,  img: '../img/10_reais.webp' },
  { nome: 'R$ 5,00',   valor: 500,   img: '../img/5_reais.png' },
  { nome: 'R$ 2,00',   valor: 200,   img: '../img/2_reais.png' },
  { nome: 'R$ 1,00',   valor: 100,   img: '../img/1_real.png' },
  { nome: 'R$ 0,50',   valor: 50,    img: '../img/0,50.webp' },
  { nome: 'R$ 0,25',   valor: 25,    img: '../img/0,25.webp' },
  { nome: 'R$ 0,10',   valor: 10,    img: '../img/0,10.webp' },
  { nome: 'R$ 0,05',   valor: 5,     img: '../img/0,05.webp' }
];

    // Objeto acumulador para armazenar as quantidades globais
    const totalConsolidado = {};
    denominacoes.forEach(d => totalConsolidado[d.valor] = 0);

    let valorTotalGeral = 0;

    // Percorre cada funcionário, calcula o troco individual e acumula no total geral
    listaPassagens.forEach(item => {
        let centavos = Math.round(Number(item.valor_total || 0) * 100);
        valorTotalGeral += centavos;

        denominacoes.forEach(d => {
            if (centavos >= d.valor) {
                const qtd = Math.floor(centavos / d.valor);
                centavos = centavos % d.valor;
                totalConsolidado[d.valor] += qtd;
            }
        });
    });

    // Renderiza o resultado na tela
    const container = document.getElementById('containerResumo');
    
    // Converte centavos de volta para reais na exibição do total
    const totalEmReais = (valorTotalGeral / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    container.innerHTML = `<h2>Valor Total para Saque: ${totalEmReais}</h2><hr/>`;

    // Exibe apenas as notas/moedas que possuem quantidade > 0
   denominacoes.forEach(d => {
  const qtd = totalConsolidado[d.valor];
  if (qtd > 0) {
    const itemElemento = document.createElement('div');
    itemElemento.className = 'item-nota-row';
    itemElemento.style.display = 'flex';
    itemElemento.style.alignItems = 'center';
    itemElemento.style.gap = '12px';
    itemElemento.style.margin = '8px 0';

    itemElemento.innerHTML = `
      <span class="badge-qtd" style="font-weight: bold; color: #f0f2f5; font-size: 1.1rem;">${qtd}x</span>
      <img src="${d.img}" alt="${d.nome}" style="height: 40px; object-fit: contain;" />
      <span style="font-size: 0.9rem; color: #666;">(${d.nome})</span>
    `;
    
    container.appendChild(itemElemento);
    }
    });

   document.getElementById('btn-gerar-pdf')?.addEventListener('click', () => {
  const element = document.getElementById('containerResumo');
  const dataHoje = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');

  const options = {
    margin:       [10, 10, 10, 10], // Margens menores (topo, esquerda, baixo, direita)
    filename:     `Relatorio_Saque_TRANSPORED_${dataHoje}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { 
      scale: 2,           // Mantém alta resolução
      useCORS: true, 
      scrollY: 0          // Evita cortes se a página estiver com rolagem
    },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
    // EVITA A QUEBRA DE PÁGINA DENTRO DAS LINHAS:
    pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
  };

  html2pdf().set(options).from(element).save();
});
});