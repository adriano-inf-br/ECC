/**
 * Detecção de tipo de projeto e framework
 *
 * Detecção multiplataforma (Windows, macOS, Linux) de tipo de projeto
 * inspecionando arquivos no diretório de trabalho.
 *
 * Resolves: https://github.com/affaan-m/everything-claude-code/issues/293
 */

const fs = require('fs');
const path = require('path');

/**
 * Regras de detecção de linguagem.
 * Cada regra verifica arquivos marcadores ou padrões glob na raiz do projeto.
 */
const LANGUAGE_RULES = [
  {
    type: 'python',
    markers: ['requirements.txt', 'pyproject.toml', 'setup.py', 'setup.cfg', 'Pipfile', 'poetry.lock'],
    extensions: ['.py']
  },
  {
    type: 'typescript',
    markers: ['tsconfig.json', 'tsconfig.build.json'],
    extensions: ['.ts', '.tsx']
  },
  {
    type: 'javascript',
    markers: ['package.json', 'jsconfig.json'],
    extensions: ['.js', '.jsx', '.mjs']
  },
  {
    type: 'golang',
    markers: ['go.mod', 'go.sum'],
    extensions: ['.go']
  },
  {
    type: 'rust',
    markers: ['Cargo.toml', 'Cargo.lock'],
    extensions: ['.rs']
  },
  {
    type: 'ruby',
    markers: ['Gemfile', 'Gemfile.lock', 'Rakefile'],
    extensions: ['.rb']
  },
  {
    type: 'java',
    markers: ['pom.xml', 'build.gradle', 'build.gradle.kts'],
    extensions: ['.java']
  },
  {
    type: 'c',
    markers: [],
    extensions: ['.c']
  },
  {
    type: 'csharp',
    markers: [],
    extensions: ['.cs', '.csproj', '.sln']
  },
  {
    type: 'fsharp',
    markers: [],
    extensions: ['.fs', '.fsx', '.fsproj']
  },
  {
    type: 'swift',
    markers: ['Package.swift'],
    extensions: ['.swift']
  },
  {
    type: 'kotlin',
    markers: [],
    extensions: ['.kt', '.kts']
  },
  {
    type: 'elixir',
    markers: ['mix.exs'],
    extensions: ['.ex', '.exs']
  },
  {
    type: 'php',
    markers: ['composer.json', 'composer.lock'],
    extensions: ['.php']
  }
];

/**
 * Regras de detecção de framework.
 * Verificadas após a detecção de linguagem para identificação mais específica.
 */
