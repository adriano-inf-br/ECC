# Rascunho da Thread X - ECC v2.0.0-rc.1

1/ ECC v2.0.0-rc.1 é a primeira passagem de release-candidate na direção 2.0.

O repositório está migrando de um pacote de configuração do Claude Code para um
meta-harness para trabalho agentic.

2/ A divisão importante:

ECC é o substrato reutilizável.
Hermes é o shell do operador que pode rodar sobre ele.

Skills, hooks, configurações MCP, rules e pacotes de fluxo de trabalho vivem no ECC.

3/ Um meta-harness importa porque a camada de agent está se fragmentando.

Claude Code, Codex, OpenCode, Cursor, Gemini, Zed, Copilot e fluxos de trabalho
de terminal todos precisam de primitivas operacionais semelhantes:

- contexto
- ferramentas
- memória
- gates
- avaliação
- evidência de lançamento
- verificações de segurança

4/ O ECC dá a essas primitivas uma forma compartilhada em vez de deixar cada fluxo
de trabalho preso dentro de um cliente.

Use o harness que preferir. Mantenha a camada de fluxo de trabalho portável.

5/ Desde a v1.10.0, o trabalho também incorporou a camada de operador:

Auditorias de PR/issue/discussão, sincronização de progresso do Linear, evidência de lançamento, verificações de observabilidade e um painel de prontidão gerado.

6/ A postura de segurança também mudou.

A campanha Mini Shai-Hulud/TanStack forçou um loop real de cadeia de suprimentos:

- varredura de IOC
- instalações de CI sem lifecycle
- atualização de fonte de advisory
- verificações de audit/assinatura do npm
- alvos de persistência de ferramentas de AI

7/ A superfície do rc.1 disponibiliza as peças públicas:

- Guia de configuração do Hermes
- notas de lançamento
- checklist de lançamento
- documento de arquitetura cross-harness
- orientação de importação do Hermes
- gate de smoke do preview-pack
- rascunhos para X, LinkedIn e artigo

8/ Ele também adiciona a superfície de teaser público para o pacote de skills de
mercado de predição Itô.

Isso é separado do faturamento do ECC Tools e o Itô permanece como um negócio separado.

As skills públicas são pesquisa, comparação, planejamento e revisão de risco.

9/ Fronteira importante:

Sem conselhos de investimento.
Sem negociação automática ao vivo por padrão.
Sem chaves privadas.
Sem chamada suportada pelo Itô sem acesso API explicitamente aprovado.

Forma de fluxo de trabalho útil primeiro, acesso a dados aprovado depois.

10/ Não disponibiliza estado privado do workspace.

Sem secrets.
Sem tokens OAuth.
Sem exportações locais brutas.
Sem conjuntos de dados pessoais.

O objetivo é publicar a forma reutilizável do sistema.

11/ Por que o Hermes importa:

A maioria dos sistemas de agent falha no loop diário de operação.

Eles conseguem programar, mas não mantêm pesquisa, conteúdo, handoffs, lembretes e execução em uma única superfície mensurável.

12/ O ECC fornece a camada reutilizável.

O Hermes fornece o shell do operador.

Juntos fazem o trabalho parecer menos janelas de chat dispersas e mais um sistema que você pode operar.

13/ Este ainda é um release candidate.

Os documentos públicos e as superfícies reutilizáveis estão prontos para revisão.

As integrações locais mais profundas ficam locais até serem sanitizadas. O GitHub prerelease e o pacote npm `next` estão ao vivo; URLs de plugin, vídeo, faturamento e saída final ainda ficam atrás do gate de aprovação.

14/ Comece aqui:

Repositório:
<https://github.com/affaan-m/ECC>

Configuração Hermes x ECC:
<https://github.com/affaan-m/ECC/blob/main/docs/HERMES-SETUP.md>

15/ Notas de lançamento:
<https://github.com/affaan-m/ECC/blob/main/docs/releases/2.0.0-rc.1/release-notes.md>

Fronteira do pacote de skills Itô:
<https://github.com/affaan-m/ECC/blob/main/docs/releases/2.0.0-rc.1/ito-prediction-market-skill-pack.md>

Registro de URLs:
<https://github.com/affaan-m/ECC/blob/main/docs/releases/2.0.0-rc.1/release-url-ledger-2026-05-19.md>
