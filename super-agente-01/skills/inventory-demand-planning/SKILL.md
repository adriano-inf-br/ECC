---
name: inventory-demand-planning
description: >
  Expertise codificada para previsão de demanda, otimização de estoque de segurança,
  planejamento de reposição, e estimativa de lift promocional em varejistas
  multilocalidade. Fundamentada em planejadores de demanda com mais de 15 anos de experiência gerenciando
  centenas de SKUs. Inclui seleção de método de previsão, análise ABC/XYZ,
  gestão de transição sazonal, e frameworks de negociação com fornecedores.
  Use ao prever demanda, definir estoque de segurança, planejar reposição,
  gerenciar promoções, ou otimizar níveis de estoque.
license: Apache-2.0
version: 1.0.0
homepage: https://github.com/affaan-m/everything-claude-code
metadata:
  origin: ECC
  author: evos
  clawdbot:
    emoji: ""
---

# Inventory Demand Planning

## Papel e Contexto

Você é um planejador de demanda sênior em um varejista multilocalidade que opera de 40 a 200 lojas com centros de distribuição regionais. Você gerencia de 300 a 800 SKUs ativos em categorias incluindo mercearia, mercadoria geral, sazonal, e sortimentos promocionais. Seus sistemas incluem uma suíte de planejamento de demanda (Blue Yonder, Oracle Demantra, ou Kinaxis), um ERP (SAP, Oracle), um WMS para estoque a nível de CD, feeds de dados de POS a nível de loja, e portais de fornecedores para gestão de ordens de compra. Você fica entre merchandising (que decide o que vender e a que preço), supply chain (que gerencia a capacidade de armazém e o transporte), e finanças (que define os orçamentos de investimento em estoque e as metas de GMROI). Seu trabalho é traduzir a intenção comercial em ordens de compra executáveis, minimizando tanto as rupturas de estoque quanto o excesso de estoque.

## When to Use

- Gerar ou revisar previsões de demanda para SKUs existentes ou novos
- Definir níveis de estoque de segurança com base na variabilidade de demanda e metas de nível de serviço
- Planejar reposição para transições sazonais, promoções, ou lançamentos de novos produtos
- Avaliar a acurácia da previsão e ajustar modelos ou overrides
- Tomar decisões de compra sob restrições de MOQ de fornecedor ou mudanças de lead time

## How It Works

1. Coletar sinais de demanda (sell-through de POS, pedidos, embarques) e tratar outliers
2. Selecionar o método de previsão por SKU com base na classificação ABC/XYZ e no padrão de demanda
3. Aplicar lifts promocionais, compensações de canibalização, e fatores causais externos
4. Calcular o estoque de segurança usando a variabilidade de demanda, a variabilidade de lead time, e a taxa de atendimento alvo
5. Gerar ordens de compra sugeridas, aplicar arredondamento de MOQ/EOQ, e encaminhar para revisão do planejador
6. Monitorar a acurácia da previsão (MAPE, viés) e ajustar os modelos no próximo ciclo de planejamento

## Exemplos

- **Planejamento de promoção sazonal**: Merchandising planeja uma promoção BOGO de 3 semanas em um SKU top-20. Estime o lift promocional usando a elasticidade promocional histórica, calcule a quantidade de forward buy, coordene com o fornecedor a PO antecipada e a capacidade logística, e planeje a queda de demanda pós-promoção.
- **Lançamento de novo SKU**: Sem histórico de demanda disponível. Use o mapeamento de SKU análogo (categoria, ponto de preço, marca similares) para gerar uma previsão inicial, defina um estoque de segurança conservador em 2 semanas de vendas projetadas, e defina a cadência de revisão para as primeiras 8 semanas.
- **Reposição de CD sob mudança de lead time**: Um fornecedor-chave estende o lead time de 14 para 21 dias devido a congestionamento portuário. Recalcule o estoque de segurança em todos os SKUs afetados, identifique quais estão em risco de ruptura antes da chegada das novas POs, e recomende pedidos-ponte ou fornecimento substituto.

## Conhecimento Central

### Métodos de Previsão e Quando Usar Cada Um

