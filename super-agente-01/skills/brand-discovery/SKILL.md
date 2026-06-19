---
name: brand-discovery
description: >-
  Use quando uma marca precisa descobrir ou articular sua identidade por meio de
  entrevistas estruturadas multi-sessão. Cobre propósito, posicionamento, público,
  personalidade, voz, narrativa e tensão fundador-marca ao longo de 8 módulos
  usando laddering, 5 Porquês e técnicas projetivas. Produz uma
  sessão retomável com estado persistido em disco e um brandbook mestre (90_SYNTHESIS.md).
---

# Brand Discovery

Use esta Skill para conduzir uma entrevista de identidade de marca estruturada e adaptativa.
A meta é um `90_SYNTHESIS.md` completo — um brandbook mestre que a
organização pode usar para fazer briefings com designers, redatores e
colaboradores externos.

A entrevista corre ao longo de múltiplas sessões. Capture as respostas em disco conforme
avança, para que nenhum conhecimento extraído seja perdido quando uma conversa termina, e para que uma
sessão posterior possa retomar de onde a última parou.

## When to Activate

- Uma marca está sendo criada, reposicionada ou precisa de uma referência de identidade escrita para fazer briefings com colaboradores.
- São esperadas múltiplas sessões — a conversa se estenderá por dias ou semanas.
- Vários fundadores ou stakeholders precisam de entrevistas individuais antes de uma passagem de reconciliação.
- O usuário quer um método estruturado e repetível em vez de uma conversa ad-hoc.
- A documentação de marca existente está dispersa, implícita ou dependente do fundador e precisa ser tornada explícita.

## Protocolo de início de sessão

A cada ativação, execute estes passos **antes** de fazer qualquer pergunta
de entrevista:

1. **Verifique o progresso anterior.** Procure por um conjunto existente de arquivos de módulo
   e um checkpoint `state.json` no diretório de brand-identity do projeto.
   Se nenhum existir, este é um começo do zero — confirme o nome da marca,
   os participantes e onde salvar os arquivos de brand-identity, depois comece no
   primeiro módulo.
2. **Leia o arquivo do módulo atual** se algum estiver em andamento, e varra a seção Raw
   dele em busca de respostas capturadas anteriormente.
3. **Reporte ao usuário** em duas ou três frases: em qual módulo estamos,
   o status dele e o que falta. Depois pergunte: "Continuar aqui, ou trocar
   de módulo?"

## Disciplina de entrevista

Aplique estas regras ao longo de cada módulo:

1. **Uma pergunta de cada vez.** Nunca apresente uma lista de perguntas.
2. **Após cada resposta:** paráfrase curta → uma sondagem de aprofundamento OU encerre
   o fio se o tópico estiver saturado. Nunca prossiga em silêncio.
3. **Laddering:** para cada resposta de "o quê", siga com "Por que isso
   importa para você?" até que um valor central aflore (tipicamente duas a quatro
   iterações).
4. **5 Porquês:** para crenças ou afirmações de posicionamento — pressione até que a razão
   raiz, não a declaração de superfície, esteja na mesa.
5. **Detecte respostas rasas:** se genéricas, cheias de jargão ou vagas, peça
   um exemplo concreto, uma história de cliente ou um número.
6. **Técnicas projetivas** (use uma vez por módulo para quebrar um platô):
   - "Se a marca fosse uma pessoa, como ela entraria em uma sala?"
   - Obituário da marca: "Se a organização fechasse em cinco anos, do que os
     clientes sentiriam falta? Do que você se arrependeria de não ter dito?"
   - Contraste competitivo: "Cite um par que você admira mas no qual nunca gostaria
     de se tornar. O que especificamente o torna o modelo errado?"
7. **Sinal de saturação:** quando duas sondagens consecutivas não produzem nenhuma nova
   informação, resuma e encerre o módulo.
8. **Fim do módulo:** escreva um arquivo de módulo estruturado com duas seções:
   - `## Raw` — citações e exemplos literais.
   - `## Synthesis` — sua interpretação, três formulações candidatas,
     perguntas em aberto, contradições entre participantes.
   Depois atualize o checkpoint `state.json` (veja o Protocolo de estado abaixo).

## Sequência de módulos

