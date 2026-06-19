---
name: nextjs-turbopack
description: Next.js 16+ e Turbopack — bundling incremental, cache no sistema de arquivos, velocidade de desenvolvimento e quando usar Turbopack vs webpack.
metadata:
  origin: ECC
---

# Next.js e Turbopack

O Next.js 16+ usa Turbopack por padrão para desenvolvimento local: um bundler incremental escrito em Rust que acelera significativamente a inicialização do ambiente de desenvolvimento e as atualizações por hot reload.

## Quando Usar

- **Turbopack (padrão de dev)**: Use para o desenvolvimento do dia a dia. Inicialização a frio e HMR mais rápidos, especialmente em aplicações grandes.
- **Webpack (dev legado)**: Use somente se você encontrar um bug no Turbopack ou depender de um plugin exclusivo do webpack em desenvolvimento. Desabilite com `--webpack` (ou `--no-turbopack` dependendo da sua versão do Next.js; verifique a documentação da sua versão).
- **Produção**: O comportamento do Build de produção (`next build`) pode usar Turbopack ou webpack dependendo da versão do Next.js; verifique a documentação oficial do Next.js para a sua versão.

Use quando: desenvolver ou depurar aplicações Next.js 16+, diagnosticar inicialização lenta do ambiente de desenvolvimento ou HMR, ou otimizar bundles de produção.

## Como Funciona

- **Turbopack**: Bundler incremental para o ambiente de desenvolvimento do Next.js. Usa cache no sistema de arquivos para que reinicializações sejam muito mais rápidas (ex.: 5–14x em projetos grandes).
- **Padrão em desenvolvimento**: A partir do Next.js 16, `next dev` executa com Turbopack a menos que seja desabilitado.
- **Cache no sistema de arquivos**: Reinicializações reutilizam trabalho anterior; o cache normalmente fica em `.next`; nenhuma configuração extra é necessária para uso básico.
- **Bundle Analyzer (Next.js 16.1+)**: Bundle Analyzer experimental para inspecionar a saída e encontrar dependências pesadas; habilite via config ou flag experimental (veja a documentação do Next.js para a sua versão).

## Exemplos

### Comandos

```bash
next dev
next build
next start
```

### Uso

Execute `next dev` para desenvolvimento local com Turbopack. Use o Bundle Analyzer (veja a documentação do Next.js) para otimizar code-splitting e reduzir dependências grandes. Prefira App Router e server components sempre que possível.

## Nomenclatura de Arquivo de Middleware

O Next.js 16 introduziu `proxy.ts` como nome do arquivo de middleware, substituindo a convenção anterior de `middleware.ts`:

- **Next.js 16+**: use `proxy.ts` na raiz do projeto
- **Anterior ao Next.js 16**: use `middleware.ts` na raiz do projeto

A mudança de nome está vinculada à **versão do Next.js**, não ao bundler (Turbopack ou webpack) em uso. Sempre verifique a documentação oficial para a versão que você está revisando.

**Não sinalize `proxy.ts` como um arquivo de middleware mal nomeado ou ausente em projetos Next.js 16.** O arquivo está correto e é intencional. Sugerir uma renomeação para `middleware.ts` quebrará a execução do middleware.

Referência: [Documentação de proxy do Next.js](https://nextjs.org/docs/app/getting-started/proxy)

## Boas Práticas

- Mantenha-se em uma versão recente do Next.js 16.x para comportamento estável do Turbopack e do cache.
- Se o desenvolvimento estiver lento, certifique-se de estar usando Turbopack (padrão) e que o cache não está sendo limpo desnecessariamente.
- Para problemas de tamanho de bundle em produção, use as ferramentas oficiais de análise de bundle do Next.js para a sua versão.