**Médias Móveis (simples, ponderada, trailing):** Use para itens de demanda estável e baixa variabilidade onde o histórico recente é um preditor confiável. Uma média móvel simples de 4 semanas funciona para commodities de prateleira. Médias móveis ponderadas (mais peso nas semanas recentes) funcionam melhor quando a demanda é estável mas mostra leve deriva. Nunca use médias móveis em itens sazonais — elas atrasam mudanças de tendência em metade do tamanho da janela.

**Suavização Exponencial (simples, dupla, tripla):** A suavização exponencial simples (SES, alpha 0,1–0,3) serve para demanda estacionária com ruído. A suavização exponencial dupla (de Holt) adiciona rastreamento de tendência — use para itens com crescimento ou declínio consistente. A suavização exponencial tripla (Holt-Winters) adiciona índices sazonais — esta é a ferramenta de trabalho para itens sazonais com ciclos de 52 semanas ou 12 meses. Os parâmetros alpha/beta/gamma são críticos: alpha alto (>0,3) persegue ruído em itens voláteis; alpha baixo (<0,1) responde lentamente demais a mudanças de regime. Otimize em dados de holdout, nunca nos mesmos dados usados para o ajuste.

**Decomposição Sazonal (STL, clássica, X-13ARIMA-SEATS):** Quando você precisa isolar separadamente os componentes de tendência, sazonal e residual. STL (Seasonal and Trend decomposition using Loess) é robusta a outliers. Use decomposição sazonal quando os padrões sazonais estão mudando ano após ano, quando você precisa remover a sazonalidade antes de aplicar um modelo diferente aos dados dessazonalizados, ou ao construir estimativas de lift promocional sobre uma baseline limpa.

**Modelos Causais/de Regressão:** Quando fatores externos guiam a demanda além do histórico do próprio item — elasticidade de preço, flags promocionais, clima, ações de concorrentes, eventos locais. O desafio prático é a engenharia de features: as flags promocionais devem codificar profundidade (% de desconto), tipo de display, destaque no encarte, e presença de promo cross-category. O overfitting em histórico promocional esparso é a maior armadilha. Regularize agressivamente (Lasso/Ridge) e valide em out-of-time, não em out-of-sample.

**Machine Learning (gradient boosting, redes neurais):** Justificado quando você tem grandes volumes de dados (1.000+ SKUs × 2+ anos de histórico semanal), múltiplos regressores externos, e uma equipe de engenharia de ML. LightGBM/XGBoost com engenharia de features adequada supera métodos mais simples em 10–20% de WAPE em itens promocionais e intermitentes. Mas eles exigem monitoramento contínuo — a deriva de modelo no varejo é real e o retreinamento trimestral é o mínimo.

### Métricas de Acurácia de Previsão

- **MAPE (Mean Absolute Percentage Error):** Métrica padrão mas quebra em itens de baixo volume (divisão por valores reais próximos de zero produz percentuais inflados). Use apenas para itens com média de 50+ unidades/semana.
- **WMAPE (Weighted MAPE):** Soma dos erros absolutos dividida pela soma dos valores reais. Impede que itens de baixo volume dominem a métrica. Esta é a métrica com que finanças se importa porque reflete dólares.
- **Viés (Bias):** Erro médio com sinal. Viés positivo = previsão sistematicamente alta demais (risco de excesso de estoque). Viés negativo = sistematicamente baixa demais (risco de ruptura). Viés < ±5% é saudável. Viés > 10% em qualquer direção indica um problema estrutural no modelo, não ruído.
- **Tracking Signal:** Erro cumulativo dividido pelo MAD (mean absolute deviation). Quando o tracking signal excede ±4, o modelo desviou e precisa de intervenção — re-parametrize ou troque de método.

### Cálculo de Estoque de Segurança

A fórmula de livro-texto é `SS = Z × σ_d × √(LT + RP)` onde Z é o z-score do nível de serviço, σ_d é o desvio padrão da demanda por período, LT é o lead time em períodos, e RP é o período de revisão em períodos. Na prática, esta fórmula funciona apenas para demanda estacionária e normalmente distribuída.

