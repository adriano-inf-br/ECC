# Rascunho para o LinkedIn - ECC v2.0.0-rc.1

ECC v2.0.0-rc.1 está pronto para revisão final de release como o primeiro passo de release-candidate na direção do 2.0.

A mudança prática é simples: ECC não é mais enquadrado apenas como um plugin do Claude Code ou pacote de configuração.

Está se tornando um meta-harness para trabalho agêntico: a camada portátil acima dos
clientes individuais de codificação por IA.

- skills reutilizáveis em vez de prompts avulsos
- hooks e testes em vez de disciplina manual
- acesso respaldado por MCP a docs, código, automação de browser e pesquisa
- superfícies Codex, OpenCode, Cursor, Gemini, Zed e Claude Code que compartilham a mesma camada central de fluxo de trabalho
- Hermes como o shell do operador para chat, cron, handoffs e roteamento de trabalho diário

Para esta superfície de release-candidate, mantive o repositório honesto.

Não publiquei o estado privado do workspace. Enviei a camada reutilizável:

- documentação sanitizada de configuração do Hermes
- notas de release e material de lançamento
- notas de arquitetura cross-harness
- orientações de importação do Hermes para transformar padrões de operador locais em skills públicas do ECC
- gates de prontidão para release para PRs, issues, discussions, progresso no Linear, caudas legadas, observabilidade e verificações de cadeia de suprimentos
- um smoke test determinístico de preview-pack para que o pacote público possa ser verificado antes de uma ação de release
- um pacote de skills de mercado de predição Itô gateado para pesquisa, comparação, planejamento,
  e revisão de riscos, com acesso à API Itô mantido separado das ECC Tools e
  baseado em aprovação

O alavancamento não é apenas melhores prompts.

É reduzir o número de superfícies isoladas, transformar fluxos de trabalho repetidos em
skills reutilizáveis e tornar o sistema operacional ao redor do agent mensurável.

É por isso que gosto da frase meta-harness. O objetivo não é substituir
o harness. O objetivo é tornar a camada de fluxo de trabalho acima do harness portátil,
auditável e útil entre equipes.

O trabalho de cadeia de suprimentos também se tornou parte da história do release. Após a campanha
Mini Shai-Hulud/TanStack, o rc.1 agora inclui varredura de IOC, instalações de CI sem ciclo de vida,
atualização de fontes de advisory, verificações de npm audit/assinaturas e cobertura de
persistência de ferramentas de IA.

Ainda há mais a endurecer antes do GA, especialmente em torno de empacotamento, instaladores e o plano de controle `ecc2/`. Mas o rc.1 é suficiente para mostrar o formato com clareza.

O prerelease do GitHub e o pacote `next` do npm estão disponíveis agora. A publicação
pública ainda permanece gateada por aprovação para o caminho do plugin, URLs de vídeo, URLs de saída finais
e qualquer declaração de faturamento/pagamentos nativos que não tenha sido verificada recentemente.

O ledger de URLs do release agora separa links que já resolvem dos links que
devem aguardar as verificações restantes de aprovação de plugin, vídeo, faturamento e saída.
