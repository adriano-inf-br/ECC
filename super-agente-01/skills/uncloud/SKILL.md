---
name: uncloud
description: Use ao gerenciar um cluster Uncloud — implantando serviços, configurando ingress Caddy, adicionando rotas de proxy estático para dispositivos fora do cluster, publicando portas, escalando, inspecionando logs ou gerenciando máquinas e volumes com o CLI `uc`.
metadata:
  origin: ECC
---

# Gerenciamento de Cluster Uncloud

Referência para o CLI `uc` — uma plataforma de auto-hospedagem descentralizada usando contêineres Docker, rede mesh WireGuard e proxy reverso Caddy.

## Quando Ativar

Use esta skill ao trabalhar com clusters Uncloud, especialmente quando:
- Iniciando ou unindo máquinas com `uc machine`
- Implantando serviços de arquivos Compose com `uc deploy`
- Publicando portas HTTP, HTTPS, TCP ou UDP através do Uncloud
- Configurando ingress Caddy com `x-caddy`, `x-ports` ou `--caddyfile`
- Roteando dispositivos LAN externos através do proxy do cluster
- Inspecionando logs, estado de serviços, volumes, DNS ou posicionamento de máquinas

## Como Funciona

O Uncloud executa serviços Docker entre máquinas pares conectadas por uma mesh WireGuard. Cada máquina é um membro igual do cluster; os serviços se comunicam na rede overlay e o Caddy é executado globalmente para terminar tráfego HTTP/HTTPS público. Arquivos Compose podem usar extensões Uncloud para ingress, posicionamento e configuração Caddy gerada, enquanto o CLI `uc` trata distribuição de imagens, agendamento, escalamento, logs e estado do cluster.

## Exemplos

```bash
uc machine init user@host --name machine-1
uc service run --name web -p app.example.com:8080/https nginx:latest
uc deploy
```

## Conceitos Principais

- **Sem plano de controle central** — todas as máquinas são pares iguais conectados por WireGuard
- **Caddy** é executado como um serviço global em cada máquina; obtém TLS automaticamente do Let's Encrypt
- **Rede overlay** — serviços se comunicam via `10.210.0.0/16` por padrão; DNS fornecido dentro da mesh
- **Caddyfile é gerado automaticamente** — nunca edite diretamente; use `x-caddy` / `--caddyfile`

---

## Referência Rápida do CLI

### Máquinas

| Comando | Propósito |
|---------|---------|
| `uc machine init user@host` | Inicializa primeira máquina / novo cluster |
| `uc machine add user@host` | Une máquina ao cluster existente |
| `uc machine ls` | Lista máquinas |
| `uc machine update NAME --public-ip IP` | Atualiza IP público para ingress |
| `uc machine rm NAME` | Remove máquina |

Flags principais do `init`: `--name`, `--network 10.210.0.0/16`, `--no-caddy`, `--no-dns`, `--public-ip auto\|IP\|none`

### Serviços

| Comando | Propósito |
|---------|---------|
| `uc service ls` / `uc ls` | Lista serviços |
| `uc service run IMAGE` | Executa um serviço de contêiner único |
| `uc deploy` | Implanta a partir de `compose.yaml` |
| `uc deploy --no-build` | Implanta imagens já enviadas sem reconstruir |
| `uc deploy --recreate` | Força recriação do serviço |
| `uc scale SERVICE N` | Define contagem de réplicas |
| `uc service logs SERVICE` | Visualiza logs |
| `uc service exec SERVICE` | Abre shell no contêiner |
| `uc service inspect SERVICE` | Informações detalhadas |
| `uc service rm SERVICE` | Remove serviço (mantém volumes nomeados) |
| `uc ps` | Todos os contêineres do cluster |

### Imagens

```bash
uc image push myapp:latest                    # Envia imagem local para todas as máquinas
uc image push myapp:latest -m machine1,machine2  # Envia para máquinas específicas
uc images                                     # Lista imagens no cluster
```

### Volumes

```bash
uc volume ls                  # Todos os volumes
uc volume ls -m machine1      # Em máquina específica
uc volume create NAME -m MACHINE
uc volume rm NAME
```

### Caddy

```bash
uc caddy config    # Mostra Caddyfile gerado atual (somente leitura)
uc caddy deploy    # Implanta/atualiza Caddy no cluster
```

### DNS & Contexto

```bash
uc dns show        # Mostra domínio *.uncld.dev reservado
uc dns reserve     # Reserva um novo domínio
uc ctx ls          # Lista contextos de cluster
uc ctx use prod    # Muda contexto
```

---

## Publicação de Portas

### HTTP/HTTPS (via proxy reverso Caddy)

```
-p [hostname:]container_port[/protocol]
```

| Exemplo | Significado |
|---------|---------|
| `-p 8080/https` | HTTPS com hostname `service-name.cluster-domain` automático |
| `-p app.example.com:8080/https` | HTTPS com hostname personalizado |
| `-p 8080/http` | HTTP apenas, sem TLS |

### TCP/UDP (vinculado ao host, contorna o Caddy)

```
-p [host_ip:]host_port:container_port[/protocol]@host
```

| Exemplo | Significado |
|---------|---------|
| `-p 5432:5432@host` | TCP 5432 em todas as interfaces |
| `-p 127.0.0.1:5432:5432@host` | TCP 5432 somente loopback |
| `-p 53:5353/udp@host` | UDP |

---

## Extensões de Arquivo Compose

