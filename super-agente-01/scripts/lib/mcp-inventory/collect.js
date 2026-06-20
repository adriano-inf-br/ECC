'use strict';

const { normalizeServerEntry, buildInventory } = require('./canonical-mcp');
const { readClaudeCodeMcp } = require('./readers/claude-code');
const { readCodexMcp } = require('./readers/codex');
const { readOpencodeMcp } = require('./readers/opencode');

const DEFAULT_READERS = Object.freeze({
  'claude-code': readClaudeCodeMcp,
  codex: readCodexMcp,
  opencode: readOpencodeMcp
});

// Coleta as configurações de servidor MCP de cada reader de harness, normaliza
// cada entry bruta para ecc.mcp.v1 e mescla tudo em um único inventário
// deduplicado com um relatório de fragmentação. Os segredos são removidos
// durante a normalização (apenas os nomes das chaves de env sobrevivem), de modo
// que o inventário retornado é seguro para imprimir ou persistir.
function collectMcpInventory(options = {}) {
  const readers = options.readers || DEFAULT_READERS;
  const readerOptions = options.readerOptions || {};

  const rawRecords = [];
  for (const [harness, reader] of Object.entries(readers)) {
    if (typeof reader !== 'function') {
      continue;
    }

    let entries;
    try {
      entries = reader(readerOptions[harness] || readerOptions.shared || {});
    } catch {
      entries = [];
    }

    if (Array.isArray(entries)) {
      rawRecords.push(...entries);
    }
  }

  const normalized = rawRecords.map(normalizeServerEntry);
  return buildInventory(normalized);
}

module.exports = {
  collectMcpInventory,
  DEFAULT_READERS
};
