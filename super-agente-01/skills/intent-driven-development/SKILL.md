---
name: intent-driven-development
description: Transforma mudanças ambíguas ou de alto impacto de produto e engenharia em critérios de aceitação delimitados e verificáveis antes ou junto com a implementação. Use quando um usuário pedir para esclarecer uma feature, definir critérios de aceitação, reduzir o risco de uma mudança de segurança/dados/migração/integração, preparar requisitos de implementação para outro agente, ou tornar testável uma solicitação complexa. Não dispare para edições triviais, correções diretas, depuração ativa, revisão de código, ou solicitações de implementação cujas condições de aceitação já estejam claras, a menos que o usuário invoque explicitamente esta skill.
---

# Intent-Driven Development

Produz critérios de aceitação úteis sem transformar a especificação em cerimônia. Inspecione
o contexto disponível primeiro, exponha a ambiguidade genuína, e escolha métodos de verificação que se ajustem
ao trabalho e ao seu risco.

## Quando Ativar

- O usuário pede para esclarecer uma feature, definir critérios de aceitação, ou reduzir o risco de uma mudança antes da implementação
- A solicitação toca segurança, autenticação, dados persistentes, migrações, APIs externas ou conformidade
- O usuário quer preparar um artefato de handoff para outro agente ou equipe
- A solicitação é ambígua o bastante para que o resultado esperado ainda não seja observável ou testável
- O usuário invoca explicitamente esta skill com `/intent-driven-development`

Não ative para edições triviais, correções diretas de uma linha, sessões de depuração ativa,
solicitações de revisão de código, ou solicitações de implementação cujas condições de aceitação já estejam claras.

## Como Funciona

1. **Inspecione o contexto primeiro** — lê o repositório, docs, schemas e infraestrutura de testes em busca de fatos técnicos antes de fazer qualquer pergunta, ao mesmo tempo em que trata as restrições de produto/negócio como algo que só o usuário ou um artefato de produto pode fornecer
2. **Escolha a profundidade** — seleciona Captura Rápida (3-7 critérios, risco baixo/moderado) ou Briefing de Aceitação Completo (mudanças de segurança, dados, migração, entre sistemas) com base no perfil de risco
3. **Pergunte o mínimo** — só faz perguntas cujas respostas não podem ser inferidas e que alterem materialmente o escopo ou o comportamento
4. **Escreva critérios observáveis** — cada AC-NNN descreve uma condição inicial, um gatilho, um resultado esperado, um efeito colateral proibido, um método de verificação e uma prioridade; nenhuma palavra vaga como "corretamente" ou "com segurança" sem evidência
5. **Prossiga ou faça o handoff** — para solicitações claras sem riscos bloqueadores, registra os critérios e continua; para mudanças arriscadas, apresenta os bloqueadores e aguarda confirmação
6. **Lide com revisão** — se um AC falha no meio da implementação por restrições arquiteturais, marca-o como `[revised]`, atualiza o escopo ou o método de verificação, incrementa o número da revisão, e reapresenta apenas os critérios alterados

## Exemplos

**Captura Rápida — "Adicionar exportação CSV ao dashboard"**

```
Objetivo: Usuários autenticados podem baixar os dados do dashboard como um arquivo CSV.
No escopo: Exportação das linhas atualmente filtradas; o nome do arquivo inclui a data.
Fora do escopo: Exportações agendadas, entrega por e-mail, formato Excel.
Premissas: A contagem máxima de linhas é abaixo de 10k; nenhum PII nos campos exportados.

AC-001: A exportação gera o arquivo com os cabeçalhos corretos
- Cenário: usuário autenticado, ao menos uma linha de dados visível
- Ação: clicar em "Export CSV"
- Esperado: o navegador baixa o arquivo com as colunas [id, name, created_at]
- Não deve: expor campos internos ou linhas pertencentes a outros usuários
- Verificação: teste de integração automatizado + verificação manual pontual do schema
- Prioridade: Obrigatório
```

