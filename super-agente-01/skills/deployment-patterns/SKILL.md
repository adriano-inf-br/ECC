---
name: deployment-patterns
description: Fluxos de trabalho de deployment, padrões de pipeline CI/CD, conteinerização com Docker, health checks, estratégias de rollback e checklists de prontidão para produção para aplicações web.
metadata:
  origin: ECC
---

# Deployment Patterns

Fluxos de trabalho de deployment para produção e boas práticas de CI/CD.

## Quando Ativar

- Configurar pipelines CI/CD
- Conteinerizar uma aplicação com Docker
- Planejar estratégia de deployment (blue-green, canary, rolling)
- Implementar health checks e readiness probes
- Preparar uma release de produção
- Configurar definições específicas de ambiente

## Estratégias de Deployment

### Rolling Deployment (Padrão)

Substitui instâncias gradualmente — versões antiga e nova rodam simultaneamente durante o rollout.

```
Instância 1: v1 → v2  (atualiza primeiro)
Instância 2: v1        (ainda rodando v1)
Instância 3: v1        (ainda rodando v1)

Instância 1: v2
Instância 2: v1 → v2  (atualiza em segundo)
Instância 3: v1

Instância 1: v2
Instância 2: v2
Instância 3: v1 → v2  (atualiza por último)
```

**Prós:** Zero downtime, rollout gradual
**Contras:** Duas versões rodam simultaneamente — exige mudanças retrocompatíveis
**Use quando:** Deployments padrão, mudanças retrocompatíveis

### Blue-Green Deployment

Rode dois ambientes idênticos. Troque o tráfego atomicamente.

```
Blue  (v1) ← tráfego
Green (v2)   ocioso, rodando a nova versão

# Após verificação:
Blue  (v1)   ocioso (torna-se standby)
Green (v2) ← tráfego
```

**Prós:** Rollback instantâneo (volte para o blue), cutover limpo
**Contras:** Exige 2x de infraestrutura durante o deployment
**Use quando:** Serviços críticos, tolerância zero a problemas

### Canary Deployment

Roteia uma pequena porcentagem do tráfego para a nova versão primeiro.

```
v1: 95% do tráfego
v2:  5% do tráfego  (canary)

# Se as métricas parecerem boas:
v1: 50% do tráfego
v2: 50% do tráfego

# Final:
v2: 100% do tráfego
```

**Prós:** Pega problemas com tráfego real antes do rollout completo
**Contras:** Exige infraestrutura de divisão de tráfego, monitoramento
**Use quando:** Serviços de alto tráfego, mudanças arriscadas, feature flags

## Docker

### Dockerfile Multi-Stage (Node.js)

```dockerfile
# Stage 1: Instala dependências
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --production=false

# Stage 2: Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
RUN npm prune --production

# Stage 3: Imagem de produção
FROM node:22-alpine AS runner
WORKDIR /app

RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001
USER appuser

COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/package.json ./

ENV NODE_ENV=production
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]
```

### Dockerfile Multi-Stage (Go)

```dockerfile
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /server ./cmd/server

FROM alpine:3.19 AS runner
RUN apk --no-cache add ca-certificates
RUN adduser -D -u 1001 appuser
USER appuser

COPY --from=builder /server /server

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:8080/health || exit 1
CMD ["/server"]
```

### Dockerfile Multi-Stage (Python/Django)

```dockerfile
FROM python:3.12-slim AS builder
WORKDIR /app
RUN pip install --no-cache-dir uv
COPY requirements.txt .
RUN uv pip install --system --no-cache -r requirements.txt

FROM python:3.12-slim AS runner
WORKDIR /app

RUN useradd -r -u 1001 appuser
USER appuser

COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
COPY . .

ENV PYTHONUNBUFFERED=1
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health/')" || exit 1
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4"]
```

### Boas Práticas de Docker

```
# Boas práticas
- Use tags de versão específicas (node:22-alpine, não node:latest)
- Builds multi-stage para minimizar o tamanho da imagem
- Rode como usuário não-root
- Copie os arquivos de dependência primeiro (cache de camadas)
- Use .dockerignore para excluir node_modules, .git, tests
- Adicione a instrução HEALTHCHECK
- Defina limites de recursos em docker-compose ou k8s

# Más práticas
- Rodar como root
- Usar tags :latest
- Copiar o repositório inteiro em uma única camada COPY
- Instalar dependências de dev na imagem de produção
- Armazenar segredos na imagem (use env vars ou gerenciador de segredos)
```

## Pipeline CI/CD

### GitHub Actions (Pipeline Padrão)

