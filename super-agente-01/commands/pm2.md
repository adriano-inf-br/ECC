---
description: Analisa um projeto e gera comandos de serviço PM2 para serviços de frontend, backend ou banco de dados detectados.
---

# PM2 Init

Analisa automaticamente o projeto e gera comandos de serviço PM2.

**Comando**: `$ARGUMENTS`

---

## Fluxo de trabalho

1. Verificar o PM2 (instalar via `npm install -g pm2` se ausente)
2. Escanear o projeto para identificar serviços (frontend/backend/banco de dados)
3. Gerar arquivos de configuração e arquivos de comando individuais

---

## Detecção de Serviços

| Tipo | Detecção | Porta Padrão |
|------|-----------|--------------|
| Vite | vite.config.* | 5173 |
| Next.js | next.config.* | 3000 |
| Nuxt | nuxt.config.* | 3000 |
| CRA | react-scripts in package.json | 3000 |
| Express/Node | server/backend/api directory + package.json | 3000 |
| FastAPI/Flask | requirements.txt / pyproject.toml | 8000 |
| Go | go.mod / main.go | 8080 |

**Prioridade de Detecção de Porta**: Especificada pelo usuário > .env > arquivo de config > argumentos de scripts > porta padrão

---

## Arquivos Gerados

```
project/
├── ecosystem.config.cjs              # PM2 config
├── {backend}/start.cjs               # Python wrapper (if applicable)
└── .claude/
    ├── commands/
    │   ├── pm2-all.md                # Start all + monit
    │   ├── pm2-all-stop.md           # Stop all
    │   ├── pm2-all-restart.md        # Restart all
    │   ├── pm2-{port}.md             # Start single + logs
    │   ├── pm2-{port}-stop.md        # Stop single
    │   ├── pm2-{port}-restart.md     # Restart single
    │   ├── pm2-logs.md               # View all logs
    │   └── pm2-status.md             # View status
    └── scripts/
        ├── pm2-logs-{port}.ps1       # Single service logs
        └── pm2-monit.ps1             # PM2 monitor
```

---

## Configuração no Windows (IMPORTANTE)

### ecosystem.config.cjs

**Deve usar a extensão `.cjs`**

```javascript
module.exports = {
  apps: [
    // Node.js (Vite/Next/Nuxt)
    {
      name: 'project-3000',
      cwd: './packages/web',
      script: 'node_modules/vite/bin/vite.js',
      args: '--port 3000',
      interpreter: 'C:/Program Files/nodejs/node.exe',
      env: { NODE_ENV: 'development' }
    },
    // Python
    {
      name: 'project-8000',
      cwd: './backend',
      script: 'start.cjs',
      interpreter: 'C:/Program Files/nodejs/node.exe',
      env: { PYTHONUNBUFFERED: '1' }
    }
  ]
}
```

**Caminhos de script por framework:**

| Framework | script | args |
|-----------|--------|------|
| Vite | `node_modules/vite/bin/vite.js` | `--port {port}` |
| Next.js | `node_modules/next/dist/bin/next` | `dev -p {port}` |
| Nuxt | `node_modules/nuxt/bin/nuxt.mjs` | `dev --port {port}` |
| Express | `src/index.js` or `server.js` | - |

### Script Wrapper de Python (start.cjs)

```javascript
const { spawn } = require('child_process');
const proc = spawn('python', ['-m', 'uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', '8000', '--reload'], {
  cwd: __dirname, stdio: 'inherit', windowsHide: true
});
proc.on('close', (code) => process.exit(code));
```

---

## Templates de Arquivo de Comando (Conteúdo Mínimo)

### pm2-all.md (Start all + monit)
````markdown
Start all services and open PM2 monitor.
```bash
cd "{PROJECT_ROOT}" && pm2 start ecosystem.config.cjs && start wt.exe -d "{PROJECT_ROOT}" pwsh -NoExit -c "pm2 monit"
```
````

### pm2-all-stop.md
````markdown
Stop all services.
```bash
cd "{PROJECT_ROOT}" && pm2 stop all
```
````

### pm2-all-restart.md
````markdown
Restart all services.
```bash
cd "{PROJECT_ROOT}" && pm2 restart all
```
````

