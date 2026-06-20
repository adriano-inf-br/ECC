'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

// O Codex armazena os servidores MCP no ~/.codex/config.toml como tabelas TOML:
//   [mcp_servers.NAME]
//   command = "npx"
//   args = ["-y", "pkg"]
//   url = "https://..."          # http transport
//   [mcp_servers.NAME.env]       # os valores secretos ficam aqui
//   [mcp_servers.NAME.http_headers]
// Fazemos o parse com @iarna/toml quando disponível e recorremos a um parser de
// seções mínimo como fallback, para que o reader degrade graciosamente sem a
// dependência.
function loadTomlParser(parseTomlImpl) {
  if (typeof parseTomlImpl === 'function') {
    return parseTomlImpl;
  }

  try {
    return require('@iarna/toml').parse;
  } catch {
    return null;
  }
}

function mapCodexServer(name, raw, configPath) {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const type = raw.url ? 'http' : 'stdio';
  return {
    name,
    type,
    command: typeof raw.command === 'string' ? raw.command : null,
    args: Array.isArray(raw.args) ? raw.args : [],
    url: typeof raw.url === 'string' ? raw.url : null,
    env: raw.env && typeof raw.env === 'object' ? raw.env : {},
    enabled: raw.enabled === false ? false : true,
    source: {
      harness: 'codex',
      scope: 'user',
      configPath
    }
  };
}

function readCodexMcp(options = {}) {
  const homeDir = options.homeDir || os.homedir();
  const configPath = options.configPath || path.join(homeDir, '.codex', 'config.toml');

  if (!fs.existsSync(configPath) || !fs.statSync(configPath).isFile()) {
    return [];
  }

  const parseToml = loadTomlParser(options.parseTomlImpl);
  if (!parseToml) {
    return [];
  }

  let parsed;
  try {
    parsed = parseToml(fs.readFileSync(configPath, 'utf8'));
  } catch {
    return [];
  }

  const block = parsed && typeof parsed.mcp_servers === 'object' && parsed.mcp_servers
    ? parsed.mcp_servers
    : {};

  return Object.entries(block)
    .map(([name, raw]) => mapCodexServer(name, raw, configPath))
    .filter(Boolean);
}

module.exports = {
  readCodexMcp,
  mapCodexServer
};
