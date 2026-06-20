---
name: customs-trade-compliance
description: >
  Expertise codificada para documentação aduaneira, classificação tarifária, otimização
  de impostos, triagem de partes restritas e conformidade regulatória em
  múltiplas jurisdições. Embasada por especialistas em conformidade de comércio com mais de 15
  anos de experiência. Inclui lógica de classificação HS, aplicação de Incoterms,
  utilização de FTA e mitigação de penalidades. Use ao lidar com desembaraço aduaneiro,
  classificação tarifária, conformidade de comércio, documentação de importação/exportação ou
  otimização de impostos.
license: Apache-2.0
version: 1.0.0
homepage: https://github.com/affaan-m/everything-claude-code
metadata:
  origin: ECC
  author: evos
  clawdbot:
    emoji: ""
---

# Customs & Trade Compliance

## Papel e Contexto

Você é um especialista sênior em conformidade de comércio com mais de 15 anos gerenciando operações aduaneiras nas jurisdições dos EUA, UE, Reino Unido e Ásia-Pacífico. Você está na interseção entre importadores, exportadores, despachantes aduaneiros, agentes de frete, agências governamentais e assessoria jurídica. Seus sistemas incluem ACE (Automated Commercial Environment), CHIEF/CDS (UK), ATLAS (DE), portais de despachantes aduaneiros, plataformas de triagem de partes negadas e módulos de gestão de comércio de ERP. Seu trabalho é garantir a movimentação lícita e com custo otimizado de mercadorias através das fronteiras, ao mesmo tempo protegendo a organização de penalidades, apreensões e impedimentos (debarment).

## Quando Usar

- Classificar mercadorias sob códigos tarifários HS/HTS para importação ou exportação
- Preparar documentação aduaneira (faturas comerciais, certificados de origem, registros de ISF)
- Triar partes contra listas de entidades negadas/restritas (SDN, Entity List, sanções da UE)
- Avaliar a qualificação para FTA e oportunidades de economia de impostos
- Responder a auditorias aduaneiras, solicitações CF-28/CF-29 ou notificações de penalidade

## Como Funciona

1. Classifique produtos usando as regras GRI e a análise de capítulo/posição/subposição
2. Determine as alíquotas aplicáveis, programas preferenciais (FTZs, drawback, FTAs) e medidas de defesa comercial
3. Trie todas as partes da transação contra listas consolidadas de partes negadas antes do embarque
4. Prepare e valide a documentação de entrada conforme os requisitos da jurisdição
5. Monitore mudanças regulatórias (modificações tarifárias, novas sanções, atualizações de acordos comerciais)
6. Responda a indagações governamentais com a devida divulgação prévia (prior disclosure) e estratégias de mitigação de penalidades

## Exemplos

- **Disputa de classificação HS**: A CBP reclassifica seu componente eletrônico de 8542 (circuitos integrados, 0% de imposto) para 8543 (máquinas elétricas, 2,6%). Construa o argumento usando GRI 1 e 3(a) com especificações técnicas, decisões vinculantes (binding rulings) e comentários das EN.
- **Qualificação para FTA**: Avalie se um produto montado no México se qualifica para tratamento preferencial sob o USMCA. Rastreie os componentes da BOM para determinar o conteúdo de valor regional e a elegibilidade de mudança tarifária.
- **Acerto na triagem de parte negada**: A triagem automatizada sinaliza um cliente como possível correspondência na lista SDN da OFAC. Percorra a resolução de falso positivo, os procedimentos de escalonamento e os requisitos de documentação.

## Conhecimento Central

### Classificação Tarifária HS

O Sistema Harmonizado é uma nomenclatura internacional de 6 dígitos mantida pela WCO. Os primeiros 2 dígitos identificam o capítulo, 4 dígitos a posição, 6 dígitos a subposição. Extensões nacionais adicionam mais dígitos: os EUA usam números HTS de 10 dígitos (Schedule B para exportações), a UE usa códigos TARIC de 10 dígitos, o Reino Unido usa códigos de mercadoria de 10 dígitos via UK Global Tariff.

A classificação segue as General Rules of Interpretation (GRI) em ordem estrita — você nunca invoca a GRI 3 a menos que a GRI 1 falhe, nunca a GRI 4 a menos que de 1 a 3 falhem:

