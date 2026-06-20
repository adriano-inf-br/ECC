---
name: hipaa-compliance
description: Ponto de entrada específico para HIPAA em trabalhos de privacidade e segurança em saúde. Use quando uma tarefa for explicitamente enquadrada em torno de HIPAA, tratamento de PHI, entidades cobertas, BAAs, postura de violação ou requisitos de conformidade de saúde nos EUA.
metadata:
  origin: ECC direct-port adaptation
version: "1.0.0"
---

# Conformidade HIPAA

Use este como o ponto de entrada específico para HIPAA quando uma tarefa for claramente sobre conformidade de saúde nos EUA. Esta skill intencionalmente permanece enxuta e canônica:

- `healthcare-phi-compliance` continua sendo a skill de implementação primária para tratamento de PHI/PII, classificação de dados, logging de auditoria, criptografia e prevenção de vazamentos.
- `healthcare-reviewer` continua sendo o revisor especializado quando código, arquitetura ou comportamento de produto precisam de uma segunda passagem com consciência de saúde.
- `security-review` ainda se aplica para autenticação geral, tratamento de entrada, segredos, API e hardening de implantação.

## Quando Usar

- A solicitação menciona explicitamente HIPAA, PHI, entidades cobertas, associados de negócios ou BAAs
- Construindo ou revisando software de saúde dos EUA que armazena, processa, exporta ou transmite PHI
- Avaliando se logging, analytics, Prompts de LLM, armazenamento ou fluxos de trabalho de suporte criam exposição HIPAA
- Projetando sistemas voltados ao paciente ou ao clínico onde acesso mínimo necessário e auditabilidade importam

## Como Funciona

Trate o HIPAA como uma camada sobreposta ao skill mais amplo de privacidade em saúde:

1. Comece com `healthcare-phi-compliance` para as regras concretas de implementação.
2. Aplique portões de decisão específicos do HIPAA:
   - Este dado é PHI?
   - Este ator é uma entidade coberta ou associado de negócios?
   - Um fornecedor ou provedor de modelo requer um BAA antes de tocar os dados?
   - O acesso está limitado ao escopo mínimo necessário?
   - Eventos de leitura/escrita/exportação são auditáveis?
3. Escale para `healthcare-reviewer` se a tarefa afeta segurança do paciente, fluxos de trabalho clínicos ou arquitetura de produção regulamentada.

## Salvaguardas Específicas do HIPAA

- Nunca coloque PHI em logs, eventos de analytics, relatórios de crash, Prompts ou strings de erro visíveis ao cliente.
- Nunca exponha PHI em URLs, armazenamento do navegador, screenshots ou payloads de exemplo copiados.
- Exija acesso autenticado, autorização com escopo e trilhas de auditoria para leituras e escritas de PHI.
- Trate SaaS de terceiros, observabilidade, ferramentas de suporte e provedores de LLM como bloqueados por padrão até que o status do BAA e as fronteiras de dados estejam claros.
- Siga o acesso mínimo necessário: o usuário certo deve ver apenas a menor fatia de PHI necessária para a tarefa.
- Prefira IDs internos opacos em vez de nomes, MRNs, números de telefone, endereços ou outros identificadores.

## Exemplos

### Exemplo 1: Solicitação de produto enquadrada como HIPAA

Solicitação do usuário:

> Adicione resumos de consultas gerados por IA ao nosso dashboard de clínicos. Servimos clínicas nos EUA e precisamos manter conformidade HIPAA.

Padrão de resposta:

- Ativar `hipaa-compliance`
- Usar `healthcare-phi-compliance` para revisar movimentação de PHI, logging, armazenamento e fronteiras de Prompt
- Verificar se o provedor de sumarização está coberto por um BAA antes de enviar qualquer PHI
- Escalar para `healthcare-reviewer` se os resumos influenciarem decisões clínicas

### Exemplo 2: Decisão de fornecedor/ferramentas

Solicitação do usuário:

> Podemos enviar transcrições de suporte e mensagens de pacientes para nossa stack de analytics?

Padrão de resposta:

- Assumir que essas mensagens podem conter PHI
- Bloquear o design a menos que o fornecedor de analytics seja aprovado para cargas de trabalho vinculadas ao HIPAA e o caminho de dados seja minimizado
- Exigir redação ou um modelo de evento sem PHI quando possível

## Skills Relacionadas

- `healthcare-phi-compliance`
- `healthcare-reviewer`
- `healthcare-emr-patterns`
- `healthcare-eval-harness`
- `security-review`
