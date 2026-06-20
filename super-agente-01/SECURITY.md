# Política de Segurança

## Versões Suportadas

| Versão | Suportada |
| --- | --- |
| 2.x / builds rc | :white_check_mark: |
| 1.10.x | :white_check_mark: |
| 1.9.x | Apenas correções críticas |
| < 1.9 | :x: |

As correções de segurança chegam primeiro na `main`. Backports são feitos na medida do possível e apenas para as linhas de release atualmente suportadas.

## Reportando uma Vulnerabilidade

Use o reporte privado de vulnerabilidades do GitHub sempre que possível — ele chega diretamente ao mantenedor:

- <https://github.com/affaan-m/ECC/security/advisories/new>

Você também pode enviar e-mail para **<affaan@ecc.tools>** (o alias `security@ecc.tools` não é monitorado — use `affaan@ecc.tools`).

**Não** abra uma issue pública no GitHub para vulnerabilidades de segurança.

Inclua:

- arquivo, pacote, versão, commit e caminho de instalação afetados
- passos para reproduzir a partir de um checkout limpo
- impacto esperado e limite de confiança afetado
- se a exploração exige acesso local ao shell, um repositório malicioso, um pacote malicioso, um ator remoto não autenticado ou credenciais de mantenedor
- quaisquer logs de PoC com tokens, chaves, caminhos locais e dados privados redigidos

Resposta esperada:

- **Confirmação de recebimento:** dentro de 48 horas
- **Avaliação inicial:** dentro de 7 dias
- **Meta de correção ou mitigação crítica:** dentro de 14 dias quando o reporte afeta uma release suportada e cruza um limite de confiança real
- **Divulgação coordenada:** antes da publicação do aviso público

Se um reporte for recusado, explicaremos se ele não é reproduzível, está fora de escopo, já foi corrigido ou precisa de um caminho de ataque mais robusto.

## Escopo

Esta política cobre:

- o repositório `affaan-m/ECC`
- o pacote npm `ecc-universal`
- as superfícies de plugin, instalação, reparo, dashboard, hook, regra, skill, MCP e comandos do ECC enviadas a partir deste repositório
- os fluxos de trabalho do GitHub Actions e a automação de release neste repositório
- os pontos de integração do GitHub App da ECC Tools documentados por este repositório
- a documentação de uso do AgentShield quando ela está embutida aqui. Problemas de código do AgentShield pertencem a <https://github.com/affaan-m/agentshield>

## Superfícies de Distribuição Oficiais

As superfícies oficiais do ECC são:

- repositório GitHub: <https://github.com/affaan-m/ECC>
- pacote npm: `ecc-universal`
- GitHub App: <https://github.com/apps/ecc-tools>
- slug de marketplace/plugin: `ecc@ecc`
- site: <https://ecc.tools>

Superfície oficial do AgentShield:

- pacote npm: `ecc-agentshield`
- repositório GitHub: <https://github.com/affaan-m/agentshield>

Os seguintes pacotes foram observados usando metadados do repositório ECC, mas **não são mantidos pela ECC**:

- `@chil_ntl/ecc-cli`
- `ecc-100xprompt-plugin`

Trate qualquer pacote não listado nas superfícies oficiais como não oficial até ser verificado. Não instale pacotes chamados `opencode-ecc`, `everything-claude-code` ou outros aliases parecidos com ECC, a menos que este repositório os documente explicitamente como oficiais.

O grafo de dependências do GitHub também pode mostrar aliases de módulo Go como `github.com/affaan-m/ecc` ou caminhos históricos do repositório. O ECC não é atualmente distribuído como um módulo Go suportado.

## Fora de Escopo

Os reportes geralmente estão fora de escopo quando apenas mostram:

- execução local de comandos em que o usuário já controla o shell local e nenhum limite de confiança de privilégio superior é cruzado
- capturas de tela, números de linha desatualizados ou reportes contra `affaan-m/everything-claude-code` que não se reproduzem no `affaan-m/ECC` atual
- self-XSS ou engenharia social sem caminho de exploit controlado pelo repositório
- confusão de grafo de dependências/metadados de pacote sem um caminho de instalação para um pacote oficial do ECC
- vulnerabilidades em pacotes de terceiros, a menos que o ECC os fixe, instale ou execute de uma forma que crie impacto adicional