- **GRI 1:** A classificação é determinada pelos termos das posições e pelas notas de Seção/Capítulo. Isso resolve ~90% das classificações. Leia o texto da posição literalmente e verifique cada nota de Seção e Capítulo relevante antes de prosseguir.
- **GRI 2(a):** Artigos incompletos ou inacabados são classificados como o artigo completo se tiverem a característica essencial do artigo completo. Uma carroceria de carro sem o motor ainda é classificada como veículo automotor.
- **GRI 2(b):** Misturas e combinações de materiais. Um compósito de aço e plástico é classificado por referência ao material que confere a característica essencial.
- **GRI 3(a):** Quando mercadorias são, prima facie, classificáveis sob duas ou mais posições, prefira a posição mais específica. "Luvas cirúrgicas de borracha" é mais específico que "artigos de borracha".
- **GRI 3(b):** Mercadorias compostas, sortidos — classifique pelo componente que confere a característica essencial. Um kit de presente com um perfume de US$ 40 e uma bolsinha de US$ 5 é classificado como perfume.
- **GRI 3(c):** Quando a 3(a) e a 3(b) falham, use a posição que ocorre por último na ordem numérica.
- **GRI 4:** Mercadorias que não podem ser classificadas pelas GRI 1-3 são classificadas sob a posição das mercadorias mais análogas.
- **GRI 5:** Estojos, recipientes e materiais de embalagem seguem regras específicas para classificação com ou separadamente de seu conteúdo.
- **GRI 6:** A classificação no nível de subposição segue os mesmos princípios, aplicados dentro da posição relevante. Notas de subposição têm precedência neste nível.

**Armadilhas comuns de classificação incorreta:** Dispositivos multifuncionais (classifique pela função primária conforme a GRI 3(b), não pelo componente mais caro). Preparações alimentícias vs ingredientes (Capítulo 21 vs Capítulos 7-12 — verifique se o produto foi "preparado" além da simples conservação). Compósitos têxteis (a porcentagem em peso das fibras determina a classificação, não a área de superfície). Partes vs acessórios (a Nota 2 da Seção XVI determina se uma parte é classificada com a máquina ou separadamente). Software em mídia física (a mídia, não o software, determina a classificação na maioria das pautas tarifárias).

### Requisitos de Documentação

**Fatura Comercial:** Deve incluir nomes e endereços de vendedor/comprador, descrição das mercadorias suficiente para a classificação, quantidade, preço unitário, valor total, moeda, Incoterms, país de origem e condições de pagamento. A CBP dos EUA exige que a fatura esteja em conformidade com 19 CFR § 141.86. A subvaloração aciona penalidades conforme 19 USC § 1592.

**Lista de Embalagem (Packing List):** Peso e dimensões por volume, marcas e números coincidentes com o BOL, contagem de peças. Discrepâncias entre a lista de embalagem e a contagem física acionam exame.

**Certificado de Origem:** Varia por FTA. O USMCA usa uma certificação (sem formulário prescrito) que deve incluir nove elementos de dados conforme o Artigo 5.2. Certificados de movimento EUR.1 para comércio preferencial da UE. Formulário A para reivindicações do GSP. O Reino Unido usa "declarações de origem" nas faturas para reivindicações sob o TCA UK-EU.

**Conhecimento de Embarque / Conhecimento Aéreo (Bill of Lading / Air Waybill):** O BOL marítimo serve como título de propriedade das mercadorias, contrato de transporte e recibo. O conhecimento aéreo é não negociável. Ambos devem coincidir com os detalhes da fatura comercial — anotações adicionadas pela transportadora ("said to contain", "shipper's load and count") limitam a responsabilidade da transportadora e afetam a pontuação de risco aduaneiro.

**ISF 10+2 (US):** O Importer Security Filing deve ser submetido 24 horas antes do carregamento do navio no porto estrangeiro. Dez elementos de dados do importador (fabricante, vendedor, comprador, ship-to, país de origem, HS-6, local de estufagem do contêiner, consolidador, número do importador de registro, número do consignatário). Dois da transportadora. ISF tardio ou impreciso aciona danos liquidados de US$ 5.000 por violação. A CBP usa os dados do ISF para targeting — erros aumentam a probabilidade de exame.

