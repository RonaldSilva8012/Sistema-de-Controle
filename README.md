Calculadora de Vale-Transporte & Distribuição de Troco 🚌💵
Criei esse projeto para resolver uma dor de cabeça clássica de RH e financeiro: fechar os gastos de vale-transporte da equipe e descobrir exatamente quanto dinheiro físico sacar no banco para pagar todo mundo sem faltar uma única moeda.

A aplicação permite cadastrar cada colaborador, adicionar múltiplos valores de passagem por pessoa, salvar tudo na nuvem e, no final, calcular a distribuição exata de quais cédulas e moedas você precisa entregar para cada um.

O que o sistema faz na prática
Adição dinâmica de funcionários: Dá para incluir quantos colaboradores precisar em tempo real e configurar valores de ônibus diferentes para quem pega mais de uma condução.

Descobre o gênero pelo nome: O sistema consome uma API que tenta adivinhar o gênero com base no primeiro nome e já coloca o ícone visual correspondente na hora.

Trava de segurança nas linhas: Dá para alternar entre editar e salvar (seja clicando no botão ou dando Enter), evitando alterar valores por engano depois de preenchido.

Soma em tempo real: Qualquer centavo digitado ou linha removida já recalcula o total geral instantaneamente no rodapé.

Cálculo do troco (notas e moedas): O coração da aplicação. O sistema pega o valor final e quebra na menor quantidade de notas (de 100 até 2 reais) e moedas (de 1 real até 5 centavos), fazendo o cálculo todo em centavos para o JavaScript não se perder nas casas decimais.

Banco de dados na nuvem: Os dados são enviados e salvos diretamente no Supabase, permitindo listar tudo em ordem alfabética na tela de resultado e excluir registros com um clique.

O que usei para construir
HTML5 & CSS3: Estrutura das páginas, formulários, tabelas customizadas, efeito zebrado, responsividade e tooltips feitos na mão.

JavaScript Puro (Vanilla ES6+): Toda a manipulação do DOM, eventos em tempo real, chamadas assíncronas com async/await e a lógica matemática de divisão do dinheiro.

Supabase (PostgreSQL): Banco de dados relacional na nuvem para persistir os colaboradores (funcionarios_vt) e gerenciar o CRUD.

Genderize.io API: Para identificar o gênero dos nomes cadastrados.

Google Fonts & Material Symbols: Fonte Josefin Sans e os ícones visuais da interface.

O que estou construindo agora (Próximos passos)
Quero tirar a aplicação da dependência de BaaS e colocar um backend próprio rodando em Python puro para gerenciar acessos:

Servidor Python na unha: Criar um backend usando apenas bibliotecas padrão do Python (como http.server) para entender a fundo como funcionam sockets, requisições HTTP, leitura de JSON bruto e regras de CORS.

Fluxo de autorização por e-mail:

O usuário solicita cadastro informando nome e e-mail.

O Python gera um token único e temporário e salva o usuário com status "pendente".

O sistema dispara um e-mail automático via SMTP para o administrador com um link seguro.

O admin clica no link e o acesso é liberado no banco.