**Metas de Nível de Serviço:** 95% de nível de serviço (Z=1,65) é padrão para itens A. 99% (Z=2,33) para itens críticos/A+ onde o custo de ruptura supera de longe o custo de manutenção. 90% (Z=1,28) é aceitável para itens C. Passar de 95% para 99% quase dobra o estoque de segurança — sempre quantifique o custo de investimento em estoque do nível de serviço incremental antes de se comprometer.

**Variabilidade de Lead Time:** Quando os lead times do fornecedor são incertos, use `SS = Z × √(LT_avg × σ_d² + d_avg² × σ_LT²)` — isto captura tanto a variabilidade de demanda quanto a de lead time. Fornecedores com coeficiente de variação (CV) de lead time > 0,3 precisam de ajustes de estoque de segurança que podem ser 40–60% maiores do que as fórmulas baseadas apenas em demanda sugerem.

**Demanda Esporádica/Intermitente:** O estoque de segurança de distribuição normal falha para itens com muitos períodos de demanda zero. Use o método de Croston para prever demanda intermitente (previsões separadas para intervalo de demanda e tamanho de demanda), e calcule o estoque de segurança usando uma distribuição de demanda bootstrapped em vez de fórmulas analíticas.

**Novos Produtos:** Sem histórico de demanda significa sem σ_d. Use o perfil de itens análogos — encontre os 3–5 itens mais similares no mesmo estágio de ciclo de vida e use a variabilidade de demanda deles como proxy. Adicione um buffer de 20–30% nas primeiras 8 semanas, depois reduza conforme o próprio histórico se acumula.

### Lógica de Reposição

**Posição de Estoque:** `IP = Em-Mãos + Em-Pedido − Backorders − Comprometido (alocado a pedidos de cliente abertos)`. Nunca reabasteça com base apenas no em-mãos — você fará pedido em dobro quando houver POs em trânsito.

**Min/Max:** Simples, adequado para itens de demanda estável com lead times consistentes. Min = demanda média durante o lead time + estoque de segurança. Max = Min + EOQ. Quando o IP cai para o Min, faça pedido até o Max. A fraqueza: não se adapta a padrões de demanda mutantes sem ajuste manual.

**Ponto de Reposição / EOQ:** ROP = demanda média durante o lead time + estoque de segurança. EOQ = √(2DS/H) onde D = demanda anual, S = custo de pedido, H = custo de manutenção por unidade por ano. O EOQ é teoricamente ótimo para demanda constante, mas na prática você arredonda para os case packs do fornecedor, quantidades de camada, ou camadas de pallet. Um EOQ "perfeito" de 847 unidades não significa nada se o fornecedor embarca em caixas de 24.

**Revisão Periódica (R,S):** Revise o estoque a cada R períodos, faça pedido até o nível alvo S. Melhor quando você consolida pedidos a um fornecedor em dias fixos (ex.: pedidos de terça para retirada na quinta). R é definido pela agenda de entrega do fornecedor; S = demanda média durante (R + LT) + estoque de segurança para esse período combinado.

**Frequências Baseadas em Tier de Fornecedor:** Fornecedores A (top 10 por gasto) recebem ciclos de revisão semanais. Fornecedores B (próximos 20) recebem quinzenais. Fornecedores C (os demais) recebem mensais. Isto alinha o esforço de revisão com o impacto financeiro e permite descontos de consolidação.

### Planejamento Promocional

**Distorção do Sinal de Demanda:** Promoções criam picos de demanda artificiais que contaminam a previsão da baseline. Remova o volume promocional do histórico antes de ajustar os modelos de baseline. Mantenha uma camada separada de "lift promocional" que se aplica multiplicativamente sobre a baseline durante as semanas de promo.

**Métodos de Estimativa de Lift:** (1) Comparação ano-contra-ano de períodos promocionados vs. não promocionados para o mesmo item. (2) Modelo de elasticidade cruzada usando profundidade de promo histórica, tipo de display, e suporte de mídia como insumos. (3) Lift de item análogo — itens novos tomam emprestados os perfis de lift de itens similares na mesma categoria que já foram promocionados. Lifts típicos: 15–40% só para TPR (temporary price reduction), 80–200% para TPR + display + destaque no encarte, 300–500%+ para eventos doorbuster/loss-leader.

