# Animações de Transição de Rota

O Angular Router suporta a **View Transitions API** do navegador para transições visuais suaves entre rotas.

## Habilitando View Transitions

Adicione `withViewTransitions()` à configuração do seu router.

```ts
provideRouter(routes, withViewTransitions());
```

Isso é um **aprimoramento progressivo**. Em navegadores que não suportam a API, o router continuará funcionando, mas sem a animação de transição.

## Como Funciona

1. O navegador tira uma captura de tela do estado antigo.
2. O router atualiza o DOM (ativa o novo componente).
3. O navegador tira uma captura de tela do novo estado.
4. O navegador anima entre os dois estados.

## Personalizando com CSS

As transições são personalizadas em **arquivos CSS globais** (não em CSS com escopo de componente).

Use os pseudo-elementos `::view-transition-old()` e `::view-transition-new()`.

```css
/* Exemplo: Cross-fade + Slide */
::view-transition-old(root) {
  animation: 90ms cubic-bezier(0.4, 0, 1, 1) both fade-out;
}
::view-transition-new(root) {
  animation: 210ms cubic-bezier(0, 0, 0.2, 1) 90ms both fade-in;
}
```

## Controle Avançado

Use `onViewTransitionCreated` para pular transições ou personalizar o comportamento com base no contexto da navegação.

```ts
withViewTransitions({
  onViewTransitionCreated: ({transition, from, to}) => {
    // Pular animação para rotas específicas
    if (to.url === '/no-animation') {
      transition.skipTransition();
    }
  },
});
```

## Boas Práticas

- **Estilos Globais**: Sempre defina as animações de transição em `styles.css` para evitar problemas de encapsulamento de view.
- **Nomes de View Transition**: Atribua `view-transition-name` únicos a elementos que devem transicionar suavemente entre rotas (por exemplo, uma imagem de cabeçalho).