**Gatilho de Briefing de Aceitação Completo — "Migrar a autenticação de usuário para OAuth"**

Mudança de autenticação + dependência externa + dados de sessão existentes → Briefing Completo com tabela de Revisão de Risco,
decisões bloqueadoras sobre a estratégia de invalidação de sessão, e um AC explícito de rollback.

**Revisão de especificação existente — o usuário cola um PRD**

A skill o revisa em busca de limites de escopo ausentes, requisitos não verificáveis ("o sistema deve ser rápido"),
e premissas silenciosas, depois retorna critérios corrigidos ou complementares sem reiniciar a descoberta.

## Regras de Operação

1. Inspecione o repositório, a documentação, a issue, o design e o contexto de testes disponíveis antes de
   pedir fatos técnicos que possam ser descobertos localmente.
2. Não infira restrições de produto ou negócio a partir do código. Regras de negócio, obrigações de conformidade e
   regulatórias, SLAs contratuais, precificação, política de retenção de dados, priorização,
   e usuários-alvo não podem ser lidos de um repositório. Trate-os como desconhecidos até que o usuário
   os forneça ou um artefato de produto autoritativo (PRD, contrato, documento de política) os declare.
   Registre-os como premissas sinalizadas para confirmação, nunca como fatos descobertos. O
   repositório lhe diz como o sistema se comporta hoje, não o que o negócio exige que ele faça.
3. Faça apenas perguntas cujas respostas sejam necessárias e não possam ser inferidas com segurança. Agrupe perguntas curtas
   e relacionadas quando isso poupar turnos desnecessários.
4. Não bloqueie a implementação por padrão. Quando o usuário pediu para implementar uma mudança suficientemente
   clara, registre brevemente as premissas-chave e os critérios de aceitação, depois prossiga ou os entregue
   ao fluxo de trabalho de implementação.
5. Exija confirmação explícita do usuário antes de prosseguir apenas quando uma decisão não resolvida possa
   criar exposição material de segurança, perda de dados, migração irreversível, quebra contratual/de API,
   custo significativo, ou ação externa destrutiva.
6. Não escreva um documento de aceitação em um repositório, não altere arquivos do projeto, não crie um branch,
   não faça commit, nem invoque outra skill, a menos que o usuário solicite ou o fluxo de trabalho ativo
   do repositório exija explicitamente.
7. Trate testes automatizados como evidência, não como verdade. Prefira a automação quando confiável e
   proporcional; permita verificação manual de UX, acessibilidade, segurança, jurídica ou operacional
   onde a automação não puder estabelecer o resultado.
8. Nunca inclua segredos reais, credenciais, tokens, chaves privadas, dados pessoais, ou payloads
   sensíveis de produção em critérios de aceitação, fixtures, exemplos ou artefatos salvos. Use
   valores redigidos ou sintéticos.
9. Não execute testes destrutivos, migrações, sondagens de segurança, testes de carga, chamadas externas pagas,
   ou operações contra dados de produção/ativos sem autorização explícita e um ambiente
   seguro identificado.
10. Quando um critério de aceitação não puder ser satisfeito devido a uma restrição arquitetural, de plataforma ou
   externa descoberta durante a implementação, não o descarte ou contorne silenciosamente.
   Atualize o critério afetado (marque-o `[revised]`, declare a restrição, e ajuste o escopo ou o
   método de verificação), incremente o número da revisão, e reapresente apenas os critérios alterados
   ao usuário antes de continuar. Exija confirmação explícita apenas se a revisão alterar uma
   decisão bloqueadora ou reduzir materialmente as garantias de segurança ou correção.

## Escolha a Profundidade

Use a menor saída útil.

### Captura Rápida

Use para uma mudança clara mas não trivial com risco baixo ou moderado. Produza:

- Objetivo
- No escopo / fora do escopo
- Premissas
- 3-7 critérios de aceitação com métodos de verificação
- Perguntas bloqueadoras, se houver

