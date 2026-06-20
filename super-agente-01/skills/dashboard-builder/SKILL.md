---
name: dashboard-builder
description: Construa dashboards de monitoramento que respondam a perguntas reais de operadores para Grafana, SigNoz e plataformas similares. Use ao transformar métricas em um dashboard funcional em vez de um painel de vaidade.
metadata:
  origin: ECC direct-port adaptation
version: "1.0.0"
---

# Dashboard Builder

Use esta skill quando a tarefa é construir um dashboard a partir do qual as pessoas possam operar.

O objetivo não é "mostrar todas as métricas". O objetivo é responder:

- está saudável?
- onde está o gargalo?
- o que mudou?
- que ação alguém deve tomar?

## Quando Usar

- "Construa um dashboard de monitoramento do Kafka"
- "Crie um dashboard Grafana para Elasticsearch"
- "Faça um dashboard SigNoz para este serviço"
- "Transforme esta lista de métricas em um dashboard operacional real"

## Restrições

- não comece pelo layout visual; comece pelas perguntas dos operadores
- não inclua todas as métricas disponíveis apenas porque existem
- não misture painéis de saúde, throughput e recursos sem estrutura
- não entregue painéis sem títulos, unidades e limiares razoáveis

## Fluxo de Trabalho

### 1. Defina as perguntas operacionais

Organize em torno de:

- saúde / disponibilidade
- latência / desempenho
- throughput / volume
- saturação / recursos
- risco específico do serviço

### 2. Estude o schema da plataforma alvo

Inspecione os dashboards existentes primeiro:

- estrutura JSON
- linguagem de consulta
- variáveis
- estilização de limiares
- layout de seções

### 3. Construa o board mínimo útil

Estrutura recomendada:

1. visão geral
2. desempenho
3. recursos
4. seção específica do serviço

### 4. Corte painéis de vaidade

Cada painel deve responder a uma pergunta real. Se não responder, remova-o.

## Conjuntos de Painéis de Exemplo

### Elasticsearch

- saúde do cluster
- alocação de shards
- latência de busca
- taxa de indexação
- JVM heap / GC

### Kafka

- contagem de brokers
- partições sub-replicadas
- mensagens de entrada / saída
- lag do consumidor
- pressão de disco e rede

### API gateway / ingress

- taxa de requisições
- latência p50 / p95 / p99
- taxa de erros
- saúde upstream
- conexões ativas

## Checklist de Qualidade

- [ ] JSON do dashboard válido
- [ ] agrupamento claro de seções
- [ ] títulos e unidades presentes
- [ ] limiares/cores de status são significativos
- [ ] variáveis existem para filtros comuns
- [ ] intervalo de tempo padrão e refresh são razoáveis
- [ ] nenhum painel de vaidade sem valor operacional

## Skills Relacionadas

- `research-ops`
- `backend-patterns`
- `terminal-ops`
