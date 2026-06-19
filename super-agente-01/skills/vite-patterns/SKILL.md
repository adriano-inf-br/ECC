---
name: vite-patterns
description: Padrões da ferramenta de build Vite incluindo configuração, plugins, HMR, variáveis de ambiente, configuração de proxy, SSR, modo biblioteca, pré-empacotamento de dependências e otimização de build. Ative ao trabalhar com vite.config.ts, plugins Vite ou projetos baseados em Vite.
metadata:
  origin: ECC
---

# Padrões Vite

Padrões de ferramenta de build e servidor de desenvolvimento para projetos Vite 8+. Cobre configuração, variáveis de ambiente, configuração de proxy, modo biblioteca, pré-empacotamento de dependências e armadilhas comuns de produção.

## Quando Usar

- Configurando `vite.config.ts` ou `vite.config.js`
- Configurando variáveis de ambiente ou arquivos `.env`
- Configurando proxy do servidor de desenvolvimento para backends de API
- Otimizando a saída do build (chunks, minificação, assets)
- Publicando bibliotecas com `build.lib`
- Solucionando problemas de pré-empacotamento de dependências ou interoperabilidade CJS/ESM
- Depurando HMR, servidor de desenvolvimento ou erros de build
- Escolhendo ou ordenando plugins Vite

## Como Funciona

- **Modo dev** serve arquivos fonte como ESM nativo — sem empacotamento. As transformações ocorrem sob demanda por requisição de módulo, por isso as inicializações a frio são rápidas e o HMR é preciso.
- **Modo build** usa Rolldown (v7+) ou Rollup (v5–v6) para empacotar a aplicação para produção com tree-shaking, code-splitting e minificação baseada em Oxc.
- **Pré-empacotamento de dependências** converte dependências CJS/UMD para ESM uma vez via esbuild e armazena o resultado em `node_modules/.vite`, de modo que inicializações subsequentes ignoram o trabalho.
- **Plugins** compartilham uma interface unificada entre dev e build — o mesmo objeto de plugin funciona tanto para as transformações sob demanda do servidor de desenvolvimento quanto para o pipeline de produção.
- **Variáveis de ambiente** são injetadas estaticamente no momento do build. Variáveis com prefixo `VITE_` tornam-se constantes públicas no bundle; tudo sem esse prefixo é invisível para o código do cliente.

## Exemplos

### Estrutura de Configuração