**Entry Summary (CBP 7501):** Apresentado dentro de 10 dias úteis da entrada. Contém classificação, valor, alíquota, país de origem e reivindicações de programas preferenciais. Esta é a declaração legal — erros aqui criam exposição a penalidades sob 19 USC § 1592.

### Incoterms 2020

Os Incoterms definem a transferência de custos, risco e responsabilidade entre comprador e vendedor. Eles não são lei — são termos contratuais que devem ser explicitamente incorporados. Implicações críticas de conformidade:

- **EXW (Ex Works):** Obrigação mínima do vendedor. O comprador organiza tudo. Problema: o comprador é o exportador de registro no país do vendedor, o que cria obrigações de conformidade de exportação que o comprador pode não estar preparado para tratar. Raramente apropriado para comércio internacional.
- **FCA (Free Carrier):** O vendedor entrega à transportadora no local designado. O vendedor cuida do desembaraço de exportação. A revisão de 2020 permite que o comprador instrua sua transportadora a emitir um BOL "on-board" para o vendedor — crítico para transações com carta de crédito.
- **CPT/CIP (Carriage Paid To / Carriage & Insurance Paid To):** O risco é transferido na primeira transportadora, mas o vendedor paga o frete até o destino. O CIP agora exige Institute Cargo Clauses (A) — cobertura contra todos os riscos, uma mudança significativa em relação aos Incoterms 2010.
- **DAP (Delivered at Place):** O vendedor arca com todo o risco e custo até o destino, excluindo o desembaraço de importação e os impostos. O vendedor não desembaraça a alfândega no país de destino.
- **DDP (Delivered Duty Paid):** O vendedor arca com tudo, incluindo impostos e tributos de importação. O vendedor deve estar registrado como importador de registro ou usar um arranjo de importador não residente. A valoração aduaneira é baseada no preço DDP menos os impostos (método dedutivo) — se o vendedor incluir o imposto no preço da fatura, isso cria um problema de valoração circular.
- **Impacto na valoração:** Os Incoterms afetam a estrutura da fatura, mas a valoração aduaneira ainda segue as regras do regime importador. Nos EUA, o valor de transação da CBP geralmente exclui frete e seguro internacionais; na UE, o valor aduaneiro geralmente inclui custos de transporte e seguro até o local de entrada na União. Errar isso muda o cálculo do imposto mesmo quando o termo comercial está claro.
- **Mal-entendidos comuns:** Os Incoterms não transferem a titularidade das mercadorias — isso é regido pelo contrato de venda e pela lei aplicável. Os Incoterms não se aplicam a transações apenas domésticas por padrão — eles devem ser explicitamente invocados. Usar FOB para frete marítimo conteinerizado é tecnicamente incorreto (FCA é preferível) porque o risco é transferido na amurada do navio sob FOB, mas no pátio de contêineres sob FCA.

### Otimização de Impostos

**Utilização de FTA:** Cada acordo comercial preferencial tem regras de origem específicas que as mercadorias devem satisfazer. O USMCA exige regras específicas de produto (Anexo 4-B), incluindo mudança tarifária, conteúdo de valor regional (RVC) e métodos de custo líquido. O TCA UE-Reino Unido usa regras de "wholly obtained" e "sufficient processing" com regras de lista específicas de produto no Anexo ORIG-2. O RCEP tem regras uniformes para 15 nações da Ásia-Pacífico com disposições de cumulação. O AfCFTA permite 60% de cumulação entre os estados membros.

**O cálculo do RVC importa:** O USMCA oferece dois métodos — método de valor de transação (TV): RVC = ((TV - VNM) / TV) × 100, e método de custo líquido (NC): RVC = ((NC - VNM) / NC) × 100. O método de custo líquido exclui promoção de vendas, royalties e custos de transporte do denominador, frequentemente gerando um RVC mais alto quando as margens são apertadas.

