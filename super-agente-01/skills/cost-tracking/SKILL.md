---
name: cost-tracking
description: Rastreie e relate o uso de tokens, gastos e orçamentos do Claude Code a partir do log de métricas local do cost-tracker do ECC. Use quando o usuário perguntar sobre custos, gastos, uso, tokens, orçamentos ou detalhamentos de custo por modelo, sessão ou data.
metadata:
  origin: community
---

# Cost Tracking

Use esta skill para analisar o histórico de custo e uso do Claude Code a partir do log de métricas
que o hook `stop:cost-tracker` do ECC grava.

## Onde os dados ficam

O tracker anexa um objeto JSON por encerramento de sessão em
`~/.claude/metrics/costs.jsonl`. Cada linha é um **snapshot cumulativo daquela
sessão**, então, para totalizar o gasto, você pega a **linha mais recente por `session_id`** e
soma entre as sessões — somar todas as linhas conta valores em duplicidade.

Esquema da linha:

| Campo | Significado |
| --- | --- |
| `timestamp` | Timestamp ISO do snapshot |
| `session_id` | Identificador da sessão do Claude Code |
| `transcript_path` | Caminho para a transcrição da sessão |
| `model` | Modelo usado |
| `input_tokens` / `output_tokens` | Contagens de tokens |
| `cache_write_tokens` / `cache_read_tokens` | Contagens de tokens de prompt-cache |
| `estimated_cost_usd` | Custo cumulativo pré-calculado em USD para a sessão |

Prefira `estimated_cost_usd` em vez de calcular preços à mão — os preços de modelo e de cache
mudam, e o tracker é a fonte da verdade.

## Quando Usar

- O usuário pergunta "quanto eu gastei?", "quanto custou esta sessão?" ou
  "qual é o meu uso de tokens?"
- O usuário menciona orçamentos, limites de gasto, estouros ou controles de custo.
- O usuário quer um detalhamento de custo por modelo, sessão ou data, ou uma exportação CSV.

## Como Funciona

Primeiro verifique se o log existe (use `node`, não `sqlite3` — o tracker grava
JSONL, e o `node` é multiplataforma):

```bash
node -e 'const fs=require("fs"),os=require("os"),p=require("path");const f=p.join(os.homedir(),".claude","metrics","costs.jsonl");console.log(fs.existsSync(f)?"cost log found":"cost log not found: "+f)'
```

If the log is missing, do not fabricate usage data. Tell the user that cost
tracking populates after the first session ends with the `stop:cost-tracker`
hook enabled.

## Example — summary, by model, last 7 days

```bash
node -e '
const fs=require("fs"),os=require("os"),path=require("path");
const f=path.join(os.homedir(),".claude","metrics","costs.jsonl");
if(!fs.existsSync(f)){console.log("cost log not found: "+f);process.exit(0);}
const rows=fs.readFileSync(f,"utf8").split(/\r?\n/).filter(Boolean).map(l=>{try{return JSON.parse(l)}catch{return null}}).filter(Boolean);
const bySession=new Map();
for(const r of rows){const k=r.session_id||r.transcript_path||r.timestamp;const p=bySession.get(k);if(!p||String(r.timestamp)>String(p.timestamp))bySession.set(k,r);}
const latest=[...bySession.values()];
const cost=r=>Number(r.estimated_cost_usd)||0, day=r=>String(r.timestamp||"").slice(0,10), sum=a=>a.reduce((s,r)=>s+cost(r),0), f4=n=>"$"+n.toFixed(4);
const today=new Date().toISOString().slice(0,10), yest=new Date(Date.now()-864e5).toISOString().slice(0,10);
console.log("today: "+f4(sum(latest.filter(r=>day(r)===today)))+" | yesterday: "+f4(sum(latest.filter(r=>day(r)===yest)))+" | total: "+f4(sum(latest))+" ("+latest.length+" sessions)");
const m=new Map();for(const r of latest){const k=r.model||"(unknown)";m.set(k,(m.get(k)||0)+cost(r));}
console.log("by model:");[...m.entries()].sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>console.log("  "+f4(v)+"  "+k));
'
```

For a session drilldown or CSV export, iterate the same `latest` set (or the raw
rows for CSV) and print the fields you need.

## Reporting Guidance

When presenting cost data, include today's spend vs yesterday, total across all
sessions, a by-model breakdown, and session count. Format sub-dollar amounts
with four decimals, larger amounts with two.

## Anti-Patterns

- Do not sum every row — they are cumulative per session; reduce to the latest
  row per `session_id` first.
- Do not estimate costs from raw token counts when `estimated_cost_usd` is present.
- Do not assume the log exists without checking.
- Do not hard-code current model pricing in user-facing answers.
- Do not recommend installing unreviewed hooks or plugins that execute arbitrary code.

## Related

- `/cost-report` - Command-form report over the same metrics log.
- `cost-aware-llm-pipeline` - Model-routing and budget-design patterns.
- `token-budget-advisor` - Context and token-budget planning.
- `strategic-compact` - Context compaction to reduce repeated token spend.