#### Configuração Básica

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': new URL('./src', import.meta.url).pathname },
  },
})
```

#### Configuração Condicional

```typescript
// vite.config.ts
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd())   // somente prefixo VITE_ (seguro)

  return {
    plugins: [react()],
    server: command === 'serve' ? { port: 3000 } : undefined,
    define: {
      __API_URL__: JSON.stringify(env.VITE_API_URL),
    },
  }
})
```

#### Opções de Configuração Principais

| Chave | Padrão | Descrição |
|-----|---------|-------------|
| `root` | `'.'` | Raiz do projeto (onde fica o `index.html`) |
| `base` | `'/'` | Caminho base público para assets implantados |
| `envPrefix` | `'VITE_'` | Prefixo para variáveis de ambiente expostas ao cliente |
| `build.outDir` | `'dist'` | Diretório de saída |
| `build.minify` | `'oxc'` | Minificador (`'oxc'`, `'terser'`, ou `false`) |
| `build.sourcemap` | `false` | `true`, `'inline'`, ou `'hidden'` |

### Plugins

#### Plugins Essenciais

A maioria das necessidades de plugin é coberta por um punhado de pacotes bem mantidos. Recorra a eles antes de escrever o seu próprio.

| Plugin | Finalidade | Quando usar |
|--------|---------|-------------|
| `@vitejs/plugin-react-swc` | HMR do React + Fast Refresh via SWC | Padrão para apps React (mais rápido que a variante Babel) |
| `@vitejs/plugin-react` | HMR do React + Fast Refresh via Babel | Somente se precisar de plugins Babel (emotion, decoradores MobX) |
| `@vitejs/plugin-vue` | Suporte a SFC do Vue 3 | Apps Vue |
| `vite-plugin-checker` | Executa `tsc` + ESLint em thread worker com overlay HMR | **Qualquer app TypeScript** — Vite NÃO faz verificação de tipos durante `vite build` |
| `vite-tsconfig-paths` | Respeita os aliases de `paths` do `tsconfig.json` | Sempre que você já tiver aliases no `tsconfig.json` |
| `vite-plugin-dts` | Emite arquivos `.d.ts` no modo biblioteca | Publicando bibliotecas TypeScript |
| `vite-plugin-svgr` | Importa SVGs como componentes React | Apps React que usam SVGs como componentes |
| `rollup-plugin-visualizer` | Relatório de treemap/sunburst do bundle | Auditorias periódicas de tamanho de bundle (use `enforce: 'post'`) |
| `vite-plugin-pwa` | PWA + Workbox com zero configuração | Apps com suporte offline |

**Aviso importante:** `vite build` transpila mas NÃO faz verificação de tipos. Erros de tipo vão silenciosamente para produção a menos que você adicione `vite-plugin-checker` ou execute `tsc --noEmit` no CI.

#### Criando Plugins Personalizados

Criar plugins é raro — a maioria das necessidades é coberta por plugins existentes. Quando você precisar de um, comece inline em `vite.config.ts` e extraia apenas se for reutilizado.

```typescript
// vite.config.ts — plugin inline mínimo
function myPlugin(): Plugin {
  return {
    name: 'my-plugin',                       // obrigatório, deve ser único
    enforce: 'pre',                           // 'pre' | 'post' (opcional)
    apply: 'build',                           // 'build' | 'serve' (opcional)
    transform(code, id) {
      if (!id.endsWith('.custom')) return
      return { code: transformCustom(code), map: null }
    },
  }
}
```

**Hooks principais:** `transform` (modificar fonte), `resolveId` + `load` (módulos virtuais), `transformIndexHtml` (injetar no HTML), `configureServer` (adicionar middleware de dev), `hotUpdate` (HMR personalizado — substitui o `handleHotUpdate` descontinuado na v7+).

**Módulos virtuais** usam a convenção de prefixo `\0` — `resolveId` retorna `'\0virtual:my-id'` para que outros plugins o ignorem. O código do usuário importa `'virtual:my-id'`.

Para a API completa de plugins, veja [vite.dev/guide/api-plugin](https://vite.dev/guide/api-plugin). Use `vite-plugin-inspect` durante o desenvolvimento para depurar o pipeline de transformação.

### API HMR

Os plugins de framework (`@vitejs/plugin-react`, `@vitejs/plugin-vue`, etc.) gerenciam o HMR automaticamente. Use `import.meta.hot` diretamente apenas ao criar stores de estado personalizados, ferramentas de desenvolvimento ou utilitários independentes de framework que precisam persistir estado entre atualizações.

```typescript
// src/store.ts — HMR manual para um módulo vanilla
if (import.meta.hot) {
  // Persiste o estado entre atualizações (deve MUTAR, nunca reatribuir .data)
  import.meta.hot.data.count = import.meta.hot.data.count ?? 0

  // Limpa efeitos colaterais antes que o módulo seja substituído
  import.meta.hot.dispose((data) => clearInterval(data.intervalId))

  // Aceita as próprias atualizações deste módulo
  import.meta.hot.accept()
}
```

Todo o código `import.meta.hot` é removido por tree-shaking dos builds de produção — não é necessário remover guards manualmente.

### Variáveis de Ambiente

Vite carrega `.env`, `.env.local`, `.env.[mode]` e `.env.[mode].local` nessa ordem (o posterior sobrescreve o anterior); arquivos `*.local` são incluídos no `.gitignore` e destinados a segredos locais.

#### Acesso no Lado do Cliente

Apenas variáveis com prefixo `VITE_` são expostas ao código do cliente:

```typescript
import.meta.env.VITE_API_URL   // string
import.meta.env.MODE            // 'development' | 'production' | personalizado
import.meta.env.BASE_URL        // valor da configuração base
import.meta.env.DEV             // boolean
import.meta.env.PROD            // boolean
import.meta.env.SSR             // boolean
```

#### Usando Variáveis de Ambiente na Configuração

```typescript
// vite.config.ts
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())          // somente prefixo VITE_ (seguro)
  return {
    define: {
      __API_URL__: JSON.stringify(env.VITE_API_URL),
    },
  }
})
```

### Segurança

#### O Prefixo `VITE_` NÃO é uma Fronteira de Segurança

Qualquer variável com prefixo `VITE_` é **injetada estaticamente no bundle do cliente no momento do build**. Minificação, codificação base64 e desabilitação de source maps NÃO a ocultam. Um atacante determinado pode extrair qualquer variável `VITE_` do JavaScript enviado.

**Regra:** Apenas valores públicos (URLs de API, feature flags, chaves públicas) vão em variáveis `VITE_`. Segredos (tokens de API, URLs de banco de dados, chaves privadas) DEVEM ficar no lado do servidor, atrás de uma API ou função serverless.

#### A Armadilha do `loadEnv('')`

```typescript
// RUIM: passar '' como terceiro argumento carrega TODAS as variáveis de ambiente — incluindo segredos do servidor —
// e as disponibiliza para injeção no código do cliente via `define`.
const env = loadEnv(mode, process.cwd(), '')

