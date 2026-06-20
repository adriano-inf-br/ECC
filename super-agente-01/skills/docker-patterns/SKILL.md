---
name: docker-patterns
description: Padrões de Docker e Docker Compose para desenvolvimento local, segurança de containers, rede, estratégias de volumes e orquestração multi-serviço.
metadata:
  origin: ECC
---

# Padrões de Docker

Melhores práticas de Docker e Docker Compose para desenvolvimento containerizado.

## Quando Ativar

- Configurando o Docker Compose para desenvolvimento local
- Projetando arquiteturas multi-container
- Solucionando problemas de rede ou de volumes em containers
- Revisando Dockerfiles em busca de segurança e tamanho
- Migrando do desenvolvimento local para um fluxo de trabalho containerizado

## Docker Compose para Desenvolvimento Local

### Stack Padrão de Aplicação Web

```yaml
# docker-compose.yml
services:
  app:
    build:
      context: .
      target: dev                     # Usa o estágio dev do Dockerfile multi-estágio
    ports:
      - "3000:3000"
    volumes:
      - .:/app                        # Bind mount para hot reload
      - /app/node_modules             # Volume anônimo -- preserva as deps do container
    environment:
      - DATABASE_URL=postgres://postgres:postgres@db:5432/app_dev
      - REDIS_URL=redis://redis:6379/0
      - NODE_ENV=development
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    command: npm run dev

  db:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: app_dev
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data

  mailpit:                            # Teste de e-mail local
    image: axllent/mailpit
    ports:
      - "8025:8025"                   # Interface Web
      - "1025:1025"                   # SMTP

volumes:
  pgdata:
  redisdata:
```

### Dockerfile de Desenvolvimento vs Produção

```dockerfile
# Estágio: dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Estágio: dev (hot reload, ferramentas de debug)
FROM node:22-alpine AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Estágio: build
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build && npm prune --production

# Estágio: production (imagem mínima)
FROM node:22-alpine AS production
WORKDIR /app
RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001
USER appuser
COPY --from=build --chown=appuser:appgroup /app/dist ./dist
COPY --from=build --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=build --chown=appuser:appgroup /app/package.json ./
ENV NODE_ENV=production
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/server.js"]
```

### Arquivos de Override

```yaml
# docker-compose.override.yml (carregado automaticamente, configurações apenas para dev)
services:
  app:
    environment:
      - DEBUG=app:*
      - LOG_LEVEL=debug
    ports:
      - "9229:9229"                   # Depurador do Node.js

# docker-compose.prod.yml (explícito para produção)
services:
  app:
    build:
      target: production
    restart: always
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 512M
```

```bash
# Desenvolvimento (carrega o override automaticamente)
docker compose up

# Produção
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Rede

### Descoberta de Serviços

Serviços na mesma rede do Compose são resolvidos pelo nome do serviço:
```
# A partir do container "app":
postgres://postgres:postgres@db:5432/app_dev    # "db" resolve para o container db
redis://redis:6379/0                             # "redis" resolve para o container redis
```

### Redes Personalizadas

```yaml
services:
  frontend:
    networks:
      - frontend-net

  api:
    networks:
      - frontend-net
      - backend-net

  db:
    networks:
      - backend-net              # Acessível apenas a partir da api, não do frontend

networks:
  frontend-net:
  backend-net:
```

### Expor Apenas o Necessário

```yaml
services:
  db:
    ports:
      - "127.0.0.1:5432:5432"   # Acessível apenas a partir do host, não da rede
    # Omita ports inteiramente em produção -- acessível apenas dentro da rede Docker
```

## Estratégias de Volume

```yaml
volumes:
  # Volume nomeado: persiste entre reinícios do container, gerenciado pelo Docker
  pgdata:

  # Bind mount: mapeia um diretório do host para dentro do container (para desenvolvimento)
  # - ./src:/app/src

  # Volume anônimo: preserva conteúdo gerado pelo container contra o override do bind mount
  # - /app/node_modules
```

### Padrões Comuns

```yaml
services:
  app:
    volumes:
      - .:/app                   # Código-fonte (bind mount para hot reload)
      - /app/node_modules        # Protege o node_modules do container contra o host
      - /app/.next               # Protege o cache de build

  db:
    volumes:
      - pgdata:/var/lib/postgresql/data          # Dados persistentes
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql  # Scripts de inicialização
```

## Segurança de Containers

### Endurecimento do Dockerfile

```dockerfile
# 1. Use tags específicas (nunca :latest)
FROM node:22.12-alpine3.20

# 2. Execute como não-root
RUN addgroup -g 1001 -S app && adduser -S app -u 1001
USER app

# 3. Remova capabilities (no compose)
# 4. Sistema de arquivos raiz somente leitura sempre que possível
# 5. Sem segredos nas camadas da imagem
```

### Segurança do Compose

```yaml
services:
  app:
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
      - /app/.cache
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE          # Apenas se fizer bind em portas < 1024
```

### Gerenciamento de Segredos

```yaml
# BOM: Use variáveis de ambiente (injetadas em tempo de execução)
services:
  app:
    env_file:
      - .env                     # Nunca faça commit do .env no git
    environment:
      - API_KEY                  # Herda do ambiente do host

# BOM: Docker secrets (modo Swarm)
secrets:
  db_password:
    file: ./secrets/db_password.txt

services:
  db:
    secrets:
      - db_password

# RUIM: Embutido na imagem (hardcoded)
# ENV API_KEY=sk-proj-xxxxx      # NUNCA FAÇA ISSO
```

## .dockerignore

```
node_modules
.git
.env
.env.*
dist
coverage
*.log
.next
.cache
docker-compose*.yml
Dockerfile*
README.md
tests/
```

## Depuração

### Comandos Comuns

```bash
# Ver logs
docker compose logs -f app           # Acompanha os logs do app
docker compose logs --tail=50 db     # Últimas 50 linhas do db

# Executa comandos em um container em execução
docker compose exec app sh           # Abre um shell no app
docker compose exec db psql -U postgres  # Conecta ao postgres

# Inspecionar
docker compose ps                     # Serviços em execução
docker compose top                    # Processos em cada container
docker stats                          # Uso de recursos

# Reconstruir
docker compose up --build             # Reconstrói as imagens
docker compose build --no-cache app   # Força uma reconstrução completa

# Limpeza
docker compose down                   # Para e remove os containers
docker compose down -v                # Também remove os volumes (DESTRUTIVO)
docker system prune                   # Remove imagens/containers não utilizados
```

### Depurando Problemas de Rede

```bash
# Verifica a resolução de DNS dentro do container
docker compose exec app nslookup db

# Verifica a conectividade
docker compose exec app wget -qO- http://api:3000/health

# Inspeciona a rede
docker network ls
docker network inspect <project>_default
```

## Anti-Padrões

```
# RUIM: Usar docker compose em produção sem orquestração
# Use Kubernetes, ECS ou Docker Swarm para cargas multi-container em produção

# RUIM: Armazenar dados em containers sem volumes
# Containers são efêmeros -- todos os dados são perdidos no reinício sem volumes

# RUIM: Executar como root
# Sempre crie e use um usuário não-root

# RUIM: Usar a tag :latest
# Fixe versões específicas para builds reproduzíveis

# RUIM: Um container gigante com todos os serviços
# Separe as preocupações: um processo por container

# RUIM: Colocar segredos no docker-compose.yml
# Use arquivos .env (no gitignore) ou Docker secrets
```
