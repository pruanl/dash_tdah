Crie uma página de Dashboard de Relatório de Performance em React usando Tailwind CSS e Shadcn/UI.

1. Roteamento e Dados:
- A página deve ser acessível via rota `/report/:public_id`.
- Use o hook useParams para capturar o public_id.
- Integre com o Supabase usando a chave pública. Chame a função RPC 'get_user_performance_report' passando o public_id da URL e um intervalo de datas (padrão: últimos 7 dias até hoje).

Exemplo de como deve vir o retorno:
[
  {
    "user_name": "Pedro Ruan",
    "tasks_completed": 4,
    "tasks_pending": 2,
    "total_period_tasks": 6,
    "completion_rate": "66.67",
    "daily_history": {
      "2026-02-17": 3,
      "2026-02-18": 1
    }
  }
]

2. Interface (UI):
- No topo, mostre o nome do usuário (user_name) com um badge de "Relatório Público".
- Crie 3 cards principais de métricas: "Tarefas Concluídas", "Pendentes Atuais" e "Taxa de Eficiência (%)".
- Adicione um gráfico de barras (usando a biblioteca 'recharts' ou os componentes de chart do Shadcn) para exibir o 'daily_history'. Transforme o objeto JSON {"YYYY-MM-DD": count} em um array formatado para o gráfico.
- Adicione um seletor de período (Date Range Picker) que, ao ser alterado, refaça a chamada ao banco.

3. Seção "Inspiração do Dia":
- Crie um componente que simule a leitura de um arquivo chamado 'stories.md'.
- Como estamos em um ambiente web, o componente deve conter um array de objetos/strings (as histórias) e selecionar uma ALEATÓRIA cada vez que a página for carregada ou o relatório consultado.
- Exiba essa história em um card com estilo de citação (blockquote) ou um design elegante de "Dica do Diário".

4. Estado de Loading/Empty:
- Mostre um Skeleton screen enquanto os dados carregam.
- Se o 'daily_history' for vazio, mostre uma mensagem amigável: "Nenhuma atividade registrada neste período".

Use as cores do tema Dark (Zinc/Slate) para combinar com a identidade de ferramentas de produtividade.

5. Crie um .env com os dados que precisa que eu vou alterar aqui.

Dicas extras sobbre usabilidade:

Crie uma página de Dashboard de Relatório de Performance em React usando Tailwind CSS e Shadcn/UI.

1. Estilo Visual (Baseado em desafoga.tdahceo.com.br):
- Tema: Dark Mode rigoroso.
- Background: #09090b. Cards: #18181b com bordas finas em #27272a.
- Cores de acento: Azul (#2563eb) para botões e links. Texto principal em #fafafa.
- Fontes: Use fontes sem-serifa limpas (Inter ou Geist).

2. Funcionalidade Principal:
- Rota: /report/:public_id
- Hook: useParams para pegar o public_id.
- Chamada Supabase: Use a RPC 'get_user_performance_report' passando o public_id e o intervalo de datas.
- Filtro: Adicione um Date Range Picker do Shadcn no topo direito. O padrão deve ser os últimos 7 dias.

3. Layout do Relatório:
- Hero: "Raio-X - [user_name]".
- Grid de 3 Cards: 
    1. "Concluídas" (Destaque o número em Verde #22c55e).
    2. "Pendentes" (Destaque em Amarelo/Laranja).
    3. "Taxa de Eficiência" (Mostre um círculo de progresso ou porcentagem grande).
- Gráfico: Recharts BarChart para o 'daily_history'. Use a cor #2563eb nas barras.

4. Componente de Histórias (Inspirado em Diógenes e Produtividade):
- Crie uma seção "Reflexão do Cínico" que seleciona aleatoriamente uma destas histórias:
    * "Diógenes foi visto pedindo esmola a uma estátua. Ao ser questionado, disse: 'Estou treinando para não me decepcionar com a falta de resposta dos homens.' - Lição: Foque na sua execução, não no aplauso."
    * "A liberdade não pertence a quem tem muito, mas a quem precisa de pouco para realizar o que importa."
    * "A disciplina é o fogo onde transformamos intenção em resultado. Cada tarefa feita é um passo fora do caos."
    * "Não espere pelo momento perfeito. Diógenes vivia em um barril e ainda assim desafiou Alexandre, o Grande. Sua ferramenta é o que você tem agora."
    * "O progresso é uma sucessão de pequenos 'feitos'. Não subestime a vitória de uma tarefa simples concluída."

5. Loading: Use Skeleton do Shadcn para os cards e o gráfico.