// BOM: lista de prefixos explícita
const env = loadEnv(mode, process.cwd(), ['VITE_', 'APP_'])
```

#### Source Maps em Produção

Source maps de produção expõem seu código-fonte original. Desabilite-os a menos que você os envie para um rastreador de erros (Sentry, Bugsnag) e os exclua localmente depois:

```typescript
build: {
  sourcemap: false,                                  // padrão — mantenha assim
}
```

#### Lista de Verificação do `.gitignore`

- `.env.local`, `.env.*.local` — substituições de segredos locais
- `dist/` — saída do build
- `node_modules/.vite` — cache de pré-bundle (entradas obsoletas causam erros fantasma)

### Proxy do Servidor

```typescript
// vite.config.ts — server.proxy
server: {
  proxy: {
    '/foo': 'http://localhost:4567',                    // atalho de string

    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,                               // necessário para backends com virtual hosting
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
}
```

Para proxy WebSocket, adicione `ws: true` à configuração da rota.

### Otimização de Build

#### Chunks Manuais

```typescript
// vite.config.ts — build.rolldownOptions
build: {
  rolldownOptions: {
    output: {
      // Forma de objeto: agrupa pacotes específicos
      manualChunks: {
        'react-vendor': ['react', 'react-dom'],
        'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-popover'],
      },
    },
  },
}
```

```typescript
// Forma de função: divide por heurística
manualChunks(id) {
  if (id.includes('node_modules/react')) return 'react-vendor'
  if (id.includes('node_modules')) return 'vendor'
}
```

### Performance

#### Evite Barrel Files

Barrel files (`index.ts` re-exportando tudo de um diretório) forçam o Vite a carregar cada arquivo re-exportado mesmo quando você importa um único símbolo. Este é o principal gargalo do servidor de desenvolvimento apontado pela documentação oficial.

```typescript
// RUIM — importar um utilitário força o Vite a carregar todo o barrel
import { slash } from '@/utils'

// BOM — importação direta, apenas o arquivo é carregado
import { slash } from '@/utils/slash'
```

#### Seja Explícito com Extensões de Importação

Cada extensão implícita força até 6 verificações do sistema de arquivos via `resolve.extensions`. Em bases de código grandes, isso se acumula.

```typescript
// RUIM
import Component from './Component'

