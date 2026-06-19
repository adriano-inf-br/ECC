# Guia de Solução de Problemas

Problemas comuns e soluções para o plugin Everything Claude Code (ECC).

## Sumário

- [Problemas de Memória e Contexto](#memory--context-issues)
- [Falhas no Harness de Agent](#agent-harness-failures)
- [Erros de Hook e Fluxo de Trabalho](#hook--workflow-errors)
- [Instalação e Configuração](#installation--setup)
- [Problemas de Desempenho](#performance-issues)
- [Mensagens de Erro Comuns](#common-error-messages)
- [Obtendo Ajuda](#getting-help)

---

## Problemas de Memória e Contexto

### Estouro da Janela de Contexto

**Sintoma:** Erros de "Context too long" ou respostas incompletas

**Causas:**
- Uploads de arquivos grandes que excedem os limites de Token
- Histórico de conversa acumulado
- Múltiplas saídas grandes de ferramentas em uma única sessão

**Soluções:**
```bash
# 1. Clear conversation history and start fresh
# Use Claude Code: "New Chat" or Cmd/Ctrl+Shift+N

# 2. Reduce file size before analysis
head -n 100 large-file.log > sample.log

# 3. Use streaming for large outputs
head -n 50 large-file.txt

# 4. Split tasks into smaller chunks
# Instead of: "Analyze all 50 files"
# Use: "Analyze files in src/components/ directory"
```

### Falhas na Persistência de Memória

**Sintoma:** O Agent não lembra do contexto ou das observações anteriores

**Causas:**
- Hooks de aprendizado contínuo desativados
- Arquivos de observação corrompidos
- Falhas na detecção do projeto

**Soluções:**
```bash
# Check if observations are being recorded
ls ~/.claude/homunculus/projects/*/observations.jsonl

# Find the current project's hash id
python3 - <<'PY'
import json, os
registry_path = os.path.expanduser("~/.claude/homunculus/projects.json")
with open(registry_path) as f:
    registry = json.load(f)
for project_id, meta in registry.items():
    if meta.get("root") == os.getcwd():
        print(project_id)
        break
else:
    raise SystemExit("Project hash not found in ~/.claude/homunculus/projects.json")
PY

# View recent observations for that project
tail -20 ~/.claude/homunculus/projects/<project-hash>/observations.jsonl

# Back up a corrupted observations file before recreating it
mv ~/.claude/homunculus/projects/<project-hash>/observations.jsonl \
  ~/.claude/homunculus/projects/<project-hash>/observations.jsonl.bak.$(date +%Y%m%d-%H%M%S)

# Verify hooks are enabled
grep -r "observe" ~/.claude/settings.json
```

---

## Falhas no Harness de Agent

### Agent Não Encontrado

**Sintoma:** Erros de "Agent not loaded" ou "Unknown agent"

**Causas:**
- Plugin não instalado corretamente
- Configuração incorreta do caminho do Agent
- Incompatibilidade entre instalação via marketplace e manual

**Soluções:**
```bash
# Check plugin installation
ls ~/.claude/plugins/cache/

# Verify agent exists (marketplace install)
ls ~/.claude/plugins/cache/*/agents/

# For manual install, agents should be in:
ls ~/.claude/agents/  # Custom agents only

# Reload plugin
# Claude Code → Settings → Extensions → Reload
```

### A Execução do Fluxo de Trabalho Trava

**Sintoma:** O Agent inicia, mas nunca conclui

**Causas:**
- Loops infinitos na lógica do Agent
- Bloqueado aguardando entrada do usuário
- Timeout de rede aguardando a API

**Soluções:**
```bash
# 1. Check for stuck processes
ps aux | grep claude

# 2. Enable debug mode
export CLAUDE_DEBUG=1

# 3. Set shorter timeouts
export CLAUDE_TIMEOUT=30

# 4. Check network connectivity
curl -I https://api.anthropic.com
```

### Erros de Uso de Ferramentas

**Sintoma:** "Tool execution failed" ou permissão negada

**Causas:**
- Dependências ausentes (npm, python, etc.)
- Permissões de arquivo insuficientes
- Caminho não encontrado

**Soluções:**
```bash
# Verify required tools are installed
which node python3 npm git

# Fix permissions on hook scripts
chmod +x ~/.claude/plugins/cache/*/hooks/*.sh
chmod +x ~/.claude/plugins/cache/*/skills/*/hooks/*.sh

# Check PATH includes necessary binaries
echo $PATH
```

---

## Erros de Hook e Fluxo de Trabalho

### Hooks Não Disparam

**Sintoma:** Os hooks de pré/pós-execução não são executados

**Causas:**
- Hooks não registrados em settings.json
- Sintaxe de Hook inválida
- Script de Hook não executável

**Soluções:**
```bash
# Check hooks are registered
grep -A 10 '"hooks"' ~/.claude/settings.json

# Verify hook files exist and are executable
ls -la ~/.claude/plugins/cache/*/hooks/

# Test hook manually
bash ~/.claude/plugins/cache/*/hooks/pre-bash.sh <<< '{"command":"echo test"}'

# Re-register hooks (if using plugin)
# Disable and re-enable plugin in Claude Code settings
```

### Incompatibilidades de Versão do Python/Node

**Sintoma:** "python3 not found" ou "node: command not found"

**Causas:**
- Instalação do Python/Node ausente
- PATH não configurado
- Versão incorreta do Python (Windows)

**Soluções:**
```bash
# Install Python 3 (if missing)
# macOS: brew install python3
# Ubuntu: sudo apt install python3
# Windows: Download from python.org

# Install Node.js (if missing)
# macOS: brew install node
# Ubuntu: sudo apt install nodejs npm
# Windows: Download from nodejs.org

# Verify installations
python3 --version
node --version
npm --version

# Windows: Ensure python (not python3) works
python --version
```

### Falsos Positivos do Bloqueador de Servidor de Desenvolvimento

**Sintoma:** O Hook bloqueia comandos legítimos que mencionam "dev"

**Causas:**
- Conteúdo de heredoc disparando a correspondência de padrão
- Comandos não relacionados a desenvolvimento com "dev" nos argumentos

**Soluções:**
```bash
# This is fixed in v1.8.0+ (PR #371)
# Upgrade plugin to latest version

# Workaround: Wrap dev servers in tmux
tmux new-session -d -s dev "npm run dev"
tmux attach -t dev

# Disable hook temporarily if needed
# Edit ~/.claude/settings.json and remove pre-bash hook
```

---

## Instalação e Configuração

### O Plugin Não Carrega

**Sintoma:** Recursos do Plugin indisponíveis após a instalação

**Causas:**
- Cache do marketplace não atualizado
- Incompatibilidade de versão do Claude Code
- Arquivos de Plugin corrompidos
- A configuração local do Claude foi apagada ou redefinida

**Soluções:**
```bash
# First inspect what ECC still knows about this machine
ecc list-installed
ecc doctor
ecc repair

# Only reinstall if doctor/repair cannot restore the missing files

# Inspect the plugin cache before changing it
ls -la ~/.claude/plugins/cache/

# Back up the plugin cache instead of deleting it in place
mv ~/.claude/plugins/cache ~/.claude/plugins/cache.backup.$(date +%Y%m%d-%H%M%S)
mkdir -p ~/.claude/plugins/cache

# Reinstall from marketplace
# Claude Code → Extensions → Everything Claude Code → Uninstall
# Then reinstall from marketplace

# If the issue is marketplace/account access, use ECC Tools billing/account recovery separately; do not use reinstall as a proxy for account recovery

# Check Claude Code version
claude --version
# Requires Claude Code 2.0+

# Manual install (if marketplace fails)
git clone https://github.com/affaan-m/everything-claude-code.git
cp -r everything-claude-code ~/.claude/plugins/ecc
```

### A Detecção do Gerenciador de Pacotes Falha

**Sintoma:** Gerenciador de pacotes incorreto usado (npm em vez de pnpm)

**Causas:**
- Nenhum arquivo de lock presente
- CLAUDE_PACKAGE_MANAGER não definido
- Múltiplos arquivos de lock confundindo a detecção

**Soluções:**
```bash
# Set preferred package manager globally
export CLAUDE_PACKAGE_MANAGER=pnpm
# Add to ~/.bashrc or ~/.zshrc

# Or set per-project
echo '{"packageManager": "pnpm"}' > .claude/package-manager.json

# Or use package.json field
npm pkg set packageManager="pnpm@8.15.0"

# Warning: removing lock files can change installed dependency versions.
# Commit or back up the lock file first, then run a fresh install and re-run CI.
# Only do this when intentionally switching package managers.
rm package-lock.json  # If using pnpm/yarn/bun
```

---

## Problemas de Desempenho

### Tempos de Resposta Lentos

**Sintoma:** O Agent leva mais de 30 segundos para responder

**Causas:**
- Arquivos de observação grandes
- Hooks ativos em excesso
- Latência de rede até a API

**Soluções:**
```bash
# Archive large observations instead of deleting them
archive_dir="$HOME/.claude/homunculus/archive/$(date +%Y%m%d)"
mkdir -p "$archive_dir"
find ~/.claude/homunculus/projects -name "observations.jsonl" -size +10M -exec sh -c '
  for file do
    base=$(basename "$(dirname "$file")")
    gzip -c "$file" > "'"$archive_dir"'/${base}-observations.jsonl.gz"
    : > "$file"
  done
' sh {} +

# Disable unused hooks temporarily
# Edit ~/.claude/settings.json

# Keep active observation files small
# Large archives should live under ~/.claude/homunculus/archive/
```

### Uso Elevado de CPU

**Sintoma:** O Claude Code consumindo 100% da CPU

**Causas:**
- Loops infinitos de observação
- Monitoramento de arquivos em diretórios grandes
- Vazamentos de memória nos hooks

**Soluções:**
```bash
# Check for runaway processes
top -o cpu | grep claude

# Disable continuous learning temporarily
touch ~/.claude/homunculus/disabled

# Restart Claude Code
# Cmd/Ctrl+Q then reopen

# Check observation file size
du -sh ~/.claude/homunculus/*/
```

---

## Mensagens de Erro Comuns

### "EACCES: permission denied"

```bash
# Fix hook permissions
find ~/.claude/plugins -name "*.sh" -exec chmod +x {} \;

# Fix observation directory permissions
chmod -R u+rwX,go+rX ~/.claude/homunculus
```

### "MODULE_NOT_FOUND"

```bash
# Install plugin dependencies
cd ~/.claude/plugins/cache/ecc
npm install

# Or for manual install
cd ~/.claude/plugins/ecc
npm install
```

### "spawn UNKNOWN"

```bash
# Windows-specific: Ensure scripts use correct line endings
# Convert CRLF to LF
find ~/.claude/plugins -name "*.sh" -exec dos2unix {} \;

# Or install dos2unix
# macOS: brew install dos2unix
# Ubuntu: sudo apt install dos2unix
```

---

## Obtendo Ajuda

 Se você ainda estiver enfrentando problemas:

1. **Consulte as Issues no GitHub**: [github.com/affaan-m/everything-claude-code/issues](https://github.com/affaan-m/everything-claude-code/issues)
2. **Ative o Log de Depuração**:
   ```bash
   export CLAUDE_DEBUG=1
   export CLAUDE_LOG_LEVEL=debug
   ```
3. **Colete Informações de Diagnóstico**:
   ```bash
   claude --version
   node --version
   python3 --version
   echo $CLAUDE_PACKAGE_MANAGER
   ls -la ~/.claude/plugins/cache/
   ```
4. **Abra uma Issue**: Inclua logs de depuração, mensagens de erro e informações de diagnóstico

---

## Documentação Relacionada

- [README.md](./README.md) - Instalação e recursos
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Diretrizes de desenvolvimento
- [docs/](./docs/) - Documentação detalhada
- [examples/](./examples/) - Exemplos de uso
