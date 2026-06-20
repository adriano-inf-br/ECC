'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Auxiliares de contenção de caminho para operações de arquivo orientadas pelo install-state.
 *
 * Os arquivos de install-state são locais ao projeto e, portanto, controláveis por um atacante
 * (um repositório clonado/forkado pode trazer um `.cursor/ecc-install-state.json` forjado).
 * `repair`/`uninstall`/`auto-update` reexecutam as operações registradas, então todo
 * destino de escrita/exclusão DEVE estar confinado à raiz confiável derivada do adaptador
 * — nunca confiada a partir do próprio arquivo de estado (GHSA-hfpv-w6mp-5g95).
 */

function safeRealpath(target) {
  try {
    return fs.realpathSync(path.resolve(target));
  } catch {
    return path.resolve(target);
  }
}

/**
 * Canonicaliza um caminho que talvez ainda não exista: aplica realpath ao
 * ancestral existente mais próximo e, então, reanexa a cauda ausente. Isso
 * neutraliza fugas via symlink em que um diretório intermediário é um symlink
 * apontando para fora da raiz.
 */
function realpathNearestExisting(target) {
  let current = path.resolve(target);
  const tail = [];
  while (!fs.existsSync(current)) {
    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    tail.unshift(path.basename(current));
    current = parent;
  }
  const real = safeRealpath(current);
  return tail.length > 0 ? path.join(real, ...tail) : real;
}

/**
 * Verdadeiro quando `target` resolve para a própria `root` ou para um caminho
 * abaixo dela, com os symlinks resolvidos em ambos os lados.
 */
function isWithinRoot(target, root) {
  if (!root) {
    return false;
  }
  const realRoot = safeRealpath(root);
  const realTarget = realpathNearestExisting(target);
  if (realTarget === realRoot) {
    return true;
  }
  const rel = path.relative(realRoot, realTarget);
  return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel);
}

/**
 * Guarda fail-closed: lança erro a menos que `target` esteja contido em `root`.
 * Retorna o caminho de destino canonicalizado em caso de sucesso.
 */
function assertWithinTrustedRoot(target, root, action = 'write') {
  if (!target || typeof target !== 'string') {
    throw new Error(`Refusing to ${action}: missing destination path.`);
  }
  if (!root) {
    throw new Error(`Refusing to ${action} '${target}': no trusted install root resolved.`);
  }
  if (!isWithinRoot(target, root)) {
    throw new Error(`Refusing to ${action} outside the install root: '${target}' is not within '${root}'.`);
  }
  return realpathNearestExisting(target);
}

module.exports = {
  realpathNearestExisting,
  isWithinRoot,
  assertWithinTrustedRoot
};