// BOM
import Component from './Component.tsx'
```

Restrinja `allowImportingTsExtensions` do `tsconfig.json` + `resolve.extensions` apenas às extensões que você realmente usa.

#### Pré-aqueça Rotas de Caminho Crítico

`server.warmup.clientFiles` pré-transforma entradas conhecidas de caminho crítico antes que o navegador as solicite — eliminando o waterfall de requisições de carregamento a frio em apps grandes.

```typescript
// vite.config.ts
server: {
  warmup: {
    clientFiles: ['./src/main.tsx', './src/routes/**/*.tsx'],
  },
}
```

#### Perfilando Servidores de Desenvolvimento Lentos

Quando `vite dev` parece lento, comece com `vite --profile`, interaja com o app e pressione `p+enter` para salvar um `.cpuprofile`. Carregue-o no [Speedscope](https://www.speedscope.app) para encontrar quais plugins estão consumindo tempo — geralmente os hooks `buildStart`, `config` ou `configResolved` em plugins da comunidade.

### Modo Biblioteca

Ao publicar um pacote npm, use `build.lib`. Dois pontos de atenção importam mais do que detalhes de configuração:

1. **Tipos não são emitidos** — adicione `vite-plugin-dts` ou execute `tsc --emitDeclarationOnly` separadamente.
2. **Dependências peer DEVEM ser externalizadas** — peers não listados são empacotados na sua biblioteca, causando erros de runtime duplicados nos consumidores.

```typescript
// vite.config.ts
build: {
  lib: {
    entry: 'src/index.ts',
    formats: ['es', 'cjs'],
    fileName: (format) => `my-lib.${format}.js`,
  },
  rolldownOptions: {
    external: ['react', 'react-dom', 'react/jsx-runtime'],  // toda dep peer
  },
}
```

### Externos SSR

Configurações bare com `createServer({ middlewareMode: true })` são território de autores de frameworks. A maioria dos apps deve usar Nuxt, Remix, SvelteKit, Astro ou TanStack Start. O que você *vai* ajustar como usuário de framework é a configuração de externos quando dependências quebram no SSR:

```typescript
// vite.config.ts — opções ssr
ssr: {
  external: ['node-native-package'],           // mantém como require() no bundle SSR
  noExternal: ['esm-only-package'],            // força empacotamento na saída SSR (corrige a maioria dos erros SSR)
  target: 'node',                              // 'node' ou 'webworker'
}
```

### Pré-empacotamento de Dependências

O Vite pré-empacota dependências para converter CJS/UMD para ESM e reduzir a contagem de requisições.

```typescript
// vite.config.ts — optimizeDeps
optimizeDeps: {
  include: [
    'lodash-es',                              // força o pré-empacotamento de deps pesadas conhecidas
    'cjs-package',                            // deps CJS que causam problemas de interoperabilidade
    'deep-lib/components/**',                 // glob para importações profundas
  ],
  exclude: ['local-esm-package'],             // deve ser ESM válido se excluído
  force: true,                                // ignora cache, re-otimiza (depuração temporária)
}
```

### Armadilhas Comuns

#### Dev Não Corresponde ao Build

Dev usa esbuild/Rolldown para transformações; build usa Rolldown para empacotamento. Bibliotecas CJS podem se comportar de forma diferente entre os dois. Sempre verifique com `vite build && vite preview` antes de implantar.

#### Chunks Obsoletos Após Implantação

Novos builds produzem novos hashes de chunk. Usuários com sessões ativas solicitam nomes de arquivo antigos que não existem mais. O Vite não tem solução nativa. Mitigações:

- Mantenha os arquivos antigos de `dist/assets/` ativos durante uma janela de implantação
- Capture erros de importação dinâmica no seu router e force um recarregamento de página

#### Docker e Containers

O Vite se vincula ao `localhost` por padrão, que é inacessível de fora de um container:

```typescript
// vite.config.ts — configuração Docker/container
server: {
  host: true,                                  // vincula 0.0.0.0
  hmr: { clientPort: 3000 },                   // se atrás de um proxy reverso
}
```

#### Acesso a Arquivos em Monorepo

O Vite restringe o serving de arquivos à raiz do projeto. Pacotes fora da raiz são bloqueados:

```typescript
// vite.config.ts — acesso a arquivos em monorepo
server: {
  fs: {
    allow: ['..'],                             // permite o diretório pai (raiz do workspace)
  },
}
```

### Anti-Padrões

```typescript
// RUIM: Definir envPrefix como '' expõe TODAS as variáveis de ambiente (incluindo segredos) ao cliente
envPrefix: ''