Não atrase a implementação para aprovação a menos que exista um risco bloqueador das regras de operação
ou o usuário tenha pedido especificamente uma especificação primeiro.

### Briefing de Aceitação Completo

Use para mudanças ambíguas, entre sistemas, sensíveis à segurança, que alteram dados, de migração, de conformidade,
ou de alto custo, ou quando o usuário solicitar um artefato de handoff. Produza o template completo
abaixo e solicite confirmação para decisões bloqueadoras não resolvidas antes da implementação arriscada.

### Revisão de Especificação Existente

Quando o usuário já forneceu um PRD, issue, plano ou critérios de aceitação:

1. Revise-o em vez de reiniciar a descoberta.
2. Identifique limites de escopo ausentes, premissas inseguras, contradições e requisitos
   não verificáveis.
3. Retorne critérios corrigidos ou complementares.

## Fluxo de trabalho

### 1. Estabeleça o Objetivo e o Risco

Extraia ou pergunte:

- O resultado observável para o usuário ou o sistema.
- Os atores afetados.
- A principal consequência de falha.
- Dimensões de risco que de fato se aplicam: segurança/privacidade, dados persistentes, compatibilidade/API,
  migração, dependências externas, custo, concorrência, desempenho, usabilidade/acessibilidade.

Evite fazer perguntas genéricas sobre riscos irrelevantes.

### 2. Descubra o Contexto

Quando artefatos locais ou conectados estiverem disponíveis, inspecione apenas o necessário:

- Comportamento existente e arquivos ou interfaces diretamente relacionados.
- Convenções do repositório, docs de produto, contratos de API, schemas de dados, ou histórico de migração.
- Infraestrutura de verificação existente e comandos realistas.
- Dependências externas e se elas são testáveis isoladamente.

Registre os fatos descobertos separadamente das premissas fornecidas pelo usuário. Se o contexto não puder ser
inspecionado, diga o que é desconhecido e faça perguntas focadas.

O repositório revela fatos técnicos — como o sistema se comporta hoje, suas convenções, e
seus contratos. Ele não revela restrições de produto ou negócio: regras de negócio, obrigações de conformidade
e regulatórias, SLAs contratuais, precificação, política de retenção de dados, priorização,
e usuários-alvo. Nunca reconstrua isso a partir do código ou da nomenclatura. Capture-as apenas do usuário
ou de um artefato de produto autoritativo, e liste-as como premissas a confirmar até então.

### 3. Defina o Escopo

Declare:

- Objetivo: uma frase descrevendo o resultado pretendido.
- No escopo: o comportamento que esta mudança deve entregar.
- Fora do escopo: trabalho adjacente tentador explicitamente excluído.
- Premissas: afirmações ainda não comprovadas.
- Decisões bloqueadoras: escolhas não resolvidas que afetam materialmente a segurança ou o comportamento.

### 4. Escreva os Critérios de Aceitação

Use `AC-001`, `AC-002`, e assim por diante. Cada critério deve descrever comportamento observável e um
método de verificação apropriado; critérios e testes não precisam mapear um-para-um.

Para cada critério aplicável, inclua:

- Cenário ou condição inicial.
- Ação ou gatilho.
- Comportamento observável esperado.
- Efeito colateral proibido quando relevante.
- Método de verificação: teste automatizado, verificação de integração, revisão manual de UX, verificação de
  acessibilidade, revisão de segurança, verificação operacional, ou aceitação de stakeholder.
- Restrição de ambiente/segurança quando a verificação puder afetar dados, serviços, custo ou segredos.
- Prioridade: obrigatório, importante ou opcional.

Não use palavras como "corretamente", "com segurança", "rápido", "intuitivo" ou "robusto" sem
definir evidência observável ou registrá-las como um julgamento de revisão humana.

### 5. Cubra Apenas os Limites Relevantes

Considere estas categorias, mas inclua apenas as categorias que se aplicam:

