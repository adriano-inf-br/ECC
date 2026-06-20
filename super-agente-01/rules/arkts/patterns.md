---
paths:
  - "**/*.ets"
  - "**/*.ts"
---
# Padrões do HarmonyOS / ArkTS

> This file extends [common/patterns.md](../common/patterns.md) with HarmonyOS and ArkTS-specific patterns.

## Gerenciamento de Estado: Apenas V2

**DEVE usar** o ArkUI State Management V2. Os decorators V1 estão obsoletos e não devem ser usados.

### Decorators V2

| Decorator | Propósito |
|-----------|---------|
| `@ComponentV2` | Marca um struct como um componente V2 |
| `@Local` | Estado local dentro de um componente |
| `@Param` | Props recebidas do pai (somente leitura) |
| `@Event` | Eventos de callback do filho para o pai |
| `@Provider` | Fornece estado a componentes descendentes |
| `@Consumer` | Consome estado de um `@Provider` ancestral |
| `@Monitor` | Observa mudanças de estado (substitui o `@Watch` da V1) |
| `@Computed` | Valores derivados/computados |
| `@ObservedV2` | Torna uma classe observável para o gerenciamento de estado V2 |
| `@Trace` | Marca propriedades observáveis em classes `@ObservedV2` |

### Decorators V1 Proibidos

Nunca use: `@State`, `@Prop`, `@Link`, `@ObjectLink`, `@Observed`, `@Provide`, `@Consume`, `@Watch`, `@Component` (use `@ComponentV2` em vez disso).

### Exemplo de Componente V2

```typescript
@ObservedV2
class UserModel {
  @Trace name: string = ''
  @Trace age: number = 0
}

@ComponentV2
struct UserCard {
  @Param user: UserModel = new UserModel()
  @Event onDelete: () => void = () => {}

  build() {
    Column() {
      Text(this.user.name)
        .fontSize($r('app.float.font_size_title'))
      Text(`${this.user.age}`)
        .fontSize($r('app.float.font_size_body'))
      Button($r('app.string.delete'))
        .onClick(() => this.onDelete())
    }
  }
}
```

### Sincronização de Estado

```typescript
@ComponentV2
struct ParentPage {
  @Provider('userState') userModel: UserModel = new UserModel()

  build() {
    Column() {
      ChildComponent()  // recebe automaticamente @Consumer('userState')
    }
  }
}

@ComponentV2
struct ChildComponent {
  @Consumer('userState') userModel: UserModel = new UserModel()

  build() {
    Text(this.userModel.name)
  }
}
```

## Roteamento: Apenas Navigation

**DEVE usar** o componente `Navigation` com `NavPathStack`. Nunca use `@ohos.router`.

### Configuração de Navigation

```typescript
@ComponentV2
struct MainPage {
  @Local navPathStack: NavPathStack = new NavPathStack()

  build() {
    Navigation(this.navPathStack) {
      // Conteúdo da Home
    }
    .navDestination(this.routerMap)
  }

  @Builder
  routerMap(name: string, param: ESObject) {
    if (name === 'detail') {
      DetailPage()
    } else if (name === 'settings') {
      SettingsPage()
    }
  }
}
```

### Navegação entre Páginas

```typescript
// Empilhar uma nova página
this.navPathStack.pushPath({ name: 'detail', param: { id: '123' } })

// Substituir a página atual
this.navPathStack.replacePath({ name: 'settings' })

// Voltar (pop)
this.navPathStack.pop()

// Voltar à raiz
this.navPathStack.clear()
```

### Subpágina NavDestination

```typescript
@ComponentV2
struct DetailPage {
  build() {
    NavDestination() {
      Column() {
        Text($r('app.string.detail_title'))
      }
    }
    .title($r('app.string.detail_nav_title'))
  }
}
```

## Padrão de Arquitetura: MVVM

Arquitetura recomendada para aplicações HarmonyOS:

```
feature/
  |-- model/           # Modelos de dados (classes @ObservedV2)
  |-- viewmodel/       # Lógica de negócio (classes ViewModel)
  |-- view/            # Componentes de UI (structs @ComponentV2)
  |-- service/         # Chamadas de API, acesso a dados
```

- **View**: Apenas lógica de renderização, sem lógica de negócio em `build()`
- **ViewModel**: Toda a lógica de negócio encapsulada aqui
- **Model**: Classes de dados puras com `@ObservedV2` e `@Trace`
- **Service**: Requisições de rede, operações de banco de dados, I/O de arquivos

## Padrões de Animação do ArkUI

### Animação Orientada por Estado

```typescript
@ComponentV2
struct AnimatedCard {
  @Local isExpanded: boolean = false
  @Local cardScale: number = 0.8

  build() {
    Column() {
      // Conteúdo
    }
    .scale({ x: this.cardScale, y: this.cardScale })
    .animation({ duration: 300, curve: Curve.EaseInOut })
    .onClick(() => {
      this.isExpanded = !this.isExpanded
      this.cardScale = this.isExpanded ? 1.0 : 0.8
    })
  }
}
```

### Regras de Animação

- Prefira as APIs de animação nativas do HarmonyOS e templates avançados
- Use UI declarativa com animações orientadas por estado (altere variáveis de estado para disparar animações)
- Defina `renderGroup(true)` para animações complexas de subcomponentes para reduzir lotes de renderização
- **NUNCA** altere com frequência `width`, `height`, `padding`, `margin` durante animações - impacto severo no desempenho
- Use `animateTo` para controle explícito de animação
- Prefira `transform` (translate, scale, rotate) e `opacity` para animações de bom desempenho

## Padrões de Desempenho

### LazyForEach para Listas Grandes

```typescript
@ComponentV2
struct LargeList {
  @Local dataSource: MyDataSource = new MyDataSource()

  build() {
    List() {
      LazyForEach(this.dataSource, (item: ItemModel) => {
        ListItem() {
          ItemComponent({ item: item })
        }
      }, (item: ItemModel) => item.id)
    }
  }
}
```

### Reuso de Componentes

- Extraia componentes reutilizáveis para arquivos separados
- Use `@Builder` para fragmentos de UI leves dentro de um componente
- Use `@Param` para componentes configuráveis

## Referências de Recursos

Sempre defina constantes de UI como recursos e referencie via `$r()`:

```typescript
// RUIM: valores hardcoded
Text('Hello')
  .fontSize(16)
  .fontColor('#333333')

// BOM: referências de recurso
Text($r('app.string.greeting'))
  .fontSize($r('app.float.font_size_body'))
  .fontColor($r('app.color.text_primary'))
```
