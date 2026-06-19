# Fluxo de trabalho de desenvolvimento

> Este arquivo estende [common/git-workflow.md](./git-workflow.md) com o processo completo de desenvolvimento de funcionalidades que ocorre antes das operações de git.

O Fluxo de Implementação de Funcionalidades descreve o pipeline de desenvolvimento: pesquisa, planejamento, TDD, revisão de código e, então, o commit no git.

## Fluxo de Implementação de Funcionalidades

0. **Pesquisa e Reutilização** _(obrigatório antes de qualquer nova implementação)_
   - **Busca de código no GitHub primeiro:** Execute `gh search repos` e `gh search code` para encontrar implementações, templates e padrões existentes antes de escrever qualquer coisa nova.
   - **Documentação de bibliotecas em segundo:** Use o Context7 ou a documentação primária do fornecedor para confirmar o comportamento da API, o uso de pacotes e detalhes específicos de versão antes de implementar.
   - **Exa somente quando os dois primeiros forem insuficientes:** Use o Exa para pesquisa ou descoberta mais ampla na web depois da busca no GitHub e da documentação primária.
   - **Verifique os registros de pacotes:** Pesquise npm, PyPI, crates.io e outros registros antes de escrever código utilitário. Prefira bibliotecas testadas em campo em vez de soluções feitas à mão.
   - **Procure implementações adaptáveis:** Busque projetos open-source que resolvam 80% ou mais do problema e que possam sofrer fork, ser portados ou encapsulados.
   - Prefira adotar ou portar uma abordagem comprovada em vez de escrever código totalmente novo quando ela atender ao requisito.

1. **Planeje Primeiro**
   - Use o agent **planner** para criar o plano de implementação
   - Gere documentos de planejamento antes de codar: PRD, arquitetura, system_design, tech_doc, task_list
   - Identifique dependências e riscos
   - Divida em fases

2. **Abordagem TDD**
   - Use o agent **tdd-guide**
   - Escreva os testes primeiro (RED)
   - Implemente para passar nos testes (GREEN)
   - Refatore (IMPROVE)
   - Verifique cobertura de 80% ou mais

3. **Revisão de código**
   - Use o agent **code-reviewer** imediatamente após escrever o código
   - Trate os problemas CRITICAL e HIGH
   - Corrija os problemas MEDIUM quando possível

4. **Commit e Push**
   - Mensagens de commit detalhadas
   - Siga o formato de conventional commits
   - Veja [git-workflow.md](./git-workflow.md) para o formato de mensagem de commit e o processo de PR

5. **Verificações Pré-Revisão**
   - Verifique se todas as checagens automatizadas (CI/CD) estão passando
   - Resolva quaisquer conflitos de merge
   - Garanta que o branch esteja atualizado com o branch de destino
   - Solicite a revisão somente depois que essas verificações passarem
