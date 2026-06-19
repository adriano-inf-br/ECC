# Estilo de Código

## Imutabilidade (CRÍTICO)

SEMPRE crie novos objetos, NUNCA mute os existentes:

```
// Pseudocódigo
ERRADO:  modify(original, field, value) → altera original no lugar
CORRETO: update(original, field, value) → retorna nova cópia com a mudança
```

Justificativa: Dados imutáveis evitam efeitos colaterais ocultos, facilitam a depuração e permitem concorrência segura.

## Princípios Centrais

### KISS (Keep It Simple)

- Prefira a solução mais simples que realmente funcione
- Evite otimização prematura
- Otimize pela clareza em vez de esperteza

### DRY (Don't Repeat Yourself)

- Extraia lógica repetida em funções ou utilitários compartilhados
- Evite a divergência de implementações por copiar e colar
- Introduza abstrações quando a repetição for real, não especulativa

### YAGNI (You Aren't Gonna Need It)

- Não construa features ou abstrações antes que sejam necessárias
- Evite generalidade especulativa
- Comece simples, depois refatore quando a pressão for real

## Organização de Arquivos

MUITOS ARQUIVOS PEQUENOS > POUCOS ARQUIVOS GRANDES:
- Alta coesão, baixo acoplamento
- 200-400 linhas típicas, 800 no máximo
- Extraia utilitários de módulos grandes
- Organize por feature/domínio, não por tipo

## Tratamento de Erros

SEMPRE trate erros de forma abrangente:
- Trate erros explicitamente em todos os níveis
- Forneça mensagens de erro amigáveis em código voltado à UI
- Registre o contexto detalhado do erro no lado do servidor
- Nunca engula erros silenciosamente

## Validação de Entrada

SEMPRE valide nas fronteiras do sistema:
- Valide toda entrada do usuário antes de processar
- Use validação baseada em schema onde disponível
- Falhe rápido com mensagens de erro claras
- Nunca confie em dados externos (respostas de API, entrada do usuário, conteúdo de arquivo)

## Convenções de Nomenclatura

- Variáveis e funções: `camelCase` com nomes descritivos
- Booleanos: prefira os prefixos `is`, `has`, `should` ou `can`
- Interfaces, tipos e componentes: `PascalCase`
- Constantes: `UPPER_SNAKE_CASE`
- Hooks customizados: `camelCase` com um prefixo `use`

## Code Smells a Evitar

### Aninhamento Profundo

Prefira early returns em vez de condicionais aninhados quando a lógica começar a se empilhar.

### Números Mágicos

Use constantes nomeadas para limiares, atrasos e limites significativos.

### Funções Longas

Divida funções grandes em partes focadas com responsabilidades claras.

## Checklist de Qualidade de Código

Antes de marcar o trabalho como concluído:
- [ ] Código é legível e bem nomeado
- [ ] Funções são pequenas (<50 linhas)
- [ ] Arquivos são focados (<800 linhas)
- [ ] Sem aninhamento profundo (>4 níveis)
- [ ] Tratamento de erros adequado
- [ ] Sem valores hardcoded (use constantes ou config)
- [ ] Sem mutação (padrões imutáveis usados)
