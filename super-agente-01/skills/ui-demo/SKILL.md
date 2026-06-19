---
name: ui-demo
description: Grave vídeos de demonstração de UI polidos usando Playwright. Use quando o usuário pedir para criar uma demo, walkthrough, gravação de tela ou vídeo tutorial de uma aplicação web. Produz vídeos WebM com cursor visível, ritmo natural e aparência profissional.
metadata:
  origin: ECC
---

# Gravador de Vídeo de Demo de UI

Grave vídeos de demonstração polidos de aplicações web usando a gravação de vídeo do Playwright com overlay de cursor injetado, ritmo natural e fluxo de narrativa.

## Quando Usar

- Usuário pede por um "vídeo de demo", "gravação de tela", "walkthrough" ou "tutorial"
- Usuário quer mostrar uma funcionalidade ou fluxo de trabalho visualmente
- Usuário precisa de um vídeo para documentação, onboarding ou apresentação para stakeholders

## Processo em Três Fases

Cada demo passa por três fases: **Descobrir -> Ensaiar -> Gravar**. Nunca pule direto para a gravação.

---

## Fase 1: Descobrir

Antes de escrever qualquer script, explore as páginas alvo para entender o que realmente está lá.

### Por quê

Você não pode criar um script do que não viu. Campos podem ser `<input>` em vez de `<textarea>`, dropdowns podem ser componentes personalizados em vez de `<select>`, e caixas de comentário podem suportar `@mentions` ou `#tags`. Suposições quebram gravações silenciosamente.

### Como

Navegue para cada página no fluxo e liste seus elementos interativos:

```javascript
// Execute isso para cada página no fluxo ANTES de escrever o script de demo
const fields = await page.evaluate(() => {
  const els = [];
  document.querySelectorAll('input, select, textarea, button, [contenteditable]').forEach(el => {
    if (el.offsetParent !== null) {
      els.push({
        tag: el.tagName,
        type: el.type || '',
        name: el.name || '',
        placeholder: el.placeholder || '',
        text: el.textContent?.trim().substring(0, 40) || '',
        contentEditable: el.contentEditable === 'true',
        role: el.getAttribute('role') || '',
      });
    }
  });
  return els;
});
console.log(JSON.stringify(fields, null, 2));
```

### O que procurar

- **Campos de formulário**: São `<select>`, `<input>`, dropdowns personalizados ou comboboxes?
- **Opções de select**: Liste os valores E textos das opções. Placeholders frequentemente têm `value="0"` ou `value=""` que parecem não vazios. Use `Array.from(el.options).map(o => ({ value: o.value, text: o.text }))`. Ignore opções onde o texto inclui "Select" ou o valor é `"0"`.
- **Texto rico**: A caixa de comentário suporta `@mentions`, `#tags`, markdown ou emoji? Verifique o texto do placeholder.
- **Campos obrigatórios**: Quais campos bloqueiam o envio do formulário? Verifique `required`, `*` nos rótulos e tente enviar vazio para ver erros de validação.
- **Conteúdo dinâmico**: Campos aparecem após outros campos serem preenchidos?
- **Rótulos de botão**: Texto exato como `"Submit"`, `"Submit Request"` ou `"Send"`.
- **Cabeçalhos de coluna de tabela**: Para modais baseados em tabela, mapeie cada `input[type="number"]` para seu cabeçalho de coluna em vez de assumir que todas as entradas numéricas significam a mesma coisa.

### Saída

Um mapa de campos para cada página, usado para escrever seletores corretos no script. Exemplo:

```text
/purchase-requests/new:
  - Budget Code: <select> (primeiro select na página, 4 opções)
  - Desired Delivery: <input type="date">
  - Context: <textarea> (não input)
  - Tabela BOM: células editáveis inline com padrão span.cursor-pointer -> input
  - Submit: <button> text="Submit"

/purchase-requests/N (detalhe):
  - Comment: <input placeholder="Type a message..."> suporta @user e #PR tags
  - Send: <button> text="Send" (desabilitado até o input ter conteúdo)
```

