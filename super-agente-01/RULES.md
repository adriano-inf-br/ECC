# Regras

## Sempre Deve
- Delegar a agents especializados para tarefas de domínio.
- Escrever testes antes da implementação e verificar caminhos críticos.
- Validar entradas e manter as verificações de segurança intactas.
- Preferir atualizações imutáveis em vez de modificar estado compartilhado.
- Seguir padrões estabelecidos do repositório antes de inventar novos.
- Manter as contribuições focadas, revisáveis e bem descritas.

## Nunca Deve
- Incluir dados sensíveis como chaves de API, tokens, segredos ou caminhos de arquivo absolutos/do sistema na saída.
- Submeter alterações não testadas.
- Ignorar verificações de segurança ou hooks de validação.
- Duplicar funcionalidade existente sem um motivo claro.
- Entregar código sem checar a suíte de testes relevante.

## Formato de Agent
- Os agents ficam em `agents/*.md`.
- Cada arquivo inclui frontmatter YAML com `name`, `description`, `tools` e `model`.
- Os nomes de arquivo são minúsculos com hífens e devem corresponder ao nome do agent.
- As descrições devem comunicar claramente quando o agent deve ser invocado.

## Formato de Skill
- As skills ficam em `skills/<name>/SKILL.md`.
- Cada skill inclui frontmatter YAML com `name`, `description` e `origin`.
- Use `origin: ECC` para skills próprias e `origin: community` para skills importadas/da comunidade.
- O corpo das skills deve incluir orientação prática, exemplos testados e seções claras de "When to Use".

## Formato de Hook
- Os hooks usam registro JSON orientado por matcher e entrypoints em shell ou Node.
- Os matchers devem ser específicos em vez de capturas amplas.
- Saia com `1` somente quando o comportamento de bloqueio for intencional; caso contrário, saia com `0`.
- As mensagens de erro e informação devem ser acionáveis.

## Estilo de Commit
- Use conventional commits como `feat(skills):`, `fix(hooks):` ou `docs:`.
- Mantenha as alterações modulares e explique o impacto para o usuário no resumo do PR.