```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test -- --coverage
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage
          path: coverage/

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: ghcr.io/${{ github.repository }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - name: Deploy to production
        run: |
          # Comando de deployment específico da plataforma
          # Railway: railway up
          # Vercel: vercel --prod
          # K8s: kubectl set image deployment/app app=ghcr.io/${{ github.repository }}:${{ github.sha }}
          echo "Deploying ${{ github.sha }}"
```

### Estágios do Pipeline

```
PR aberto:
  lint → typecheck → testes unitários → testes de integração → deploy de preview

Merge na main:
  lint → typecheck → testes unitários → testes de integração → build da imagem → deploy em staging → smoke tests → deploy em produção
```

## Health Checks

### Endpoint de Health Check

```typescript
// Health check simples
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Health check detalhado (para monitoramento interno)
app.get("/health/detailed", async (req, res) => {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    externalApi: await checkExternalApi(),
  };

  const allHealthy = Object.values(checks).every(c => c.status === "ok");

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || "unknown",
    uptime: process.uptime(),
    checks,
  });
});

async function checkDatabase(): Promise<HealthCheck> {
  try {
    await db.query("SELECT 1");
    return { status: "ok", latency_ms: 2 };
  } catch (err) {
    return { status: "error", message: "Database unreachable" };
  }
}
```

### Probes do Kubernetes

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 30
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 10
  failureThreshold: 2

startupProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 0
  periodSeconds: 5
  failureThreshold: 30    # 30 * 5s = 150s de tempo máximo de startup
```

## Configuração de Ambiente

### Padrão Twelve-Factor App

```bash
# Toda config via variáveis de ambiente — nunca no código
DATABASE_URL=postgres://user:pass@host:5432/db
REDIS_URL=redis://host:6379/0
API_KEY=${API_KEY}           # injetada pelo gerenciador de segredos
LOG_LEVEL=info
PORT=3000

# Comportamento específico de ambiente
NODE_ENV=production          # ou staging, development
APP_ENV=production           # ambiente explícito da aplicação
```

### Validação de Configuração

```typescript
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "staging", "production"]),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

// Valida no startup — falhe rápido se a config estiver errada
export const env = envSchema.parse(process.env);
```

## Estratégia de Rollback

### Rollback Instantâneo

```bash
# Docker/Kubernetes: aponte para a imagem anterior
kubectl rollout undo deployment/app

# Vercel: promova o deployment anterior
vercel rollback

# Railway: faça redeploy do commit anterior
railway up --commit <previous-sha>

# Banco de dados: faça rollback da migration (se reversível)
npx prisma migrate resolve --rolled-back <migration-name>
```

### Checklist de Rollback

- [ ] Imagem/artefato anterior está disponível e com tag
- [ ] Migrations de banco de dados são retrocompatíveis (sem mudanças destrutivas)
- [ ] Feature flags podem desativar novos recursos sem deploy
- [ ] Alertas de monitoramento configurados para picos na taxa de erro
- [ ] Rollback testado em staging antes da release de produção

## Checklist de Prontidão para Produção

Antes de qualquer deployment de produção:

### Aplicação
- [ ] Todos os testes passam (unitários, integração, E2E)
- [ ] Nenhum segredo hardcoded no código ou em arquivos de config
- [ ] Tratamento de erros cobre todos os casos extremos
- [ ] Logging é estruturado (JSON) e não contém PII
- [ ] Endpoint de health check retorna status significativo

### Infraestrutura
- [ ] Imagem Docker compila de forma reprodutível (versões fixadas)
- [ ] Variáveis de ambiente documentadas e validadas no startup
- [ ] Limites de recursos definidos (CPU, memória)
- [ ] Escalonamento horizontal configurado (instâncias min/max)
- [ ] SSL/TLS habilitado em todos os endpoints

### Monitoramento
- [ ] Métricas da aplicação exportadas (taxa de requisições, latência, erros)
- [ ] Alertas configurados para taxa de erro > limite
- [ ] Agregação de logs configurada (logs estruturados, pesquisáveis)
- [ ] Monitoramento de uptime no endpoint de health

### Segurança
- [ ] Dependências escaneadas em busca de CVEs
- [ ] CORS configurado apenas para origens permitidas
- [ ] Rate limiting habilitado em endpoints públicos
- [ ] Autenticação e autorização verificadas
- [ ] Headers de segurança definidos (CSP, HSTS, X-Frame-Options)

### Operações
- [ ] Plano de rollback documentado e testado
- [ ] Migration de banco de dados testada contra dados do tamanho de produção
- [ ] Runbook para cenários comuns de falha
- [ ] Rotação de plantão (on-call) e caminho de escalonamento definidos
