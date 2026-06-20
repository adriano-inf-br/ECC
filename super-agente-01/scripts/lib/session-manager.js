/**
 * Biblioteca de Gerenciador de Sessão para o Claude Code
 * Fornece operações CRUD centrais de sessão para listar, carregar e gerenciar sessões
 *
 * As sessões são armazenadas como arquivos markdown em ~/.claude/session-data/ com
 * compatibilidade de leitura legada para ~/.claude/sessions/:
 * - YYYY-MM-DD-session.tmp (formato antigo)
 * - YYYY-MM-DD-<short-id>-session.tmp (formato novo)
 */

const fs = require('fs');
const path = require('path');

const {
  getSessionsDir,
  getSessionSearchDirs,
  readFile,
  log
} = require('./utils');

// Padrão de nome de arquivo de sessão: YYYY-MM-DD-[session-id]-session.tmp
// O session-id é opcional (formato antigo) e pode incluir letras, dígitos,
// underscores e hífens, mas não pode começar com um hífen.
// Corresponde a: "2026-02-01-session.tmp", "2026-02-01-a1b2c3d4-session.tmp",
// "2026-02-01-frontend-worktree-1-session.tmp", e
// "2026-02-01-ChezMoi_2-session.tmp"
const SESSION_FILENAME_REGEX = /^(\d{4}-\d{2}-\d{2})(?:-([a-zA-Z0-9_][a-zA-Z0-9_-]*))?-session\.tmp$/;

/**
 * Faz o parse do nome de arquivo de sessão para extrair metadados
 * @param {string} filename - Nome de arquivo de sessão (ex.: "2026-01-17-abc123-session.tmp" ou "2026-01-17-session.tmp")
 * @returns {object|null} Metadados extraídos ou null se inválido
 */
function parseSessionFilename(filename) {
  if (!filename || typeof filename !== 'string') return null;
  const match = filename.match(SESSION_FILENAME_REGEX);
  if (!match) return null;

  const dateStr = match[1];

  // Valida que os componentes da data são corretos no calendário (não apenas o formato)
  const [year, month, day] = dateStr.split('-').map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  // Rejeita datas impossíveis como 31 de fev, 31 de abr — o construtor Date
  // transborda dias inválidos (ex.: 31 de fev → 3 de mar), então verifica se o mês se mantém
  const d = new Date(year, month - 1, day);
  if (d.getMonth() !== month - 1 || d.getDate() !== day) return null;

  // match[2] é undefined no formato antigo (sem ID)
  const shortId = match[2] || 'no-id';

  return {
    filename,
    shortId,
    date: dateStr,
    // Usa o construtor de horário local (consistente com a validação na linha 40)
    // new Date(dateStr) interpreta YYYY-MM-DD como meia-noite UTC, o que aparece
    // como o dia anterior em fusos horários com deslocamento UTC negativo
    datetime: new Date(year, month - 1, day)
  };
}

/**
 * Obtém o caminho completo para um arquivo de sessão
 * @param {string} filename - Nome de arquivo de sessão
 * @returns {string} Caminho completo para o arquivo de sessão
 */
function getSessionPath(filename) {
  return path.join(getSessionsDir(), filename);
}

function getSessionCandidates(options = {}) {
  const {
    date = null,
    search = null
  } = options;

  const candidates = [];

  for (const sessionsDir of getSessionSearchDirs()) {
    if (!fs.existsSync(sessionsDir)) {
      continue;
    }

    let entries;
    try {
      entries = fs.readdirSync(sessionsDir, { withFileTypes: true });
    } catch (error) {
      log(`[SessionManager] Error reading sessions directory ${sessionsDir}: ${error.message}`);
      continue;
    }

    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.tmp')) continue;

      const filename = entry.name;
      const metadata = parseSessionFilename(filename);

      if (!metadata) continue;
      if (date && metadata.date !== date) continue;
      if (search && !metadata.shortId.includes(search)) continue;

      const sessionPath = path.join(sessionsDir, filename);

      let stats;
      try {
        stats = fs.statSync(sessionPath);
      } catch (error) {
        log(`[SessionManager] Error stating session ${sessionPath}: ${error.message}`);
        continue;
      }

      candidates.push({
        ...metadata,
        sessionPath,
        hasContent: stats.size > 0,
        size: stats.size,
        modifiedTime: stats.mtime,
        createdTime: stats.birthtime || stats.ctime
      });
    }
  }

  const deduped = [];
  const seenFilenames = new Set();

  for (const session of candidates) {
    if (seenFilenames.has(session.filename)) {
      continue;
    }
    seenFilenames.add(session.filename);
    deduped.push(session);
  }

  deduped.sort((a, b) => b.modifiedTime - a.modifiedTime);
  return deduped;
}

