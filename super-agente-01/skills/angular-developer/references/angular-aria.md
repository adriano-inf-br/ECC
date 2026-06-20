# Angular Aria

O Angular Aria (`@angular/aria`) é uma coleção de diretivas headless e acessíveis que implementam padrões comuns do WAI-ARIA. Essas diretivas cuidam de interações de teclado, atributos ARIA, gerenciamento de foco e suporte a leitores de tela.

**Como um agent de IA, seu papel é fornecer a estrutura HTML e a estilização CSS**, enquanto as diretivas cuidam da lógica complexa de acessibilidade.

## Estilizando Componentes Headless

Como os componentes do Angular Aria são headless, eles não vêm com estilos padrão. Você **deve** usar CSS para estilizar diferentes estados com base nos atributos ARIA ou nas classes estruturais que as diretivas aplicam automaticamente.

Atributos ARIA comuns para mirar no CSS:

- `[aria-expanded="true"]` / `[aria-expanded="false"]`
- `[aria-selected="true"]`
- `[aria-disabled="true"]`
- `[aria-current="page"]` (para navegação)

---

**CRÍTICO**: Antes de usar este pacote, ele deve ser instalado via gerenciador de pacotes. Confirme que ele foi instalado no projeto. Use `npm install @angular/aria` para instalar, se necessário.

## 1. Accordion

Organiza conteúdo relacionado em seções expansíveis/recolhíveis.

**Uso:** O Accordion é um componente de layout projetado para organizar conteúdo em grupos lógicos que os usuários podem expandir um de cada vez, reduzindo a rolagem em páginas com muito conteúdo. Use-o para FAQs, formulários longos ou divulgação progressiva de informações, mas evite-o para navegação primária ou cenários em que os usuários precisam ver várias seções de conteúdo simultaneamente.

**Imports:** `import { AccordionContent, AccordionGroup, AccordionPanel, AccordionTrigger } from '@angular/aria/accordion';`

**Diretivas:** `ngAccordionGroup`, `ngAccordionTrigger`, `ngAccordionPanel`, `ngAccordionContent` (para lazy loading).

```ts
@Component({
  selector: 'app-cmp',
  imports: [AccordionContent, AccordionGroup, AccordionPanel, AccordionTrigger],
  template: `...`,
  styles: [],
})
export class App {
  protected readonly title = signal('angular-app');
}
```

```html
<div ngAccordionGroup [multiExpandable]="false">
  <div class="accordion-item">
    <button ngAccordionTrigger panelId="panel-1" class="accordion-header">
      Section 1
      <span class="icon">▼</span>
    </button>
    <div ngAccordionPanel panelId="panel-1" class="accordion-panel">
      <ng-template ngAccordionContent>
        <p>Lazy loaded content here.</p>
      </ng-template>
    </div>
  </div>
</div>
```

**Estratégia de Estilização:**
Mire no atributo `[aria-expanded]` do trigger para girar ícones e estilize a visibilidade do painel.

```css
.accordion-header[aria-expanded='true'] .icon {
  transform: rotate(180deg);
}

/* A diretiva do painel cuida da remoção do DOM, mas você pode estilizar a transição */
.accordion-panel {
  padding: 1rem;
  border-top: 1px solid #ccc;
}
```

---

## 2. Listbox

Uma diretiva fundamental para exibir uma lista de opções. Usada para listas de seleção visíveis (não dropdowns).

**Uso:** Listas selecionáveis visíveis (seleção única ou múltipla).

**Imports:** `import {Listbox, Option} from '@angular/aria/listbox';`

**Diretivas:** `ngListbox`, `ngOption`.

```ts
@Component({
  selector: 'app-cmp',
  imports: [Listbox, Option],
  template: `...`,
  styles: [],
})
export class App {
  protected readonly title = signal('angular-app');
}
```

```html
<!-- orientação horizontal ou vertical -->
<ul ngListbox [(values)]="selectedItems" orientation="horizontal" [multi]="true">
  <li ngOption value="apple" class="option">Apple</li>
  <li ngOption value="banana" class="option">Banana</li>
</ul>
```

**Estratégia de Estilização:**
Mire em `[aria-selected="true"]` para o estado selecionado e em `:focus-visible` ou `[data-active]` para o item focado (o Angular Aria usa roving tabindex ou activedescendant).

```css
.option {
  padding: 8px;
  cursor: pointer;
}
.option[aria-selected='true'] {
  background: #e0f7fa;
  font-weight: bold;
}
/* Estado de foco gerenciado pelo aria */
.option:focus-visible {
  outline: 2px solid blue;
}
```

---

## 3. Combobox, Select e Multiselect

Esses padrões combinam `ngCombobox` com um popup contendo um `ngListbox`.

- **Combobox**: Campo de texto + popup (usado para Autocomplete).
- **Select**: Combobox somente leitura + Listbox de seleção única.
- **Multiselect**: Combobox somente leitura + Listbox de seleção múltipla.