### pm2-{port}.md (Start single + logs)
````markdown
Start {name} ({port}) and open logs.
```bash
cd "{PROJECT_ROOT}" && pm2 start ecosystem.config.cjs --only {name} && start wt.exe -d "{PROJECT_ROOT}" pwsh -NoExit -c "pm2 logs {name}"
```
````

### pm2-{port}-stop.md
````markdown
Stop {name} ({port}).
```bash
cd "{PROJECT_ROOT}" && pm2 stop {name}
```
````

### pm2-{port}-restart.md
````markdown
Restart {name} ({port}).
```bash
cd "{PROJECT_ROOT}" && pm2 restart {name}
```
````

### pm2-logs.md
````markdown
View all PM2 logs.
```bash
cd "{PROJECT_ROOT}" && pm2 logs
```
````

### pm2-status.md
````markdown
View PM2 status.
```bash
cd "{PROJECT_ROOT}" && pm2 status
```
````

### Scripts PowerShell (pm2-logs-{port}.ps1)
```powershell
Set-Location "{PROJECT_ROOT}"
pm2 logs {name}
```

### Scripts PowerShell (pm2-monit.ps1)
```powershell
Set-Location "{PROJECT_ROOT}"
pm2 monit
```

---

## Regras Principais

1. **Arquivo de config**: `ecosystem.config.cjs` (não .js)
2. **Node.js**: Especificar o caminho do bin diretamente + interpreter
3. **Python**: Script wrapper Node.js + `windowsHide: true`
4. **Abrir nova janela**: `start wt.exe -d "{path}" pwsh -NoExit -c "command"`
5. **Conteúdo mínimo**: Cada arquivo de comando tem apenas 1-2 linhas de descrição + bloco bash
6. **Execução direta**: Sem necessidade de parsing por IA, basta rodar o comando bash

---

## Executar

Com base em `$ARGUMENTS`, execute o init:

1. Escanear o projeto em busca de serviços
2. Gerar `ecosystem.config.cjs`
3. Gerar `{backend}/start.cjs` para serviços Python (se aplicável)
4. Gerar arquivos de comando em `.claude/commands/`
5. Gerar arquivos de script em `.claude/scripts/`
6. **Atualizar o CLAUDE.md do projeto** com informações do PM2 (veja abaixo)
7. **Exibir o resumo de conclusão** com os comandos de terminal

---

## Pós-Init: Atualizar CLAUDE.md

Após gerar os arquivos, acrescente a seção PM2 ao `CLAUDE.md` do projeto (crie se não existir):

````markdown
## PM2 Services

| Port | Name | Type |
|------|------|------|
| {port} | {name} | {type} |

**Terminal Commands:**
```bash
pm2 start ecosystem.config.cjs   # First time
pm2 start all                    # After first time
pm2 stop all / pm2 restart all
pm2 start {name} / pm2 stop {name}
pm2 logs / pm2 status / pm2 monit
pm2 save                         # Save process list
pm2 resurrect                    # Restore saved list
```
````

**Regras para a atualização do CLAUDE.md:**
- Se a seção PM2 existir, substitua-a
- Se não existir, acrescente ao final
- Mantenha o conteúdo mínimo e essencial

---

## Pós-Init: Exibir Resumo

Após todos os arquivos serem gerados, produza:

```
## PM2 Init Complete

**Services:**

| Port | Name | Type |
|------|------|------|
| {port} | {name} | {type} |

**Claude Commands:** /pm2-all, /pm2-all-stop, /pm2-{port}, /pm2-{port}-stop, /pm2-logs, /pm2-status

**Terminal Commands:**
## First time (with config file)
pm2 start ecosystem.config.cjs && pm2 save

## After first time (simplified)
pm2 start all          # Start all
pm2 stop all           # Stop all
pm2 restart all        # Restart all
pm2 start {name}       # Start single
pm2 stop {name}        # Stop single
pm2 logs               # View logs
pm2 monit              # Monitor panel
pm2 resurrect          # Restore saved processes

**Tip:** Run `pm2 save` after first start to enable simplified commands.
```