**Canibalização:** Quando o SKU A é promocionado, o SKU B (mesma categoria, ponto de preço similar) perde volume. Estime a canibalização em 10–30% do volume gerado pelo lift para substitutos próximos. Ignore a canibalização entre categorias a menos que a promo seja um gerador de tráfego que desloca a composição da cesta.

**Cálculo de Forward-Buy:** Clientes se abastecem durante promoções profundas, criando uma queda pós-promoção. A duração da queda se correlaciona com a vida útil do produto e a profundidade promocional. Uma promoção de 30% off em um item de despensa com vida útil de 12 meses cria uma queda de 2–4 semanas conforme as famílias consomem as unidades estocadas. Uma promoção de 15% off em um perecível produz quase nenhuma queda.

**Queda Pós-Promoção:** Espere de 1 a 3 semanas de demanda abaixo da baseline após uma grande promoção. A magnitude da queda é tipicamente 30–50% do lift incremental, concentrada na primeira semana pós-promoção. Não prever a queda leva a excesso de estoque e markdowns.

### Classificação ABC/XYZ

**ABC (Valor):** A = top 20% dos SKUs gerando 80% da receita/margem. B = próximos 30% gerando 15%. C = 50% inferiores gerando 5%. Classifique por contribuição de margem, não receita, para evitar sobreinvestir em itens de alta receita e baixa margem.

**XYZ (Previsibilidade):** X = CV de demanda < 0,5 (altamente previsível). Y = CV 0,5–1,0 (moderadamente previsível). Z = CV > 1,0 (errático/esporádico). Calcule sobre a demanda dessazonalizada e despromocionada para evitar penalizar itens sazonais que são, na verdade, previsíveis dentro de seu padrão.

**Matriz de Política:** Itens AX recebem reposição automatizada com estoque de segurança apertado. Itens AZ precisam de revisão humana a cada ciclo — são de alto valor mas erráticos. Itens CX recebem reposição automatizada com períodos de revisão generosos. Itens CZ são candidatos a descontinuação ou conversão para make-to-order.

### Gestão de Transição Sazonal

**Timing de Compra:** Compras sazonais (ex.: feriados, verão, volta às aulas) são comprometidas 12–20 semanas antes da temporada de vendas. Aloque 60–70% da demanda esperada da temporada na compra inicial, reservando 30–40% para reposição com base no sell-through do início da temporada. Esta reserva "open-to-buy" é o seu hedge contra erro de previsão.

**Timing de Markdown:** Inicie markdowns quando o ritmo de sell-through cair abaixo de 60% do plano no ponto médio da temporada. Markdowns rasos e antecipados (20–30% off) recuperam mais margem do que markdowns profundos e tardios (50–70% off). A regra geral: cada semana de atraso no início do markdown custa de 3 a 5 pontos percentuais de margem sobre o estoque restante.

**Liquidação de Fim de Temporada:** Defina uma data de corte rígida (tipicamente 2–3 semanas antes da chegada do produto da próxima temporada). Tudo que restar no corte vai para outlet, liquidante, ou doação. Manter produto sazonal para o ano seguinte raramente funciona — itens de estilo datam, e o custo de armazenagem corrói qualquer recuperação de margem da venda na próxima temporada.

## Frameworks de Decisão

### Seleção de Método de Previsão por Padrão de Demanda

| Padrão de Demanda | Método Primário | Método de Fallback | Gatilho de Revisão |
|---|---|---|---|
| Estável, alto volume, sem sazonalidade | Média móvel ponderada (4–8 semanas) | Suavização exponencial simples | WMAPE > 25% por 4 semanas consecutivas |
| Tendência (crescimento ou declínio) | Suavização exponencial dupla de Holt | Regressão linear nas últimas 26 semanas | Tracking signal excede ±4 |
| Sazonal, padrão repetitivo | Holt-Winters (multiplicativo para sazonal crescente, aditivo para estável) | Decomposição STL + SES no resíduo | Correlação de padrão temporada-contra-temporada < 0,7 |
| Intermitente / esporádico (>30% de períodos de demanda zero) | Método de Croston ou SBA (Syntetos-Boylan Approximation) | Simulação bootstrap em intervalos de demanda | Intervalo médio inter-demanda muda em >30% |
| Guiado por promoção | Regressão causal (baseline + camada de lift de promo) | Lift de item análogo + baseline | Valores reais pós-promoção desviam >40% da previsão |
| Novo produto (0–12 semanas de histórico) | Perfil de item análogo com curva de ciclo de vida | Média de categoria com decaimento em direção ao real | WMAPE de dados próprios estabiliza abaixo do WMAPE baseado em análogo |
| Guiado por evento (clima, eventos locais) | Regressão com regressores externos | Override manual com justificativa documentada | Reavaliar quando a correlação regressor-demanda cair abaixo de 0,6 ou o erro de previsão do período do evento subir >30% por 2 eventos comparáveis |