| Categoria | Inclua quando | Evidência típica |
| --- | --- | --- |
| Caminho feliz | Comportamento novo ou alterado visível ao usuário | Fluxo de trabalho ou transição de estado bem-sucedida |
| Validação | A mudança aceita entrada | Valor malformado ou de limite rejeitado sem mutação |
| Autorização/privacidade | Dados ou ações têm limites de acesso | Acesso negado e nenhuma divulgação sensível |
| Persistência/migração | Dados armazenados ou schemas mudam | Leitura retrocompatível, migração, rollback ou backup |
| Compatibilidade | APIs públicas, arquivos, eventos ou clientes podem quebrar | Contrato ou fixture existente permanece válido |
| Recuperação de falha | Existe falha de rede, serviço ou assíncrona | Nenhum estado parcial ou comportamento claro de retry/degradação |
| Idempotência/concorrência | Repetições ou escritas simultâneas são plausíveis | Nenhum efeito colateral duplicado ou estado final inválido |
| Desempenho | Um limiar de usuário ou serviço importa | Condições de medição e limiar definidos |
| UX/acessibilidade | Uma pessoa interage com o resultado | Teclado, feedback, recuperação de erro, revisão visual/manual |

### 6. Apresente e Continue

- Para uma solicitação de esclarecimento/especificação, apresente o briefing e peça decisões apenas sobre os
  bloqueadores listados.
- Para uma solicitação de implementação sem bloqueador, apresente um resumo compacto dos critérios como parte do
  trabalho e continue com a implementação.
- Para handoff a outro agente ou equipe, inclua contexto e detalhe de verificação suficientes para que eles
  ajam sem inventar requisitos.
- Salve o briefing em um arquivo apenas quando solicitado. Use um caminho aprovado pelo repositório quando houver;
  caso contrário, peça ou declare o destino escolhido antes de escrever.

## Template de Saída

Use este template para um Briefing de Aceitação Completo. Omita as seções irrelevantes para a Captura Rápida.

```markdown
# Briefing de Aceitação: <Nome da Mudança>

**Status:** Rascunho | Aprovado | Implementado | Verificado
**Revisão:** <número>
**Preparado para:** <usuário/equipe/agente, quando conhecido>
**Aprovação necessária antes de trabalho arriscado:** Sim | Não - <motivo>

## Log de Revisão

| Rev | Data | Critérios alterados | Motivo |
| --- | --- | --- | --- |
| 1 | <data> | — | Rascunho inicial |

## Objetivo

<Uma frase de resultado observável.>

## Escopo

**No escopo**
- <comportamento incluído>

**Fora do escopo**
- <trabalho adjacente excluído>

## Contexto

**Fatos descobertos** (técnicos, verificados a partir do repositório ou artefato)
- <como o sistema se comporta hoje, convenções, contratos>

**Restrições de produto/negócio** (fornecidas pelo usuário ou artefato de produto, nunca inferidas do código)
- <regra de negócio, obrigação de conformidade/SLA, política de retenção, prioridade, usuário-alvo — ou "nenhuma fornecida ainda">

**Premissas**
- <afirmação não verificada a confirmar ou validar>

**Dependências e restrições**
- <serviço externo, convenção local, obrigação de compatibilidade, limite de ambiente>

## Revisão de Risco

| Área de risco | Aplica-se? | Tratamento necessário |
| --- | --- | --- |
| Segurança/privacidade | Sim/Não | <redação, autorização, revisão, etc.> |
| Dados persistentes/migração | Sim/Não | <compatibilidade, backup, rollback, etc.> |
| Efeitos externos/custo | Sim/Não | <sandbox/ambiente de teste/autorização> |
| Compatibilidade/API | Sim/Não | <contrato a preservar ou versionar> |
| UX/acessibilidade | Sim/Não | <evidência manual ou automatizada> |

## Critérios de Aceitação

### AC-001: <comportamento observável>
- **Cenário:** <condição inicial>
- **Ação:** <gatilho único>
- **Esperado:** <resultado observável>
- **Não deve:** <efeito colateral proibido, se aplicável>
- **Verificação:** <método e evidência pretendida>
- **Ambiente/segurança:** <restrições, se aplicável>
- **Prioridade:** Obrigatório | Importante | Opcional

## Decisões Bloqueadoras

- [ ] <apenas decisões que impedem o progresso seguro ou correto>

## Plano de Verificação

| Critério | Evidência de verificação | Status |
| --- | --- | --- |
| AC-001 | <comando de teste/verificação/revisão ou tipo de evidência> | Pendente |
```