**Zonas de Comércio Exterior (FTZs):** Mercadorias admitidas em uma FTZ não estão no território aduaneiro dos EUA. Benefícios: diferimento de imposto até as mercadorias entrarem em comércio, alívio de tarifa invertida (pague o imposto na alíquota do produto acabado se for menor que as alíquotas dos componentes), nenhum imposto sobre desperdício/sucata, nenhum imposto sobre reexportações. Transferências de zona para zona mantêm o status de privileged foreign.

**Termos de Importação Temporária (TIBs):** ATA Carnet para equipamento profissional, amostras, mercadorias de exibição — entrada isenta de impostos em mais de 78 países. Importação temporária dos EUA sob caução (TIB) conforme 19 USC § 1202, Capítulo 98 — as mercadorias devem ser exportadas dentro de 1 ano (extensível a 3 anos). A não exportação aciona a liquidação pelo imposto integral mais o prêmio da caução.

**Drawback de Impostos:** Reembolso de 99% dos impostos pagos sobre mercadorias importadas que são subsequentemente exportadas. Três tipos: drawback de manufatura (materiais importados usados em exportações fabricadas nos EUA), drawback de mercadoria não utilizada (mercadorias importadas exportadas na mesma condição) e drawback de substituição (mercadorias comercialmente intercambiáveis). As reivindicações devem ser apresentadas dentro de 5 anos da importação. O TFTEA simplificou significativamente o drawback — não exige mais a correspondência de entradas de importação específicas a entradas de exportação específicas para reivindicações de substituição.

### Triagem de Partes Restritas

**Listas obrigatórias (US):** SDN (OFAC — Specially Designated Nationals), Entity List (BIS — controle de exportação), Denied Persons List (BIS — privilégio de exportação negado), Unverified List (BIS — não é possível verificar o uso final), Military End User List (BIS), Non-SDN Menu-Based Sanctions (OFAC). A triagem deve cobrir todas as partes da transação: comprador, vendedor, consignatário, usuário final, agente de frete, bancos e consignatários intermediários.

**Listas UE/Reino Unido:** EU Consolidated Sanctions List, UK OFSI Consolidated List, UK Export Control Joint Unit.

**Sinais de alerta que acionam due diligence reforçada:** Cliente relutante em fornecer informações de uso final. Roteamento incomum (mercadorias de alto valor por portos francos). Cliente disposto a pagar em dinheiro por itens caros. Entrega a um agente de frete ou trading company sem usuário final claro. Capacidades do produto excedem a aplicação declarada. Cliente sem histórico comercial no tipo de produto. Padrões de pedido inconsistentes com o negócio do cliente.

**Gestão de falsos positivos:** ~95% dos acertos de triagem são falsos positivos. A adjudicação exige: correspondência exata de nome vs correspondência parcial, correlação de endereço, data de nascimento (para indivíduos), nexo de país, análise de aliases. Documente a justificativa da adjudicação para cada acerto — os reguladores perguntarão durante auditorias.

### Especialidades Regionais

**US CBP:** Os Centers of Excellence and Expertise (CEEs) se especializam por indústria. Programas de Trusted Trader: C-TPAT (segurança) e Trusted Trader (combinando C-TPAT + ISA). O ACE é a janela única para todos os dados de importação/exportação. Auditorias de Focused Assessment visam áreas específicas de conformidade — a divulgação prévia antes do início de uma FA é crítica.

**EU Customs Union:** A Common External Tariff (CET) se aplica uniformemente. O Authorised Economic Operator (AEO) fornece AEOC (simplificações aduaneiras) e AEOS (segurança). A Binding Tariff Information (BTI) fornece certeza de classificação por 3 anos. O Union Customs Code (UCC) governa desde 2016.

**UK pós-Brexit:** A UK Global Tariff substituiu a CET. O Protocolo da Irlanda do Norte / Windsor Framework cria mercadorias de status duplo. O UK Customs Declaration Service (CDS) substituiu o CHIEF. O TCA UK-EU exige conformidade com as Rules of Origin para tratamento de tarifa zero — "originating" exige ou wholly obtained no Reino Unido/UE ou sufficient processing.

**China:** A CCC (China Compulsory Certification) é exigida para categorias de produto listadas antes da importação. A China usa códigos HS de 13 dígitos. O e-commerce transfronteiriço tem canais de desembaraço distintos (modos de comércio 9610, 9710, 9810). A recente Unreliable Entity List cria novas obrigações de triagem.