**Uso:** O Combobox é uma diretiva primitiva de baixo nível que sincroniza um campo de texto com um popup, servindo como lógica fundamental para os padrões de autocomplete, select e multiselect. Use-o especificamente para construir filtragem customizada, requisitos de seleção únicos ou coordenação especializada entre input e popup que se desvie dos componentes padrão documentados.

**Imports:**

```
  import {Combobox, ComboboxInput, ComboboxPopupContainer} from '@angular/aria/combobox';
  import {Listbox, Option} from '@angular/aria/listbox';
```

**Diretivas:** `ngCombobox`, `ngComboboxInput`, `ngComboboxPopupContainer`, `ngListbox`, `ngOption`.

```html
<!-- Exemplo: Select padrão -->
<div ngCombobox [readonly]="true">
  <button ngComboboxInput class="select-trigger">
    {{ selectedValue() || 'Choose an option' }}
  </button>

  <ng-template ngComboboxPopupContainer>
    <ul ngListbox [(values)]="selectedValue" class="dropdown-menu">
      <li ngOption value="option1">Option 1</li>
      <li ngOption value="option2">Option 2</li>
    </ul>
  </ng-template>
</div>
```

**Estratégia de Estilização:**
Estilize o container do popup para parecer um dropdown flutuando acima do conteúdo (frequentemente combinado com o CDK Overlay).

```css
.select-trigger {
  width: 200px;
  padding: 8px;
  text-align: left;
}
.dropdown-menu {
  list-style: none;
  padding: 0;
  margin: 0;
  border: 1px solid #ccc;
  background: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

---

## 4. Menu e Menubar

Para ações, comandos e menus de contexto (não para seleção de formulário).

**Uso:** O Menubar é um padrão de navegação de alto nível projetado para construir barras de comando no estilo de aplicações desktop (ex.: File, Edit, View) que permanecem persistentes em toda a interface. É mais bem aproveitado para organizar comandos complexos em categorias lógicas de nível superior com suporte completo de teclado horizontal, mas deve ser evitado para listas de ações isoladas simples ou layouts mobile-first onde o espaço horizontal é limitado.

**Imports:** `import {MenuBar, Menu, MenuContent, MenuItem} from '@angular/aria/menu';`

**Diretivas:** `ngMenuBar`, `ngMenu`, `ngMenuItem`, `ngMenuTrigger`.

```html
<!-- Exemplo de Menubar -->
<ul ngMenuBar class="menubar">
  <li ngMenuItem value="file">
    <button ngMenuTrigger [menu]="fileMenu">File</button>
  </li>
</ul>

<ul ngMenu #fileMenu="ngMenu" class="menu">
  <li ngMenuItem value="new">New</li>
  <li ngMenuItem value="open">Open</li>
</ul>
```

**Estratégia de Estilização:**
Use flexbox para o menubar. Oculte/exiba submenus com base no estado do trigger.

```css
.menubar {
  display: flex;
  gap: 10px;
  list-style: none;
  padding: 0;
}
.menu {
  background: white;
  border: 1px solid #ccc;
  padding: 5px 0;
}
.menu li {
  padding: 5px 15px;
  cursor: pointer;
}
```

---

## 5. Tabs

Seções de conteúdo em camadas onde apenas um painel fica visível.

**Uso:** O componente Tabs é usado para organizar conteúdo relacionado em seções distintas e navegáveis, permitindo que os usuários alternem entre categorias ou visões sem sair da página. É ideal para painéis de configurações, documentação multi-tópico ou dashboards, mas deve ser evitado para fluxos de trabalho sequenciais (steppers) ou quando a navegação envolve mais de 7–8 seções.

**Imports:** `import {Tab, Tabs, TabList, TabPanel, TabContent} from '@angular/aria/tabs';`

**Diretivas:** `ngTabs`, `ngTabList`, `ngTab`, `ngTabPanel`, `ngTabContent`.

```html
<div ngTabs>
  <ul ngTabList class="tab-list">
    <li ngTab value="profile" class="tab-btn">Profile</li>
    <li ngTab value="security" class="tab-btn">Security</li>
  </ul>

  <div ngTabPanel value="profile" class="tab-panel">
    <ng-template ngTabContent>Profile Settings</ng-template>
  </div>
  <div ngTabPanel value="security" class="tab-panel">
    <ng-template ngTabContent>Security Settings</ng-template>
  </div>
</div>
```

**Estratégia de Estilização:**
Mire em `[aria-selected="true"]` nos botões de aba.

```css
.tab-list {
  display: flex;
  border-bottom: 2px solid #ccc;
  list-style: none;
  padding: 0;
}
.tab-btn {
  padding: 10px 20px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}
