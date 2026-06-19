---
name: liquid-glass-design
description: Design system Liquid Glass do iOS 26 — material de vidro dinâmico com desfoque, reflexo e morphing interativo para SwiftUI, UIKit e WidgetKit.
---

# Liquid Glass Design System (iOS 26)

Padrões para implementar o Liquid Glass da Apple — um material dinâmico que desfoca o conteúdo atrás dele, reflete cor e luz do conteúdo ao redor e reage a interações de toque e ponteiro. Cobre a integração com SwiftUI, UIKit e WidgetKit.

## Quando Ativar

- Construir ou atualizar apps para iOS 26+ com a nova linguagem de design
- Implementar botões, cards, toolbars ou containers no estilo glass
- Criar transições de morphing entre elementos glass
- Aplicar efeitos Liquid Glass a widgets
- Migrar efeitos de blur/material existentes para a nova API Liquid Glass

## Padrão Central — SwiftUI

### Efeito Glass Básico

A forma mais simples de adicionar Liquid Glass a qualquer view:

```swift
Text("Hello, World!")
    .font(.title)
    .padding()
    .glassEffect()  // Padrão: variante regular, formato cápsula
```

### Personalizando Formato e Tonalidade

```swift
Text("Hello, World!")
    .font(.title)
    .padding()
    .glassEffect(.regular.tint(.orange).interactive(), in: .rect(cornerRadius: 16.0))
```

Principais opções de personalização:
- `.regular` — efeito glass padrão
- `.tint(Color)` — adiciona tonalidade de cor para destaque
- `.interactive()` — reage a interações de toque e ponteiro
- Formato: `.capsule` (padrão), `.rect(cornerRadius:)`, `.circle`

### Estilos de Botão Glass

```swift
Button("Click Me") { /* action */ }
    .buttonStyle(.glass)

Button("Important") { /* action */ }
    .buttonStyle(.glassProminent)
```

### GlassEffectContainer para Múltiplos Elementos

Sempre envolva múltiplas views glass em um container para desempenho e morphing:

```swift
GlassEffectContainer(spacing: 40.0) {
    HStack(spacing: 40.0) {
        Image(systemName: "scribble.variable")
            .frame(width: 80.0, height: 80.0)
            .font(.system(size: 36))
            .glassEffect()

        Image(systemName: "eraser.fill")
            .frame(width: 80.0, height: 80.0)
            .font(.system(size: 36))
            .glassEffect()
    }
}
```

O parâmetro `spacing` controla a distância de fusão — elementos mais próximos mesclam seus formatos glass.

### Unindo Efeitos Glass

Combine múltiplas views em um único formato glass com `glassEffectUnion`:

```swift
@Namespace private var namespace

GlassEffectContainer(spacing: 20.0) {
    HStack(spacing: 20.0) {
        ForEach(symbolSet.indices, id: \.self) { item in
            Image(systemName: symbolSet[item])
                .frame(width: 80.0, height: 80.0)
                .glassEffect()
                .glassEffectUnion(id: item < 2 ? "group1" : "group2", namespace: namespace)
        }
    }
}
```

### Transições de Morphing

Crie um morphing suave quando elementos glass aparecem/desaparecem:

```swift
@State private var isExpanded = false
@Namespace private var namespace

GlassEffectContainer(spacing: 40.0) {
    HStack(spacing: 40.0) {
        Image(systemName: "scribble.variable")
            .frame(width: 80.0, height: 80.0)
            .glassEffect()
            .glassEffectID("pencil", in: namespace)

        if isExpanded {
            Image(systemName: "eraser.fill")
                .frame(width: 80.0, height: 80.0)
                .glassEffect()
                .glassEffectID("eraser", in: namespace)
        }
    }
}

Button("Toggle") {
    withAnimation { isExpanded.toggle() }
}
.buttonStyle(.glass)
```

### Estendendo a Rolagem Horizontal Sob a Sidebar

Para permitir que o conteúdo de rolagem horizontal se estenda sob uma sidebar ou inspector, garanta que o conteúdo do `ScrollView` alcance as bordas inicial/final do container. O sistema trata automaticamente o comportamento de rolagem sob a sidebar quando o layout se estende até as bordas — nenhum modificador adicional é necessário.

## Padrão Central — UIKit

### UIGlassEffect Básico

```swift
let glassEffect = UIGlassEffect()
glassEffect.tintColor = UIColor.systemBlue.withAlphaComponent(0.3)
glassEffect.isInteractive = true

let visualEffectView = UIVisualEffectView(effect: glassEffect)
visualEffectView.translatesAutoresizingMaskIntoConstraints = false
visualEffectView.layer.cornerRadius = 20
visualEffectView.clipsToBounds = true

view.addSubview(visualEffectView)
NSLayoutConstraint.activate([
    visualEffectView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
    visualEffectView.centerYAnchor.constraint(equalTo: view.centerYAnchor),
    visualEffectView.widthAnchor.constraint(equalToConstant: 200),
    visualEffectView.heightAnchor.constraint(equalToConstant: 120)
])

// Adicionar conteúdo ao contentView
let label = UILabel()
label.text = "Liquid Glass"
label.translatesAutoresizingMaskIntoConstraints = false
visualEffectView.contentView.addSubview(label)
NSLayoutConstraint.activate([
    label.centerXAnchor.constraint(equalTo: visualEffectView.contentView.centerXAnchor),
    label.centerYAnchor.constraint(equalTo: visualEffectView.contentView.centerYAnchor)
])
```

