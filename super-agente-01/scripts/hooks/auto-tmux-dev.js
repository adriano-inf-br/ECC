#!/usr/bin/env node
/**
 * Auto-Tmux Dev Hook - Inicia servidores de desenvolvimento em tmux/cmd automaticamente
 *
 * macOS/Linux: Executa o servidor de desenvolvimento em uma sessão tmux nomeada (não bloqueante).
 *              Volta ao comando original se o tmux não estiver instalado.
 * Windows: Abre o servidor de desenvolvimento em uma nova janela cmd (não bloqueante).
 *
 * Executa antes do uso da ferramenta Bash. Se o comando for um servidor de desenvolvimento (npm run dev, pnpm dev, yarn dev, bun run dev),
 * transforma-o para executar em uma sessão desanexada.
 *
 * Benefícios:
 * - O servidor de desenvolvimento roda desanexado (não bloqueia o Claude Code)
 * - A sessão persiste (pode-se executar `tmux capture-pane -t <session> -p` para ver os logs no Unix)
 * - O nome da sessão corresponde ao diretório do projeto (permite múltiplos projetos simultaneamente)
 *
 * Gerenciamento de sessão (Unix):
 * - Verifica a disponibilidade do tmux antes de transformar
 * - Encerra qualquer sessão existente com o mesmo nome (reinício limpo)
 * - Cria nova sessão desanexada
 * - Reporta o nome da sessão e como visualizar os logs
 *
 * Gerenciamento de sessão (Windows):
 * - Abre nova janela cmd com título descritivo
 * - Permite que múltiplos servidores de desenvolvimento rodem simultaneamente
 */

const path = require('path');
const { spawnSync } = require('child_process');

const MAX_STDIN = 1024 * 1024; // limite de 1MB
let data = '';

function run(rawInput) {
  try {
    const input = typeof rawInput === 'string' ? JSON.parse(rawInput) : rawInput;
    const cmd = input.tool_input?.command || '';

    // Detecta comandos de servidor de desenvolvimento: npm run dev, pnpm dev, yarn dev, bun run dev
    // Usa limite de palavra (\b) para evitar correspondência com comandos parciais
    const devServerRegex = /(npm run dev\b|pnpm( run)? dev\b|yarn dev\b|bun run dev\b)/;

    if (devServerRegex.test(cmd)) {
      // Obtém o nome da sessão a partir do basename do diretório atual, sanitiza para segurança no shell
      // ex.: /home/user/Portfolio → "Portfolio", /home/user/my-app-v2 → "my-app-v2"
      const rawName = path.basename(process.cwd());
      // Substitui caracteres não alfanuméricos (exceto - e _) por sublinhado para evitar injeção de shell
      const sessionName = rawName.replace(/[^a-zA-Z0-9_-]/g, '_') || 'dev';

      if (process.platform === 'win32') {
        // Windows: abre em uma nova janela cmd (não bloqueante)
        // Escapa aspas duplas no cmd para a sintaxe cmd /k
        const escapedCmd = cmd.replace(/"/g, '""');
        return JSON.stringify({
          ...input,
          tool_input: {
            ...input.tool_input,
            command: `start "DevServer-${sessionName}" cmd /k "${escapedCmd}"`,
          },
        });
      } else {
        // Unix (macOS/Linux): Verifica se o tmux está disponível antes de transformar
        const tmuxCheck = spawnSync('which', ['tmux'], { encoding: 'utf8' });
        if (tmuxCheck.status === 0) {
          // Escapa aspas simples para segurança no shell: 'text' -> 'text'\''text'
          const escapedCmd = cmd.replace(/'/g, "'\\''");

          // Monta o comando transformado:
          // 1. Encerra a sessão existente (silencioso se não existir)
          // 2. Cria nova sessão desanexada com o comando de desenvolvimento
          // 3. Exibe mensagem de confirmação com instruções para visualizar os logs
          const transformedCmd = `SESSION="${sessionName}"; tmux kill-session -t "$SESSION" 2>/dev/null || true; tmux new-session -d -s "$SESSION" '${escapedCmd}' && echo "[Hook] Dev server started in tmux session '${sessionName}'. View logs: tmux capture-pane -t ${sessionName} -p -S -100"`;
          return JSON.stringify({
            ...input,
            tool_input: {
              ...input.tool_input,
              command: transformedCmd,
            },
          });
        }
        // senão: tmux não encontrado, repassa o comando original sem alteração
      }
    }

    return JSON.stringify(input);
  } catch {
    // Entrada inválida — repassa os dados originais sem alteração
    return typeof rawInput === 'string' ? rawInput : JSON.stringify(rawInput);
  }
}

if (require.main === module) {
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => {
    if (data.length < MAX_STDIN) {
      const remaining = MAX_STDIN - data.length;
      data += chunk.substring(0, remaining);
    }
  });

  process.stdin.on('end', () => {
    process.stdout.write(run(data));
    process.exit(0);
  });
}

module.exports = { run };