| File | Label | Frameworks used |
|------|-------|-----------------|
| `10_purpose-why.md` | Purpose / Why | Sinek Golden Circle, Lencioni |
| `20_positioning.md` | Positioning | Dunford "Obviously Awesome", Moore template |
| `30_audience-niche.md` | Audience & Niche | Baker "Business of Expertise", ICP |
| `40_personality-archetype.md` | Personality & Archetype | Mark & Pearson 12 archetypes, J. Aaker 5 dims |
| `50_voice-tone.md` | Voice & Tone | Brand voice guidelines |
| `60_narrative-story.md` | Narrative / Story | Neumeier trueline, brand story arc |
| `70_founder-tension.md` | Founder Brands vs Studio Brand | Enns "Win Without Pitching" |
| `90_SYNTHESIS.md` | Master Brandbook | Kapferer prism, Aaker brand system |

Complete os módulos em ordem. Atenda a um pedido do usuário para pular módulos e anote
o salto em `state.json`.

## Protocolo de escrita de estado

Depois que cada módulo atinge a saturação ou o status concluído, escreva dois arquivos:

**Arquivo do módulo** em `modules/{moduleFile}` — conteúdo completo de Raw e Synthesis.

**`state.json`** — um checkpoint leve para que uma sessão posterior possa retomar.
Atualize `completedModules`, `inProgressModule`, `nextModule`, `lastUpdated`.
Schema:

```json
{
  "session": "{brand_name}-brand-{YYYY-MM}",
  "outputPath": "{path_to_brand_identity_directory}",
  "completedModules": [],
  "inProgressModule": "10_purpose-why.md",
  "nextModule": "20_positioning.md",
  "participants": ["founder-A"],
  "lastUpdated": "{ISO-8601}"
}
```

Após escrever, confirme: "Module X saved. State updated. Next: Y."

**Módulo terminal (90_SYNTHESIS.md):** ao escrever a síntese final,
defina `inProgressModule` como `"90_SYNTHESIS.md"` e `nextModule` como `null`
em `state.json`. Após escrever, defina `completedModules` para incluir
`"90_SYNTHESIS.md"`, depois defina `inProgressModule` como `null` — deixá-lo
preenchido faria uma retomada futura tratar o brandbook concluído
como ainda em andamento. Confirme: "Brandbook complete. All modules saved."

## Modo multi-fundador

Quando mais de um fundador participa, escreva as respostas de cada fundador em
`founders/{participant}.md` em vez dos arquivos de módulo principais. Valide o
nome `participant` antes de escrever: aceite apenas caracteres alfanuméricos e
hífens (ex.: `founder-a`, `anna`); rejeite nomes contendo separadores de caminho
(`/`, `\`, `..`) ou caracteres especiais. Valide `moduleFile` contra a
sequência enumerada de módulos (apenas 10 a 90). Valide `outputPath` para
garantir que seja um caminho absoluto dentro do diretório do projeto — rejeite caminhos relativos
e caminhos que escapam via segmentos `..`. Depois que todos os fundadores completarem um
módulo, rode uma passagem de reconciliação: resuma convergências e divergências no
arquivo do módulo, sinalize "tensões produtivas" para o workshop de alinhamento do grupo.

## Anti-Patterns

- **Começar sem ler o estado primeiro.** Toda sessão deve abrir verificando arquivos de módulo existentes e `state.json`. Pular isso perde toda a continuidade das sessões anteriores.
- **Fazer várias perguntas de uma vez.** Uma pergunta de cada vez não é opcional — listas produzem respostas de checklist, não insight real.
- **Passar para Synthesis antes da saturação.** Se as duas últimas sondagens não produziram nenhuma nova informação, o módulo está concluído. Se produziram — não está.
- **Pular a reconciliação multi-fundador.** Quando vários stakeholders estão envolvidos, as entrevistas individuais devem ser concluídas antes da reconciliação. Discutir a marca coletivamente primeiro introduz viés de ancoragem.
- **Tratar isto como uma sessão única.** Esta Skill é projetada para múltiplas sessões. Correr para o `90_SYNTHESIS.md` em uma única conversa produz um resultado superficial.

## Related Skills

- `competitive-platform-analysis` — depois que o brand-discovery estabelece o brief de posicionamento, use isto para delimitar e categorizar o conjunto de concorrentes.
- `brand-voice` (ECC) — se o módulo de voz-e-tom do brand-discovery precisar de um perfil de estilo de escrita separado, derivado de fontes.
