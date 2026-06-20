---
name: ui-to-vue
description: Use quando o usuário tiver screenshots de UI ou exportações de design que precisam de conversão em lote para componentes Vue 3, especialmente com Vant, Element Plus ou Ant Design Vue.
metadata:
  origin: community
---

# UI To Vue

Converta em lote screenshots de design de UI em código de componente Vue 3 Composition API.

## Quando Usar

- O usuário fornece um diretório de screenshots de design ou imagens de exportação de design.
- A aplicação alvo é Vue 3.
- O usuário quer um primeiro passe de componentes de página, componentes compartilhados e fiação de roteador.
- O usuário especifica Vant, Element Plus ou Ant Design Vue como biblioteca de componentes.

## Quando Não Usar

- O usuário tem apenas um screenshot e quer um componente personalizado.
- O projeto alvo não é Vue.
- O design requer lógica de interação detalhada, fluxo de dados ou revisão de acessibilidade.
- Os screenshots contêm dados privados de clientes que não podem ser enviados para uma API de modelo externo.

## Entradas

Use um diretório de entrada que agrupe screenshots por módulo e estado de página:

```text
screenshots/
|-- HomePage/
|   |-- List/
|   |   |-- HomePage-List-Default@3x.png
|   |   `-- cut-images/
|   |-- cut-images/
|   `-- HomePage-Default@3x.png
`-- cut-images/
```

Nomes de diretório de imagem cortada suportados incluem `assets`, `icons`, `sprites`, `cut`, `images` e `cut-images`.

## Modelo de Conversão

- Agrupamento de página: combine screenshots relacionados em um componente de página quando representam estados de lista, detalhe, formulário, carregamento ou vazio.
- Mapeamento de biblioteca UI: mapeie elementos visuais nativos para componentes Vant, Element Plus ou Ant Design Vue quando prático.
- Prioridade de imagem cortada: prefira assets de nível de página, depois assets de nível de módulo, depois assets compartilhados globais.
- Extração de componente: extraia regiões de UI repetidas em componentes compartilhados quando aparecerem mais de uma vez.

## Uso CLI

Execute o conversor com `npx` para que o comando documentado funcione sem depender de um binário global:

```bash
export DASHSCOPE_API_KEY=your_key
npx ui-to-vue-converter@1.0.2 --input ./screenshots --ui vant --output ./src
```

Para bibliotecas UI de desktop:

```bash
npx ui-to-vue-converter@1.0.2 --input ./designs --ui element-plus --output ./src
npx ui-to-vue-converter@1.0.2 --input ./designs --ui antd-vue --output ./src
```

Se o pacote estiver instalado globalmente, o binário `ui-to-vue` pode ser usado diretamente:

```bash
npm install -g ui-to-vue-converter@1.0.2
ui-to-vue --input ./screenshots --ui vant --output ./src
```

## Opções

| Opção | Descrição | Padrão |
| --- | --- | --- |
| `--input` | Diretório de imagens de design | `./screenshots` |
| `--ui` | Biblioteca UI: `vant`, `element-plus` ou `antd-vue` | `vant` |
| `--output` | Diretório de saída | `./src` |
| `--config` | Caminho do arquivo de configuração | `./.ui-to-vue.config.json` |

## Tratamento de Chave de API

O conversor pode ler credenciais DashScope de um arquivo de configuração ou do ambiente. Prefira uma variável de ambiente em repositórios:

```bash
export DASHSCOPE_API_KEY=your_key
```

Se um arquivo de configuração local for necessário, mantenha-o fora do controle de versão:

```json
{
  "apiKey": "your_dashscope_key",
  "input": "./designs",
  "ui": "vant",
  "output": "./src"
}
```

```gitignore
.ui-to-vue.config.json
```

## Segurança e Privacidade

- Trate screenshots de design como material de origem que pode ser enviado para uma API de modelo externo.
- Não execute este fluxo em designs privados de clientes sem permissão.
- Fixe a versão do conversor em fluxos de trabalho repetíveis em vez de usar `@latest`.
- Revise o código Vue gerado antes de commitá-lo.
- Não commite `.ui-to-vue.config.json`, chaves de API, segredos gerados ou screenshots de clientes.

## Lista de Verificação de Revisão de Saída

- [ ] Componentes de página foram gerados em `views/` ou no diretório de saída escolhido.
- [ ] Regiões de UI repetidas foram extraídas em `components/` apenas quando o reuso é claro.
- [ ] A saída do roteador é compatível com o estilo de roteador do projeto alvo.
- [ ] Componentes gerados usam a biblioteca UI solicitada de forma consistente.
- [ ] Unidades CSS geradas correspondem à linha de base do design.
- [ ] O código passa pelo formatador, linter, verificador de tipos e build do projeto.
- [ ] Textos placeholder, dados Mock e assets gerados foram revisados antes do Commit.

## Solução de Problemas

| Problema | Verificar |
| --- | --- |
| Erro `401` ou de autenticação | Confirme que `DASHSCOPE_API_KEY` está definida no shell que executa o comando. |
| `command not found: ui-to-vue` | Use a forma `npx ui-to-vue-converter@1.0.2` ou instale o pacote globalmente. |
| Imagens cortadas são ignoradas | Confirme que o nome do diretório de assets é suportado e aninhado sob a página ou módulo correspondente. |
| Componentes ignoram a biblioteca UI solicitada | Re-execute com um valor `--ui` explícito e inspecione os imports gerados. |
| Dimensões de layout geradas parecem erradas | Confirme que a largura de exportação do screenshot corresponde à linha de base da biblioteca alvo. |

## Referências

- pacote npm: `ui-to-vue-converter`