const FRAMEWORK_RULES = [
  // Frameworks Python
  { framework: 'django', language: 'python', markers: ['manage.py'], packageKeys: ['django'] },
  { framework: 'fastapi', language: 'python', markers: [], packageKeys: ['fastapi'] },
  { framework: 'flask', language: 'python', markers: [], packageKeys: ['flask'] },

  // Frameworks JavaScript/TypeScript
  { framework: 'nextjs', language: 'typescript', markers: ['next.config.js', 'next.config.mjs', 'next.config.ts'], packageKeys: ['next'] },
  { framework: 'react', language: 'typescript', markers: [], packageKeys: ['react'] },
  { framework: 'vue', language: 'typescript', markers: ['vue.config.js'], packageKeys: ['vue'] },
  { framework: 'angular', language: 'typescript', markers: ['angular.json'], packageKeys: ['@angular/core'] },
  { framework: 'svelte', language: 'typescript', markers: ['svelte.config.js'], packageKeys: ['svelte'] },
  { framework: 'express', language: 'javascript', markers: [], packageKeys: ['express'] },
  { framework: 'nestjs', language: 'typescript', markers: ['nest-cli.json'], packageKeys: ['@nestjs/core'] },
  { framework: 'remix', language: 'typescript', markers: [], packageKeys: ['@remix-run/node', '@remix-run/react'] },
  { framework: 'astro', language: 'typescript', markers: ['astro.config.mjs', 'astro.config.ts'], packageKeys: ['astro'] },
  { framework: 'nuxt', language: 'typescript', markers: ['nuxt.config.js', 'nuxt.config.ts'], packageKeys: ['nuxt'] },
  { framework: 'electron', language: 'typescript', markers: [], packageKeys: ['electron'] },

  // Frameworks Ruby
  { framework: 'rails', language: 'ruby', markers: ['config/routes.rb', 'bin/rails'], packageKeys: [] },

  // Frameworks Go
  { framework: 'gin', language: 'golang', markers: [], packageKeys: ['github.com/gin-gonic/gin'] },
  { framework: 'echo', language: 'golang', markers: [], packageKeys: ['github.com/labstack/echo'] },

  // Frameworks Rust
  { framework: 'actix', language: 'rust', markers: [], packageKeys: ['actix-web'] },
  { framework: 'axum', language: 'rust', markers: [], packageKeys: ['axum'] },

  // Frameworks Java
  { framework: 'spring', language: 'java', markers: [], packageKeys: ['spring-boot', 'org.springframework'] },

  // Frameworks PHP
  { framework: 'laravel', language: 'php', markers: ['artisan'], packageKeys: ['laravel/framework'] },
  { framework: 'symfony', language: 'php', markers: ['symfony.lock'], packageKeys: ['symfony/framework-bundle'] },

  // Frameworks Elixir
  { framework: 'phoenix', language: 'elixir', markers: [], packageKeys: ['phoenix'] }
];

/**
 * Verifica se um arquivo existe relativo ao diretório do projeto
 * @param {string} projectDir - Diretório raiz do projeto
 * @param {string} filePath - Caminho de arquivo relativo
 * @returns {boolean}
 */
function fileExists(projectDir, filePath) {
  try {
    return fs.existsSync(path.join(projectDir, filePath));
  } catch {
    return false;
  }
}

/**
 * Verifica se algum arquivo com a extensão dada existe na raiz do projeto (não recursivo, apenas nível superior)
 * @param {string} projectDir - Diretório raiz do projeto
 * @param {string[]} extensions - Extensões de arquivo a verificar
 * @returns {boolean}
 */
function hasFileWithExtension(projectDir, extensions) {
  try {
    const entries = fs.readdirSync(projectDir, { withFileTypes: true });
    return entries.some(entry => {
      if (!entry.isFile()) return false;
      const ext = path.extname(entry.name);
      return extensions.includes(ext);
    });
  } catch {
    return false;
  }
}

/**
 * Lê e faz o parse das dependências do package.json
 * @param {string} projectDir - Diretório raiz do projeto
 * @returns {string[]} Array de nomes de dependências
 */
function getPackageJsonDeps(projectDir) {
  try {
    const pkgPath = path.join(projectDir, 'package.json');
    if (!fs.existsSync(pkgPath)) return [];
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    return [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.devDependencies || {})];
  } catch {
    return [];
  }
}

/**
 * Lê requirements.txt ou pyproject.toml para obter nomes de pacotes Python
 * @param {string} projectDir - Diretório raiz do projeto
 * @returns {string[]} Array de nomes de dependências (minúsculas)
 */
function getPythonDeps(projectDir) {
  const deps = [];

  // requirements.txt
  try {
    const reqPath = path.join(projectDir, 'requirements.txt');
    if (fs.existsSync(reqPath)) {
      const content = fs.readFileSync(reqPath, 'utf8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('-')) {
          const name = trimmed
            .split(/[>=<![;]/)[0]
            .trim()
            .toLowerCase();
          if (name) deps.push(name);
        }
      });
    }
  } catch {
    /* ignorar */
  }

  // pyproject.toml — extração simples de nomes de dependências
  try {
    const tomlPath = path.join(projectDir, 'pyproject.toml');
    if (fs.existsSync(tomlPath)) {
      const content = fs.readFileSync(tomlPath, 'utf8');
      const depMatches = content.match(/dependencies\s*=\s*\[([\s\S]*?)\]/);
      if (depMatches) {
        const block = depMatches[1];
        block.match(/"([^"]+)"/g)?.forEach(m => {
          const name = m
            .replace(/"/g, '')
            .split(/[>=<![;]/)[0]
            .trim()
            .toLowerCase();
          if (name) deps.push(name);
        });
      }
    }
  } catch {
    /* ignorar */
  }

  return deps;
}

