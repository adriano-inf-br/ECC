---
name: ml-adoption-playbook
description: Metodologia ponta a ponta para agentes de IA e engenheiros de software adicionarem algoritmos de machine learning a bases de código existentes que não usam ML. Cobre enquadramento de problemas, prontidão de dados, desacoplamento arquitetural e integração de modelos baseline.
origin: ECC
---

# ML Adoption Playbook

Esta skill fornece uma metodologia adaptativa para implementar modelos de machine learning em projetos de engenharia de software existentes. Ela faz a ponte entre a engenharia de software tradicional e o MLOps, estruturando como o ML deve ser pesquisado, desacoplado, treinado e integrado.

## When to Activate

- Um usuário pede para "adicionar ML" ou "adicionar um algoritmo" à sua base de código existente.
- Planejamento da integração de um novo modelo (ex.: recomendação, classificação, previsão) em uma aplicação que não usa ML.
- Estruturação de um fluxo de trabalho para que um agent construa, treine e implante um componente de ML de forma adaptativa.

## Phase 1: Problem Framing & Feasibility

Antes de escrever código de modelo, estabeleça o "porquê" e o "como".
- **Heuristic Check:** Pergunte ao usuário se uma heurística simples (ex.: regex, ordenação baseada em regras) poderia resolver o problema mais rápido. Se sim, comece por aí.
- **Metric Definition:** Defina qual métrica de negócio o modelo de ML está tentando melhorar (ex.: taxa de cliques, redução de latência).
- **Mistake Budget:** Defina o que constitui uma previsão "ruim" e como o sistema deve lidar com ela.

## Phase 2: Data Readiness

ML é inútil sem dados limpos e acessíveis.
- **Audit Data Sources:** Identifique onde residem os dados de treinamento. É um banco de dados ativo, um CSV estático ou uma API?
- **Data Contract:** Estabeleça um schema para os dados de entrada. Quais features são obrigatórias? O que acontece se uma feature estiver ausente?
- **Leakage Prevention:** Garanta que a divisão de dados proposta pelo usuário não vaze acidentalmente informações futuras para o conjunto de treinamento (ex.: divisão cronológica para dados de séries temporais).

## Phase 3: Architectural Integration & Decoupling

Não acople fortemente a inferência do modelo à lógica de negócio central.
- **API Boundary:** Sugira colocar o modelo atrás de um endpoint de API (ex.: usando `fastapi-patterns` ou `django-patterns`) ou de uma classe de serviço dedicada.
- **Fallback Mechanisms:** Projete um estado padrão. Se o modelo demorar demais a responder ou lançar um erro, o sistema deve recorrer de forma elegante a uma regra fixa.
- **Feature Flags:** Envolva a nova chamada de inferência de ML em uma feature flag para que ela possa ser liberada (ou revertida) com segurança.

## Phase 4: Model Implementation & Training

Estruture o código para reprodutibilidade e iteração.
- **Start Simple:** Construa primeiro um modelo baseline (ex.: uma Regressão Logística simples do scikit-learn ou uma camada linear básica em PyTorch).
- **Reproducibility:** Aplique `pytorch-patterns` ou boas práticas similares: fixe seeds aleatórias, torne o código agnóstico ao dispositivo e documente explicitamente os shapes de tensores/arrays.
- **Automated Evidence:** Exija testes para as transformações de dados e o schema de inferência. Não aceite um modelo sem um script de avaliação que o compare ao baseline.

## Phase 5: Handoff to MLOps

Uma vez que o modelo baseline esteja integrado, mude o foco para operações contínuas.
- **Refer to `mle-workflow`:** Oriente o usuário a configurar rastreamento de experimentos, registros de modelos e detecção de drift.
- **CI/CD:** Adicione a etapa de avaliação do modelo ao pipeline de CI existente para garantir que commits futuros não degradem o desempenho do modelo.

## Iterative Agent Workflow

Ao auxiliar um usuário por meio deste playbook, os agents devem:
1. **Fazer perguntas esclarecedoras** para concluir a Fase 1 antes de propor arquiteturas.
2. **Esboçar um data contract** na Fase 2 para aprovação do usuário.
3. **Escrever a interface de desacoplamento** (API/Serviço) na Fase 3 *antes* de escrever o loop de treinamento.
4. **Entregar um script reproduzível** na Fase 4 que treine o modelo e salve o artefato.
