---
paths:
  - "**/*.ets"
  - "**/*.ts"
  - "**/module.json5"
  - "**/oh-package.json5"
  - "**/build-profile.json5"
---
# Estilo de Código HarmonyOS / ArkTS

> This file extends [common/coding-style.md](../common/coding-style.md) with HarmonyOS and ArkTS-specific content.

## Restrições da Linguagem ArkTS

ArkTS é um subconjunto estrito e de tipagem estática do TypeScript. Violar essas restrições causa **falhas de compilação**.

### Sistema de Tipos

- Sem tipos `any` ou `unknown` - sempre use tipos explícitos
- Sem tipos de acesso por índice - use os nomes dos tipos diretamente
- Sem aliases de tipo condicionais ou a palavra-chave `infer`
- Sem tipos de interseção - use herança
- Sem mapped types - use classes e idiomas regulares
- Sem `typeof` para anotações de tipo - use declarações de tipo explícitas
- Sem asserções `as const` - use anotações de tipo explícitas
- Sem tipagem estrutural - use herança, interfaces ou aliases de tipo
- Sem utility types do TypeScript, exceto `Partial`, `Required`, `Readonly`, `Record`
- Para `Record<K, V>`, o tipo da expressão de índice é `V | undefined`
- Omita anotações de tipo em cláusulas `catch` (ArkTS não suporta `any`/`unknown`)

### Funções & Classes

- Sem function expressions - use arrow functions
- Sem funções aninhadas - use lambdas
- Sem generator functions - use `async`/`await` para multitarefa
- Sem `Function.apply`, `Function.call`, `Function.bind` - siga OOP tradicional para `this`
- Sem expressões de tipo de construtor - use lambdas
- Sem assinaturas de construtor em interfaces ou object types - use métodos ou classes
- Sem declarar campos de classe em construtores - declare no corpo da classe
- Sem `this` em funções autônomas ou métodos estáticos - apenas em métodos de instância
- Sem `new.target`
- Sem definite assignment assertions (`let v!: T`) - use declarações inicializadas
- Sem class literals - introduza tipos de classe nomeados
- Sem usar classes como objetos (atribuindo a variáveis) - declarações de classe introduzem tipos, não valores
- Apenas um bloco estático por classe - mescle todas as instruções estáticas

### Acesso a Objetos & Propriedades

- Sem declaração dinâmica de campo ou acesso `obj["field"]` - use a sintaxe `obj.field`
- Sem o operador `delete` - use um tipo anulável com `null` para marcar ausência
- Sem atribuição de prototype - use classes e interfaces
- Sem o operador `in` - use `instanceof`
- Sem reatribuir métodos de objeto - use funções wrapper ou herança
- Sem a API `Symbol()` (exceto `Symbol.iterator`)
- Sem `globalThis` ou escopo global - use exports/imports explícitos de módulo
- Sem namespaces como objetos - use classes ou módulos
- Sem instruções dentro de namespaces - use funções

### Desestruturação & Spread

- Sem atribuições por desestruturação ou declarações de variáveis - use objetos intermediários e acesso campo a campo
- Sem declarações de parâmetros por desestruturação - passe os parâmetros diretamente, atribua nomes locais manualmente
- Operador spread apenas para expandir arrays (ou classes derivadas de array) em rest parameters ou literais de array

### Módulos & Imports

- Sem `require()` - use a sintaxe regular de `import`
- Sem `export = ...` - use export/import normal
- Sem import assertions - imports são em tempo de compilação no ArkTS
- Sem módulos UMD
- Sem curingas em nomes de módulo
- Todas as instruções `import` devem aparecer antes de todas as outras instruções
- Codebases TypeScript não devem depender de codebases ArkTS via import (o inverso é suportado)

### Outras Restrições

- Sem `var` - use `let`
- Sem loops `for...in` - use loops `for` regulares para arrays
- Sem instruções `with`
- Sem expressões JSX
- Sem identificadores privados com `#` - use a palavra-chave `private`
- Sem declaration merging (classes, interfaces, enums) - mantenha as definições compactas
- Sem index signatures - use arrays
- Operador vírgula apenas em loops `for`
- Operadores unários `+`, `-`, `~` apenas para tipos numéricos (sem conversão implícita de string)
- Membros de enum: apenas expressões de tempo de compilação do mesmo tipo para inicializadores explícitos
- A inferência de tipo de retorno de função é limitada - especifique tipos de retorno explicitamente ao chamar funções com tipos de retorno omitidos

### Object Literals

- Suportados apenas quando o compilador consegue inferir a classe ou interface correspondente
- NÃO suportados para: tipos `any`/`Object`/`object`, classes/interfaces com métodos, classes com construtores parametrizados, classes com campos `readonly`

## Convenções de Nomenclatura

- Variáveis / funções: `camelCase` (ex.: `getUserInfo`, `goodsList`)
- Classes / interfaces: `PascalCase` (ex.: `UserViewModel`, `IGoodsModel`)
- Constantes: `UPPER_SNAKE_CASE` (ex.: `MAX_PAGE_SIZE`, `COLOR_PRIMARY`)
- Nomes de arquivo: `PascalCase` para componentes (ex.: `HomePage.ets`), `camelCase` para utilitários

## Formatação

- Prefira aspas duplas para strings
- Ponto e vírgula no final das instruções
- Nunca use `var` - prefira `const`, depois `let`
- Todos os métodos, parâmetros e valores de retorno devem ter anotações de tipo completas

## Organização de Arquivos

- Arquivos de componente (`.ets`): um `@ComponentV2` por arquivo
- Arquivos de ViewModel: uma classe ViewModel por arquivo
- Arquivos de Model: modelos de dados relacionados podem compartilhar um arquivo
- Mantenha os arquivos abaixo de 400 linhas; extraia helpers para arquivos que se aproximam de 800 linhas

## Comentários

- Cabeçalho de arquivo: `@file` (propósito do arquivo) + `@author` (desenvolvedor), se o projeto já usa cabeçalhos de arquivo
- Métodos públicos: JSDoc com `@param`, `@returns`; adicione `@example` para métodos complexos
- Corresponda ao idioma de documentação existente do projeto; use inglês a menos que o repositório já tenha padronizado comentários em chinês

## Tratamento de Erros

```typescript
// Use try/catch com tratamento de erros adequado
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  hilog.error(0x0000, 'TAG', 'Operation failed: %{public}s', error)
  throw new Error('User-friendly error message')
}
```

## Imutabilidade

Siga os princípios comuns de imutabilidade - crie novos objetos em vez de mutar:

```typescript
// RUIM: mutação
function updateUser(user: UserModel, name: string): UserModel {
  user.name = name  // mutação direta
  return user
}

// BOM: imutável - cria uma nova instância
function updateUser(user: UserModel, name: string): UserModel {
  const updated = new UserModel()
  updated.id = user.id
  updated.name = name
  updated.email = user.email
  return updated
}
```
