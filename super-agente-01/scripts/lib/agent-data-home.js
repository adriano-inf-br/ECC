/**
 * Resolve o agent data home do ECC (raiz de persistência de memória) entre harnesses.
 *
 * Política de docstring: os pontos de entrada públicos aqui são documentados; pequenos
 * helpers internos (ex.: `expandHomePath`, `readProjectConfigAt`) ficam sem documentação
 * de propósito, de forma consistente com outros módulos de script do ECC. Revisores
 * automatizados de PR (ex.: CodeRabbit) ainda podem sinalizar baixa cobertura de JSDoc
 * contra um limite alto no diff—essa verificação é informativa para este repositório,
 * não uma exigência que todo helper nos arquivos tocados deva atender. Prefira clareza
 * no código e nos testes em vez de JSDoc genérico em helpers privados, a menos que os
 * mantenedores adotem uma regra de cobertura para todo o projeto.
 *
 * @see https://github.com/affaan-m/ECC/issues/2065
 */

const fs = require('fs');
const path = require('path');

const AGENT_DATA_HOME_ENV = 'ECC_AGENT_DATA_HOME';
const DEFAULT_CLAUDE_DIR_NAME = '.claude';
const DEFAULT_CURSOR_ECC_DIR_SEGMENTS = ['.cursor', 'ecc'];
const PROJECT_CONFIG_RELATIVE = path.join('.cursor', 'ecc-agent-data.json');

/**
 * Diretório home para expansão de til e caminhos padrão de agent-data.
 *
 * Espelha intencionalmente `getHomeDir()` em `scripts/lib/utils.js` (HOME/USERPROFILE,
 * depois `os.homedir()`). Não importe `utils.getHomeDir` aqui: `utils.js` já
 * requer este módulo (`resolveAgentDataHome`), o que criaria uma dependência
 * circular e arriscaria padrões divergentes para `~/.cursor/ecc` vs `~/.claude`.
 *
 * Se a consolidação for necessária mais tarde, prefira uma destas opções:
 *
 * | Abordagem | Tradeoff |
 * | --- | --- |
 * | `scripts/lib/home-dir.js` compartilhado importado por ambos | Limpo; quebra o ciclo |
 * | Manter duplicata + comentário de referência cruzada (este arquivo) | Risco zero de require |
 * | Mover toda a resolução para cá; wrapper fino a partir de `utils` | Refatoração maior |
 */
function getHomeDirFromEnv() {
  const explicitHome = process.env.HOME || process.env.USERPROFILE;
  if (explicitHome && String(explicitHome).trim().length > 0) {
    return path.resolve(explicitHome);
  }
  return require('os').homedir();
}

function expandHomePath(value, baseDir) {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('~')) {
    const remainder = trimmed.slice(1).replace(/^[/\\]+/, '');
    return remainder ? path.join(getHomeDirFromEnv(), remainder) : getHomeDirFromEnv();
  }
  if (path.isAbsolute(trimmed)) {
    return path.resolve(trimmed);
  }
  const base = baseDir && String(baseDir).trim()
    ? path.resolve(baseDir)
    : process.cwd();
  return path.resolve(base, trimmed);
}

/**
 * Raiz do projeto para um arquivo de configuração em .cursor/ecc-agent-data.json.
 */
function resolveProjectRootFromConfigPath(configPath) {
  const configDir = path.dirname(path.resolve(configPath));
  if (path.basename(configDir) === '.cursor') {
    return path.dirname(configDir);
  }
  return configDir;
}

/**
 * Verdadeiro quando o processo atual é um subprocesso de hook do Cursor.
 * O Cursor documenta CURSOR_VERSION e CURSOR_PROJECT_DIR para scripts de hook.
 */
function isCursorHookRuntime() {
  if (process.env.CURSOR_VERSION && String(process.env.CURSOR_VERSION).trim()) {
    return true;
  }
  if (process.env.CURSOR_PROJECT_DIR && String(process.env.CURSOR_PROJECT_DIR).trim()) {
    return true;
  }
  return false;
}

function getDefaultCursorAgentDataHome() {
  return path.join(getHomeDirFromEnv(), ...DEFAULT_CURSOR_ECC_DIR_SEGMENTS);
}

function getDefaultClaudeAgentDataHome() {
  return path.join(getHomeDirFromEnv(), DEFAULT_CLAUDE_DIR_NAME);
}

function readProjectConfigAt(configPath) {
  if (!configPath || typeof configPath !== 'string') return null;
  if (!fs.existsSync(configPath)) return null;

  try {
    const parsed = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    const candidate = parsed.agentDataHome || parsed.ECC_AGENT_DATA_HOME;
    if (typeof candidate !== 'string' || !candidate.trim()) return null;
    const projectRoot = resolveProjectRootFromConfigPath(configPath);
    return expandHomePath(candidate, projectRoot);
  } catch (error) {
    console.error(
      `[ECC] Failed to read or parse agent data config at ${configPath}: ${error.message}`
    );
    return null;
  }
}

function readProjectConfig(projectDir) {
  if (!projectDir || typeof projectDir !== 'string') return null;
  return readProjectConfigAt(path.join(path.resolve(projectDir), PROJECT_CONFIG_RELATIVE));
}

function resolveProjectDir() {
  const candidates = [
    process.env.CURSOR_PROJECT_DIR,
    process.env.CLAUDE_PROJECT_DIR,
    process.cwd(),
  ];

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'string') continue;
    const resolved = path.resolve(candidate);
    if (fs.existsSync(path.join(resolved, '.cursor'))) {
      return resolved;
    }
  }

  return process.cwd();
}

/**
 * Resolve o agent data home sem mutar process.env.
 */
function resolveAgentDataHome(options = {}) {
  const fromEnv = expandHomePath(process.env[AGENT_DATA_HOME_ENV]);
  if (fromEnv) return fromEnv;

  const projectDir = options.projectDir || resolveProjectDir();
  const fromProject = readProjectConfig(projectDir);
  if (fromProject) return fromProject;

  if (options.preferCursorDefault === true || isCursorHookRuntime()) {
    return getDefaultCursorAgentDataHome();
  }

  return getDefaultClaudeAgentDataHome();
}

/**
 * Define ECC_AGENT_DATA_HOME no processo atual quando não estiver definido (rede de segurança para subprocessos de hook).
 * @returns {string} agent data home resolvido
 */
function ensureAgentDataHomeEnv(options = {}) {
  const resolved = resolveAgentDataHome(options);
  if (!expandHomePath(process.env[AGENT_DATA_HOME_ENV])) {
    process.env[AGENT_DATA_HOME_ENV] = resolved;
  }
  return resolved;
}

/**
 * Constrói o payload de env de saída do hook sessionStart do Cursor.
 */
function getCursorSessionEnvPayload(options = {}) {
  const agentDataHome = resolveAgentDataHome({
    ...options,
    preferCursorDefault: true,
  });

  return {
    ECC_AGENT_DATA_HOME: agentDataHome,
  };
}

module.exports = {
  AGENT_DATA_HOME_ENV,
  DEFAULT_CLAUDE_DIR_NAME,
  DEFAULT_CURSOR_ECC_DIR_SEGMENTS,
  PROJECT_CONFIG_RELATIVE,
  expandHomePath,
  resolveProjectRootFromConfigPath,
  isCursorHookRuntime,
  getDefaultCursorAgentDataHome,
  getDefaultClaudeAgentDataHome,
  readProjectConfig,
  readProjectConfigAt,
  resolveProjectDir,
  resolveAgentDataHome,
  ensureAgentDataHomeEnv,
  getCursorSessionEnvPayload,
};