### UIGlassContainerEffect para Múltiplos Elementos

```swift
let containerEffect = UIGlassContainerEffect()
containerEffect.spacing = 40.0

let containerView = UIVisualEffectView(effect: containerEffect)

let firstGlass = UIVisualEffectView(effect: UIGlassEffect())
let secondGlass = UIVisualEffectView(effect: UIGlassEffect())

containerView.contentView.addSubview(firstGlass)
containerView.contentView.addSubview(secondGlass)
```

### Efeitos de Borda de Rolagem

```swift
scrollView.topEdgeEffect.style = .automatic
scrollView.bottomEdgeEffect.style = .hard
scrollView.leftEdgeEffect.isHidden = true
```

### Integração Glass com Toolbar

```swift
let favoriteButton = UIBarButtonItem(image: UIImage(systemName: "heart"), style: .plain, target: self, action: #selector(favoriteAction))
favoriteButton.hidesSharedBackground = true  // Desativa o fundo glass compartilhado
```

## Padrão Central — WidgetKit

### Detecção de Modo de Renderização

```swift
struct MyWidgetView: View {
    @Environment(\.widgetRenderingMode) var renderingMode

    var body: some View {
        if renderingMode == .accented {
            // Modo tonalizado: fundo glass tematizado, com tonalidade branca
        } else {
            // Modo de cor completa: aparência padrão
        }
    }
}
```

### Grupos de Acento para Hierarquia Visual

```swift
HStack {
    VStack(alignment: .leading) {
        Text("Title")
            .widgetAccentable()  // Grupo de acento
        Text("Subtitle")
            // Grupo primário (padrão)
    }
    Image(systemName: "star.fill")
        .widgetAccentable()  // Grupo de acento
}
```

### Renderização de Imagem no Modo Acentuado

```swift
Image("myImage")
    .widgetAccentedRenderingMode(.monochrome)
```

### Fundo do Container

```swift
VStack { /* conteúdo */ }
    .containerBackground(for: .widget) {
        Color.blue.opacity(0.2)
    }
```

## Principais Decisões de Design

| Decisão | Justificativa |
|----------|-----------|
| Envolver com GlassEffectContainer | Otimização de desempenho, habilita morphing entre elementos glass |
| Parâmetro `spacing` | Controla a distância de fusão — ajuste fino de quão próximos os elementos devem estar para se mesclar |
| `@Namespace` + `glassEffectID` | Habilita transições suaves de morphing em mudanças de hierarquia de views |
| Modificador `interactive()` | Adesão explícita a reações de toque/ponteiro — nem todo glass deve responder |
| UIGlassContainerEffect no UIKit | Mesmo padrão de container do SwiftUI para consistência |
| Modo de renderização acentuado em widgets | O sistema aplica glass tonalizado quando o usuário seleciona a Tela de Início tonalizada |

## Boas Práticas

- **Sempre use GlassEffectContainer** ao aplicar glass a múltiplas views irmãs — ele habilita morphing e melhora o desempenho de renderização
- **Aplique `.glassEffect()` depois** de outros modificadores de aparência (frame, font, padding)
- **Use `.interactive()`** apenas em elementos que respondem à interação do usuário (botões, itens alternáveis)
- **Escolha o spacing com cuidado** nos containers para controlar quando os efeitos glass se mesclam
- **Use `withAnimation`** ao alterar hierarquias de views para habilitar transições suaves de morphing
- **Teste em todas as aparências** — modo claro, modo escuro e modos acentuado/tonalizado
- **Garanta o contraste de acessibilidade** — o texto sobre glass deve permanecer legível

## Anti-Padrões a Evitar

- Usar múltiplas views `.glassEffect()` isoladas sem um GlassEffectContainer
- Aninhar efeitos glass em excesso — degrada o desempenho e a clareza visual
- Aplicar glass a todas as views — reserve para elementos interativos, toolbars e cards
- Esquecer `clipsToBounds = true` no UIKit ao usar raios de canto
- Ignorar o modo de renderização acentuado em widgets — quebra a aparência da Tela de Início tonalizada
- Usar fundos opacos atrás do glass — anula o efeito de translucidez

## Quando Usar

- Barras de navegação, toolbars e tab bars com o novo design do iOS 26
- Botões de ação flutuantes e containers no estilo card
- Controles interativos que precisam de profundidade visual e feedback de toque
- Widgets que devem se integrar à aparência Liquid Glass do sistema
- Transições de morphing entre estados de UI relacionados
