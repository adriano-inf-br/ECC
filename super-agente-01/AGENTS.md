# Everything Claude Code (ECC) — Instruções para Agents

Este é um **plugin de codificação com IA pronto para produção** que fornece 67 agents especializados, 271 skills, 92 comandos e fluxos de trabalho automatizados de hook para desenvolvimento de software.

**Versão:** 2.0.0

## Princípios Centrais

1. **Agent-First** — Delegue a agents especializados para tarefas de domínio
2. **Test-Driven** — Escreva testes antes da implementação, cobertura de 80%+ exigida
3. **Security-First** — Nunca comprometa a segurança; valide todas as entradas
4. **Imutabilidade** — Sempre crie novos objetos, nunca modifique os existentes
5. **Planejar Antes de Executar** — Planeje funcionalidades complexas antes de escrever código

## Agents Disponíveis

| Agent | Propósito | Quando Usar |
|-------|---------|-------------|
| planner | Planejamento de implementação | Funcionalidades complexas, refatoração |
| architect | Design de sistema e escalabilidade | Decisões de arquitetura |
| tdd-guide | Desenvolvimento orientado a testes | Novas funcionalidades, correções de bugs |
| code-reviewer | Qualidade e manutenibilidade do código | Após escrever/modificar código |
| security-reviewer | Detecção de vulnerabilidades | Antes de commits, código sensível |
| spec-miner | Extração de especificação em projetos brownfield | Integração de projetos brownfield ao desenvolvimento orientado a especificação |
| build-error-resolver | Corrigir erros de build/tipo | Quando o build falha |
| e2e-runner | Testes end-to-end com Playwright | Fluxos de usuário críticos |
| refactor-cleaner | Limpeza de código morto | Manutenção de código |
| doc-updater | Documentação e codemaps | Atualização de documentação |
| cpp-reviewer | Revisão de código C/C++ | Projetos C e C++ |
| cpp-build-resolver | Erros de build C/C++ | Falhas de build C e C++ |
| fsharp-reviewer | Revisão de código funcional F# | Projetos F# |
| docs-lookup | Consulta de documentação via Context7 | Perguntas sobre API/documentação |
| go-reviewer | Revisão de código Go | Projetos Go |
| go-build-resolver | Erros de build Go | Falhas de build Go |
| kotlin-reviewer | Revisão de código Kotlin | Projetos Kotlin/Android/KMP |
| kotlin-build-resolver | Erros de build Kotlin/Gradle | Falhas de build Kotlin |
| database-reviewer | Especialista em PostgreSQL/Supabase | Design de schema, otimização de queries |
| python-reviewer | Revisão de código Python | Projetos Python |
| django-reviewer | Revisão de código Django | Aplicações Django, APIs DRF, ORM, migrações |
| django-build-resolver | Erros de build, migração e configuração do Django | Falhas de inicialização, dependência, migração, collectstatic do Django |
| java-reviewer | Revisão de código Java e Spring Boot | Projetos Java/Spring Boot |
| java-build-resolver | Erros de build Java/Maven/Gradle | Falhas de build Java |
| loop-operator | Execução autônoma de loops | Executar loops com segurança, monitorar travamentos, intervir |
| harness-optimizer | Ajuste de configuração do harness | Confiabilidade, custo, throughput |
| rust-reviewer | Revisão de código Rust | Projetos Rust |
| rust-build-resolver | Erros de build Rust | Falhas de build Rust |
| pytorch-build-resolver | Erros de runtime/CUDA/treinamento do PyTorch | Falhas de build/treinamento do PyTorch |
| mle-reviewer | Revisão de pipeline de ML em produção | Pipelines de ML, evals, serving, monitoramento, rollback |
| typescript-reviewer | Revisão de código TypeScript/JavaScript | Projetos TypeScript/JavaScript |

## Orquestração de Agents

Use agents proativamente sem solicitação do usuário:
- Pedidos de funcionalidades complexas → **planner**
- Código recém-escrito/modificado → **code-reviewer**
- Correção de bug ou nova funcionalidade → **tdd-guide**
- Decisão de arquitetura → **architect**
- Código sensível à segurança → **security-reviewer**
- Integração de projeto brownfield → **spec-miner**
- Loops autônomos / monitoramento de loops → **loop-operator**
- Confiabilidade e custo da configuração do harness → **harness-optimizer**

Use execução paralela para operações independentes — lance múltiplos agents simultaneamente.

## Diretrizes de Segurança

**Antes de QUALQUER commit:**
- Nenhum segredo embutido no código (chaves de API, senhas, tokens)
- Todas as entradas de usuário validadas
- Prevenção de injeção de SQL (queries parametrizadas)
- Prevenção de XSS (HTML sanitizado)
- Proteção contra CSRF habilitada
- Autenticação/autorização verificadas
- Limitação de taxa (rate limiting) em todos os endpoints
- Mensagens de erro não vazam dados sensíveis

**Gestão de segredos:** NUNCA embuta segredos no código. Use variáveis de ambiente ou um gerenciador de segredos. Valide os segredos exigidos na inicialização. Faça rotação imediata de qualquer segredo exposto.

