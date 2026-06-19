---
name: healthcare-cdss-patterns
description: Padrões de desenvolvimento de Sistema de Suporte à Decisão Clínica (CDSS). Verificação de interações medicamentosas, validação de doses, pontuação clínica (NEWS2, qSOFA), classificação de severidade de alertas e integração em fluxos de trabalho de EMR.
metadata:
  origin: Health1 Super Speciality Hospitals — contributed by Dr. Keyur Patel
version: "1.0.0"
---

# Padrões de Desenvolvimento de CDSS em Saúde

Padrões para construir Sistemas de Suporte à Decisão Clínica que se integram a fluxos de trabalho de EMR. Módulos de CDSS são críticos para a segurança do paciente — tolerância zero para falsos negativos.

## Quando Usar

- Implementando verificação de interações medicamentosas
- Construindo engines de validação de doses
- Implementando sistemas de pontuação clínica (NEWS2, qSOFA, APACHE, GCS)
- Projetando sistemas de alerta para valores clínicos anormais
- Construindo entrada de pedidos de medicação com verificações de segurança
- Integrando interpretação de resultados laboratoriais com contexto clínico

## Como Funciona

O engine de CDSS é uma **biblioteca de funções puras sem efeitos colaterais**. Insira dados clínicos, receba alertas. Isso o torna totalmente testável.

Três módulos primários:

1. **`checkInteractions(newDrug, currentMeds, allergies)`** — Verifica um novo medicamento contra os medicamentos atuais e alergias conhecidas. Retorna `InteractionAlert[]` ordenados por severidade. Usa o modelo de dados `DrugInteractionPair`.
2. **`validateDose(drug, dose, route, weight, age, renalFunction)`** — Valida uma dose prescrita de acordo com regras baseadas em peso, ajustadas por idade e ajustadas para função renal. Retorna `DoseValidationResult`.
3. **`calculateNEWS2(vitals)`** — National Early Warning Score 2 a partir de `NEWS2Input`. Retorna `NEWS2Result` com pontuação total, nível de risco e orientação de escalada.

```
UI do EMR
  ↓ (usuário insere dados)
Engine CDSS (funções puras, sem efeitos colaterais)
  ├── Verificador de Interações Medicamentosas
  ├── Validador de Doses
  ├── Pontuação Clínica (NEWS2, qSOFA, etc.)
  └── Classificador de Alertas
  ↓ (retorna alertas)
UI do EMR (exibe alertas inline, bloqueia se crítico)
```

### Verificação de Interações Medicamentosas

```typescript
interface DrugInteractionPair {
  drugA: string;           // nome genérico
  drugB: string;           // nome genérico
  severity: 'critical' | 'major' | 'minor';
  mechanism: string;
  clinicalEffect: string;
  recommendation: string;
}

function checkInteractions(
  newDrug: string,
  currentMedications: string[],
  allergyList: string[]
): InteractionAlert[] {
  if (!newDrug) return [];
  const alerts: InteractionAlert[] = [];
  for (const current of currentMedications) {
    const interaction = findInteraction(newDrug, current);
    if (interaction) {
      alerts.push({ severity: interaction.severity, pair: [newDrug, current],
        message: interaction.clinicalEffect, recommendation: interaction.recommendation });
    }
  }
  for (const allergy of allergyList) {
    if (isCrossReactive(newDrug, allergy)) {
      alerts.push({ severity: 'critical', pair: [newDrug, allergy],
        message: `Cross-reactivity with documented allergy: ${allergy}`,
        recommendation: 'Do not prescribe without allergy consultation' });
    }
  }
  return alerts.sort((a, b) => severityOrder(a.severity) - severityOrder(b.severity));
}
```

Os pares de interação devem ser **bidirecionais**: se o Medicamento A interage com o Medicamento B, então o Medicamento B interage com o Medicamento A.

### Validação de Doses

```typescript
interface DoseValidationResult {
  valid: boolean;
  message: string;
  suggestedRange: { min: number; max: number; unit: string } | null;
  factors: string[];
}

function validateDose(
  drug: string,
  dose: number,
  route: 'oral' | 'iv' | 'im' | 'sc' | 'topical',
  patientWeight?: number,
  patientAge?: number,
  renalFunction?: number
): DoseValidationResult {
  const rules = getDoseRules(drug, route);
  if (!rules) return { valid: true, message: 'No validation rules available', suggestedRange: null, factors: [] };
  const factors: string[] = [];

  // SEGURANÇA: se as regras exigem peso mas o peso está ausente, BLOQUEIE (não passe)
  if (rules.weightBased) {
    if (!patientWeight || patientWeight <= 0) {
      return { valid: false, message: `Weight required for ${drug} (mg/kg drug)`,
        suggestedRange: null, factors: ['weight_missing'] };
    }
    factors.push('weight');
    const maxDose = rules.maxPerKg * patientWeight;
    if (dose > maxDose) {
      return { valid: false, message: `Dose exceeds max for ${patientWeight}kg`,
        suggestedRange: { min: rules.minPerKg * patientWeight, max: maxDose, unit: rules.unit }, factors };
    }
  }

  // Ajuste por idade (quando as regras definem faixas etárias e a idade é fornecida)
  if (rules.ageAdjusted && patientAge !== undefined) {
    factors.push('age');
    const ageMax = rules.getAgeAdjustedMax(patientAge);
    if (dose > ageMax) {
      return { valid: false, message: `Exceeds age-adjusted max for ${patientAge}yr`,
        suggestedRange: { min: rules.typicalMin, max: ageMax, unit: rules.unit }, factors };
    }
  }

  // Ajuste renal (quando as regras definem faixas de eGFR e o eGFR é fornecido)
  if (rules.renalAdjusted && renalFunction !== undefined) {
    factors.push('renal');
    const renalMax = rules.getRenalAdjustedMax(renalFunction);
    if (dose > renalMax) {
      return { valid: false, message: `Exceeds renal-adjusted max for eGFR ${renalFunction}`,
        suggestedRange: { min: rules.typicalMin, max: renalMax, unit: rules.unit }, factors };
    }
  }

  // Máximo absoluto
  if (dose > rules.absoluteMax) {
    return { valid: false, message: `Exceeds absolute max ${rules.absoluteMax}${rules.unit}`,
      suggestedRange: { min: rules.typicalMin, max: rules.absoluteMax, unit: rules.unit },
      factors: [...factors, 'absolute_max'] };
  }
  return { valid: true, message: 'Within range',
    suggestedRange: { min: rules.typicalMin, max: rules.typicalMax, unit: rules.unit }, factors };
}
```

