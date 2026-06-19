---
name: benchmark
description: Use esta Skill para medir linhas de base de desempenho, detectar regressões antes/depois de PRs e comparar alternativas de stack.
metadata:
  origin: ECC
---

# Benchmark — Linha de Base de Desempenho e Detecção de Regressão

## When to Use

- Antes e depois de um PR para medir o impacto no desempenho
- Configurar linhas de base de desempenho para um projeto
- Quando usuários relatam "parece lento"
- Antes de um lançamento — garantir que você atinge as metas de desempenho
- Comparar sua stack com alternativas

## How It Works

### Modo 1: Desempenho de Página

Mede métricas reais do navegador via MCP de navegador:

```
1. Navega até cada URL alvo
2. Mede os Core Web Vitals:
   - LCP (Largest Contentful Paint) — alvo < 2.5s
   - CLS (Cumulative Layout Shift) — alvo < 0.1
   - INP (Interaction to Next Paint) — alvo < 200ms
   - FCP (First Contentful Paint) — alvo < 1.8s
   - TTFB (Time to First Byte) — alvo < 800ms
3. Mede os tamanhos dos recursos:
   - Peso total da página (alvo < 1MB)
   - Tamanho do bundle JS (alvo < 200KB com gzip)
   - Tamanho do CSS
   - Peso das imagens
   - Peso dos scripts de terceiros
4. Conta as requisições de rede
5. Verifica recursos que bloqueiam a renderização
```

### Modo 2: Desempenho de API

Faz benchmark de endpoints de API:

```
1. Acessa cada endpoint 100 vezes
2. Mede: latência p50, p95, p99
3. Acompanha: tamanho da resposta, códigos de status
4. Testa sob carga: 10 requisições concorrentes
5. Compara contra as metas de SLA
```

### Modo 3: Desempenho de Build

Mede o loop de feedback de desenvolvimento:

```
1. Tempo de build a frio
2. Tempo de hot reload (HMR)
3. Duração da suíte de testes
4. Tempo de verificação do TypeScript
5. Tempo de lint
6. Tempo de build do Docker
```

### Modo 4: Comparação Antes/Depois

Rode antes e depois de uma mudança para medir o impacto:

```
/benchmark baseline    # salva as métricas atuais
# ... faça as mudanças ...
/benchmark compare     # compara contra a linha de base
```

Saída:
```
| Metric | Before | After | Delta | Verdict |
|--------|--------|-------|-------|---------|
| LCP | 1.2s | 1.4s | +200ms | WARNING: WARN |
| Bundle | 180KB | 175KB | -5KB | ✓ BETTER |
| Build | 12s | 14s | +2s | WARNING: WARN |
```

## Output

Armazena as linhas de base em `.ecc/benchmarks/` como JSON. Versionado no Git para que a equipe compartilhe as linhas de base.

## Integration

- CI: rode `/benchmark compare` em cada PR
- Combine com `/canary-watch` para monitoramento pós-deploy
- Combine com `/browser-qa` para um checklist completo de pré-lançamento