## Exemplos de Aprovação/Reprovação

Use estes para julgar se a skill de fato produziu um briefing verificável, não prosa de planejamento.

**Um critério de aceitação reprovado**

```
AC-001: A exportação funciona corretamente e é segura.
```

Reprova — "funciona corretamente" e "segura" não são observáveis, não há cenário, gatilho,
resultado esperado, ou método de verificação, e nada declara o que não deve acontecer. Um leitor
não consegue dizer se a implementação o satisfez.

**Um critério de aceitação aprovado**

```
AC-001: A exportação gera o arquivo com os cabeçalhos corretos
- Cenário: usuário autenticado, ao menos uma linha de dados visível
- Ação: clicar em "Export CSV"
- Esperado: o navegador baixa o arquivo com as colunas [id, name, created_at]
- Não deve: expor campos internos ou linhas pertencentes a outros usuários
- Verificação: teste de integração automatizado + verificação manual pontual do schema
- Prioridade: Obrigatório
```

Aprova — um resultado observável concreto, um efeito colateral proibido, e um método de verificação
nomeado. Duas pessoas concordariam se foi atendido.

**Uma entrada de contexto reprovada**

```
Fatos descobertos: Usuários do plano gratuito são limitados a 100 exportações por mês.
```

Reprova — um limite por plano é uma regra de negócio. Não deve aparecer sob fatos descobertos inferidos
do código; pertence a Restrições de produto/negócio, fornecida pelo usuário, ou ser listada como
uma premissa a confirmar.

### Rubrica de Aprovação/Reprovação

Um briefing só passa se cada resposta for "sim". Qualquer "não" significa revisar antes de retorná-lo.

- [ ] Todo critério obrigatório tem um cenário, um resultado esperado observável, e um método de verificação nomeado?
- [ ] Todos os termos vagos ("corretamente", "seguro", "rápido", "robusto") foram substituídos por evidência observável ou marcados como julgamento humano?
- [ ] As restrições de produto/negócio estão listadas como fornecidas/presumidas, sem nenhuma inferida silenciosamente do código?
- [ ] O escopo é explícito, com os itens fora do escopo nomeados?
- [ ] As decisões bloqueadoras estão limitadas a escolhas que de fato afetam segurança ou correção, não preferências?

## Verificação de Qualidade

Antes de retornar o briefing, verifique:

- O objetivo descreve um resultado em vez de uma escolha de implementação.
- Os limites de escopo e as premissas são explícitos.
- Todo critério obrigatório é observável ou claramente marcado para julgamento humano.
- Os riscos de segurança, privacidade, dados, compatibilidade, efeito externo e UX foram considerados apenas
  onde relevantes e não ignorados silenciosamente.
- Os métodos de verificação identificam ambientes seguros para operações arriscadas.
- Nenhuma informação secreta ou sensível de produção foi copiada para a saída.
- Nenhuma mutação de repositório ou bloqueio de implementação é imposto sem justificativa ou solicitação.

## Handoff

Quando outro fluxo de trabalho de planejamento ou implementação estiver disponível, passe o briefing de aceitação ou
os IDs dos critérios a ele. Quando não existir um fluxo de trabalho dedicado, forneça o briefing diretamente como
referência de implementação. Não presuma que qualquer skill ou ferramenta nomeada esteja instalada.
