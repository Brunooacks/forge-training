# Scripts de Vídeo — LAB 03: Automated Code Review
> Plataforma: HeyGen | Avatar: Profissional masculino ou feminino | Idioma: Português Brasileiro | Tom: Técnico, direto, profissional

---

## VÍDEO 1 — "Por que isso importa no banco" (target: 4:30)
**Configuração HeyGen:** Avatar em frente a fundo escuro com overlay de código. Voz: séria, ritmo moderado.

---

[ABERTURA — 0:00–0:20]

Boa tarde. Bem-vindo ao LAB 03 do programa FORGE — Automated Code Review.

Neste vídeo, você vai entender por que revisão manual de código não escala em instituições financeiras — e como configurar um revisor automatizado que trabalha em cada Pull Request do seu time.

---

[CONTEXTO DO PROBLEMA — 0:20–1:30]

Imagine o seguinte cenário: seu time fecha um sprint com oito Pull Requests. São oito revisões manuais que um desenvolvedor sênior precisa fazer. Cada uma leva em média quarenta minutos. São mais de cinco horas de revisão — sem contar interrupções, contexto de mudança entre projetos, e o cansaço natural que reduz a atenção nos últimos PRs do dia.

O resultado? Erros passam. E em banco, erros têm um custo muito específico.

Um CPF logado em texto claro pode violar o artigo 46 da LGPD — medidas técnicas de proteção de dados pessoais. Uma API key hardcoded no repositório fica no histórico do Git para sempre — mesmo após remoção. Uma chamada à API do PIX sem timeout pode deixar uma transação em estado inconsistente, violando o SLA de dez segundos exigido pelo BACEN.

Não estamos falando de bugs funcionais. Estamos falando de problemas que passam no teste unitário, passam no code review manual — e chegam em produção.

---

[A SOLUÇÃO — 1:30–2:45]

O FORGE resolve isso com o Design System como revisor permanente.

O conceito central é o arquivo AGENTS.md — um contrato de revisão que você define uma vez, e o agente aplica em todos os PRs automaticamente.

Nesse contrato, você especifica: o que é crítico e bloqueia merge — dados pessoais em log, secrets hardcoded, ausência de timeout. O que é aviso — funções muito longas, ausência de comentário de propósito. E o que deve ser ignorado — arquivos gerados automaticamente, documentação.

Uma vez configurado, cada PR recebe feedback em minutos. Sem dependência de disponibilidade humana. Sem variação de critério entre revisores. Com trilha de auditoria de cada decisão.

---

[CONEXÃO COM COMPLIANCE — 2:45–3:45]

Isso é especialmente relevante para vocês no contexto NTT DATA.

A Resolução 4.658 do BACEN exige que instituições financeiras mantenham controles sobre o código que acessa dados de clientes. O automated code review é parte da evidência desse controle — mostrando que cada mudança no sistema passou por um checklist documentado antes de ir para produção.

Em uma auditoria, você consegue mostrar: PR número 247, data, desenvolvedor, problemas detectados, correções aplicadas, aprovação. Isso tem valor regulatório concreto.

---

[CALL TO ACTION — 3:45–4:30]

No próximo vídeo, você vai ver a configuração acontecendo na prática — o AGENTS.md sendo criado e o reviewer detectando os três problemas do nosso cenário de exercício.

Depois, é a sua vez de praticar. O exercício está na plataforma, com instruções específicas para o seu nível — E2 ou E3.

Até o próximo vídeo.

---

---

## VÍDEO 2 — "Demo: Configurando o reviewer" (target: 7:15)
**Configuração HeyGen:** Screencast com narração do avatar em picture-in-picture no canto. Mostrar terminal e editor de código. Voz: técnica, didática, pausada nos momentos de código.

---

[ABERTURA — 0:00–0:25]

Neste vídeo você vai ver, passo a passo, como configurar o Claude Code como revisor automático de PRs em um repositório bancário.

Vamos usar o repositório de exercício do LAB 03. Tudo que você vai ver aqui é o que você vai replicar no exercício.

---

[PASSO 1 — CRIAR O AGENTS.MD — 0:25–2:00]

Começamos criando o arquivo AGENTS.md na raiz do projeto.

[narração enquanto digita]

A primeira seção é Segurança — com nível crítico, que bloqueia o merge. Aqui eu defino: nunca logar dados pessoais. CPF, número de conta, saldo, nome completo. Nunca hardcodar API keys, senhas, tokens. Sempre validar input em endpoints públicos. Sempre usar HTTPS em chamadas externas.

A segunda seção é Compliance — LGPD e BACEN. Dados pessoais devem ser mascarados em logs. Acesso a dados de cliente deve ter log de auditoria. Timeouts obrigatórios em chamadas a APIs externas — máximo dez segundos para operações PIX.

A terceira seção é Qualidade. Funções com mais de vinte linhas precisam de comentário de propósito. Cobertura mínima de testes: oitenta por cento. Tratamento de erro obrigatório em toda chamada assíncrona.

Por fim, defino o que NÃO revisar — arquivos de ambiente, documentação, código gerado automaticamente. Isso evita ruído no feedback.

---

[PASSO 2 — ABRIR O PR COM PROBLEMAS — 2:00–3:30]

Agora vou criar uma branch com o arquivo saldo-service.js — que tem os três problemas intencionais.

[mostra o arquivo]

Linha 12: o logger registra o CPF completo do cliente. Problema de LGPD.

Linha 23: a chamada à API do PIX não tem timeout. Problema de SLA BACEN.

