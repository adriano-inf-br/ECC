# Estratégias de Renderização

O Angular suporta múltiplas estratégias de renderização para otimizar SEO, performance e interatividade.

## 1. Renderização no Cliente (CSR)

**Estratégia Padrão.** O conteúdo é renderizado inteiramente no navegador.

- **Caso de uso**: Dashboards interativos, ferramentas internas.
- **Prós**: Mais simples de configurar, baixo custo de servidor.
- **Contras**: SEO ruim, visibilidade de conteúdo inicial mais lenta (precisa aguardar o JS).

## 2. Geração de Site Estático (SSG / Prerendering)

O conteúdo é pré-renderizado em arquivos HTML estáticos em **tempo de build**.

- **Caso de uso**: Páginas de marketing, blogs, documentação.
- **Prós**: Carregamento inicial mais rápido, excelente SEO, compatível com CDN.
- **Contras**: Requer rebuild para atualizações de conteúdo, não serve para dados específicos do usuário.

## 3. Renderização no Servidor (SSR)

O conteúdo é renderizado no servidor para a **requisição inicial**. Navegações subsequentes ocorrem no cliente (estilo SPA).

- **Caso de uso**: Páginas de produto de e-commerce, sites de notícias, conteúdo dinâmico personalizado.
- **Prós**: Excelente SEO, visibilidade rápida do conteúdo inicial.
- **Contras**: Requer um servidor (Node.js), maior custo/latência de servidor.

## Hidratação (Hydration)

A hidratação é o processo de tornar o HTML renderizado no servidor interativo no navegador.

- **Hidratação Completa**: A aplicação inteira se torna interativa de uma vez.
- **Hidratação Incremental**: (Avançado) Partes se tornam interativas conforme necessário usando blocos `@defer`.
- **Event Replay**: Captura e reproduz eventos do usuário que ocorreram antes de a hidratação terminar.

## Matriz de Decisão

| Requisito                       | Estratégia           |
| :------------------------------ | :------------------- |
| **SEO + Conteúdo Estático**     | SSG                  |
| **SEO + Conteúdo Dinâmico**     | SSR                  |
| **Sem SEO + Alta Interatividade** | CSR                |
| **Misto**                       | Híbrido (por rota)   |