function buildSessionRecord(sessionPath, metadata) {
  let stats;
  try {
    stats = fs.statSync(sessionPath);
  } catch (error) {
    log(`[SessionManager] Error stating session ${sessionPath}: ${error.message}`);
    return null;
  }

  return {
    ...metadata,
    sessionPath,
    hasContent: stats.size > 0,
    size: stats.size,
    modifiedTime: stats.mtime,
    createdTime: stats.birthtime || stats.ctime
  };
}

function sessionMatchesId(metadata, normalizedSessionId) {
  const filename = metadata.filename;
  const shortIdMatch = metadata.shortId !== 'no-id' && metadata.shortId.startsWith(normalizedSessionId);
  const filenameMatch = filename === normalizedSessionId || filename === `${normalizedSessionId}.tmp`;
  const noIdMatch = metadata.shortId === 'no-id' && filename === `${normalizedSessionId}-session.tmp`;

  return shortIdMatch || filenameMatch || noIdMatch;
}

function getMatchingSessionCandidates(normalizedSessionId) {
  const matches = [];
  const seenFilenames = new Set();

  for (const sessionsDir of getSessionSearchDirs()) {
    if (!fs.existsSync(sessionsDir)) {
      continue;
    }

    let entries;
    try {
      entries = fs.readdirSync(sessionsDir, { withFileTypes: true });
    } catch (error) {
      log(`[SessionManager] Error reading sessions directory ${sessionsDir}: ${error.message}`);
      continue;
    }

    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.tmp')) continue;

      const metadata = parseSessionFilename(entry.name);
      if (!metadata || !sessionMatchesId(metadata, normalizedSessionId)) {
        continue;
      }

      if (seenFilenames.has(metadata.filename)) {
        continue;
      }

      const sessionPath = path.join(sessionsDir, metadata.filename);
      const sessionRecord = buildSessionRecord(sessionPath, metadata);
      if (!sessionRecord) {
        continue;
      }

      seenFilenames.add(metadata.filename);
      matches.push(sessionRecord);
    }
  }

  matches.sort((a, b) => b.modifiedTime - a.modifiedTime);
  return matches;
}

/**
 * Lê e faz o parse do conteúdo markdown da sessão
 * @param {string} sessionPath - Caminho completo para o arquivo de sessão
 * @returns {string|null} Conteúdo da sessão ou null se não encontrado
 */
function getSessionContent(sessionPath) {
  return readFile(sessionPath);
}

/**
 * Faz o parse dos metadados da sessão a partir do conteúdo markdown
 * @param {string} content - Conteúdo markdown da sessão
 * @returns {object} Metadados extraídos
 */
