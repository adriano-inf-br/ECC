---
name: ai-first-engineering
description: Modelo operacional de engenharia para equipes em que agents de IA geram uma grande parcela da produção de implementação.
metadata:
  origin: ECC
---

# Engenharia AI-First

Use esta skill ao projetar processo, revisões e arquitetura para equipes que entregam com geração de código assistida por IA.

## Mudanças no Processo

1. A qualidade do planejamento importa mais do que a velocidade de digitação.
2. A cobertura de avaliações (evals) importa mais do que a confiança anedótica.
3. O foco da revisão muda da sintaxe para o comportamento do sistema.

## Requisitos de Arquitetura

Prefira arquiteturas amigáveis a agents:
- limites explícitos
- contratos estáveis
- interfaces tipadas
- testes determinísticos

Evite comportamento implícito espalhado por convenções ocultas.

## Revisão de Código em Equipes AI-First

Revise procurando:
- regressões de comportamento
- premissas de segurança
- integridade de dados
- tratamento de falhas
- segurança de rollout

Minimize o tempo gasto em questões de estilo já cobertas por automação.

## Sinais de Contratação e Avaliação

Engenheiros AI-first fortes:
- decompõem trabalho ambíguo com clareza
- definem critérios de aceitação mensuráveis
- produzem prompts e evals de alto sinal
- aplicam controles de risco sob pressão de entrega

## Padrão de Testes

Eleve o nível de testes para código gerado:
- cobertura de regressão obrigatória para os domínios tocados
- asserções explícitas de casos extremos
- verificações de integração para os limites das interfaces
