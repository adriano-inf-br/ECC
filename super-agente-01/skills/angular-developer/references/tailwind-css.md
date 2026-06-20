# Usando Tailwind CSS com Angular

O Tailwind CSS é um framework CSS utility-first que se integra perfeitamente ao Angular.

**ORIENTAÇÃO CRÍTICA PARA O AGENT: SEMPRE concentre-se nas práticas do Tailwind CSS v4. NÃO volte aos padrões antigos do Tailwind v3 (como criar `tailwind.config.js` com diretivas `@tailwind`), pois isso quebrará o build da aplicação. Projetos Angular modernos usam o Tailwind v4.**

## Configuração Automatizada (Recomendada)

A forma mais fácil de adicionar o Tailwind CSS a um projeto Angular é via Angular CLI:

```shell
ng add tailwindcss
```

Isso irá automaticamente:

1. Instalar `tailwindcss` e as dependências de pares (peer dependencies).
2. Configurar o projeto para usar o Tailwind CSS.
3. Adicionar o import adequado aos seus estilos globais.

## Configuração Manual (Tailwind v4)

Se for configurar manualmente, use o seguinte padrão do Tailwind v4:

### 1. Instalar Dependências

Instale o Tailwind CSS e o PostCSS:

```shell
npm install tailwindcss @tailwindcss/postcss postcss
```

### 2. Configurar o PostCSS

Crie um arquivo `.postcssrc.json` na raiz do projeto:

```json
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
```

_(NÃO crie um arquivo `tailwind.config.js`! A configuração no v4 é feita através de variáveis CSS)._

### 3. Importar o Tailwind CSS

No seu arquivo de estilos globais (por exemplo, `src/styles.css`), adicione o import padrão do v4:

```css
@import 'tailwindcss';
```

_(Se estiver usando SCSS, use `@use 'tailwindcss';` em vez disso)._

### 4. Usar Classes Utilitárias

Agora você pode usar classes do Tailwind diretamente nos templates dos seus componentes:

```html
<h1 class="text-3xl font-bold underline">Hello world!</h1>
```

## Resumo para Agents de IA

- **Não use `@tailwind base; @tailwind components; @tailwind utilities;`**. Use `@import 'tailwindcss';`.
- **Não crie `tailwind.config.js`**. A configuração é gerenciada diretamente no CSS via variáveis de tema ou usando configurações do PostCSS.
- Siga rigorosamente a sintaxe e os fluxos de trabalho do v4.