// RUIM: Assumir que require() funciona no código-fonte da aplicação — Vite é ESM-first
const lib = require('some-lib')                // use import em vez disso

// RUIM: Dividir cada node_module em seu próprio chunk — cria centenas de arquivos minúsculos
manualChunks(id) {
  if (id.includes('node_modules')) {
    return id.split('node_modules/')[1].split('/')[0]   // um chunk por pacote
  }
}

// RUIM: Não externalizar deps peer no modo biblioteca — causa erros de runtime duplicados
// build.lib sem rolldownOptions.external

// RUIM: Usar o minificador esbuild descontinuado
build: { minify: 'esbuild' }                  // use 'oxc' (padrão) ou 'terser'

// RUIM: Mutar import.meta.hot.data por reatribuição
import.meta.hot.data = { count: 0 }           // ERRADO: deve mutar propriedades, não reatribuir
import.meta.hot.data.count = 0                 // CORRETO
```

**Anti-padrões de processo:**

- **`vite preview` NÃO é um servidor de produção** — é um smoke test para o bundle compilado. Implante `dist/` em um host estático real (NGINX, Cloudflare Pages, Vercel static) ou use um Dockerfile multi-stage.
- **Esperar que `vite build` verifique tipos** — ele apenas transpila. Erros de tipo vão silenciosamente para produção. Adicione `vite-plugin-checker` ou execute `tsc --noEmit` no CI.
- **Incluir `@vitejs/plugin-legacy` por padrão** — ele aumenta os bundles em ~40%, quebra analisadores de bundle com source-map e é desnecessário para os 95%+ dos usuários em navegadores modernos. Condicione isso a análises reais, não a suposições.
- **Criar manualmente mais de 30 entradas em `resolve.alias` que duplicam os `paths` do `tsconfig.json`** — use `vite-tsconfig-paths` em vez disso. Observado no Excalidraw e PostHog; evite em novos projetos.
- **Deixar `node_modules/.vite` obsoleto após mudanças de deps** — o cache de pré-bundle causa erros fantasma. Limpe-o ao trocar de branch ou após corrigir deps.

## Referência Rápida

| Padrão | Quando Usar |
|---------|-------------|
| `defineConfig` | Sempre — fornece inferência de tipos |
| `loadEnv(mode, root, ['VITE_'])` | Acessar variáveis de ambiente na configuração (prefixo explícito) |
| `vite-plugin-checker` | Qualquer app TypeScript (preenche a lacuna de verificação de tipos) |
| `vite-tsconfig-paths` | Em vez de `resolve.alias` criado manualmente |
| `optimizeDeps.include` | Deps CJS causando problemas de interoperabilidade |
| `server.proxy` | Rotear requisições de API para o backend no dev |
| `server.host: true` | Docker, containers, acesso remoto |
| `server.warmup.clientFiles` | Pré-transformar rotas de caminho crítico |
| `build.lib` + `external` | Publicando pacotes npm |
| `manualChunks` (objeto) | Divisão de bundle de vendor |
| `vite --profile` | Depurar servidor de desenvolvimento lento |
| `vite build && vite preview` | Smoke-test do bundle de produção localmente (NÃO é um servidor de produção) |

## Skills Relacionadas

- `frontend-patterns` — Padrões de componentes React
- `docker-patterns` — Dev containerizado com Vite
- `nextjs-turbopack` — Bundler alternativo para Next.js