### Penalidades e Conformidade

**Estrutura de penalidades dos EUA sob 19 USC § 1592:**
- **Negligência:** 2× os impostos não pagos ou 20% do valor tributável para a primeira violação. Reduzido a 1× ou 10% com mitigação. A avaliação mais comum.
- **Negligência grave:** 4× os impostos não pagos ou 40% do valor tributável. Mais difícil de mitigar — exige demonstrar medidas sistêmicas de conformidade.
- **Fraude:** Valor doméstico integral da mercadoria. Encaminhamento criminal possível. Sem mitigação sem cooperação extraordinária.

**Divulgação prévia (19 CFR § 162.74):** Apresentar uma divulgação prévia antes de a CBP iniciar uma investigação limita as penalidades a juros sobre impostos não pagos no caso de negligência, e a 1× os impostos no caso de negligência grave. Esta é a ferramenta mais poderosa na mitigação de penalidades. Requisitos: identificar a violação, fornecer informações corretas, recolher os impostos não pagos. Deve ser apresentada antes de a CBP emitir uma notificação de pré-penalidade ou iniciar uma investigação formal.

**Manutenção de registros:** 19 USC § 1508 exige retenção de 5 anos de todos os registros de entrada. A UE exige 3 anos (alguns estados membros exigem 10). A falha em produzir registros durante uma auditoria cria uma inferência adversa — a CBP pode reconstruir valor/classificação de forma desfavorável.

## Frameworks de Decisão

### Lógica de Decisão de Classificação

Ao classificar um produto, siga esta sequência sem atalhos. Converta-a em uma árvore de decisão interna antes de automatizar qualquer fluxo de trabalho de classificação tarifária.

1. **Identifique a mercadoria com precisão.** Obtenha a especificação técnica completa — composição do material, função, dimensões e uso pretendido. Nunca classifique apenas a partir do nome do produto.
2. **Determine a Seção e o Capítulo.** Use as notas de Seção e Capítulo para confirmar ou excluir. As notas de Capítulo prevalecem sobre o texto da posição.
3. **Aplique a GRI 1.** Leia os termos da posição literalmente. Se apenas uma posição cobre a mercadoria, a classificação está decidida.
4. **Se a GRI 1 produzir múltiplas posições candidatas,** aplique a GRI 2 e depois a GRI 3 em sequência. Para mercadorias compostas, determine a característica essencial pela função, valor, volume ou pelo fator mais relevante para a mercadoria específica.
5. **Valide no nível de subposição.** Aplique a GRI 6. Verifique as notas de subposição. Confirme que a linha tarifária nacional (8/10 dígitos) se alinha à determinação de 6 dígitos.
6. **Verifique decisões vinculantes.** Pesquise a base de dados CBP CROSS, a base de dados EU BTI ou as opiniões de classificação da WCO para os mesmos produtos ou produtos análogos. Decisões existentes são persuasivas mesmo que não diretamente vinculantes.
7. **Documente a justificativa.** Registre a GRI aplicada, as posições consideradas e rejeitadas e o fator determinante. Esta documentação é a sua defesa em uma auditoria.

### Análise de Qualificação para FTA

1. **Identifique os FTAs aplicáveis** com base nos países de origem e destino.
2. **Determine a regra de origem específica de produto.** Procure a posição HS no anexo do FTA relevante. As regras variam por produto — algumas exigem mudança tarifária, algumas exigem RVC mínimo, algumas exigem ambos.
3. **Rastreie todos os materiais não originários** pela bill of materials. Cada insumo deve ser classificado para determinar se ocorreu uma mudança tarifária.
4. **Calcule o RVC se necessário.** Escolha o método que gera o resultado mais favorável (quando o FTA oferece uma escolha). Verifique todos os dados de custo com o fornecedor.
5. **Aplique as regras de cumulação.** O USMCA permite acumulação entre EUA, México e Canadá. O TCA UE-Reino Unido permite cumulação bilateral. O RCEP permite cumulação diagonal entre todas as 15 partes.
6. **Prepare a certificação.** As certificações do USMCA devem incluir nove elementos de dados prescritos. O EUR.1 exige endosso da Câmara de Comércio ou da autoridade aduaneira. Retenha a documentação de apoio por 5 anos (USMCA) ou 4 anos (UE).

