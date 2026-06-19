# Template de Capacidade de Produto

Use este template quando a intenção do produto existir, mas as restrições de implementação ainda estiverem implícitas.

O objetivo é criar um contrato de capacidade durável, não mais um documento de planejamento vago.

## Capacidade

- **Nome da capacidade:**
- **Fonte:** PRD / issue / discussão / roadmap / nota do fundador
- **Ator principal:**
- **Resultado após o lançamento:**
- **Sinal de sucesso:**

## Intenção do Produto

Descreva a promessa visível ao usuário em um parágrafo curto.

## Restrições

Liste as regras que devem ser verdadeiras antes do início da implementação:

- regras de negócio
- limites de escopo
- invariantes
- restrições de lançamento gradual
- restrições de migração
- restrições de compatibilidade retroativa
- restrições de cobrança / autenticação / conformidade

## Atores e Superfícies

- ator(es)
- superfícies de UI
- superfícies de API
- superfícies de automação / operador
- superfícies de relatórios / dashboard

## Estados e Transições

Descreva o ciclo de vida em termos de estados explícitos e transições permitidas.

Exemplo:

- `rascunho -> ativo -> pausado -> concluído`
- `pendente -> aprovado -> provisionado -> revogado`

## Contrato de Interface

- entradas
- saídas
- efeitos colaterais obrigatórios
- estados de falha
- novas tentativas / recuperação
- expectativas de idempotência

## Implicações de Dados

- fonte da verdade
- novas entidades ou campos
- limites de propriedade
- expectativas de retenção / exclusão

## Segurança e Política

- limites de confiança
- requisitos de permissão
- caminhos de abuso
- requisitos de política / governança

## Não-Objetivos

Liste o que esta capacidade explicitamente não possui.

## Questões em Aberto

Registre as decisões não resolvidas que bloqueiam a implementação.

## Handoff

- **Pronto para implementação?**
- **Precisa de revisão de arquitetura?**
- **Precisa de esclarecimento do produto?**
- **Próxima rota ECC:** `project-flow-ops` / `tdd-workflow` / `verification-loop` / outra
