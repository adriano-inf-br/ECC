---
name: browser-qa
description: Use esta skill para automatizar testes visuais e a verificação de interações de UI usando automação de navegador após implantar funcionalidades.
metadata:
  origin: ECC
---

# Browser QA — Testes Visuais Automatizados & Interação

## Quando Usar

- Depois de implantar uma funcionalidade em staging/preview
- Quando você precisa verificar o comportamento da UI em várias páginas
- Antes de publicar — confirme que layouts, formulários e interações realmente funcionam
- Ao revisar PRs que tocam código de frontend
- Auditorias de acessibilidade e testes responsivos

## Como Funciona

Usa o MCP de automação de navegador (claude-in-chrome, Playwright ou Puppeteer) para interagir com páginas ao vivo como um usuário real.

### Segurança em primeiro lugar — raio de impacto (rode somente leitura por padrão)

O Browser QA conduz autenticação real e jornadas reais de usuário, então trate o raio de impacto explicitamente.
O padrão é **somente leitura**: nunca rode uma jornada **mutante** (checkout, pagamento, exclusão,
atualização em massa) contra uma URL de produção — exija um opt-in explícito **e** uma URL de
staging/preview. Use **credenciais de teste** com dados semeados, nunca logins reais de produção, e **redija**
credenciais/tokens/PII antes de salvar qualquer captura de tela.

### Fase 1: Smoke Test
```
1. Navegue até a URL alvo
2. Verifique erros de console (filtre ruído: analytics, terceiros)
3. Verifique que não há 4xx/5xx nas requisições de rede
4. Capture a tela above-the-fold no viewport desktop + mobile
5. Verifique os Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms
   (o INP substituiu o FID em março de 2024; limiares conforme web.dev)
```

### Fase 2: Teste de Interação
```
1. Clique em cada link de navegação — verifique que não há links mortos
2. Envie formulários com dados válidos — verifique o estado de sucesso
3. Envie formulários com dados inválidos — verifique o estado de erro
4. Teste o fluxo de autenticação: login → página protegida → logout (apenas credenciais de teste, nunca produção)
5. Teste jornadas críticas de usuário (checkout, onboarding, busca)
   — somente leitura por padrão; só exercite jornadas mutantes contra staging
     com opt-in explícito (veja "Segurança em primeiro lugar" acima)
```

### Fase 3: Regressão Visual
```
1. Capture a tela de páginas-chave em 3 breakpoints (375px, 768px, 1440px)
2. Compare contra capturas de tela de baseline commitadas
   — sem baseline ⇒ reporte INCONCLUSIVE, nunca um PASS silencioso
3. Sinalize deslocamentos de layout > 5px, elementos faltando, overflow
4. Verifique o dark mode se aplicável
```

### Fase 4: Acessibilidade
```
1. Rode axe-core ou equivalente em cada página
2. Sinalize violações de WCAG 2.2 AA (contraste, rótulos, ordem de foco)
3. Verifique que a navegação por teclado funciona de ponta a ponta
4. Verifique os landmarks de leitor de tela
```

> Nota: o axe-core cobre automaticamente cerca de 30–40% do WCAG. Uma execução limpa é **necessária,
> não suficiente** — navegação por teclado, ordem de foco e uma passagem com leitor de tela ainda precisam de
> verificação manual. Não reporte "acessível" apenas a partir de uma execução automatizada.

## Formato de Saída

```markdown
## Relatório de QA — [URL] — [timestamp]

### Smoke Test
- Erros de console: 0 críticos, 2 avisos (ruído de analytics)
- Rede: todos 200/304, sem falhas
- Core Web Vitals: LCP 1.2s ✓, CLS 0.02 ✓, INP 89ms ✓

### Interações
- [✓] Links de navegação: 12/12 funcionando
- [✗] Formulário de contato: estado de erro faltando para e-mail inválido
- [✓] Fluxo de autenticação: login/logout funcionando

### Visual
- [✗] A seção hero transborda no viewport de 375px
- [✓] Dark mode: todas as páginas consistentes

### Acessibilidade
- 2 violações AA: texto alt faltando na imagem hero, baixo contraste nos links do rodapé

### Veredito: SHIP WITH FIXES (2 problemas, 0 bloqueadores)
# veredito ∈ SHIP / SHIP WITH FIXES / DO NOT SHIP; use INCONCLUSIVE se não houver baseline visual
```

## Integração

Funciona com qualquer MCP de navegador:
- ferramentas `mChild__claude-in-chrome__*` (preferido — usa o seu Chrome real)
- Playwright via `mcp__browserbase__*`
- Scripts diretos de Puppeteer

Combine com `/canary-watch` para monitoramento pós-deploy.