Linha 34: o endpoint não tem tratamento de erro — qualquer exceção vai retornar um stack trace para o cliente. Problema de segurança.

Faço o commit e abro o Pull Request.

---

[PASSO 3 — EXECUTAR O REVIEW — 3:30–5:15]

Com o PR aberto, executo o Claude Code para revisar.

[mostra o comando]

Observem o que acontece: o agente lê o diff do PR, aplica as regras do AGENTS.md, e em menos de um minuto retorna o feedback.

Problema um: CPF exposto na linha 12. Sugestão de correção com mascaramento.

Problema dois: chamada sem timeout na linha 23. Sugestão com Promise.race e timeout de nove segundos.

Problema três: ausência de try-catch na linha 34. Sugestão com tratamento de erro e log seguro.

Três problemas, três sugestões de correção. Automático, consistente, auditável.

---

[PASSO 4 — APLICAR AS CORREÇÕES — 5:15–6:30]

Aplico as três correções sugeridas.

[mostra cada correção]

CPF mascarado: apenas os três últimos dígitos aparecem no log.

Timeout adicionado: Promise.race com nove segundos — um segundo de margem antes do SLA do BACEN.

Try-catch adicionado: erro capturado, log seguro com apenas a mensagem de erro, resposta padronizada para o cliente.

Novo commit. O reviewer roda novamente. Zero problemas encontrados. PR aprovado.

---

[FECHAMENTO — 6:30–7:15]

Isso é o automated code review em contexto bancário. Um AGENTS.md bem configurado, aplicado consistentemente em cada PR, reduz drasticamente o risco de problemas de compliance chegarem à produção.

No seu exercício, você vai replicar exatamente esse processo — com instruções específicas para E2 e E3 na plataforma.

Boa prática.

---

---

## VÍDEO 3 — "E2 vs E3: diferença na entrega" (target: 3:48)
**Configuração HeyGen:** Avatar em frente a fundo com dois painéis lado a lado. Tom: consultivo, direto.

---

[ABERTURA — 0:00–0:20]

Vídeo rápido antes do exercício. Quero deixar claro o que diferencia uma entrega E2 de uma entrega E3 neste lab — porque não é quantidade de trabalho, é qualidade de pensamento.

---

[O QUE É E2 — 0:20–1:20]

No nível E2, você domina a ferramenta.

Você cria o AGENTS.md com regras claras. Você configura o reviewer corretamente. Você consegue usar o feedback para identificar e corrigir os problemas. E você documenta o que foi encontrado e corrigido.

Esse é o nível de competência esperado: consigo usar essa ferramenta de forma efetiva no meu trabalho cotidiano.

A pergunta que o E2 responde: funciona? Sim. Os três problemas foram detectados. As correções foram aplicadas. O PR foi aprovado.

---

[O QUE É E3 — 1:20–2:40]

No nível E3, você pensa em arquitetura e impacto.

A diferença começa no AGENTS.md. O E3 não cria regras genéricas — cria regras ancoradas nos artigos específicos da LGPD, nos incisos da resolução 4.658 do BACEN, nas seções relevantes do PCI-DSS. Cada regra tem uma justificativa regulatória documentada.

O E3 também pensa em escalabilidade: ao final do exercício, cria um template AGENTS.md que outros times podem adotar. Isso é pensar como Staff Engineer — não resolver o meu problema, mas criar a solução que resolve o problema do time.

Por fim, o E3 documenta decisões de arquitetura. "Por que escolhi mascarar o CPF desta forma e não de outra?" "Por que nove segundos de timeout e não cinco?" Essas perguntas têm respostas técnicas e regulatórias — e o E3 consegue articulá-las.

A pergunta que o E3 responde: como isso escala? Como outros times adotam? Como isso evidencia compliance em uma auditoria?

---

[FECHAMENTO — 2:40–3:48]

Se você está no E2: foco em executar bem o processo. Use o feedback do reviewer. Corrija. Documente.

Se você está no E3: foque em profundidade regulatória e reusabilidade. Pense no template. Justifique suas decisões.

Os critérios de aprovação para cada nível estão na plataforma. Boa prática — e nos vemos no LAB 04.

---

---

## Instruções de Produção no HeyGen

### Configurações recomendadas
- **Avatar:** Monica (profissional, neutra) ou qualquer avatar Business disponível
- **Língua:** Português do Brasil
- **Velocidade de fala:** Normal (1.0x)
- **Resolução:** 1920×1080
- **Fundo vídeo 1 e 3:** Template "Tech Dark" ou fundo sólido `#03050f` com overlay sutil
- **Fundo vídeo 2:** Screencast com avatar em picture-in-picture (PiP) no canto inferior direito

### Workflow de produção
1. Acesse app.heygen.com → New Video → Avatar
2. Cole o script do vídeo desejado no campo de texto
3. Selecione o avatar e configure o fundo
4. Preview → ajuste velocidade se necessário → Generate
5. Download MP4 → upload para YouTube (unlisted) ou Synthesia Share
6. Copie a URL de embed e substitua o `data-src` no `lab-03.html`

### URLs a substituir no lab-03.html
Após gerar os vídeos, substitua nos elementos `.forge-video`:
- `data-video-id="lab03-v1"` → `data-src="URL_DO_VIDEO_1"`
- `data-video-id="lab03-v2"` → `data-src="URL_DO_VIDEO_2"`
- `data-video-id="lab03-v3"` → `data-src="URL_DO_VIDEO_3"`
