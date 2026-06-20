# Rascunho do anúncio de lançamento do ECC 1.10.1

O ECC 1.10.1 é o lançamento de estabilização que sucede o 1.10.0.

Este lançamento está focado na correção de instalação, clareza de nomenclatura entre superfícies, recuperação no Windows/PowerShell, correção da instalação de projeto no Cursor e compatibilidade de Hook com o Claude Code. Não é um lançamento com muitos recursos novos.

## O que entrou na passagem de estabilização
- As superfícies npm/pacote/lançamento estão alinhadas e `ecc-universal@1.10.0` está disponível no npm
- Regressões de localidade/caminho no Windows e de caminho de instalação no PowerShell corrigidas
- Regressão de tempestade de processos no Hook do Bash corrigida
- Compatibilidade de esquema de Hook do Claude Code 2.1.x corrigida
- Caminho de instalação nativo do projeto Cursor reparado:
  - `.cursor/hooks.json` agora inclui a superfície de esquema/versão obrigatória
  - `.cursor/mcp.json` é gravado no local nativo do projeto Cursor
- o continuous-learning-v2 agora aceita `claude-desktop` como um ponto de entrada válido
- O caminho de observação no Windows agora ignora `AppInstallerPythonRedirector.exe`
- A documentação agora distingue instalações de plugin de instalações manuais completas com mais clareza

## Para que serve o 1.10.1
- tornar as superfícies de instalação atuais previsíveis
- reduzir nomenclatura/orientação de instalação desatualizada
- fechar as regressões de acompanhamento do 1.10.0
- oferecer aos usuários um ponto de atualização estável em vez de consolidar correções espalhadas em issues e discussões

## Correções incluídas neste lançamento
- `#1543` Reparo do Hook nativo do projeto Cursor + instalação MCP
- `#1524` Mitigação de argv duplicado do Claude Code v2.1.116 em `settings.local.json`
- `#1522` continuous-learning-v2 aceita `claude-desktop` como ponto de entrada válido
- `#1511` O caminho de observação no Windows ignora `AppInstallerPythonRedirector.exe`
- `#1546` Correção do início rápido do plugin continuous-learning-v2
- `#1535` Acompanhamento do overflow do hero

## Esclarecimento importante de nomenclatura
- Identificador do marketplace/plugin Claude: `everything-claude-code@everything-claude-code`
- Pacote npm: `ecc-universal`
- Repositório GitHub: `affaan-m/everything-claude-code`

Essas são superfícies intencionalmente diferentes. O identificador do plugin segue as regras do marketplace da Anthropic; o pacote npm permanece como `ecc-universal`.

## Ainda sendo monitorado
Este deve ser anunciado como um lançamento de estabilização, não como "todos os casos extremos estão resolvidos."

Ainda estamos acompanhando:
- casos extremos específicos de SO em macOS, Windows, Linux
- diferenças de comportamento específicas de shell
- incompatibilidades de caminho de instalação entre o Cursor e o plugin Claude que só aparecem em instalações antigas ou mistas
- relatórios de compatibilidade de nome de ferramenta/provedor de terceiros que ainda precisam de reprodução no main atual

Exemplos da lista de acompanhamento atual:
- `#1520` provavelmente obsoleto a menos que a reprodução reapareça no instalador atual
- `#1516` não está bloqueando a menos que seja reproduzido no `main` atual
- `#1484` permanece como um item de acompanhamento/umbrella do Windows em vez de um bloqueador ativo de lançamento

## Orientação de atualização recomendada
Se você encontrar problemas de instalação/tempo de execução no 1.10.0:
1. atualize para a superfície de pacote/plugin mais recente
2. evite misturar instalação de plugin com cópia manual completa do repositório a menos que a documentação diga explicitamente para fazer isso
3. se os problemas persistirem, reporte:
   - SO + shell
   - versão do Claude Code/Cursor
   - método de instalação utilizado
   - stderr/saída exata
   - se o problema é na instalação do plugin, instalação npm, sincronização do repositório ou instalação do projeto Cursor