---

## Fase 2: Ensaiar

Execute todos os passos sem gravar. Verifique se cada seletor resolve.

### Por quê

Falhas silenciosas de seletor são o principal motivo pelo qual gravações de demo quebram. O ensaio as captura antes de você desperdiçar uma gravação.

### Como

Use `ensureVisible`, um wrapper que registra e falha em voz alta:

```javascript
async function ensureVisible(page, locator, label) {
  const el = typeof locator === 'string' ? page.locator(locator).first() : locator;
  const visible = await el.isVisible().catch(() => false);
  if (!visible) {
    const msg = `REHEARSAL FAIL: "${label}" not found - selector: ${typeof locator === 'string' ? locator : '(locator object)'}`;
    console.error(msg);
    const found = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button, input, select, textarea, a'))
        .filter(el => el.offsetParent !== null)
        .map(el => `${el.tagName}[${el.type || ''}] "${el.textContent?.trim().substring(0, 30)}"`)
        .join('\n  ');
    });
    console.error('  Visible elements:\n  ' + found);
    return false;
  }
  console.log(`REHEARSAL OK: "${label}"`);
  return true;
}
```

### Estrutura do script de ensaio

```javascript
const steps = [
  { label: 'Login email field', selector: '#email' },
  { label: 'Login submit', selector: 'button[type="submit"]' },
  { label: 'New Request button', selector: 'button:has-text("New Request")' },
  { label: 'Budget Code select', selector: 'select' },
  { label: 'Delivery date', selector: 'input[type="date"]:visible' },
  { label: 'Description field', selector: 'textarea:visible' },
  { label: 'Add Item button', selector: 'button:has-text("Add Item")' },
  { label: 'Submit button', selector: 'button:has-text("Submit")' },
];

let allOk = true;
for (const step of steps) {
  if (!await ensureVisible(page, step.selector, step.label)) {
    allOk = false;
  }
}
if (!allOk) {
  console.error('REHEARSAL FAILED - fix selectors before recording');
  process.exit(1);
}
console.log('REHEARSAL PASSED - all selectors verified');
```

### Quando o ensaio falha

1. Leia o dump de elementos visíveis.
2. Encontre o seletor correto.
3. Atualize o script.
4. Re-execute o ensaio.
5. Só continue quando todos os seletores passarem.

---

## Fase 3: Gravar

Somente após descoberta e ensaio passarem você deve criar a gravação.

### Princípios de Gravação

#### 1. Fluxo de Narrativa

Planeje o vídeo como uma história. Siga a ordem especificada pelo usuário, ou use este padrão:

- **Entrada**: Login ou navegue até o ponto de partida
- **Contexto**: Panorâmica do ambiente para que os espectadores se orientem
- **Ação**: Execute os passos principais do fluxo de trabalho
- **Variação**: Mostre uma funcionalidade secundária como configurações, tema ou localização
- **Resultado**: Mostre o resultado, confirmação ou novo estado

#### 2. Ritmo

- Após login: `4s`
- Após navegação: `3s`
- Após clicar em um botão: `2s`
- Entre passos principais: `1,5-2s`
- Após a ação final: `3s`
- Delay de digitação: `25-40ms` por caractere

#### 3. Overlay de Cursor

Injete um cursor de seta SVG que segue movimentos do mouse:

