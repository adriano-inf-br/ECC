---
name: healthcare-phi-compliance
description: Padrões de conformidade de Informações de Saúde Protegidas (PHI) e Informações de Identificação Pessoal (PII) para aplicações de saúde. Abrange classificação de dados, controle de acesso, trilhas de auditoria, criptografia e vetores comuns de vazamento.
metadata:
  origin: Health1 Super Speciality Hospitals — contributed by Dr. Keyur Patel
version: "1.0.0"
---

# Padrões de Conformidade PHI/PII em Saúde

Padrões para proteger dados de pacientes, dados de clínicos e dados financeiros em aplicações de saúde. Aplicável a HIPAA (EUA), DISHA (Índia), GDPR (UE) e proteção geral de dados de saúde.

## Quando Usar

- Construindo qualquer feature que toque registros de pacientes
- Implementando controle de acesso ou autenticação para sistemas clínicos
- Projetando esquemas de banco de dados para dados de saúde
- Construindo APIs que retornam dados de pacientes ou clínicos
- Implementando trilhas de auditoria ou logging
- Revisando código para vulnerabilidades de exposição de dados
- Configurando Row-Level Security (RLS) para sistemas de saúde multi-tenant

## Como Funciona

A proteção de dados de saúde opera em três camadas: **classificação** (o que é sensível), **controle de acesso** (quem pode ver) e **auditoria** (quem viu).

### Classificação de Dados

**PHI (Informações de Saúde Protegidas)** — qualquer dado que possa identificar um paciente E se relacione à sua saúde: nome do paciente, data de nascimento, endereço, telefone, e-mail, números de identificação nacional (CPF, Aadhaar, número NHS), números de registro médico, diagnósticos, medicamentos, resultados laboratoriais, imagens, detalhes de apólice e sinistros de seguro, registros de consultas e internações, ou qualquer combinação do acima.

**PII (Dados pessoais não relacionados ao paciente)** em sistemas de saúde: dados pessoais de clínicos/equipe, estruturas de honorários e valores de pagamento de médicos, detalhes de salário e dados bancários de funcionários, informações de pagamento a fornecedores.

### Controle de Acesso: Row-Level Security

```sql
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Escopo de acesso por instalação
CREATE POLICY "staff_read_own_facility"
  ON patients FOR SELECT TO authenticated
  USING (facility_id IN (
    SELECT facility_id FROM staff_assignments
    WHERE user_id = auth.uid() AND role IN ('doctor','nurse','lab_tech','admin')
  ));

-- Log de auditoria: somente inserção (à prova de adulteração)
CREATE POLICY "audit_insert_only" ON audit_log FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "audit_no_modify" ON audit_log FOR UPDATE USING (false);
CREATE POLICY "audit_no_delete" ON audit_log FOR DELETE USING (false);
```

### Trilha de Auditoria

Todo acesso ou modificação de PHI deve ser registrado:

```typescript
interface AuditEntry {
  timestamp: string;
  user_id: string;
  patient_id: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'print' | 'export';
  resource_type: string;
  resource_id: string;
  changes?: { before: object; after: object };
  ip_address: string;
  session_id: string;
}
```

### Vetores Comuns de Vazamento

**Mensagens de erro:** Nunca inclua dados de identificação do paciente em mensagens de erro enviadas ao cliente. Registre detalhes somente no lado do servidor.

**Saída do console:** Nunca registre objetos completos de pacientes. Use IDs de registro internos opacos (UUIDs) — não números de registro médico, IDs nacionais ou nomes.

**Parâmetros de URL:** Nunca coloque dados de identificação do paciente em strings de consulta ou segmentos de caminho que possam aparecer em logs ou no histórico do navegador. Use apenas UUIDs opacos.

**Armazenamento do navegador:** Nunca armazene PHI em localStorage ou sessionStorage. Mantenha PHI somente na memória, busque sob demanda.

**Chaves de service role:** Nunca use a chave service_role em código do lado cliente. Sempre use a chave anon/publishable e deixe o RLS aplicar o acesso.

**Logs e monitoramento:** Nunca registre registros completos de pacientes. Use apenas IDs de registro opacos (não números de registro médico). Sanitize stack traces antes de enviar para serviços de rastreamento de erros.

### Tagging de Esquema de Banco de Dados

Marque colunas PHI/PII no nível do esquema:

```sql
COMMENT ON COLUMN patients.name IS 'PHI: patient_name';
COMMENT ON COLUMN patients.dob IS 'PHI: date_of_birth';
COMMENT ON COLUMN patients.aadhaar IS 'PHI: national_id';
COMMENT ON COLUMN doctor_payouts.amount IS 'PII: financial';
```

### Lista de Verificação de Implantação

Antes de cada implantação:
- Sem PHI em mensagens de erro ou stack traces
- Sem PHI em console.log/console.error
- Sem PHI em parâmetros de URL
- Sem PHI no armazenamento do navegador
- Sem chave service_role no código cliente
- RLS habilitado em todas as tabelas PHI/PII
- Trilha de auditoria para todas as modificações de dados
- Timeout de sessão configurado
- Autenticação de API em todos os endpoints de PHI
- Isolamento de dados entre instalações verificado

## Exemplos

### Exemplo 1: Tratamento de Erros Seguro vs Inseguro

```typescript
// RUIM — vaza PHI no erro
throw new Error(`Patient ${patient.name} not found in ${patient.facility}`);

// BOM — erro genérico, detalhes registrados no servidor com apenas IDs opacos
logger.error('Patient lookup failed', { recordId: patient.id, facilityId });
throw new Error('Record not found');
```

### Exemplo 2: Política RLS para Isolamento Multi-Instalação

```sql
-- Médico na Instalação A não pode ver pacientes da Instalação B
CREATE POLICY "facility_isolation"
  ON patients FOR SELECT TO authenticated
  USING (facility_id IN (
    SELECT facility_id FROM staff_assignments WHERE user_id = auth.uid()
  ));

-- Teste: login como doctor-facility-a, consultar pacientes da facility-b
-- Esperado: 0 linhas retornadas
```

### Exemplo 3: Logging Seguro

```typescript
// RUIM — registra dados identificáveis do paciente
console.log('Processing patient:', patient);

// BOM — registra apenas ID de registro interno opaco
console.log('Processing record:', patient.id);
// Nota: mesmo patient.id deve ser um UUID opaco, não um número de registro médico
```