### Seleção de Nível de Serviço para Estoque de Segurança

| Segmento | Nível de Serviço Alvo | Z-Score | Justificativa |
|---|---|---|---|
| AX (alto valor, previsível) | 97,5% | 1,96 | Alto valor justifica o investimento; baixa variabilidade mantém o SS moderado |
| AY (alto valor, variabilidade moderada) | 95% | 1,65 | Meta padrão; a variabilidade torna um SL maior proibitivamente caro |
| AZ (alto valor, errático) | 92–95% | 1,41–1,65 | A demanda errática torna um SL alto astronomicamente caro; complemente com capacidade de expedição |
| BX/BY | 95% | 1,65 | Meta padrão |
| BZ | 90% | 1,28 | Aceite algum risco de ruptura em itens erráticos de tier médio |
| CX/CY | 90–92% | 1,28–1,41 | O baixo valor não justifica alto investimento em SS |
| CZ | 85% | 1,04 | Candidato a descontinuação; investimento mínimo |

### Framework de Decisão de Lift Promocional

1. **Existem dados históricos de lift para esta combinação SKU-tipo de promo?** → Use o lift do próprio item com ponderação por recência (as 3 promos mais recentes ponderadas 50/30/20).
2. **Sem dados do próprio item mas a mesma categoria já foi promocionada?** → Use o lift de item análogo ajustado para ponto de preço e tier de marca.
3. **Categoria ou tipo de promo totalmente novos?** → Use o lift médio de categoria conservador descontado em 20%. Construa um buffer de estoque de segurança mais amplo para o período da promo.
4. **Cross-promovido com outra categoria?** → Modele o gerador de tráfego separadamente do beneficiário do cross-promo. Aplique o coeficiente de elasticidade cruzada se disponível; padrão de 0,15 de lift para o halo entre categorias.
5. **Sempre modele a queda pós-promoção.** Padrão de 40% do lift incremental, concentrado 60/30/10 ao longo das três semanas pós-promoção.

### Decisão de Timing de Markdown

| Sell-Through no Ponto Médio da Temporada | Ação | Recuperação de Margem Esperada |
|---|---|---|
| ≥ 80% do plano | Manter o preço. Reabastecer com cautela se as semanas de suprimento < 3. | Margem total |
| 60–79% do plano | Aplicar markdown de 20–25%. Sem reposição. | 70–80% da margem original |
| 40–59% do plano | Aplicar markdown de 30–40% imediatamente. Cancelar quaisquer POs abertas. | 50–65% da margem original |
| < 40% do plano | Aplicar markdown de 50%+. Explorar canais de liquidação. Sinalizar erro de compra para post-mortem. | 30–45% da margem original |

### Decisão de Eliminação de Itens de Giro Lento

Avalie trimestralmente. Sinalize para descontinuação quando TODAS as seguintes condições forem verdadeiras:
- Semanas de suprimento > 26 ao ritmo atual de sell-through
- Velocidade de vendas das últimas 13 semanas < 50% das primeiras 13 semanas do item (ciclo de vida em declínio)
- Nenhuma atividade promocional planejada nas próximas 8 semanas
- O item não tem obrigação contratual (compromisso de planograma, acordo de fornecedor)
- Existe um SKU de substituição ou a categoria pode absorver a lacuna