.tab-btn[aria-selected='true'] {
  border-bottom-color: blue;
  font-weight: bold;
}
.tab-panel {
  padding: 20px;
}
```

---

## 6. Toolbar

Agrupa controles relacionados (como formatação de texto).

**Uso:** A Toolbar é um componente organizacional projetado para agrupar controles relacionados e frequentemente acessados em um único container lógico. É mais bem usada para aprimorar a eficiência do teclado (via navegação por setas) e a estrutura visual em fluxos de trabalho que exigem ações repetidas, como formatação de texto ou controles de mídia.

**Imports:** `import {Toolbar, ToolbarWidget, ToolbarWidgetGroup} from '@angular/aria/toolbar';`

**Diretivas:** `ngToolbar`, `ngToolbarWidget`, `ngToolbarWidgetGroup`.

```html
<div ngToolbar class="toolbar">
  <div ngToolbarWidgetGroup [multi]="true" role="group" aria-label="Formatting">
    <button ngToolbarWidget value="bold" class="tool-btn">B</button>
    <button ngToolbarWidget value="italic" class="tool-btn">I</button>
  </div>
</div>
```

**Estratégia de Estilização:**
Mire em `[aria-pressed="true"]` (para botões de toggle) ou `[aria-checked="true"]` (para grupos de rádio) dentro da toolbar.

```css
.toolbar {
  display: flex;
  gap: 5px;
  padding: 8px;
  background: #f5f5f5;
}
.tool-btn {
  padding: 5px 10px;
  border: 1px solid #ccc;
}
.tool-btn[aria-pressed='true'],
.tool-btn[aria-checked='true'] {
  background: #ddd;
}
```

---

## 7. Tree

Exibe dados hierárquicos (sistemas de arquivos, navegação aninhada).

**Uso:** O componente Tree é projetado para navegar e exibir estruturas de dados hierárquicas e profundamente aninhadas, como sistemas de arquivos, organogramas ou arquiteturas de site complexas. Deve ser usado especificamente para relacionamentos multinível onde os usuários precisam expandir ou recolher ramos, mas deve ser evitado para listas planas, tabelas de dados ou menus de seleção simples.

**Imports:** `import {Tree, TreeItem, TreeItemGroup} from '@angular/aria/tree';`

**Diretivas:** `ngTree`, `ngTreeItem`, `ngTreeGroup`.

```html
<ul ngTree class="tree">
  <li ngTreeItem value="documents">
    <span class="tree-label">Documents</span>
    <ul ngTreeGroup class="tree-group">
      <li ngTreeItem value="resume">Resume.pdf</li>
    </ul>
  </li>
</ul>
```

**Estratégia de Estilização:**
Mire em `[aria-expanded]` para mostrar/ocultar filhos ou girar ícones de chevron. Use `padding-left` em grupos aninhados para mostrar a hierarquia.

```css
.tree,
.tree-group {
  list-style: none;
  padding-left: 20px;
}
.tree-label::before {
  content: '> ';
  display: inline-block;
  transition: transform 0.2s;
}
li[aria-expanded='true'] > .tree-label::before {
  transform: rotate(90deg);
}
```

## 8. Grid

Uma coleção interativa bidimensional de células que permite navegação por setas.

**Uso:** Tabelas de dados, calendários, planilhas e padrões de layout para elementos interativos.
**Diretivas:** `ngGrid`, `ngGridRow`, `ngGridCell`, `ngGridCellWidget`.

```html
<table ngGrid [multi]="true" [enableSelection]="true" class="grid-table">
  <tr ngGridRow>
    <th ngGridCell role="columnheader">Name</th>
    <th ngGridCell role="columnheader">Status</th>
  </tr>
  <tr ngGridRow>
    <td ngGridCell>Project A</td>
    <td ngGridCell [(selected)]="isSelected">
      <button ngGridCellWidget (activated)="onActivate()">Active</button>
    </td>
  </tr>
</table>
```

**Estratégia de Estilização:**
Mire em `[aria-selected="true"]` para células selecionadas e `:focus-visible` para a célula ativa (roving tabindex) ou `[aria-activedescendant]` no container.

```css
.grid-table {
  border-collapse: collapse;
}
[ngGridCell] {
  padding: 8px;
  border: 1px solid #ddd;
}
[ngGridCell][aria-selected='true'] {
  background: #e3f2fd;
}
/* Estado de foco gerenciado por roving tabindex */
[ngGridCell]:focus-visible {
  outline: 2px solid #2196f3;
  outline-offset: -2px;
}
```

## Regras Gerais para Agents

1. **Nunca use elementos HTML nativos como `<select>`** quando solicitado a implementar esses padrões específicos do Aria. Use as diretivas `ng*`.
2. **Trate o CSS manualmente**: Lembre-se de que o `Angular Aria` NÃO fornece estilos. Você deve escrever o CSS, mirando nos atributos ARIA nativos (`aria-expanded`, `aria-selected`, etc.) que as diretivas alternam automaticamente.
3. **Lazy Loading**: Sempre use as diretivas estruturais fornecidas (`ngAccordionContent`, `ngTabContent`) dentro de `ng-template` para painéis de conteúdo pesado, garantindo que sejam renderizados de forma lazy.