function parseSessionMetadata(content) {
  const metadata = {
    title: null,
    date: null,
    started: null,
    lastUpdated: null,
    project: null,
    branch: null,
    worktree: null,
    completed: [],
    inProgress: [],
    notes: '',
    context: ''
  };

  if (!content) return metadata;

  // Extrai o título do primeiro cabeçalho
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    metadata.title = titleMatch[1].trim();
  }

  // Extrai a data
  const dateMatch = content.match(/\*\*Date:\*\*\s*(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) {
    metadata.date = dateMatch[1];
  }

  // Extrai o horário de início
  const startedMatch = content.match(/\*\*Started:\*\*\s*([\d:]+)/);
  if (startedMatch) {
    metadata.started = startedMatch[1];
  }

  // Extrai a última atualização
  const updatedMatch = content.match(/\*\*Last Updated:\*\*\s*([\d:]+)/);
  if (updatedMatch) {
    metadata.lastUpdated = updatedMatch[1];
  }

  // Extrai os metadados do plano de controle
  const projectMatch = content.match(/\*\*Project:\*\*\s*(.+)$/m);
  if (projectMatch) {
    metadata.project = projectMatch[1].trim();
  }

  const branchMatch = content.match(/\*\*Branch:\*\*\s*(.+)$/m);
  if (branchMatch) {
    metadata.branch = branchMatch[1].trim();
  }

  const worktreeMatch = content.match(/\*\*Worktree:\*\*\s*(.+)$/m);
  if (worktreeMatch) {
    metadata.worktree = worktreeMatch[1].trim();
  }

  // Extrai os itens concluídos
  const completedSection = content.match(/### Completed\s*\n([\s\S]*?)(?=###|\n\n|$)/);
  if (completedSection) {
    const items = completedSection[1].match(/- \[x\]\s*(.+)/g);
    if (items) {
      metadata.completed = items.map(item => item.replace(/- \[x\]\s*/, '').trim());
    }
  }

  // Extrai os itens em andamento
  const progressSection = content.match(/### In Progress\s*\n([\s\S]*?)(?=###|\n\n|$)/);
  if (progressSection) {
    const items = progressSection[1].match(/- \[ \]\s*(.+)/g);
    if (items) {
      metadata.inProgress = items.map(item => item.replace(/- \[ \]\s*/, '').trim());
    }
  }

  // Extrai as notas
  const notesSection = content.match(/### Notes for Next Session\s*\n([\s\S]*?)(?=###|\n\n|$)/);
  if (notesSection) {
    metadata.notes = notesSection[1].trim();
  }

  // Extrai o contexto a carregar
  const contextSection = content.match(/### Context to Load\s*\n```\n([\s\S]*?)```/);
  if (contextSection) {
    metadata.context = contextSection[1].trim();
  }

  return metadata;
}

/**
 * Calcula estatísticas para uma sessão
 * @param {string} sessionPathOrContent - Caminho completo para o arquivo de sessão, OU
 *   a string de conteúdo previamente lida (para evitar leituras de disco redundantes
 *   quando o chamador já tem o conteúdo carregado).
 * @returns {object} Objeto de estatísticas
 */
function getSessionStats(sessionPathOrContent) {
  // Aceita a string de conteúdo previamente lida para evitar leituras de arquivo redundantes.
  // Se o argumento parecer um caminho de arquivo (sem quebras de linha, termina em .tmp,
  // começa com / no Unix ou com letra de unidade no Windows), lê do disco.
  // Caso contrário, trata-o como conteúdo.
  const looksLikePath = typeof sessionPathOrContent === 'string' &&
    !sessionPathOrContent.includes('\n') &&
    sessionPathOrContent.endsWith('.tmp') &&
    (sessionPathOrContent.startsWith('/') || /^[A-Za-z]:[/\\]/.test(sessionPathOrContent));
  const content = looksLikePath
    ? getSessionContent(sessionPathOrContent)
    : sessionPathOrContent;

  const metadata = parseSessionMetadata(content);

  return {
    totalItems: metadata.completed.length + metadata.inProgress.length,
    completedItems: metadata.completed.length,
    inProgressItems: metadata.inProgress.length,
    lineCount: content ? content.split('\n').length : 0,
    hasNotes: !!metadata.notes,
    hasContext: !!metadata.context
  };
}

/**
 * Obtém todas as sessões com filtragem e paginação opcionais
 * @param {object} options - Objeto de opções
 * @param {number} options.limit - Número máximo de sessões a retornar
 * @param {number} options.offset - Número de sessões a pular
 * @param {string} options.date - Filtrar por data (formato YYYY-MM-DD)
 * @param {string} options.search - Buscar no short ID
 * @returns {object} Objeto com o array de sessões e informações de paginação
 */
function getAllSessions(options = {}) {
  const {
    limit: rawLimit = 50,
    offset: rawOffset = 0,
    date = null,
    search = null
  } = options;

  // Limita offset e limit a inteiros não negativos seguros.
  // Sem isso, um offset negativo faz slice() contar a partir do fim,
  // e valores NaN fazem slice() retornar resultados vazios ou inesperados.
  // Nota: não é possível usar `|| default` porque 0 é falsy — use isNaN em vez disso.
  const offsetNum = Number(rawOffset);
  const offset = Number.isNaN(offsetNum) ? 0 : Math.max(0, Math.floor(offsetNum));
  const limitNum = Number(rawLimit);
  const limit = Number.isNaN(limitNum) ? 50 : Math.max(1, Math.floor(limitNum));

  const sessions = getSessionCandidates({ date, search });

  if (sessions.length === 0) {
    return { sessions: [], total: 0, offset, limit, hasMore: false };
  }

  // Aplica a paginação
  const paginatedSessions = sessions.slice(offset, offset + limit);

  return {
    sessions: paginatedSessions,
    total: sessions.length,
    offset,
    limit,
    hasMore: offset + limit < sessions.length
  };
}

/**
 * Obtém uma única sessão por ID (short ID ou caminho completo)
 * @param {string} sessionId - Short ID ou nome de arquivo de sessão
 * @param {boolean} includeContent - Incluir o conteúdo da sessão
 * @returns {object|null} Objeto de sessão ou null se não encontrado
 */
function getSessionById(sessionId, includeContent = false) {
  if (typeof sessionId !== 'string') {
    return null;
  }

  const normalizedSessionId = sessionId.trim();
  if (!normalizedSessionId) {
    return null;
  }

  const sessions = getMatchingSessionCandidates(normalizedSessionId);

  for (const session of sessions) {
    const sessionRecord = { ...session };

    if (includeContent) {
      sessionRecord.content = getSessionContent(sessionRecord.sessionPath);
      sessionRecord.metadata = parseSessionMetadata(sessionRecord.content);
      // Passa o conteúdo previamente lido para evitar uma leitura de disco redundante
      sessionRecord.stats = getSessionStats(sessionRecord.content || '');
    }

    return sessionRecord;
  }

  return null;
}

/**
 * Obtém o título da sessão a partir do conteúdo
 * @param {string} sessionPath - Caminho completo para o arquivo de sessão
 * @returns {string} Título ou texto padrão
 */
function getSessionTitle(sessionPath) {
  const content = getSessionContent(sessionPath);
  const metadata = parseSessionMetadata(content);

  return metadata.title || 'Untitled Session';
}

/**
 * Format session size in human-readable format
 * @param {string} sessionPath - Full path to session file
 * @returns {string} Formatted size (e.g., "1.2 KB")
 */
function getSessionSize(sessionPath) {
  let stats;
  try {
    stats = fs.statSync(sessionPath);
  } catch {
    return '0 B';
  }
  const size = stats.size;

  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Write session content to file
 * @param {string} sessionPath - Full path to session file
 * @param {string} content - Markdown content to write
 * @returns {boolean} Success status
 */
function writeSessionContent(sessionPath, content) {
  try {
    fs.writeFileSync(sessionPath, content, 'utf8');
    return true;
  } catch (err) {
    log(`[SessionManager] Error writing session: ${err.message}`);
    return false;
  }
}

/**
 * Append content to a session
 * @param {string} sessionPath - Full path to session file
 * @param {string} content - Content to append
 * @returns {boolean} Success status
 */
function appendSessionContent(sessionPath, content) {
  try {
    fs.appendFileSync(sessionPath, content, 'utf8');
    return true;
  } catch (err) {
    log(`[SessionManager] Error appending to session: ${err.message}`);
    return false;
  }
}

/**
 * Delete a session file
 * @param {string} sessionPath - Full path to session file
 * @returns {boolean} Success status
 */
function deleteSession(sessionPath) {
  try {
    if (fs.existsSync(sessionPath)) {
      fs.unlinkSync(sessionPath);
      return true;
    }
    return false;
  } catch (err) {
    log(`[SessionManager] Error deleting session: ${err.message}`);
    return false;
  }
}

/**
 * Check if a session exists
 * @param {string} sessionPath - Full path to session file
 * @returns {boolean} True if session exists
 */
function sessionExists(sessionPath) {
  try {
    return fs.statSync(sessionPath).isFile();
  } catch {
    return false;
  }
}

module.exports = {
  parseSessionFilename,
  getSessionPath,
  getSessionContent,
  parseSessionMetadata,
  getSessionStats,
  getSessionTitle,
  getSessionSize,
  getAllSessions,
  getSessionById,
  writeSessionContent,
  appendSessionContent,
  deleteSession,
  sessionExists
};
