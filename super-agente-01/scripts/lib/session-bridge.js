'use strict';

/**
 * Utilitários compartilhados de ponte de sessão para hooks do ECC.
 *
 * O arquivo de ponte é um pequeno agregado JSON em /tmp que permite que
 * statusline, metrics-bridge e context-monitor compartilhem estado
 * sem escanear grandes logs JSONL a cada invocação.
 */

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const MAX_SESSION_ID_LENGTH = 64;

/**
 * Sanitiza um session ID para uso seguro em caminhos de arquivo.
 * Rejeita travessia de caminho, remove caracteres inseguros, limita o comprimento.
 * @param {string} raw
 * @returns {string|null} Session ID seguro ou null se inválido
 */
function sanitizeSessionId(raw) {
  if (!raw || typeof raw !== 'string') return null;
  if (/[/\\]|\.\./.test(raw)) return null;
  const safe = raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, MAX_SESSION_ID_LENGTH);
  return safe || null;
}

/**
 * Obtém o caminho do arquivo de ponte para uma sessão.
 * @param {string} sessionId - Session ID já sanitizado
 * @returns {string}
 */
function getBridgePath(sessionId) {
  return path.join(os.tmpdir(), `ecc-metrics-${sessionId}.json`);
}

/**
 * Lê os dados da ponte. Retorna null em qualquer erro.
 * @param {string} sessionId - Session ID já sanitizado
 * @returns {object|null}
 */
function readBridge(sessionId) {
  try {
    const raw = fs.readFileSync(getBridgePath(sessionId), 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Escreve os dados da ponte atomicamente (escreve tmp com sufixo único e depois renomeia).
 *
 * O caminho do tmp inclui `process.pid` mais um nonce aleatório para que
 * escritores concorrentes (ex.: o `ecc-metrics-bridge` de PostToolUse e o
 * `ecc-statusline` em segundo plano, ambos escrevendo na mesma ponte de
 * sessão) não sobrescrevam o arquivo tmp um do outro no meio da escrita. Com
 * um sufixo `.tmp` fixo, dois escritores poderiam ambos chamar `writeFileSync`
 * contra o mesmo caminho antes de qualquer um chegar a `renameSync`, fazendo
 * o payload de um escritor sobrescrever silenciosamente o do outro e o
 * segundo `renameSync` lançar ENOENT assim que o rename consome o arquivo.
 *
 * Mesmo padrão já usado por `writeCostWarningIfChanged` em
 * `scripts/hooks/ecc-metrics-bridge.js` (commit 9b1d8918) para o
 * cache de aviso de custo; este commit o aplica também à primitiva
 * session-bridge.
 *
 * @param {string} sessionId - Session ID já sanitizado
 * @param {object} data
 */
function writeBridgeAtomic(sessionId, data) {
  const target = getBridgePath(sessionId);
  const tmp = `${target}.${process.pid}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data), 'utf8');
  try {
    renameWithRetry(tmp, target);
  } catch (err) {
    try { fs.unlinkSync(tmp); } catch { /* ignorar */ }
    throw err;
  }
}

/**
 * Substitui um arquivo via rename, tentando novamente brevemente em erros
 * transitórios de nível de SO.
 *
 * O `rename(2)` POSIX é atômico entre origem e destino, então escritores
 * concorrentes renomeiam cada um sobre o mesmo destino sem conflito. O
 * `MoveFileExW` do Windows é diferente: falha com EPERM/EACCES/EBUSY se o
 * destino estiver sendo renomeado no momento por *outro* processo — uma curta
 * janela de corrida que dispara de forma confiável sob nossa concorrência de
 * PostToolUse + statusline.
 *
 * Para manter a portabilidade, tenta novamente até 5 vezes com backoff
 * exponencial (20 ms, 40, 80, 160, 320) nos códigos transitórios exclusivos do
 * Windows. Execuções POSIX acertam na primeira tentativa e saem imediatamente.
 * Outros códigos de erro (ENOENT, ENOSPC, EROFS, …) são relançados sem nova
 * tentativa — eles não são transitórios.
 *
 * O sleep usa `Atomics.wait` em um SharedArrayBuffer descartável para que o
 * caminho de nova tentativa não fique ocupando a CPU em espera ativa. Isso
 * funciona na thread principal no Node ≥ 17 (e em workers em versões anteriores).
 *
 * @param {string} tmp
 * @param {string} target
 */
function renameWithRetry(tmp, target) {
  const RETRY_CODES = new Set(['EPERM', 'EACCES', 'EBUSY']);
  const MAX_ATTEMPTS = 5;
  for (let attempt = 0; ; attempt++) {
    try {
      fs.renameSync(tmp, target);
      return;
    } catch (err) {
      if (attempt + 1 >= MAX_ATTEMPTS || !RETRY_CODES.has(err.code)) {
        throw err;
      }
      const delayMs = 20 << attempt;
      try {
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, delayMs);
      } catch {
        // Atomics.wait lança na thread principal em alguns runtimes mais antigos;
        // recorre a uma breve espera ativa para que o caminho de nova tentativa ainda tenha um atraso.
        const until = Date.now() + delayMs;
        while (Date.now() < until) { /* espera ativa */ }
      }
    }
  }
}

/**
 * Resolve o session ID a partir de variáveis de ambiente.
 * @returns {string|null} Session ID sanitizado ou null
 */
function resolveSessionId() {
  const raw = process.env.ECC_SESSION_ID || process.env.CLAUDE_SESSION_ID || '';
  return sanitizeSessionId(raw);
}

module.exports = {
  sanitizeSessionId,
  getBridgePath,
  readBridge,
  writeBridgeAtomic,
  renameWithRetry,
  resolveSessionId,
  MAX_SESSION_ID_LENGTH
};
