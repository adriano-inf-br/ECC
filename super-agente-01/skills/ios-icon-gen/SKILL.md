---
name: ios-icon-gen
description: Gera ícones de apps iOS como imagesets PNG para catálogos de assets do Xcode a partir de SF Symbols (5000+ nativos da Apple) ou da API do Iconify (275 mil+ ícones open source de mais de 200 coleções). Use ao gerar ícones, criar assets de ícones, adicionar ícones a um catálogo de assets ou buscar ícones para projetos iOS.
metadata:
  origin: community
---

# iOS Icon Generator

Gera imagesets PNG de ícones para catálogos de assets do Xcode a partir de duas fontes.

## Quando Ativar

- Gerando assets de ícones para um projeto Xcode iOS/macOS
- Buscando ícones em coleções open source
- Criando imagesets PNG (1x, 2x, 3x) para catálogos de assets
- Substituindo ícones de placeholder por assets de qualidade de produção
- Combinando com estilos de ícones já existentes em um projeto Xcode

## Princípios Centrais

### 1. Duas Fontes, Um Formato de Saída
Ambas as fontes produzem imagesets idênticos e compatíveis com o Xcode. Escolha com base na necessidade:

| Fonte | Ícones | Requer | Melhor para |
|--------|-------|----------|----------|
| **API do Iconify** | 275.000+ de mais de 200 coleções | Internet | Ampla seleção, estilos específicos, ícones open source |
| **SF Symbols** | 5.000+ símbolos da Apple | apenas macOS | Estilo nativo da Apple, uso offline |

### 2. Sempre Combine com o Estilo Existente
Antes de gerar, verifique os ícones existentes do projeto quanto à consistência de tamanho, cor e peso.

### 3. Estrutura de Saída
Ambos os métodos produzem um imageset completo do Xcode:

```
<output-dir>/<asset-name>.imageset/
  Contents.json
  <asset-name>.png        # 1x (68px padrão)
  <asset-name>@2x.png     # 2x (136px padrão)
  <asset-name>@3x.png     # 3x (204px padrão)
```

## Exemplos

### Passo 1: Avaliar Requisitos

Determine as necessidades do ícone: o que o ícone representa, estilo preferido, cor alvo e tamanho.

Se o projeto já tiver ícones, verifique o estilo existente:
```bash
# Verifica as dimensões do ícone existente
sips -g pixelWidth -g pixelHeight path/to/existing@2x.png
```

### Passo 2: Buscar Ícones

**API do Iconify (recomendada para ampla seleção):**
```bash
# Busca em todas as coleções
$SKILL_DIR/scripts/iconify_gen.sh search "receipt"

# Busca dentro de uma coleção específica
$SKILL_DIR/scripts/iconify_gen.sh search "business card" --prefix mdi

# Lista as coleções disponíveis
$SKILL_DIR/scripts/iconify_gen.sh collections
```

**SF Symbols (para o estilo nativo da Apple):**
Navegue pelo app SF Symbols ou consulte nomes comuns:

| Caso de Uso | Nome do Símbolo |
|----------|-------------|
| Documento | `doc.text`, `doc.fill` |
| Recibo | `doc.text.below.ecg`, `receipt` |
| Pessoa | `person.crop.rectangle`, `person.text.rectangle` |
| Câmera | `camera`, `camera.fill` |
| Escanear | `doc.viewfinder`, `qrcode.viewfinder` |
| Configurações | `gearshape`, `slider.horizontal.3` |

### Passo 3: Pré-visualizar (Opcional)

```bash
# Pré-visualização do Iconify
$SKILL_DIR/scripts/iconify_gen.sh preview mdi:receipt-text-outline
```

### Passo 4: Gerar

**API do Iconify:**
```bash
# Geração básica
$SKILL_DIR/scripts/iconify_gen.sh mdi:receipt-text-outline editTool_expenseReport

# Cor e local de saída personalizados
$SKILL_DIR/scripts/iconify_gen.sh mdi:receipt-text-outline myIcon --color 007AFF --output ./Assets.xcassets/icons
```

Opções: `--size <pt>` (padrão: 68), `--color <hex>` (padrão: 8E8E93), `--output <dir>` (padrão: /tmp/icons)

**SF Symbols:**
```bash
# Geração básica
swift $SKILL_DIR/scripts/generate_icons.swift doc.text.below.ecg editTool_expenseReport

# Cor, peso e saída personalizados
swift $SKILL_DIR/scripts/generate_icons.swift person.crop.rectangle myIcon --color 007AFF --weight regular --output ./Assets.xcassets/icons
```

Opções: `--size <pt>` (padrão: 68), `--color <hex>` (padrão: 8E8E93), `--weight <name>` (padrão: thin), `--output <dir>` (padrão: /tmp/icons)

### Passo 5: Verificar e Integrar

1. Leia o PNG @2x gerado para verificar visualmente
2. Copie para o catálogo de assets caso não tenha sido enviado para lá diretamente:
   ```bash
   cp -r /tmp/icons/<name>.imageset path/to/Assets.xcassets/<group>/
   ```
3. Faça o build do projeto para verificar se o Xcode reconhece os novos assets

## Coleções Populares do Iconify

| Prefixo | Nome | Quantidade | Estilo |
|--------|------|-------|-------|
| `mdi` | Material Design Icons | 7400+ | Variantes preenchidas + contorno |
| `ph` | Phosphor | 9000+ | 6 pesos por ícone |
| `solar` | Solar | 7400+ | Bold, linear, contorno |
| `tabler` | Tabler Icons | 6000+ | Largura de traço consistente |
| `lucide` | Lucide | 1700+ | Limpo, minimalista |
| `ri` | Remix Icon | 3100+ | Variantes preenchidas + linha |
| `carbon` | Carbon | 2400+ | Linguagem de design da IBM |
| `heroicons` | HeroIcons | 1200+ | Companheiro do Tailwind CSS |

Navegue por todas: <https://icon-sets.iconify.design/>

## Referência de Scripts

| Script | Fonte | Caminho |
|--------|--------|------|
| `iconify_gen.sh` | API do Iconify (275 mil+ ícones) | `$SKILL_DIR/scripts/iconify_gen.sh` |
| `generate_icons.swift` | SF Symbols (5 mil+ ícones) | `$SKILL_DIR/scripts/generate_icons.swift` |

## Boas Práticas

- **Busque antes de gerar** -- navegue pelos ícones disponíveis para encontrar a melhor correspondência
- **Combine com o estilo existente do projeto** -- verifique dimensões, cor e peso dos ícones existentes antes de gerar novos
- **Use o Iconify para variedade** -- mais de 200 coleções significam que você pode encontrar o estilo exato de que precisa
- **Use SF Symbols para consistência com a Apple** -- eles combinam perfeitamente com a UI do sistema
- **Gere diretamente no catálogo de assets** -- use `--output ./Assets.xcassets/icons` para pular a cópia manual
- **Verifique visualmente** -- sempre pré-visualize o PNG @2x antes de fazer o commit

## Anti-Padrões

- Gerar ícones sem verificar o estilo de ícone existente do projeto
- Usar cores padrão quando o projeto tem uma paleta de cores definida
- Gerar em tamanhos errados (verifique os ícones existentes primeiro)
- Fazer commit de ícones gerados sem verificação visual
