'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Faz o parsing do frontmatter YAML de uma string markdown.
 * Retorna { frontmatter: {}, body: string }.
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n([\s\S]*))?$/);
  if (!match) {
    return { frontmatter: {}, body: content };
  }

  const frontmatter = {};
  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();

    // Trata arrays JSON (ex.: tools: ["Read", "Grep"])
    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        value = JSON.parse(value);
      } catch {
        // mantém como string
      }
    }

    // Remove as aspas ao redor
    if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }

    frontmatter[key] = value;
  }

  return { frontmatter, body: match[2] || '' };
}

/**
 * Extrai o primeiro parágrafo significativo do corpo do agent como um resumo.
 * Ignora títulos, itens de lista, blocos de código e linhas de tabela.
 */
function extractSummary(body, maxSentences = 1) {
  const lines = body.split('\n');
  const paragraphs = [];
  let current = [];
  let inCodeBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Acompanha blocos de código cercados (fenced)
    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    if (trimmed === '') {
      if (current.length > 0) {
        paragraphs.push(current.join(' '));
        current = [];
      }
      continue;
    }

    // Ignora títulos, itens de lista (negrito, simples, asterisco), listas numeradas, linhas de tabela
    if (
      trimmed.startsWith('#') ||
      trimmed.startsWith('- ') ||
      trimmed.startsWith('* ') ||
      /^\d+\.\s/.test(trimmed) ||
      trimmed.startsWith('|')
    ) {
      if (current.length > 0) {
        paragraphs.push(current.join(' '));
        current = [];
      }
      continue;
    }

    current.push(trimmed);
  }
  if (current.length > 0) {
    paragraphs.push(current.join(' '));
  }

  const firstParagraph = paragraphs.find(p => p.length > 0);
  if (!firstParagraph) return '';

  const sentences = firstParagraph.match(/[^.!?]+[.!?]+/g) || [firstParagraph];
  return sentences.slice(0, maxSentences).map(s => s.trim()).join(' ').trim();
}

/**
 * Carrega e faz o parsing de um único arquivo de agent.
 */
function loadAgent(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const { frontmatter, body } = parseFrontmatter(content);
  const fileName = path.basename(filePath, '.md');

  return {
    fileName,
    name: frontmatter.name || fileName,
    description: frontmatter.description || '',
    tools: Array.isArray(frontmatter.tools) ? frontmatter.tools : [],
    model: frontmatter.model || 'sonnet',
    body,
    byteSize: Buffer.byteLength(content, 'utf8'),
  };
}

/**
 * Carrega todos os agents de um diretório.
 */
function loadAgents(agentsDir) {
  if (!fs.existsSync(agentsDir)) return [];

  return fs.readdirSync(agentsDir)
    .filter(f => f.endsWith('.md'))
    .sort()
    .map(f => loadAgent(path.join(agentsDir, f)));
}

/**
 * Comprime um agent para uma entrada de catálogo (apenas metadados).
 */
function compressToCatalog(agent) {
  return {
    name: agent.name,
    description: agent.description,
    tools: agent.tools,
    model: agent.model,
  };
}

/**
 * Comprime um agent para uma entrada de resumo (metadados + primeiro parágrafo).
 */
function compressToSummary(agent) {
  return {
    ...compressToCatalog(agent),
    summary: extractSummary(agent.body),
  };
}

const allowedModes = ['catalog', 'summary', 'full'];

/**
 * Constrói um catálogo comprimido a partir de um diretório de agents.
 *
 * Modos:
 *  - 'catalog': apenas name, description, tools, model (~2-3k tokens para 27 agents)
 *  - 'summary': catálogo + resumo do primeiro parágrafo (~4-5k tokens)
 *  - 'full':    sem compressão, corpo completo incluído
 *
 * Retorna { agents: [], stats: { totalAgents, originalBytes, compressedBytes, compressedTokenEstimate, mode } }
 */
function buildAgentCatalog(agentsDir, options = {}) {
  const mode = options.mode || 'catalog';

  if (!allowedModes.includes(mode)) {
    throw new Error(`Invalid mode "${mode}". Allowed modes: ${allowedModes.join(', ')}`);
  }

  const filter = options.filter || null;

  let agents = loadAgents(agentsDir);

  if (typeof filter === 'function') {
    agents = agents.filter(filter);
  }

  const originalBytes = agents.reduce((sum, a) => sum + a.byteSize, 0);

  let compressed;
  if (mode === 'catalog') {
    compressed = agents.map(compressToCatalog);
  } else if (mode === 'summary') {
    compressed = agents.map(compressToSummary);
  } else {
    compressed = agents.map(a => ({
      name: a.name,
      description: a.description,
      tools: a.tools,
      model: a.model,
      body: a.body,
    }));
  }

  const compressedJson = JSON.stringify(compressed);
  // Estimativa aproximada de tokens: ~4 caracteres por token para texto em inglês
  const compressedTokenEstimate = Math.ceil(compressedJson.length / 4);

  return {
    agents: compressed,
    stats: {
      totalAgents: agents.length,
      originalBytes,
      compressedBytes: Buffer.byteLength(compressedJson, 'utf8'),
      compressedTokenEstimate,
      mode,
    },
  };
}

/**
 * Carrega de forma preguiçosa (lazy-load) o conteúdo completo de um único agent pelo nome.
 * Retorna null se não for encontrado.
 */
function lazyLoadAgent(agentsDir, agentName) {
  // Valida agentName: permite apenas alfanuméricos, hífen e sublinhado
  if (!/^[\w-]+$/.test(agentName)) {
    return null;
  }

  const filePath = path.resolve(agentsDir, `${agentName}.md`);

  // Verifica se o caminho resolvido ainda está dentro de agentsDir
  const resolvedAgentsDir = path.resolve(agentsDir);
  if (!filePath.startsWith(resolvedAgentsDir + path.sep)) {
    return null;
  }

  if (!fs.existsSync(filePath)) return null;
  return loadAgent(filePath);
}

module.exports = {
  buildAgentCatalog,
  compressToCatalog,
  compressToSummary,
  extractSummary,
  lazyLoadAgent,
  loadAgent,
  loadAgents,
  parseFrontmatter,
};
