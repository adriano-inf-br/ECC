# O ECC v1.10.0 está disponível

O ECC acabou de ultrapassar **140K estrelas**, e a superfície de lançamento pública havia se distanciado demais do repositório real.

Então o v1.10.0 é um lançamento de sincronização completa:

- **38 agents**
- **156 skills**
- **72 commands**
- metadados de plugin/instalação corrigidos
- documentação principal e superfícies de lançamento realinhadas

Este lançamento também incorpora a rota de operador/mídia que vinha crescendo em torno do sistema de harness central:

- `brand-voice`
- `social-graph-ranker`
- `connections-optimizer`
- `customer-billing-ops`
- `google-workspace-ops`
- `project-flow-ops`
- `workspace-surface-audit`
- `manim-video`
- `remotion-video-creation`

E no lado do 2.0:

O ECC 2.0 agora é **real como uma superfície alpha de plano de controle** na árvore sob `ecc2/`.

Ele compila hoje e expõe:

- `dashboard`
- `start`
- `sessions`
- `status`
- `stop`
- `resume`
- `daemon`

Isso **não** significa que o roadmap completo do ECC 2.0 está concluído.

Significa que o alpha do plano de controle está aqui, utilizável, e saindo da categoria "apenas uma visão".

O enquadramento mais honesto e conciso no momento:

- ECC 1.x é a camada de harness/fluxo de trabalho testada em batalha com ampla distribuição hoje
- ECC 2.0 é o alpha do plano de controle crescendo sobre ela

Se você estava esperando por:

- superfícies de instalação mais limpas
- paridade mais forte entre harnesses
- fluxos de trabalho de operador em vez de apenas primitivas de codificação
- uma direção real de plano de controle em vez de notas espalhadas

este é o lançamento que faz o repositório parecer coerente novamente.
