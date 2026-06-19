---
name: healthcare-emr-patterns
description: Padrões de desenvolvimento de EMR/EHR para aplicações de saúde. Segurança clínica, fluxos de trabalho de consultas, geração de prescrições, integração de suporte à decisão clínica e UI com acessibilidade em primeiro lugar para entrada de dados médicos.
metadata:
  origin: Health1 Super Speciality Hospitals — contributed by Dr. Keyur Patel
version: "1.0.0"
---

# Padrões de Desenvolvimento de EMR em Saúde

Padrões para construir sistemas de Registro Médico Eletrônico (EMR) e Registro Eletrônico de Saúde (EHR). Prioriza segurança do paciente, precisão clínica e eficiência do profissional.

## Quando Usar

- Construindo fluxos de trabalho de consultas de pacientes (queixa, exame, diagnóstico, prescrição)
- Implementando anotação clínica (estruturada + texto livre + voz para texto)
- Projetando módulos de prescrição/medicação com verificação de interações medicamentosas
- Integrando Sistemas de Suporte à Decisão Clínica (CDSS)
- Construindo exibições de resultados laboratoriais com destaque de faixa de referência
- Implementando trilhas de auditoria para dados clínicos
- Projetando UIs acessíveis para saúde para entrada de dados clínicos

## Como Funciona

### Segurança do Paciente em Primeiro Lugar

Toda decisão de design deve ser avaliada contra: "Isso poderia prejudicar um paciente?"

- Interações medicamentosas DEVEM alertar, não passar silenciosamente
- Valores laboratoriais anormais DEVEM ser sinalizados visualmente
- Sinais vitais críticos DEVEM acionar fluxos de trabalho de escalada
- Nenhuma modificação de dados clínicos sem trilha de auditoria

### Fluxo de Consulta em Página Única

As consultas clínicas devem fluir verticalmente em uma única página — sem troca de abas:

```
Cabeçalho do Paciente (fixo — sempre visível)
├── Dados demográficos, alergias, medicamentos ativos
│
Fluxo de Consulta (rolagem vertical)
├── 1. Queixa Principal (templates estruturados + texto livre)
├── 2. Histórico da Doença Atual
├── 3. Exame Físico (por sistema)
├── 4. Sinais Vitais (aciona pontuação clínica automaticamente)
├── 5. Diagnóstico (busca ICD-10/SNOMED)
├── 6. Medicamentos (banco de dados de medicamentos + verificação de interação)
├── 7. Investigações (pedidos laboratoriais/radiológicos)
├── 8. Plano e Acompanhamento
└── 9. Assinar / Bloquear / Imprimir
```

### Sistema Inteligente de Templates

```typescript
interface ClinicalTemplate {
  id: string;
  name: string;             // ex. "Dor no Peito"
  chips: string[];          // chips de sintomas clicáveis
  requiredFields: string[]; // pontos de dados obrigatórios
  redFlags: string[];       // dispara alerta não descartável
  icdSuggestions: string[]; // códigos de diagnóstico pré-mapeados
}
```

Sinais de alerta em qualquer template devem disparar um alerta visível e não descartável — NÃO uma notificação toast.

### Padrão de Segurança de Medicação

```
Usuário seleciona medicamento
  → Verificar medicamentos atuais para interações
  → Verificar medicamentos da consulta para interações
  → Verificar alergias do paciente
  → Validar dose em relação ao peso/idade/função renal
  → Se interação CRÍTICA: BLOQUEAR a prescrição completamente
  → O clínico deve documentar motivo de substituição para continuar após um bloqueio
  → Se interação MAIOR: exibir aviso, exigir confirmação de ciência
  → Registrar todos os alertas e motivos de substituição na trilha de auditoria
```

Interações críticas **bloqueiam a prescrição por padrão**. O clínico deve substituir explicitamente com um motivo documentado armazenado na trilha de auditoria. O sistema nunca permite silenciosamente uma interação crítica.

### Padrão de Consulta Bloqueada

