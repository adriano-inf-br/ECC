'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const CURRENT_PLUGIN_SLUG = 'ecc';
const LEGACY_PLUGIN_SLUG = 'everything-claude-code';
const CURRENT_PLUGIN_HANDLE = `${CURRENT_PLUGIN_SLUG}@${CURRENT_PLUGIN_SLUG}`;
const LEGACY_PLUGIN_HANDLE = `${LEGACY_PLUGIN_SLUG}@${LEGACY_PLUGIN_SLUG}`;
const PLUGIN_CACHE_SLUGS = [CURRENT_PLUGIN_SLUG, LEGACY_PLUGIN_SLUG];
const PLUGIN_ROOT_SEGMENTS = [
  [CURRENT_PLUGIN_SLUG],
  [CURRENT_PLUGIN_HANDLE],
  ['marketplaces', CURRENT_PLUGIN_SLUG],
  [LEGACY_PLUGIN_SLUG],
  [LEGACY_PLUGIN_HANDLE],
  ['marketplaces', LEGACY_PLUGIN_SLUG],
];

/**
 * Resolve o diretório raiz do código-fonte do ECC.
 *
 * Tenta, na ordem:
 *   1. variável de ambiente CLAUDE_PLUGIN_ROOT (definida pelo Claude Code para hooks, ou pelo usuário)
 *   2. Local de instalação padrão (~/.claude/) — quando há scripts ali
 *   3. Raízes de plugin conhecidas em ~/.claude/plugins/ (slugs atual + legado)
 *   4. Detecção automática no cache de plugins — varre ~/.claude/plugins/cache/{ecc,everything-claude-code}/
 *   5. Fallback para ~/.claude/ (comportamento original)
 *
 * @param {object} [options]
 * @param {string} [options.homeDir]  Sobrescreve o diretório home (para testes)
 * @param {string} [options.envRoot]  Sobrescreve CLAUDE_PLUGIN_ROOT (para testes)
 * @param {string} [options.probe]    Caminho relativo usado para verificar se uma raiz candidata
 *                                    contém scripts do ECC. Padrão: 'scripts/lib/utils.js'
 * @returns {string} Caminho da raiz do ECC resolvido
 */
function resolveEccRoot(options = {}) {
  const envRoot = options.envRoot !== undefined
    ? options.envRoot
    : (process.env.CLAUDE_PLUGIN_ROOT || '');

  if (envRoot && envRoot.trim()) {
    return envRoot.trim();
  }

  const homeDir = options.homeDir || os.homedir();
  const claudeDir = path.join(homeDir, '.claude');
  const probe = options.probe || path.join('scripts', 'lib', 'utils.js');

  // Instalação padrão — os arquivos são copiados diretamente para ~/.claude/
  if (fs.existsSync(path.join(claudeDir, probe))) {
    return claudeDir;
  }

  // Locais exatos de instalação de plugin legado. Eles preservam a
  // compatibilidade retroativa sem varrer árvores de plugin arbitrárias.
  const legacyPluginRoots = PLUGIN_ROOT_SEGMENTS.map((segments) =>
    path.join(claudeDir, 'plugins', ...segments)
  );

  for (const candidate of legacyPluginRoots) {
    if (fs.existsSync(path.join(candidate, probe))) {
      return candidate;
    }
  }

  // Cache de plugins — o Claude Code armazena plugins de marketplace em
  // ~/.claude/plugins/cache/<plugin-name>/<org>/<version>/
  try {
    for (const slug of PLUGIN_CACHE_SLUGS) {
      const cacheBase = path.join(claudeDir, 'plugins', 'cache', slug);
      const orgDirs = fs.readdirSync(cacheBase, { withFileTypes: true });

      for (const orgEntry of orgDirs) {
        if (!orgEntry.isDirectory()) continue;
        const orgPath = path.join(cacheBase, orgEntry.name);

        let versionDirs;
        try {
          versionDirs = fs.readdirSync(orgPath, { withFileTypes: true });
        } catch {
          continue;
        }

        for (const verEntry of versionDirs) {
          if (!verEntry.isDirectory()) continue;
          const candidate = path.join(orgPath, verEntry.name);
          if (fs.existsSync(path.join(candidate, probe))) {
            return candidate;
          }
        }
      }
    }
  } catch {
    // O cache de plugins não existe ou não pode ser lido — segue para o fallback
  }

  return claudeDir;
}

/**
 * Versão inline compacta para embutir em blocos de código de comandos .md.
 *
 * Esta é a forma minificada de resolveEccRoot() adequada para uso em
 * scripts node -e "..." onde require() não está disponível antes de a
 * raiz ser conhecida.
 *
 * Uso em comandos:
 *   const _r = <paste INLINE_RESOLVE>;
 *   const sm = require(_r + '/scripts/lib/session-manager');
 */
function inlineSingleQuote(value) {
  return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function inlineArray(values) {
  return `[${values.map(inlineSingleQuote).join(',')}]`;
}

function inlineNestedArray(values) {
  return `[${values.map(inlineArray).join(',')}]`;
}

const INLINE_PLUGIN_ROOT_SEGMENTS = inlineNestedArray(PLUGIN_ROOT_SEGMENTS);
const INLINE_PLUGIN_CACHE_SLUGS = inlineArray(PLUGIN_CACHE_SLUGS);

const INLINE_RESOLVE = `(()=>{var e=process.env.CLAUDE_PLUGIN_ROOT;if(e&&e.trim())return e.trim();var p=require('path'),f=require('fs'),h=require('os').homedir(),d=p.join(h,'.claude'),q=p.join('scripts','lib','utils.js');if(f.existsSync(p.join(d,q)))return d;for(var s of ${INLINE_PLUGIN_ROOT_SEGMENTS}){var l=p.join(d,'plugins',...s);if(f.existsSync(p.join(l,q)))return l}try{for(var g of ${INLINE_PLUGIN_CACHE_SLUGS}){var b=p.join(d,'plugins','cache',g);for(var o of f.readdirSync(b,{withFileTypes:true})){if(!o.isDirectory())continue;for(var v of f.readdirSync(p.join(b,o.name),{withFileTypes:true})){if(!v.isDirectory())continue;var c=p.join(b,o.name,v.name);if(f.existsSync(p.join(c,q)))return c}}}}catch(x){}return d})()`;

module.exports = {
  resolveEccRoot,
  INLINE_RESOLVE,
};
