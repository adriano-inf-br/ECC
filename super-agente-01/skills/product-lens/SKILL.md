---
name: product-lens
description: Use esta skill para validar o "porquê" antes de construir, executar diagnósticos de produto e testar a direção do produto sob pressão antes que a solicitação se torne um contrato de implementação.
metadata:
  origin: ECC
---

# Product Lens — Pense Antes de Construir

Esta rota é responsável pelo diagnóstico de produto, não pela escrita de especificações prontas para implementação.

Se o usuário precisar de um artefato PRD-para-SRS ou contrato de capacidade duráveis, transfira para `product-capability`.

## Quando Usar

- Antes de iniciar qualquer feature — valide o "porquê"
- Revisão semanal de produto — estamos construindo a coisa certa?
- Quando preso entre features para escolher
- Antes de um lançamento — verificação de sanidade da jornada do usuário
- Ao converter uma ideia vaga em um briefing de produto antes que o planejamento de engenharia comece

## Como Funciona

### Modo 1: Diagnóstico de Produto

Como o escritório do YC, mas automatizado. Faz as perguntas difíceis:

```
1. Para quem é isso? (pessoa específica, não "desenvolvedores")
2. Qual é a dor? (quantifique: com que frequência, quão grave, o que fazem hoje?)
3. Por que agora? (o que mudou que torna isso possível/necessário?)
4. Qual é a versão de 10 estrelas? (se dinheiro/tempo fossem ilimitados)
5. Qual é o MVP? (menor coisa que prova a tese)
6. Qual é o anti-objetivo? (o que você explicitamente NÃO está construindo?)
7. Como você sabe que está funcionando? (métrica, não intuição)
```

Saída: um `PRODUCT-BRIEF.md` com respostas, riscos e uma recomendação de ir/não ir.

Se o resultado for "sim, construa isso", a próxima rota é `product-capability`, não mais teatro de fundador.

### Modo 2: Revisão do Fundador

Revisa o seu projeto atual através de uma lente de fundador:

```
1. Leia README, CLAUDE.md, package.json, commits recentes
2. Infira: o que isso está tentando ser?
3. Pontue: sinais de product-market fit (0-10)
   - Trajetória de crescimento de uso
   - Indicadores de retenção (contribuidores repetidos, usuários recorrentes)
   - Sinais de receita (página de preços, código de billing, integração Stripe)
   - Vantagem competitiva (o que é difícil de copiar?)
4. Identifique: a única coisa que multiplicaria isso por 10
5. Sinalize: coisas que você está construindo e que não importam
```

### Modo 3: Auditoria da Jornada do Usuário

Mapeia a experiência real do usuário:

```
1. Clone/instale o produto como um novo usuário
2. Documente cada ponto de atrito (etapas confusas, erros, documentação faltando)
3. Cronometre cada etapa
4. Compare com o onboarding do concorrente
5. Pontue: tempo-para-valor (quanto tempo até o usuário ter sua primeira vitória?)
6. Recomende: os 3 principais ajustes para onboarding
```

### Modo 4: Priorização de Features

Quando você tem 10 ideias e precisa escolher 2:

```
1. Liste todas as features candidatas
2. Pontue cada uma em: impacto (1-5) × confiança (1-5) ÷ esforço (1-5)
3. Classifique pela pontuação ICE
4. Aplique restrições: runway, tamanho da equipe, dependências
5. Saída: roadmap priorizado com justificativa
```

## Saída

Todos os modos geram documentos acionáveis, não ensaios. Cada recomendação tem um próximo passo específico.

## Integração

Combine com:
- `/browser-qa` para verificar as descobertas da auditoria da jornada do usuário
- `/design-system audit` para avaliação do polimento visual
- `/canary-watch` para monitoramento pós-lançamento
- `product-capability` quando o briefing de produto precisar se tornar um plano de capacidade pronto para implementação
