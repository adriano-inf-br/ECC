# Componentes

Componentes Angular são os blocos de construção fundamentais de uma aplicação. Cada componente consiste em uma classe TypeScript com comportamentos, um template HTML e um selector CSS.

## Definição de Componente

Use o decorator `@Component` para definir os metadados de um componente.

```ts
@Component({
  selector: 'app-profile',
  template: `
    <img src="profile.jpg" alt="Profile photo" />
    <button (click)="save()">Save</button>
  `,
  styles: `
    img {
      border-radius: 50%;
    }
  `,
})
export class Profile {
  save() {
    /* ... */
  }
}
```

## Opções de Metadados

- `selector`: O selector CSS que identifica este componente nos templates.
- `template`: Template HTML inline (preferido para templates pequenos).
- `templateUrl`: Caminho para um arquivo HTML externo.
- `styles`: Estilos CSS inline.
- `styleUrl` / `styleUrls`: Caminho(s) para arquivo(s) CSS externo(s).
- `imports`: Lista os componentes, diretivas ou pipes usados no template deste componente.

## Usando Componentes

Para usar um componente, adicione-o ao array `imports` do componente consumidor e use seu selector no template.

```ts
@Component({
  selector: 'app-root',
  imports: [Profile],
  template: `<app-profile />`,
})
export class App {}
```

## Controle de Fluxo no Template

O Angular usa blocos embutidos para renderização condicional e loops.

### Renderização Condicional (`@if`)

Use `@if` para mostrar conteúdo condicionalmente. Você pode incluir blocos `@else if` e `@else`.

```html
@if (user.isAdmin) {
<admin-dashboard />
} @else if (user.isModerator) {
<mod-dashboard />
} @else {
<standard-dashboard />
}
```

**Aliasing de resultado**: Salve o resultado da expressão para reutilização.

```html
@if (user.settings(); as settings) {
<p>Theme: {{ settings.theme }}</p>
}
```

### Loops (`@for`)

O bloco `@for` itera sobre coleções. A expressão `track` é **obrigatória** para desempenho e reutilização do DOM.

```html
<ul>
  @for (item of items(); track item.id; let i = $index, total = $count) {
  <li>{{ i + 1 }}/{{ total }}: {{ item.name }}</li>
  } @empty {
  <li>No items to display.</li>
  }
</ul>
```

**Variáveis Implícitas**: `$index`, `$count`, `$first`, `$last`, `$even`, `$odd`.

### Alternando Conteúdo (`@switch`)

O bloco `@switch` renderiza conteúdo com base em um valor. Ele usa igualdade estrita (`===`) e **não tem fallthrough**.

```html
@switch (status()) { @case ('loading') { <app-spinner /> } @case ('error') { <app-error-msg /> }
@case ('success') { <app-data-grid /> } @default {
<p>Unknown status</p>
} }
```

**Verificação Exaustiva de Tipos**: Use `@default never;` para garantir que todos os casos de um union type sejam tratados.

```html
@switch (state) { @case ('on') { ... } @case ('off') { ... } @default never; // Erro se um novo
estado como 'standby' for adicionado }
```

## Conceitos Centrais

- **Elemento Host**: O elemento do DOM que corresponde ao selector do componente.
- **View**: O DOM renderizado pelo template do componente dentro do elemento host.
- **Standalone**: Por padrão, os componentes são standalone (desde o Angular 19, `standalone: true` é o padrão). Para versões mais antigas, `standalone: true` deve ser explícito ou o componente deve fazer parte de um `NgModule`.
- **Árvore de Componentes**: Aplicações Angular são estruturadas como uma árvore de componentes, onde cada componente pode hospedar componentes filhos.
- **Nomenclatura de Componentes**: Não adicione o sufixo `Component` às classes de Componente (ex.: AppComponent), a menos que o projeto tenha sido configurado para usar essa configuração de nomenclatura.
