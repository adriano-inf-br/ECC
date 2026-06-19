---
description: Gera um relatório local de custos do Claude Code a partir do log de métricas do cost-tracker do ECC.
argument-hint: [csv]
---

# Cost Report

Resume os gastos locais do Claude Code por dia, model e sessão a partir do log de
métricas que o hook `stop:cost-tracker` do ECC escreve.

## Onde os dados ficam

O tracker anexa um objeto JSON por encerramento de sessão em
`~/.claude/metrics/costs.jsonl`. Cada linha é um **snapshot cumulativo daquela
sessão**, então o relatório pega a **última linha por `session_id`** e soma
entre as sessões (somar todas as linhas faria uma contagem múltipla).

Schema da linha:
`{ timestamp, session_id, transcript_path, model, input_tokens, output_tokens, cache_write_tokens, cache_read_tokens, estimated_cost_usd }`

## O que este comando faz

1. Verifica se `~/.claude/metrics/costs.jsonl` existe. Se não existir, informa ao
   usuário que o tracker ainda não está configurado (ele é populado após o
   encerramento da primeira sessão com o hook `stop:cost-tracker` habilitado).
2. Reduz as linhas ao snapshot mais recente por sessão e agrega.
3. Apresenta um relatório compacto, ou exporta as linhas recentes como CSV quando o argumento é `csv`.

`node` é usado em vez de `sqlite3`/`jq` para que isso funcione de forma idêntica em macOS,
Linux e Windows.

## Relatório

```bash
node -e '
const fs=require("fs"),os=require("os"),path=require("path");
const f=path.join(os.homedir(),".claude","metrics","costs.jsonl");
if(!fs.existsSync(f)){console.log("Cost tracker not set up: "+f+" not found. Enable the stop:cost-tracker hook and finish a session first.");process.exit(0);}
const rows=fs.readFileSync(f,"utf8").split(/\r?\n/).filter(Boolean).map(l=>{try{return JSON.parse(l)}catch{return null}}).filter(Boolean);
const bySession=new Map();
for(const r of rows){const k=r.session_id||r.transcript_path||r.timestamp;const p=bySession.get(k);if(!p||String(r.timestamp)>String(p.timestamp))bySession.set(k,r);}
const latest=[...bySession.values()];
const cost=r=>Number(r.estimated_cost_usd)||0;
const day=r=>String(r.timestamp||"").slice(0,10);
const today=new Date().toISOString().slice(0,10);
const d=new Date(Date.now()-864e5).toISOString().slice(0,10);
const sum=a=>a.reduce((s,r)=>s+cost(r),0);
const f4=n=>"$"+n.toFixed(4);
console.log("=== Cost summary ===");
console.log("today:     "+f4(sum(latest.filter(r=>day(r)===today))));
console.log("yesterday: "+f4(sum(latest.filter(r=>day(r)===d))));
console.log("total:     "+f4(sum(latest))+"  ("+latest.length+" sessions)");
const by=(key)=>{const m=new Map();for(const r of latest){const k=key(r)||"(unknown)";m.set(k,(m.get(k)||0)+cost(r));}return [...m.entries()].sort((a,b)=>b[1]-a[1]);};
console.log("\n=== By model ===");for(const [k,v] of by(r=>r.model))console.log(f4(v).padStart(12)+"  "+k);
console.log("\n=== Last 7 days ===");
const days=new Map();for(const r of latest){const k=day(r);days.set(k,(days.get(k)||0)+cost(r));}
[...days.entries()].sort((a,b)=>b[0]<a[0]?-1:1).slice(0,7).forEach(([k,v])=>console.log(k+"  "+f4(v)));
'
```

## CSV export (`/cost-report csv`)

```bash
node -e '
const fs=require("fs"),os=require("os"),path=require("path");
const f=path.join(os.homedir(),".claude","metrics","costs.jsonl");
if(!fs.existsSync(f)){console.error("no data");process.exit(0);}
const rows=fs.readFileSync(f,"utf8").split(/\r?\n/).filter(Boolean).map(l=>{try{return JSON.parse(l)}catch{return null}}).filter(Boolean).slice(-100);
console.log("timestamp,session_id,model,input_tokens,output_tokens,cache_write_tokens,cache_read_tokens,estimated_cost_usd");
for(const r of rows)console.log([r.timestamp,r.session_id,r.model,r.input_tokens,r.output_tokens,r.cache_write_tokens,r.cache_read_tokens,r.estimated_cost_usd].join(","));
'
```

## Formato do relatório

1. Resumo: hoje, ontem, total, contagem de sessões.
2. Por model: models ordenados por custo total.
3. Últimos sete dias: data e custo.

Confie nos valores `estimated_cost_usd` pré-computados que o tracker escreve; não
reestime preços a partir dos tokens brutos aqui.