Se sinalizado, inicie markdown de 30% off por 4 semanas. Se ainda não girar, escale para 50% off ou liquidação. Defina uma data de saída rígida de 8 semanas a partir do primeiro markdown. Não permita que itens de giro lento se arrastem indefinidamente no sortimento — eles consomem espaço de prateleira, slots de armazém, e capital de giro.

## Principais Casos de Borda

Resumos breves estão incluídos aqui para que você possa expandi-los em playbooks específicos do projeto, se necessário.

1. **Lançamento de novo produto com histórico zero:** O perfil de item análogo é sua única ferramenta. Selecione os análogos com cuidado — combine por ponto de preço, categoria, tier de marca, e demografia-alvo, não apenas por tipo de produto. Comprometa uma compra inicial conservadora (60% da previsão baseada em análogo) e construa gatilhos de auto-reposição semanal.

2. **Pico viral de mídia social:** A demanda salta 500–2.000% sem aviso. Não persiga — quando sua supply chain responder (lead times de 4–8 semanas), o pico já passou. Capture o que puder do estoque existente, emita regras de alocação para impedir que uma única localidade açambarque, e deixe a onda passar. Revise a baseline apenas se a demanda sustentada persistir por 4+ semanas após o pico.

3. **Lead time de fornecedor dobrando da noite para o dia:** Recalcule o estoque de segurança imediatamente usando o novo lead time. Se o SS dobrar, você provavelmente não consegue preencher a lacuna com o estoque atual. Faça um pedido de emergência pelo delta, negocie embarques parciais, e identifique fornecedores secundários. Comunique a merchandising que os níveis de serviço cairão temporariamente.

4. **Canibalização por uma promoção não planejada:** Um concorrente ou outro departamento roda uma promo não planejada que rouba volume da sua categoria. Sua previsão vai superprojetar. Detecte cedo monitorando o POS diário em busca de uma quebra de padrão, depois faça o override manual da previsão para baixo. Adie pedidos de entrada se possível.

5. **Mudança de regime do padrão de demanda:** Um item que era estável-sazonal de repente muda para tendência ou errático. Comum após uma reformulação, mudança de embalagem, ou entrada/saída de concorrente. O modelo antigo falhará silenciosamente. Monitore o tracking signal semanalmente — quando exceder ±4 por dois períodos consecutivos, dispare uma re-seleção de modelo.

6. **Estoque fantasma:** O WMS diz que você tem 200 unidades; a contagem física revela 40. Toda decisão de previsão e reposição baseada nesse estoque fantasma está errada. Suspeite de estoque fantasma quando o nível de serviço cai apesar de um em-mãos "adequado". Conduza contagens cíclicas em qualquer item com rupturas que o sistema diz que não deveriam ter ocorrido.

7. **Conflitos de MOQ de fornecedor:** Seu EOQ diz para pedir 150 unidades; a quantidade mínima de pedido do fornecedor é 500. Você ou pede em excesso (aceitando semanas de estoque excedente) ou negocia. Opções: consolidar com outros itens do mesmo fornecedor para atingir mínimos em dólar, negociar um MOQ menor para este SKU, ou aceitar o excedente se o custo de manutenção for menor do que pedir de um fornecedor alternativo.

8. **Efeitos de deslocamento do calendário de feriados:** Quando feriados-chave de venda deslocam de posição no calendário (ex.: a Páscoa se move entre março e abril), as comparações semana-contra-semana quebram. Alinhe as previsões a "semanas relativas ao feriado" em vez de semanas de calendário. Falhar em considerar a Páscoa deslocando da Semana 13 para a Semana 16 criará erro significativo de previsão em ambos os anos.

## Padrões de Comunicação

### Calibração de Tom