Ferramentas locais de desenvolvedor ainda podem ser problemas de segurança válidos quando conteúdo de repositório não confiável, instalação de pacote, hooks gerados ou automação de CI podem disparar execução sem intenção clara do usuário. Demonstre esse limite de confiança no reporte.

## Regras de Cadeia de Suprimentos

O ECC trata a exposição da cadeia de suprimentos como uma superfície de segurança de primeira classe.

- O GitHub Actions deve usar SHAs de commit fixados para actions de terceiros.
- Os fluxos de trabalho devem evitar passar contexto não confiável do GitHub diretamente para blocos `run:` via shell.
- A documentação de release e instalação deve apontar apenas para pacotes oficiais.
- Os metadados do pacote devem apontar para `affaan-m/ECC`, não para caminhos históricos do repositório.
- Reportes privados de vulnerabilidade são triados de forma privada antes da divulgação pública.
- Avisos de segurança são publicados apenas quando uma release suportada é afetada e a divulgação coordenada é apropriada.

## Orientação Operacional

### Manuseio de Segredos

`mcp-configs/mcp-servers.json` é um **template**. Todos os valores `YOUR_*_HERE` devem ser substituídos no momento da instalação a partir de variáveis de ambiente ou de um gerenciador de segredos. Nunca faça commit de credenciais reais. Se um segredo for comitado acidentalmente, rotacione-o imediatamente e reescreva o histórico. Não confie em um simples revert.

A mesma regra se aplica à config de usuário do Claude Code (`~/.claude/settings.json` ou `%USERPROFILE%\.claude\settings.json`). Esse arquivo está fora deste repositório, mas é comumente compartilhado por meio da saída do `claude doctor`, capturas de tela e relatórios de bug. Não deixe PATs, chaves de API ou tokens OAuth hardcoded em blocos `mcpServers[*].env`. Resolva-os no momento do spawn a partir do keychain do SO ou de variáveis de ambiente que o seu servidor MCP já suporta.

Auditoria rápida:

```bash
# macOS / Linux
grep -EnH '(TOKEN|SECRET|KEY|PASSWORD)\s*"\s*:\s*"[A-Za-z0-9_-]{16,}"' ~/.claude/settings.json

# Windows PowerShell
Select-String -Path "$env:USERPROFILE\.claude\settings.json" -Pattern '(TOKEN|SECRET|KEY|PASSWORD)"\s*:\s*"[A-Za-z0-9_-]{16,}"'
```

Se a auditoria encontrar correspondências, rotacione o segredo no provedor emissor e então mova-o para fora do arquivo.

### Portas Locais de MCP

Alguns servidores MCP empacotados se conectam via HTTP simples a uma porta de localhost. Antes do primeiro uso, verifique o processo que está escutando:

```bash
# Windows
netstat -ano | findstr :18801

# macOS / Linux
lsof -iTCP:18801 -sTCP:LISTEN
```

Compare o PID com o binário esperado. Qualquer outro processo naquela porta pode interceptar o tráfego MCP.

## Triagem: blocos `<system-reminder>` suspeitos

O ECC roda dentro de harnesses de agente que podem injetar lembretes de sistema efêmeros do lado do cliente na entrada do modelo a cada turno. Esses blocos não são automaticamente payloads carregados pelo repositório.

Antes de tratar um deles como ataque, verifique:

1. O bloco está de fato em um arquivo dentro deste repositório?

   ```bash
   grep -rEn "system-reminder|NEVER mention|DO NOT mention" .
   ```

2. O bloco está armazenado na transcrição da sessão como parte de um resultado de ferramenta?
3. Ele é consistente com lembretes de cliente conhecidos, como cutucadas do TodoWrite, avisos de data ou avisos de arquivo modificado?

Escale para cima apenas quando o bloco estiver presente dentro de um resultado de ferramenta ou arquivo do repositório e não for atribuível ao arquivo, URL ou comando que foi de fato lido.

## Recursos de Segurança

- **AgentShield:** `npx ecc-agentshield scan`
- **Guia de Segurança:** [O Guia Resumido para Tudo sobre Segurança de Agentes](./the-security-guide.md)
- **Resposta a incidentes de cadeia de suprimentos:** [playbook de registro de pacotes npm/GitHub Actions](./docs/security/supply-chain-incident-response.md)
- **OWASP MCP Top 10:** <https://owasp.org/www-project-mcp-top-10/>
- **OWASP Agentic Applications Top 10:** <https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/>
