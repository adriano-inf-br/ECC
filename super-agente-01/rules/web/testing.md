> Este arquivo estende [common/testing.md](../common/testing.md) com conteúdo de testes específico de web.

# Regras de Testes Web

## Ordem de Prioridade

### 1. Regressão Visual

- Faça screenshots dos breakpoints principais: 320, 768, 1024, 1440
- Teste seções hero, seções de scrollytelling e estados significativos
- Use screenshots do Playwright para trabalho com forte componente visual
- Se ambos os temas existem, teste os dois

### 2. Acessibilidade

- Execute verificações automatizadas de acessibilidade
- Teste a navegação por teclado
- Verifique o comportamento de reduced-motion
- Verifique o contraste de cores

### 3. Performance

- Execute o Lighthouse ou equivalente contra páginas significativas
- Mantenha as metas de CWV de [performance.md](performance.md)

### 4. Cross-Browser

- Mínimo: Chrome, Firefox, Safari
- Teste scroll, movimento e comportamento de fallback

### 5. Responsivo

- Teste 320, 375, 768, 1024, 1440, 1920
- Verifique que não há overflow
- Verifique interações de toque

## Forma do E2E

```ts
import { test, expect } from '@playwright/test';

test('landing hero loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});
```

- Evite asserções instáveis baseadas em timeout
- Prefira esperas determinísticas

## Testes Unitários

- Teste utilitários, transformações de dados e custom hooks
- Para componentes muito visuais, a regressão visual costuma carregar mais sinal do que asserções frágeis de marcação
- A regressão visual complementa as metas de cobertura; ela não as substitui