```javascript
async function injectCursor(page) {
  await page.evaluate(() => {
    if (document.getElementById('demo-cursor')) return;
    const cursor = document.createElement('div');
    cursor.id = 'demo-cursor';
    cursor.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 3L19 12L12 13L9 20L5 3Z" fill="white" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>
    </svg>`;
    cursor.style.cssText = `
      position: fixed; z-index: 999999; pointer-events: none;
      width: 24px; height: 24px;
      transition: left 0.1s, top 0.1s;
      filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.3));
    `;
    cursor.style.left = '0px';
    cursor.style.top = '0px';
    document.body.appendChild(cursor);
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });
  });
}
```

Chame `injectCursor(page)` após cada navegação de página porque o overlay é destruído ao navegar.

#### 4. Movimento do Mouse

Nunca teletransporte o cursor. Mova até o alvo antes de clicar:

```javascript
async function moveAndClick(page, locator, label, opts = {}) {
  const { postClickDelay = 800, ...clickOpts } = opts;
  const el = typeof locator === 'string' ? page.locator(locator).first() : locator;
  const visible = await el.isVisible().catch(() => false);
  if (!visible) {
    console.error(`WARNING: moveAndClick skipped - "${label}" not visible`);
    return false;
  }
  try {
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const box = await el.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 10 });
      await page.waitForTimeout(400);
    }
    await el.click(clickOpts);
  } catch (e) {
    console.error(`WARNING: moveAndClick failed on "${label}": ${e.message}`);
    return false;
  }
  await page.waitForTimeout(postClickDelay);
  return true;
}
```

Cada chamada deve incluir um `label` descritivo para depuração.

#### 5. Digitação

Digite visivelmente, não com preenchimento instantâneo:

```javascript
async function typeSlowly(page, locator, text, label, charDelay = 35) {
  const el = typeof locator === 'string' ? page.locator(locator).first() : locator;
  const visible = await el.isVisible().catch(() => false);
  if (!visible) {
    console.error(`WARNING: typeSlowly skipped - "${label}" not visible`);
    return false;
  }
  await moveAndClick(page, el, label);
  await el.fill('');
  await el.pressSequentially(text, { delay: charDelay });
  await page.waitForTimeout(500);
  return true;
}
```

#### 6. Rolagem

Use rolagem suave em vez de saltos:

```javascript
await page.evaluate(() => window.scrollTo({ top: 400, behavior: 'smooth' }));
await page.waitForTimeout(1500);
```

#### 7. Panorâmica de Dashboard

Ao mostrar um dashboard ou página de visão geral, mova o cursor pelos elementos principais:

```javascript
async function panElements(page, selector, maxCount = 6) {
  const elements = await page.locator(selector).all();
  for (let i = 0; i < Math.min(elements.length, maxCount); i++) {
    try {
      const box = await elements[i].boundingBox();
      if (box && box.y < 700) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 8 });
        await page.waitForTimeout(600);
      }
    } catch (e) {
      console.warn(`WARNING: panElements skipped element ${i} (selector: "${selector}"): ${e.message}`);
    }
  }
}
```

#### 8. Legendas

Injete uma barra de legendas na parte inferior da viewport:

```javascript
async function injectSubtitleBar(page) {
  await page.evaluate(() => {
    if (document.getElementById('demo-subtitle')) return;
    const bar = document.createElement('div');
    bar.id = 'demo-subtitle';
    bar.style.cssText = `
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 999998;
      text-align: center; padding: 12px 24px;
      background: rgba(0, 0, 0, 0.75);
      color: white; font-family: -apple-system, "Segoe UI", sans-serif;
      font-size: 16px; font-weight: 500; letter-spacing: 0.3px;
      transition: opacity 0.3s;
      pointer-events: none;
    `;
    bar.textContent = '';
    bar.style.opacity = '0';
    document.body.appendChild(bar);
  });
}

async function showSubtitle(page, text) {
  await page.evaluate((t) => {
    const bar = document.getElementById('demo-subtitle');
    if (!bar) return;
    if (t) {
      bar.textContent = t;
      bar.style.opacity = '1';
    } else {
      bar.style.opacity = '0';
    }
  }, text);
  if (text) await page.waitForTimeout(800);
}
```

Chame `injectSubtitleBar(page)` junto com `injectCursor(page)` após cada navegação.

Padrão de uso:

```javascript
await showSubtitle(page, 'Passo 1 - Fazendo login');
await showSubtitle(page, 'Passo 2 - Visão geral do dashboard');
await showSubtitle(page, '');
```

Diretrizes:

- Mantenha o texto da legenda curto, idealmente com menos de 60 caracteres.
- Use o formato `Passo N - Ação` para consistência.
- Limpe a legenda durante pausas longas onde a UI fala por si mesma.

## Template de Script

```javascript
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:3000';
const VIDEO_DIR = path.join(__dirname, 'screenshots');
const OUTPUT_NAME = 'demo-FEATURE.webm';
const REHEARSAL = process.argv.includes('--rehearse');