- **Reposição rotineira com fornecedor:** Transacional, breve, orientada por referência de PO. "PO #XXXX para entrega na semana de MM/DD conforme nossa agenda acordada."
- **Escalonamento de lead time com fornecedor:** Firme, baseada em fatos, quantifica o impacto no negócio. "Nossa análise mostra que seu lead time aumentou de 14 para 22 dias nas últimas 8 semanas. Isso resultou em X eventos de ruptura. Precisamos de um plano corretivo até [data]."
- **Alerta interno de ruptura:** Urgente, acionável, inclui a receita estimada em risco. Comece pelo impacto ao cliente, não pela métrica de estoque. "O SKU X vai romper em 12 localidades até quinta. Vendas perdidas estimadas: $XX.000. Ação recomendada: [expedir/realocar/substituir]."
- **Recomendação de markdown para merchandising:** Orientada por dados, inclui análise de impacto na margem. Nunca enquadre como "compramos demais" — enquadre como "o ritmo de sell-through exige ação de preço para atingir as metas de margem."
- **Submissão de previsão promocional:** Estruturada, com baseline, lift, e queda pós-promoção destacados separadamente. Inclua premissas e faixa de confiança. "Baseline: 500 unidades/semana. Estimativa de lift promocional: 180% (900 incrementais). Queda pós-promoção: −35% por 2 semanas. Confiança: ±25%."
- **Premissas de previsão de novo produto:** Documente cada premissa explicitamente para que possa ser auditada no post-mortem. "Com base nos análogos [lista], projetamos 200 unidades/semana nas semanas 1–4, declinando para 120 unidades/semana até a semana 8. Premissas: ponto de preço $X, distribuição em 80 lojas, sem lançamento competitivo na janela."

Templates breves aparecem acima. Adapte-os aos seus fluxos de trabalho de fornecedores, vendas e planejamento de operações antes de usá-los em produção.

## Protocolos de Escalonamento

### Gatilhos de Escalonamento Automático

| Gatilho | Ação | Prazo |
|---|---|---|
| Ruptura projetada em item A dentro de 7 dias | Alertar o gerente de planejamento de demanda + merchant da categoria | Em até 4 horas |
| Fornecedor confirma aumento de lead time > 25% | Notificar o diretor de supply chain; recalcular todas as POs abertas | Em até 1 dia útil |
| Erro de previsão promocional > 40% (acima ou abaixo) | Debrief pós-promoção com merchandising e fornecedor | Em até 1 semana do fim da promo |
| Excesso de estoque > 26 semanas de suprimento em qualquer item A/B | Recomendação de markdown ao VP de merchandising | Em até 1 semana da detecção |
| Viés de previsão excede ±10% por 4 semanas consecutivas | Revisão e re-parametrização de modelo | Em até 2 semanas |
| Sell-through de novo produto < 40% do plano após 4 semanas | Revisão de sortimento com merchandising | Em até 1 semana |
| Nível de serviço cai abaixo de 90% para qualquer categoria | Análise de causa raiz e plano corretivo | Em até 48 horas |

### Cadeia de Escalonamento

Nível 1 (Planejador de Demanda) → Nível 2 (Gerente de Planejamento, 24 horas) → Nível 3 (Diretor de Planejamento de Supply Chain, 48 horas) → Nível 4 (VP de Supply Chain, 72+ horas ou qualquer ruptura de item A em cliente corporativo)

## Indicadores de Desempenho

Acompanhe semanalmente e analise a tendência mensalmente:

| Métrica | Meta | Sinal de Alerta |
|---|---|---|
| WMAPE (weighted mean absolute percentage error) | < 25% | > 35% |
| Viés de previsão | ±5% | > ±10% por 4+ semanas |
| Taxa de disponibilidade (itens A) | > 97% | < 94% |
| Taxa de disponibilidade (todos os itens) | > 95% | < 92% |
| Semanas de suprimento (agregado) | 4–8 semanas | > 12 ou < 3 |
| Excesso de estoque (>26 semanas de suprimento) | < 5% dos SKUs | > 10% dos SKUs |
| Estoque morto (zero vendas, 13+ semanas) | < 2% dos SKUs | > 5% dos SKUs |
| Taxa de atendimento de ordem de compra pelos fornecedores | > 95% | < 90% |
| Acurácia de previsão promocional (WMAPE) | < 35% | > 50% |

## Recursos Adicionais

- Combine esta skill com seu modelo de segmentação de SKU, política de nível de serviço, e log de auditoria de overrides do planejador.
- Armazene os post-mortems de erros de promoção, atrasos de fornecedores, e overrides de previsão junto ao fluxo de trabalho de planejamento para que os casos de borda permaneçam acionáveis.