Uma vez que uma consulta clínica é assinada:
- Nenhuma edição é permitida — apenas um adendo (um registro separado vinculado)
- Tanto o original quanto o adendo aparecem na linha do tempo do paciente
- A trilha de auditoria captura quem assinou, quando e quaisquer registros de adendo

### Padrões de UI para Dados Clínicos

**Exibição de Sinais Vitais:** Valores atuais com destaque de faixa normal (verde/amarelo/vermelho), setas de tendência em relação ao anterior, pontuação clínica calculada automaticamente (NEWS2, qSOFA), orientação de escalada inline.

**Exibição de Resultados Laboratoriais:** Destaque de faixa normal, comparação com valor anterior, valores críticos com alerta não descartável, timestamps de coleta/análise, pedidos pendentes com prazo esperado.

**PDF de Prescrição:** Geração com um clique incluindo dados demográficos do paciente, alergias, diagnóstico, detalhes do medicamento (genérico + marca, dose, via, frequência, duração), bloco de assinatura do clínico.

### Acessibilidade para Saúde

UIs de saúde têm requisitos mais rigorosos do que aplicativos web típicos:
- Contraste mínimo de 4,5:1 (WCAG AA) — clínicos trabalham em iluminação variada
- Alvos de toque grandes (mínimo 44x44px) — para interação com luvas/apressada
- Navegação por teclado — para usuários avançados inserindo dados rapidamente
- Sem indicadores somente de cor — sempre combine cor com texto/ícone (clínicos daltônicos)
- Rótulos de leitores de tela em todos os campos de formulário
- Sem toasts autodescartáveis para alertas clínicos — o clínico deve confirmar ativamente

### Anti-Padrões

- Armazenar dados clínicos no localStorage do navegador
- Falhas silenciosas na verificação de interações medicamentosas
- Toasts descartáveis para alertas clínicos críticos
- UIs de consulta baseadas em abas que fragmentam o fluxo de trabalho clínico
- Permitir edições em consultas assinadas/bloqueadas
- Exibir dados clínicos sem trilha de auditoria
- Usar tipo `any` para estruturas de dados clínicos

## Exemplos

### Exemplo 1: Fluxo de Consulta do Paciente

```
Médico abre consulta para Paciente #4521
  → Cabeçalho fixo mostra: "Rajesh M, 58M, Alergias: Penicilina, Medicamentos Ativos: Metformina 500mg"
  → Queixa Principal: seleciona template "Dor no Peito"
    → Clica nos chips: "substernal", "irradiando para o braço esquerdo", "opressiva"
    → Sinal de alerta "dor substernal opressiva" dispara alerta não descartável
  → Exame: sistema cardiovascular — "B1 B2 normais, sem sopro"
  → Sinais Vitais: FC 110, PA 90/60, SpO2 94%
    → NEWS2 calcula automaticamente: pontuação 8, risco ALTO, alerta de escalada exibido
  → Diagnóstico: pesquisa "SCA" → seleciona ICD-10 I21.9
  → Medicamentos: seleciona Aspirina 300mg
    → CDSS verifica contra Metformina: sem interação
  → Assina consulta → bloqueada, somente adendo a partir deste ponto
```

### Exemplo 2: Fluxo de Trabalho de Segurança de Medicação

```
Médico prescreve Varfarina para Paciente #4521
  → CDSS detecta: Varfarina + Aspirina = interação CRÍTICA
  → UI: modal vermelho não descartável bloqueia a prescrição
  → Médico clica em "Substituir com motivo"
  → Digite: "Benefícios superam os riscos — protocolo INR monitorado"
  → Motivo de substituição + alerta armazenados na trilha de auditoria
  → Prescrição prossegue com substituição documentada
```

### Exemplo 3: Consulta Bloqueada + Adendo

```
Consulta #E-2024-0891 assinada pelo Dr. Shah às 14:30
  → Todos os campos bloqueados — sem botões de edição visíveis
  → Botão "Adicionar Adendo" disponível
  → Dr. Shah clica em adendo, adiciona: "Resultados laboratoriais recebidos — Troponina elevada"
  → Novo registro E-2024-0891-A1 vinculado ao original
  → Linha do tempo mostra ambos: consulta original + adendo com timestamps
```