// Cole aqui injectCursor, injectSubtitleBar, showSubtitle, moveAndClick,
// typeSlowly, ensureVisible e panElements.

(async () => {
  const browser = await chromium.launch({ headless: true });

  if (REHEARSAL) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();
    // Navegue pelo fluxo e execute ensureVisible para cada seletor.
    await browser.close();
    return;
  }

  const context = await browser.newContext({
    recordVideo: { dir: VIDEO_DIR, size: { width: 1280, height: 720 } },
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    await injectCursor(page);
    await injectSubtitleBar(page);

    await showSubtitle(page, 'Passo 1 - Fazendo login');
    // ações de login

    await page.goto(`${BASE_URL}/dashboard`);
    await injectCursor(page);
    await injectSubtitleBar(page);
    await showSubtitle(page, 'Passo 2 - Visão geral do dashboard');
    // panorâmica do dashboard

    await showSubtitle(page, 'Passo 3 - Fluxo principal');
    // sequência de ações

    await showSubtitle(page, 'Passo 4 - Resultado');
    // revelação final
    await showSubtitle(page, '');
  } catch (err) {
    console.error('DEMO ERROR:', err.message);
  } finally {
    await context.close();
    const video = page.video();
    if (video) {
      const src = await video.path();
      const dest = path.join(VIDEO_DIR, OUTPUT_NAME);
      try {
        fs.copyFileSync(src, dest);
        console.log('Video saved:', dest);
      } catch (e) {
        console.error('ERROR: Failed to copy video:', e.message);
        console.error('  Source:', src);
        console.error('  Destination:', dest);
      }
    }
    await browser.close();
  }
})();
```

Uso:

```bash
# Fase 2: Ensaiar
node demo-script.cjs --rehearse

# Fase 3: Gravar
node demo-script.cjs
```

## Lista de Verificação Antes de Gravar

- [ ] Fase de descoberta concluída
- [ ] Ensaio passou com todos os seletores OK
- [ ] Modo headless ativado
- [ ] Resolução definida como `1280x720`
- [ ] Overlays de cursor e legenda re-injetados após cada navegação
- [ ] `showSubtitle(page, 'Passo N - ...')` usado nas transições principais
- [ ] `moveAndClick` usado para todos os cliques com labels descritivos
- [ ] `typeSlowly` usado para entrada visível
- [ ] Sem capturas silenciosas; helpers registram avisos
- [ ] Rolagem suave usada para revelar conteúdo
- [ ] Pausas principais são visíveis para um espectador humano
- [ ] Fluxo corresponde à ordem de história solicitada
- [ ] Script reflete a UI real descoberta na fase 1

## Armadilhas Comuns

1. Cursor desaparece após navegação — re-injete-o.
2. Vídeo está muito rápido — adicione pausas.
3. Cursor é um ponto em vez de uma seta — use o overlay SVG.
4. Cursor teletransporta — mova antes de clicar.
5. Dropdowns select parecem errados — mostre o movimento, depois escolha a opção.
6. Modais parecem abruptos — adicione uma pausa de leitura antes de confirmar.
7. Caminho do arquivo de vídeo é aleatório — copie para um nome de saída estável.
8. Falhas de seletor são engolidas — nunca use blocos catch silenciosos.
9. Tipos de campo foram assumidos — descubra-os primeiro.
10. Funcionalidades foram assumidas — inspecione a UI real antes de criar o script.
11. Valores de select placeholder parecem reais — cuidado com `"0"` e `"Select..."`.
12. Popups criam vídeos separados — capture páginas de popup explicitamente e mescle depois se necessário.
