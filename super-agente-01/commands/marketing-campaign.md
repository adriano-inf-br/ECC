---
description: Planeja e executa uma campanha de marketing completa. Aceita um brief de produto e retorna posicionamento, copy de landing page, sequência de e-mails, posts sociais, variantes de anúncios, roteiros de vídeo e um calendário de conteúdo. Também pode revisar copy existente para avaliar a qualidade de conversão.
allowed_tools: ["Read", "Grep", "Glob", "WebSearch", "WebFetch", "Write"]
---

# /marketing-campaign

Planeje e execute uma campanha de marketing, do brief à suíte completa de conteúdo.

## Uso

```
/marketing-campaign                          # Solicita o brief interativamente
/marketing-campaign [product brief]          # Campanha completa a partir de um brief inline
/marketing-campaign copy [type]              # Apenas um único entregável
/marketing-campaign review [file-or-brief]   # Auditoria de copy para conversão e consistência de marca
```

## O Que Faz

1. **Pesquisa** — Perfila o público-alvo e mapeia os concorrentes antes de escrever qualquer coisa
2. **Posicionamento** — Define primeiro o ângulo da campanha e o perfil de tom
3. **Produção de copy** — Gera a suíte completa de conteúdo na ordem certa (landing page → e-mails → social → anúncios → roteiros de vídeo → calendário)
4. **Revisão** — Submete toda a saída a um checklist de conversão e consistência de marca

## Modos

### Modo de Campanha Completa

Forneça um brief de produto contendo:
- Nome e descrição do produto
- Público-alvo (específico, não genérico)
- Problema central que o produto resolve
- Benefício / resultado central
- Orientação de tom
- Canais necessários
- Meta ou cronograma de lançamento

O agent retorna todos os entregáveis da campanha em ordem, com um resumo da revisão de copy ao final.

### Modo de Entregável Único

```
/marketing-campaign copy landing-page
/marketing-campaign copy email-sequence
/marketing-campaign copy social-posts
/marketing-campaign copy ads
/marketing-campaign copy video-scripts
```

Requer que o posicionamento seja definido primeiro. Execute o modo completo ou forneça o ângulo antes de solicitar um único entregável.

### Modo de Revisão de Copy

```
/marketing-campaign review path/to/copy.md
/marketing-campaign review "paste copy here"
```

Retorna uma auditoria estruturada com base em:
- Teste de clareza em 5 segundos (copy acima da dobra)
- Qualidade do CTA (específico, justificado, um por peça)
- Consistência do tom de marca
- Especificidade e sustentabilidade das afirmações
- Adequação nativa à plataforma
- Consistência entre canais

## Template de Brief

```markdown
Product: [name]
Description: [1-3 sentences on what it does]
Audience: [who, specifically]
Problem: [the specific pain the product solves]
Benefit: [the outcome the user gets]
Tone: [adjectives + what to avoid]
Channels: [landing page, email, LinkedIn, X, ads, video]
Goal: [launch, waitlist, signups, awareness — and timeline]
```

## Local de Saída

Ao salvar os ativos da campanha, a convenção é `.claude/campaigns/{campaign-name}/`:

```
.claude/campaigns/product-launch/
├── positioning.md
├── landing-page.md
├── email-sequence.md
├── social-posts.md
├── ad-copy.md
├── video-scripts.md
└── content-calendar.md
```

Confirme o local de salvamento antes de escrever os arquivos.

## Exemplos

```
/marketing-campaign Build a 7-day launch campaign for an AI career platform for UK university students.
```

```
/marketing-campaign copy landing-page
```

```
/marketing-campaign review .claude/campaigns/the-key/landing-page.md
```

## Delegação de Agent

Este comando invoca:
- `marketing-agent` — planejamento de campanha e produção de copy
- `brand-voice` — captura de voz quando o tom precisa ser fixado em múltiplas saídas
- `content-engine` — produção de conteúdo social nativo da plataforma
- `crosspost` — distribuição multiplataforma
- `market-research` — inteligência aprofundada de audiência ou competitiva

## Comandos Relacionados

- `/plan` — Planejamento estratégico antes de uma campanha
- `/plan-prd` — Documento de requisitos de produto antes de fazer o brief de uma campanha
- `/code-review` — Revisar o código por trás da implementação de uma landing page

---

*Parte de [Everything Claude Code](https://github.com/affaan-m/everything-claude-code)*