/**
 * Lê go.mod para obter as dependências de módulo Go
 * @param {string} projectDir - Diretório raiz do projeto
 * @returns {string[]} Array de caminhos de módulo
 */
function getGoDeps(projectDir) {
  try {
    const modPath = path.join(projectDir, 'go.mod');
    if (!fs.existsSync(modPath)) return [];
    const content = fs.readFileSync(modPath, 'utf8');
    const deps = [];
    const requireBlock = content.match(/require\s*\(([\s\S]*?)\)/);
    if (requireBlock) {
      requireBlock[1].split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('//')) {
          const parts = trimmed.split(/\s+/);
          if (parts[0]) deps.push(parts[0]);
        }
      });
    }
    return deps;
  } catch {
    return [];
  }
}

/**
 * Lê Cargo.toml para obter as dependências de crate Rust
 * @param {string} projectDir - Diretório raiz do projeto
 * @returns {string[]} Array de nomes de crate
 */
function getRustDeps(projectDir) {
  try {
    const cargoPath = path.join(projectDir, 'Cargo.toml');
    if (!fs.existsSync(cargoPath)) return [];
    const content = fs.readFileSync(cargoPath, 'utf8');
    const deps = [];
    // Casa as seções [dependencies] e [dev-dependencies]
    const sections = content.match(/\[(dev-)?dependencies\]([\s\S]*?)(?=\n\[|$)/g);
    if (sections) {
      sections.forEach(section => {
        section.split('\n').forEach(line => {
          const match = line.match(/^([a-zA-Z0-9_-]+)\s*=/);
          if (match && !line.startsWith('[')) {
            deps.push(match[1]);
          }
        });
      });
    }
    return deps;
  } catch {
    return [];
  }
}

/**
 * Lê composer.json para obter as dependências de pacote PHP
 * @param {string} projectDir - Diretório raiz do projeto
 * @returns {string[]} Array de nomes de pacote
 */
function getComposerDeps(projectDir) {
  try {
    const composerPath = path.join(projectDir, 'composer.json');
    if (!fs.existsSync(composerPath)) return [];
    const composer = JSON.parse(fs.readFileSync(composerPath, 'utf8'));
    return [...Object.keys(composer.require || {}), ...Object.keys(composer['require-dev'] || {})];
  } catch {
    return [];
  }
}

/**
 * Lê mix.exs para obter as dependências Elixir (casamento de padrão simples)
 * @param {string} projectDir - Diretório raiz do projeto
 * @returns {string[]} Array de nomes de átomo de dependência
 */
function getElixirDeps(projectDir) {
  try {
    const mixPath = path.join(projectDir, 'mix.exs');
    if (!fs.existsSync(mixPath)) return [];
    const content = fs.readFileSync(mixPath, 'utf8');
    const deps = [];
    const matches = content.match(/\{:(\w+)/g);
    if (matches) {
      matches.forEach(m => deps.push(m.replace('{:', '')));
    }
    return deps;
  } catch {
    return [];
  }
}

/**
 * Detecta as linguagens e frameworks do projeto
 * @param {string} [projectDir] - Diretório do projeto (padrão: cwd)
 * @returns {{ languages: string[], frameworks: string[], primary: string, projectDir: string }}
 */
function detectProjectType(projectDir) {
  projectDir = projectDir || process.cwd();
  const languages = [];
  const frameworks = [];

  // Passo 1: Detectar linguagens
  for (const rule of LANGUAGE_RULES) {
    const hasMarker = rule.markers.some(m => fileExists(projectDir, m));
    const hasExt = rule.extensions.length > 0 && hasFileWithExtension(projectDir, rule.extensions);

    if (hasMarker || hasExt) {
      languages.push(rule.type);
    }
  }

  // Remover duplicatas: se detectados typescript e javascript, manter typescript
  if (languages.includes('typescript') && languages.includes('javascript')) {
    const idx = languages.indexOf('javascript');
    if (idx !== -1) languages.splice(idx, 1);
  }

  // Passo 2: Detectar frameworks com base em marcadores e dependências
  const npmDeps = getPackageJsonDeps(projectDir);
  const pyDeps = getPythonDeps(projectDir);
  const goDeps = getGoDeps(projectDir);
  const rustDeps = getRustDeps(projectDir);
  const composerDeps = getComposerDeps(projectDir);
  const elixirDeps = getElixirDeps(projectDir);

  for (const rule of FRAMEWORK_RULES) {
    // Verificar arquivos marcadores
    const hasMarker = rule.markers.some(m => fileExists(projectDir, m));

    // Verificar dependências de pacote
    let hasDep = false;
    if (rule.packageKeys.length > 0) {
      let depList = [];
      switch (rule.language) {
        case 'python':
          depList = pyDeps;
          break;
        case 'typescript':
        case 'javascript':
          depList = npmDeps;
          break;
        case 'golang':
          depList = goDeps;
          break;
        case 'rust':
          depList = rustDeps;
          break;
        case 'php':
          depList = composerDeps;
          break;
        case 'elixir':
          depList = elixirDeps;
          break;
      }
      // Casamento sensível a limites: uma dependência casa com um packageKey
      // apenas quando é igual à chave, ou a chave é um prefixo imediatamente
      // seguido por um delimitador (/ . _ -). O casamento por substring simples
      // classificava erroneamente `preact` / `reactive` como `react`. Isso ainda
      // casa os casos reais: react-dom, @remix-run/node, spring-boot-starter,
      // org.springframework.boot, github.com/labstack/echo/v4, phoenix_live_view.
      hasDep = rule.packageKeys.some(key => {
        const k = key.toLowerCase();
        return depList.some(dep => {
          const d = dep.toLowerCase();
          if (!d.startsWith(k)) return false;
          return d.length === k.length || /[/._-]/.test(d[k.length]);
        });
      });
    }

    if (hasMarker || hasDep) {
      frameworks.push(rule.framework);
    }
  }

  // Passo 3: Determinar o tipo primário
  let primary = 'unknown';
  if (frameworks.length > 0) {
    primary = frameworks[0];
  } else if (languages.length > 0) {
    primary = languages[0];
  }

  // Determinar se é fullstack (linguagens frontend e backend)
  const frontendSignals = ['react', 'vue', 'angular', 'svelte', 'nextjs', 'nuxt', 'astro', 'remix'];
  const backendSignals = ['django', 'fastapi', 'flask', 'express', 'nestjs', 'rails', 'spring', 'laravel', 'phoenix', 'gin', 'echo', 'actix', 'axum'];
  const hasFrontend = frameworks.some(f => frontendSignals.includes(f));
  const hasBackend = frameworks.some(f => backendSignals.includes(f));

  if (hasFrontend && hasBackend) {
    primary = 'fullstack';
  }

  return {
    languages,
    frameworks,
    primary,
    projectDir
  };
}

module.exports = {
  detectProjectType,
  LANGUAGE_RULES,
  FRAMEWORK_RULES,
  // Exportado para testes
  getPackageJsonDeps,
  getPythonDeps,
  getGoDeps,
  getRustDeps,
  getComposerDeps,
  getElixirDeps
};