### Seleção do Método de Valoração

A valoração aduaneira segue o Acordo de Valoração Aduaneira da OMC (baseado no Artigo VII do GATT). Os métodos são aplicados em ordem hierárquica — você só passa para o método seguinte quando o método anterior não pode ser aplicado:

1. **Valor de Transação (Método 1):** O preço efetivamente pago ou a pagar, ajustado por adições (assists, royalties, comissões, embalagem) e deduções (custos pós-importação, impostos). É usado para ~90% das entradas. Falha quando: transação entre partes relacionadas em que o relacionamento influenciou o preço, ausência de venda (consignação, locações, mercadorias gratuitas) ou venda condicional com condições não quantificáveis.
2. **Valor de Transação de Mercadorias Idênticas (Método 2):** Mesmas mercadorias, mesmo país de origem, mesmo nível comercial. Raramente disponível porque "idênticas" é estritamente definido.
3. **Valor de Transação de Mercadorias Similares (Método 3):** Mercadorias comercialmente intercambiáveis. Mais amplo que o Método 2, mas ainda exige o mesmo país de origem.
4. **Valor Dedutivo (Método 4):** Comece pelo preço de revenda no país importador, deduza: margem de lucro, transporte, impostos e quaisquer custos de processamento pós-importação.
5. **Valor Computado (Método 5):** Construa a partir de: custo de materiais, fabricação, lucro e despesas gerais no país de exportação. Disponível apenas se o exportador cooperar com os dados de custo.
6. **Método de Recurso (Método 6):** Aplicação flexível dos Métodos 1-5 com ajustes razoáveis. Não pode ser baseado em valores arbitrários, valores mínimos ou no preço das mercadorias no mercado doméstico do país exportador.

### Avaliação de Acerto de Triagem

Quando uma tool de triagem de partes restritas retorna uma correspondência, não bloqueie a transação automaticamente nem a libere sem investigação. Siga este protocolo:

1. **Avalie a qualidade da correspondência:** Percentual de correspondência de nome, correlação de endereço, nexo de país, análise de aliases, data de nascimento (indivíduos). Correspondências abaixo de 85% de similaridade de nome sem correlação de endereço ou país são provavelmente falsos positivos — documente e libere.
2. **Verifique a identidade da entidade:** Faça referência cruzada com registros de empresas, números D&B, verificação de site e histórico de transações anteriores. Um cliente legítimo com anos de histórico de transações limpo e uma correspondência parcial de nome com uma entrada SDN é quase certamente um falso positivo.
3. **Verifique as especificidades da lista:** Acertos SDN exigem licença da OFAC para prosseguir. Acertos na Entity List exigem licença do BIS com presunção de negação. Acertos na Denied Persons List são proibições absolutas — nenhuma licença disponível.
4. **Escalone verdadeiros positivos e casos ambíguos** para a assessoria jurídica de conformidade imediatamente. Nunca prossiga com uma transação enquanto um acerto de triagem estiver sem resolução.
5. **Documente tudo.** Registre a tool de triagem usada, a data, os detalhes da correspondência, a justificativa da adjudicação e a disposição. Retenha por no mínimo 5 anos.

## Casos Extremos Principais

Estas são situações em que a abordagem óbvia está errada. Resumos breves são incluídos aqui para que você possa expandi-los em playbooks específicos de projeto, se necessário.

1. **Exploração do limiar de minimis:** Um fornecedor reestrutura embarques para ficar abaixo do limiar de minimis de US$ 800 dos EUA para evitar impostos. Múltiplos embarques no mesmo dia para o mesmo consignatário podem ser agregados pela CBP. A entrada da Section 321 não elimina cota, AD/CVD ou requisitos da PGA — apenas dispensa o imposto.

2. **Transbordo contornando ordens de AD/CVD:** Mercadorias fabricadas na China, mas roteadas pelo Vietnã com processamento mínimo para reivindicar origem vietnamita. A CBP usa investigações de evasão (EAPA) com poder de intimação. O teste de "substantial transformation" exige um novo artigo de comércio com nome, característica e uso diferentes.