O Uncloud adiciona estas extensões sobre o Docker Compose:

### `x-ports` — publicar portas com domínios

```yaml
services:
  app:
    image: app:latest
    x-ports:
      - example.com:8000/https
      - www.example.com:8000/https
      - api.example.com:9000/https
```

### `x-caddy` — configuração Caddy personalizada para serviço

```yaml
services:
  app:
    image: app:latest
    x-caddy: |
      example.com {
        redir https://www.example.com{uri} permanent
      }
      www.example.com {
        reverse_proxy {{upstreams 8000}} {
          import common_proxy
        }
        basic_auth /admin/* {
          admin $2a$14$...
        }
      }
```

Funções de template disponíveis dentro de `x-caddy`:
- `{{upstreams [service] [port]}}` — IPs de contêiner saudáveis
- `{{.Name}}` — nome do serviço
- `{{.Upstreams}}` — mapa de todos os serviços → IPs

### `x-machines` — restrições de posicionamento

```yaml
services:
  db:
    image: postgres:18
    x-machines: db-machine          # Nome de máquina única
  app:
    image: app:latest
    x-machines:
      - machine-1
      - machine-2
```

### Exemplo completo multi-serviço

```yaml
services:
  api:
    build: ./api
    x-ports:
      - api.example.com:3000/https
    environment:
      DATABASE_URL: postgres://db:5432/mydb

  web:
    build: ./web
    x-ports:
      - example.com:8000/https
      - www.example.com:8000/https
    environment:
      API_URL: http://api:3000

  db:
    image: postgres:18
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - db-data:/var/lib/postgresql/data
    x-machines: db-machine

volumes:
  db-data:
```

---

## Roteamento para Dispositivos Externos (Fora do Cluster)

Para expor um dispositivo externo (ex.: BMC, NAS, UI de roteador) via Caddy sem executar um contêiner real:

**1. Crie um snippet Caddyfile** (ex.: `~/device.caddyfile`):

```caddyfile
https://device.example.com {
    reverse_proxy https://192.168.1.x {
        transport http {
            tls_insecure_skip_verify   # necessário para certs BMC auto-assinados
        }
    }
    log
}
```

Para upstream em texto simples: `reverse_proxy http://192.168.1.x:port`

**2. Registre como serviço nomeado com contêiner no-op:**

```bash
uc service run \
  --name device-bmc \
  --caddyfile ~/device.caddyfile \
  registry.k8s.io/pause:3.9
```

`pause` é um contêiner mínimo no-op — não faz nada, mas dá ao Uncloud uma entrada de serviço para anexar o Caddyfile.

**3. Verifique:**

```bash
uc caddy config   # bloco device.example.com deve aparecer
```

> `--caddyfile` não pode ser combinado com portas publicadas que não sejam `@host`.

**Dica de DNS:** Um registro wildcard (`*.yourdomain.com → cluster-public-ip`) significa que qualquer novo subdomínio funciona imediatamente — sem necessidade de mudança de DNS por serviço.

---

## DNS de Serviço (Interno)

Os serviços dentro do cluster se resolvem mutuamente por nome:

| Nome DNS | Resolve para |
|----------|------------|
| `service-name` | Qualquer contêiner saudável |
| `service-name.internal` | Igual |
| `rr.service-name.internal` | Round-robin |
| `nearest.service-name.internal` | Preferência local da máquina |

---

## Escalamento & Serviços Globais

```bash
uc scale web 5    # 5 réplicas (distribuídas entre máquinas)
uc scale web 1    # Reduz escalamento
```

```yaml
services:
  caddy:
    deploy:
      mode: global   # Um contêiner em cada máquina
```

---

## Templates de Tag de Imagem (em compose.yaml)

```yaml
image: myapp:{{gitdate "20060102"}}.{{gitsha 7}}
image: myapp:{{gitsha 7}}.${GITHUB_RUN_ID:-local}
```

| Função | Saída |
|----------|--------|
| `{{gitsha N}}` | Primeiros N chars do SHA do Commit |
| `{{gitdate "format"}}` | Data do Commit git no formato Go |
| `{{date "format"}}` | Data atual |

---

## Fluxos de Trabalho Comuns

**Implantar a partir do código-fonte:**
```bash
uc deploy                          # Build + push + implantar
uc build --push && uc deploy --no-build   # Passos separados
```

**Inspecionar um serviço:**
```bash
uc inspect web
uc logs -f web
uc logs --since 1h web
uc exec web                        # Abre shell
uc exec web /bin/sh -c "env"       # Executa comando específico
```

**Implantações sem downtime** acontecem automaticamente; o Uncloud aguarda verificações de saúde antes de encerrar contêineres antigos.

**Forçar recriação:**
```bash
uc deploy --recreate
```

---

## Erros Comuns

| Erro | Correção |
|---------|-----|
| Editar o Caddyfile diretamente | Use `x-caddy` no compose ou `--caddyfile` no `uc service run` |
| Fazer proxy de upstream HTTPS com cert auto-assinado | Adicione `transport http { tls_insecure_skip_verify }` |
| `uc caddy config` não mostra blocos definidos pelo usuário | Socket admin do Caddy inacessível — verifique `uc inspect caddy` e `uc logs caddy` |
| Serviço não alcança IP LAN externo do contêiner | Verifique se o host do contêiner Caddy pode rotear para a rede alvo |
| Volumes perdidos após `uc service rm` | Volumes nomeados persistem; apenas volumes anônimos são removidos automaticamente |
