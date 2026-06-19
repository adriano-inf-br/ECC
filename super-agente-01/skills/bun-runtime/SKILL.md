---
name: bun-runtime
description: Bun como runtime, gerenciador de pacotes, bundler e test runner. Quando escolher Bun vs Node, notas de migração e suporte no Vercel.
metadata:
  origin: ECC
---

# Bun Runtime

Bun é um runtime e toolkit JavaScript rápido e tudo-em-um: runtime, gerenciador de pacotes, bundler e test runner.

## Quando Usar

- **Prefira Bun** para: novos projetos JS/TS, scripts em que a velocidade de instalação/execução importa, deployments no Vercel com runtime Bun, e quando você quer uma única toolchain (run + install + test + build).
- **Prefira Node** para: máxima compatibilidade de ecossistema, ferramentas legadas que assumem Node, ou quando uma dependência tem problemas conhecidos com Bun.

Use quando: adotando Bun, migrando de Node, escrevendo ou depurando scripts/testes Bun, ou configurando Bun no Vercel ou outras plataformas.

## Como Funciona

- **Runtime**: Runtime drop-in compatível com Node (construído sobre o JavaScriptCore, implementado em Zig).
- **Gerenciador de pacotes**: `bun install` é significativamente mais rápido que npm/yarn. O lockfile é `bun.lock` (texto) por padrão no Bun atual; versões mais antigas usavam `bun.lockb` (binário).
- **Bundler**: Bundler e transpilador embutidos para apps e bibliotecas.
- **Test runner**: `bun test` embutido com API similar à do Jest.

**Migração de Node**: Substitua `node script.js` por `bun run script.js` ou `bun script.js`. Rode `bun install` no lugar de `npm install`; a maioria dos pacotes funciona. Use `bun run` para scripts npm; `bun x` para execuções pontuais no estilo npx. Built-ins do Node são suportados; prefira APIs do Bun onde elas existirem para melhor desempenho.

**Vercel**: Defina o runtime como Bun nas configurações do projeto. Build: `bun run build` ou `bun build ./src/index.ts --outdir=dist`. Install: `bun install --frozen-lockfile` para deploys reproduzíveis.

## Exemplos

### Executar e instalar

```bash
# Install dependencies (creates/updates bun.lock or bun.lockb)
bun install

# Run a script or file
bun run dev
bun run src/index.ts
bun src/index.ts
```

### Scripts e env

```bash
bun run --env-file=.env dev
FOO=bar bun run script.ts
```

### Testes

```bash
bun test
bun test --watch
```

```typescript
// test/example.test.ts
import { expect, test } from "bun:test";

test("add", () => {
  expect(1 + 2).toBe(3);
});
```

### API de Runtime

```typescript
const file = Bun.file("package.json");
const json = await file.json();

Bun.serve({
  port: 3000,
  fetch(req) {
    return new Response("Hello");
  },
});
```

## Boas Práticas

- Commite o lockfile (`bun.lock` ou `bun.lockb`) para instalações reproduzíveis.
- Prefira `bun run` para scripts. Para TypeScript, o Bun roda `.ts` nativamente.
- Mantenha as dependências atualizadas; o Bun e o ecossistema evoluem rapidamente.