3. **Mercadorias de uso dual na fronteira EAR/ITAR:** Um componente com aplicações tanto comerciais quanto militares. O ITAR controla com base no item, o EAR controla com base no item mais o uso final e o usuário final. A determinação de jurisdição de commodity (solicitação CJ) é exigida quando a classificação é ambígua. Apresentar sob o regime errado é uma violação de ambos.

4. **Ajustes pós-importação:** Ajustes de preço de transferência entre partes relacionadas após a liquidação da entrada. A CBP exige entradas de reconciliação (CF 7501 com flag de reconciliação) quando o preço final não é conhecido na entrada. A falha em reconciliar cria exposição de imposto sobre a diferença não paga mais penalidades.

5. **Valoração de primeira venda para partes relacionadas:** Usar o preço pago pelo intermediário (primeira venda) em vez do preço pago pelo importador (última venda) como valor aduaneiro. A CBP permite isso sob a "first sale rule" (Nissho Iwai), mas exige demonstrar que a primeira venda é uma transação de boa-fé, em condições de mercado (arm's-length). A UE e a maioria das outras jurisdições não reconhecem a primeira venda — elas valoram pela última venda antes da importação.

6. **Reivindicações retroativas de FTA:** Descobrir 18 meses após a importação que as mercadorias se qualificavam para tratamento preferencial. Os EUA permitem reivindicações pós-importação via PSC (Post Summary Correction) dentro do período de liquidação. A UE exige que o certificado de origem tenha sido válido no momento da importação. Os requisitos de prazo e documentação diferem por FTA e jurisdição.

7. **Classificação de kits vs componentes:** Um kit de varejo contendo itens de diferentes capítulos HS (ex.: um kit de camping com barraca, fogareiro e utensílios). A GRI 3(b) classifica pela característica essencial — mas se nenhum componente único confere a característica essencial, a GRI 3(c) se aplica (última posição na ordem numérica). Kits "apresentados para venda a varejo" têm regras específicas sob a GRI 3(b) que diferem dos sortidos industriais.

8. **Importações temporárias que se tornam permanentes:** Equipamento importado sob ATA Carnet ou TIB que o importador decide manter. O carnet/caução deve ser quitado pagando o imposto integral mais quaisquer penalidades. Se o período de importação temporária expirou sem exportação ou pagamento de imposto, a garantia do carnet é acionada, criando responsabilidade para a câmara de comércio garantidora.

## Padrões de Comunicação

### Calibração de Tom

Adeque o tom da comunicação à contraparte, ao contexto regulatório e ao nível de risco:

- **Despachante aduaneiro (rotina):** Colaborativo e preciso. Forneça documentação completa, sinalize itens incomuns, confirme a classificação antecipadamente. "HS 8471.30 confirmado — nossa análise de GRI 1 e a decisão CBP HQ H298456 de 2019 apoiam esta classificação. Empacotados 3 de 4 documentos exigidos, C/O segue até o fim do dia."
- **Despachante aduaneiro (retenção/exame urgente):** Direto, factual, sensível ao tempo. "Embarque retido em LA/LB — CBP solicitando documentação do fabricante. Enviando verificação de MID e registros de produção agora. Preciso do seu protocolo dentro de 2 horas para evitar demurrage."
- **Autoridade regulatória (solicitação de decisão):** Formal, exaustivamente documentado, juridicamente preciso. Siga exatamente o formato prescrito pela agência. Forneça amostras se solicitado. Nunca exagere a certeza — use "é nossa posição que" em vez de "este produto é classificado como".
- **Autoridade regulatória (resposta a penalidade):** Comedido, cooperativo, factual. Reconheça o erro se ele existir. Apresente os fatores de mitigação sistematicamente. Nunca admita fraude quando os fatos apoiam negligência.
- **Aviso interno de conformidade:** Impacto de negócio claro, itens de ação específicos, prazo. Traduza os requisitos regulatórios para linguagem operacional. "A partir de 1º de março, todas as importações de baterias de lítio exigem resumos de teste UN 38.3 na entrada. As operações devem coletá-los dos fornecedores antes da reserva. Não conformidade: mais de US$ 10 mil por embarque em multas e retenções de carga."
- **Questionário de fornecedor:** Específico, estruturado, explique por que você precisa da informação. Fornecedores que entendem a economia de impostos de um FTA são mais cooperativos com os dados de origem.

### Modelos Principais

Modelos breves aparecem abaixo. Adapte-os ao seu despachante, assessoria jurídica aduaneira e fluxos de trabalho regulatórios antes de usá-los em produção.

**Instruções ao despachante aduaneiro:** Assunto: `Entry Instructions — {PO/shipment_ref} — {origin} to {destination}`. Inclua: classificação com justificativa GRI, valor declarado com Incoterms, reivindicação de FTA com referência à documentação de apoio, quaisquer requisitos da PGA (FDA prior notice, EPA TSCA certification, FCC declaration).

**Apresentação de divulgação prévia:** Deve ser endereçada ao diretor do porto da CBP ou ao escritório de Fines, Penalties and Forfeitures com jurisdição. Inclua: números de entrada, datas, violações específicas, informações corretas, imposto devido e recolhimento do valor não pago.

**Alerta interno de conformidade:** Assunto: `COMPLIANCE ACTION REQUIRED: {topic} — Effective {date}`. Comece pelo impacto de negócio, depois a base regulatória, depois a ação exigida, depois o prazo e as consequências da não conformidade.

## Protocolos de Escalonamento

### Gatilhos de Escalonamento Automático

| Gatilho | Ação | Prazo |
|---|---|---|
| Detenção ou apreensão pela CBP | Notificar VP e assessoria jurídica | Dentro de 1 hora |
| Verdadeiro positivo de triagem de parte restrita | Interromper transação, notificar o responsável por conformidade e o jurídico | Imediatamente |
| Exposição potencial a penalidade > US$ 50.000 | Notificar VP de Conformidade de Comércio e General Counsel | Dentro de 2 horas |
| Exame aduaneiro com discrepância encontrada | Designar especialista dedicado, notificar despachante | Dentro de 4 horas |
| Correspondência confirmada de parte negada / SDN | Parada total em todas as transações com a entidade globalmente | Imediatamente |
| Investigação de evasão de AD/CVD recebida | Contratar assessoria jurídica de comércio externa | Dentro de 24 horas |
| Auditoria de origem de FTA de autoridade aduaneira estrangeira | Notificar todos os fornecedores afetados, iniciar revisão de documentação | Dentro de 48 horas |
| Decisão de divulgação voluntária | Aprovação da assessoria jurídica exigida antes da apresentação | Antes da submissão |

### Cadeia de Escalonamento

Nível 1 (Analista) → Nível 2 (Gerente de Conformidade de Comércio, 4 horas) → Nível 3 (Diretor de Conformidade, 24 horas) → Nível 4 (VP de Conformidade de Comércio, 48 horas) → Nível 5 (General Counsel / C-suite, imediato para apreensões, correspondências SDN ou exposição a penalidade > US$ 100 mil)

## Indicadores de Desempenho

Acompanhe estas métricas mensalmente e analise a tendência trimestralmente:

| Métrica | Meta | Sinal de Alerta |
|---|---|---|
| Precisão de classificação (pós-auditoria) | > 98% | < 95% |
| Taxa de utilização de FTA (embarques elegíveis) | > 90% | < 70% |
| Taxa de rejeição de entrada | < 2% | > 5% |
| Frequência de divulgação prévia | < 2 por ano | > 4 por ano |
| Tempo de adjudicação de falso positivo de triagem | < 4 horas | > 24 horas |
| Economia de impostos capturada (FTA + FTZ + drawback) | Acompanhar tendência | Em declínio trimestre a trimestre |
| Taxa de exame da CBP | < 3% | > 7% |
| Exposição a penalidade (anual) | US$ 0 | Qualquer penalidade material avaliada |

## Recursos Adicionais

- Combine esta skill com um log interno de classificação HS, uma matriz de escalonamento de despachante e uma lista de jurisdições onde sua equipe tem cobertura de importador não residente ou de FTZ.
- Registre os pressupostos de valoração que sua organização usa para as rotas dos EUA, UE e APAC, para que os cálculos de impostos permaneçam consistentes entre as equipes.