### Pontuação Clínica: NEWS2

```typescript
interface NEWS2Input {
  respiratoryRate: number; oxygenSaturation: number; supplementalOxygen: boolean;
  temperature: number; systolicBP: number; heartRate: number;
  consciousness: 'alert' | 'voice' | 'pain' | 'unresponsive';
}
interface NEWS2Result {
  total: number;           // 0-20
  risk: 'low' | 'low-medium' | 'medium' | 'high';
  components: Record<string, number>;
  escalation: string;
}
```

As tabelas de pontuação devem corresponder exatamente à especificação do Royal College of Physicians.

### Severidade do Alerta e Comportamento da UI

| Severidade | Comportamento da UI | Ação Requerida do Clínico |
|------------|---------------------|--------------------------|
| Crítico | Bloqueia ação. Modal não descartável. Vermelho. | Deve documentar motivo de substituição para continuar |
| Maior | Banner de aviso inline. Laranja. | Deve confirmar ciência antes de continuar |
| Menor | Nota informativa inline. Amarelo. | Apenas consciência, sem ação necessária |

Alertas críticos NUNCA devem ser autodescartados ou implementados como notificações toast. Os motivos de substituição devem ser armazenados na trilha de auditoria.

### Testando CDSS (Tolerância Zero para Falsos Negativos)

```typescript
describe('CDSS — Patient Safety', () => {
  INTERACTION_PAIRS.forEach(({ drugA, drugB, severity }) => {
    it(`detects ${drugA} + ${drugB} (${severity})`, () => {
      const alerts = checkInteractions(drugA, [drugB], []);
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts[0].severity).toBe(severity);
    });
    it(`detects ${drugB} + ${drugA} (reverse)`, () => {
      const alerts = checkInteractions(drugB, [drugA], []);
      expect(alerts.length).toBeGreaterThan(0);
    });
  });
  it('blocks mg/kg drug when weight is missing', () => {
    const result = validateDose('gentamicin', 300, 'iv');
    expect(result.valid).toBe(false);
    expect(result.factors).toContain('weight_missing');
  });
  it('handles malformed drug data gracefully', () => {
    expect(() => checkInteractions('', [], [])).not.toThrow();
  });
});
```

Critério de aprovação: 100%. Uma única interação não detectada é um evento de segurança do paciente.

### Anti-Padrões

- Tornar as verificações de CDSS opcionais ou ignoráveis sem motivo documentado
- Implementar verificações de interação como notificações toast
- Usar tipos `any` para dados de medicamentos ou dados clínicos
- Hardcodar pares de interação em vez de usar uma estrutura de dados manutenível
- Capturar silenciosamente erros no engine de CDSS (falhas devem ser expostas de forma barulhenta)
- Pular a validação baseada em peso quando o peso não está disponível (deve bloquear, não passar)

## Exemplos

### Exemplo 1: Verificação de Interação Medicamentosa

```typescript
const alerts = checkInteractions('warfarin', ['aspirin', 'metformin'], ['penicillin']);
// [{ severity: 'critical', pair: ['warfarin', 'aspirin'],
//    message: 'Increased bleeding risk', recommendation: 'Avoid combination' }]
```

### Exemplo 2: Validação de Dose

```typescript
const ok = validateDose('paracetamol', 1000, 'oral', 70, 45);
// { valid: true, suggestedRange: { min: 500, max: 4000, unit: 'mg' } }

const bad = validateDose('paracetamol', 5000, 'oral', 70, 45);
// { valid: false, message: 'Exceeds absolute max 4000mg' }

const noWeight = validateDose('gentamicin', 300, 'iv');
// { valid: false, factors: ['weight_missing'] }
```

### Exemplo 3: Pontuação NEWS2

```typescript
const result = calculateNEWS2({
  respiratoryRate: 24, oxygenSaturation: 93, supplementalOxygen: true,
  temperature: 38.5, systolicBP: 100, heartRate: 110, consciousness: 'voice'
});
// { total: 13, risk: 'high', escalation: 'Urgent clinical review. Consider ICU.' }
```