**Se uma questão de segurança for encontrada:** PARE → use o agent security-reviewer → corrija questões CRÍTICAS → faça rotação dos segredos expostos → revise a base de código em busca de questões semelhantes.

## Estilo de Código

**Imutabilidade (CRÍTICO):** Sempre crie novos objetos, nunca modifique. Retorne novas cópias com as alterações aplicadas.

**Organização de arquivos:** Muitos arquivos pequenos em vez de poucos grandes. 200-400 linhas típico, 800 máximo. Organize por funcionalidade/domínio, não por tipo. Alta coesão, baixo acoplamento.

**Tratamento de erros:** Trate erros em todos os níveis. Forneça mensagens amigáveis ao usuário em código de UI. Registre contexto detalhado no lado do servidor. Nunca engula erros silenciosamente.

**Validação de entrada:** Valide toda entrada de usuário nos limites do sistema. Use validação baseada em schema. Falhe rápido com mensagens claras. Nunca confie em dados externos.

**Checklist de qualidade de código:**
- Funções pequenas (<50 linhas), arquivos focados (<800 linhas)
- Sem aninhamento profundo (>4 níveis)
- Tratamento adequado de erros, sem valores embutidos no código
- Identificadores legíveis e bem nomeados

## Requisitos de Teste

**Cobertura mínima: 80%**

Tipos de teste (todos exigidos):
1. **Testes unitários** — Funções individuais, utilitários, componentes
2. **Testes de integração** — Endpoints de API, operações de banco de dados
3. **Testes E2E** — Fluxos de usuário críticos

**Fluxo de trabalho de TDD (obrigatório):**
1. Escreva o teste primeiro (RED) — o teste deve FALHAR
2. Escreva a implementação mínima (GREEN) — o teste deve PASSAR
3. Refatore (IMPROVE) — verifique cobertura de 80%+

Solucione falhas: verifique o isolamento dos testes → verifique os mocks → corrija a implementação (não os testes, a menos que os testes estejam errados).

## Fluxo de Trabalho de Desenvolvimento

1. **Planejar** — Use o agent planner, identifique dependências e riscos, divida em fases
2. **TDD** — Use o agent tdd-guide, escreva testes primeiro, implemente, refatore
3. **Revisar** — Use o agent code-reviewer imediatamente, trate questões CRÍTICAS/ALTAS
4. **Capture conhecimento no lugar certo**
   - Notas pessoais de depuração, preferências e contexto temporário → memória automática
   - Conhecimento de equipe/projeto (decisões de arquitetura, mudanças de API, runbooks) → a estrutura de documentação existente do projeto
   - Se a tarefa atual já produz a documentação ou os comentários de código relevantes, não duplique a mesma informação em outro lugar
   - Se não houver um local óbvio de documentação do projeto, pergunte antes de criar um novo arquivo de nível superior
5. **Commit** — Formato de conventional commits, resumos abrangentes de PR

## Política de Superfície de Fluxo de Trabalho

- `skills/` é a superfície canônica de fluxo de trabalho.
- Novas contribuições de fluxo de trabalho devem chegar primeiro em `skills/`.
- `commands/` é uma superfície de compatibilidade de entrada por barra legada e só deve ser adicionada ou atualizada quando um shim ainda for necessário para migração ou paridade entre harnesses.

## Fluxo de Trabalho do Git

**Formato de commit:** `<type>: <description>` — Tipos: feat, fix, refactor, docs, test, chore, perf, ci

**Fluxo de trabalho de PR:** Analise todo o histórico de commits → redija um resumo abrangente → inclua um plano de teste → faça push com a flag `-u`.

## Padrões de Arquitetura

**Formato de resposta de API:** Envelope consistente com indicador de sucesso, payload de dados, mensagem de erro e metadados de paginação.

**Padrão Repository:** Encapsule o acesso a dados atrás de uma interface padrão (findAll, findById, create, update, delete). A lógica de negócio depende da interface abstrata, não do mecanismo de armazenamento.

**Projetos esqueleto:** Busque templates testados em campo, avalie com agents paralelos (segurança, extensibilidade, relevância), clone a melhor correspondência, itere dentro de uma estrutura comprovada.

## Performance

**Gestão de contexto:** Evite os últimos 20% da janela de contexto para refatorações grandes e funcionalidades multiarquivo. Tarefas de menor sensibilidade (edições únicas, documentação, correções simples) toleram maior utilização.

**Solução de problemas de build:** Use o agent build-error-resolver → analise os erros → corrija incrementalmente → verifique após cada correção.

## Estrutura do Projeto

```
agents/          — 67 specialized subagents
skills/          — 271 workflow skills and domain knowledge
commands/        — 92 slash commands
hooks/           — Trigger-based automations
rules/           — Always-follow guidelines (common + per-language)
scripts/         — Cross-platform Node.js utilities
mcp-configs/     — 14 MCP server configurations
tests/           — Test suite
```

`commands/` permanece no repositório por compatibilidade, mas a direção de longo prazo é skills-first.

## Métricas de Sucesso

- Todos os testes passam com cobertura de 80%+
- Nenhuma vulnerabilidade de segurança
- O código é legível e de fácil manutenção
- A performance é aceitável
- Os requisitos do usuário são atendidos
