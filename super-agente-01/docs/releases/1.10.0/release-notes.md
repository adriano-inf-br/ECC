# Notas de Lançamento do ECC v1.10.0

## Posicionamento

O ECC v1.10.0 é um lançamento de sincronização de superfície e de faixa de operador.

O objetivo foi fazer com que o repositório público, os metadados do plugin, os caminhos de instalação e a narrativa do ecossistema voltassem a refletir o estado real e ativo do projeto, enquanto continuamos entregando os fluxos de trabalho de operador e as ferramentas de mídia que cresceram em torno da camada central do harness.

## O Que Mudou

- Sincronizou a superfície OSS ativa para **38 agents, 156 skills e 72 comandos**.
- Atualizou o plugin do Claude, o plugin do Codex, os metadados do pacote OpenCode e a documentação voltada para o lançamento para **1.10.0**.
- Atualizou as métricas principais do repositório para corresponder ao repositório público ativo (**140K+ estrelas**, **21K+ forks**, **170+ contribuidores**).
- Expandiu a faixa de operador/fluxo de trabalho com:
  - `brand-voice`
  - `social-graph-ranker`
  - `connections-optimizer`
  - `customer-billing-ops`
  - `google-workspace-ops`
  - `project-flow-ops`
  - `workspace-surface-audit`
- Expandiu a faixa de mídia com:
  - `manim-video`
  - `remotion-video-creation`
- Adicionou e estabilizou mais cobertura de framework/domínio, incluindo `nestjs-patterns`.

## Status do ECC 2.0

O ECC 2.0 é **real e utilizável como alfa**, mas **não está completo para disponibilidade geral**.

O que existe hoje:

- Código-fonte do plano de controle Rust `ecc2/` no repositório principal
- `cargo build --manifest-path ecc2/Cargo.toml` passa com sucesso
- Comandos `ecc-tui` atualmente disponíveis:
  - `dashboard`
  - `start`
  - `sessions`
  - `status`
  - `stop`
  - `resume`
  - `daemon`

O que isso significa:

- Você pode experimentar a superfície do plano de controle agora.
- Você não deve descrever o roteiro completo do ECC 2.0 como concluído.
- O enquadramento correto hoje é **ECC 2.0 alfa / prévia do plano de controle**, não disponibilidade geral.

## Orientação de Instalação

Superfícies de instalação atuais:

- Plugin do Claude Code
- `ecc-universal` no npm
- Manifesto do plugin do Codex
- Superfície de pacote/plugin do OpenCode
- CLI do AgentShield + npm + ação do GitHub Marketplace

Nuance importante:

- O plugin do Claude permanece limitado pelos limites de distribuição de `rules` no nível da plataforma.
- O caminho de instalação seletiva / OSS ainda é a instalação completa mais confiável para equipes que querem a superfície ECC completa.

## Caminho de Atualização Recomendado

1. Atualize para os metadados mais recentes de plugin/instalação.
2. Prefira o caminho de instalação seletiva / OSS quando precisar de cobertura completa de rules.
3. Use o AgentShield para guardrails e escaneamento de repositório.
4. Trate o ECC 2.0 como uma superfície alfa de plano de controle até que o roteiro aberto de P0/P1 seja substancialmente concluído.
