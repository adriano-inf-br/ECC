---
name: security-bounty-hunter
description: Caça vulnerabilidades exploráveis e elegíveis para recompensa em repositórios. Foca em vulnerabilidades remotamente alcançáveis que qualificam para relatórios reais, em vez de achados locais com muito ruído.
metadata:
  origin: ECC direct-port adaptation
version: "1.0.0"
---

# Security Bounty Hunter

Use este skill quando o objetivo é a descoberta prática de vulnerabilidades para divulgação responsável ou envio de bounty, e não uma revisão ampla de boas práticas.

## Quando Usar

- Escanear um repositório em busca de vulnerabilidades exploráveis
- Preparar uma submissão para Huntr, HackerOne ou plataforma de bounty similar
- Triagem onde a pergunta é "isso realmente compensa?" em vez de "isso é teoricamente inseguro?"

## Como Funciona

Priorize caminhos de ataque remotamente alcançáveis e controlados pelo usuário, e descarte padrões que as plataformas rotineiramente rejeitam como informativos ou fora de escopo.

## Padrões Em Escopo

Estes são os tipos de problemas que consistentemente importam:

| Padrão | CWE | Impacto típico |
| --- | --- | --- |
| SSRF via URLs controladas pelo usuário | CWE-918 | acesso à rede interna, roubo de metadados de cloud |
| Bypass de autenticação em middleware ou guardas de API | CWE-287 | acesso não autorizado a contas ou dados |
| Caminhos remotos de desserialização ou upload para RCE | CWE-502 | execução de código |
| SQL injection em endpoints alcançáveis | CWE-89 | exfiltração de dados, bypass de autenticação, destruição de dados |
| Command injection em handlers de requisição | CWE-78 | execução de código |
| Path traversal em caminhos de servimento de arquivos | CWE-22 | leitura ou escrita arbitrária de arquivos |
| XSS acionado automaticamente | CWE-79 | roubo de sessão, comprometimento de admin |

## Pular Estes

Estes geralmente têm baixo sinal ou estão fora do escopo de bounty, a menos que o programa diga o contrário:

- `pickle.loads`, `torch.load` ou equivalente somente local sem caminho remoto
- `eval()` ou `exec()` em tooling apenas de CLI
- `shell=True` em comandos completamente hardcoded
- Cabeçalhos de segurança ausentes por si só
- Reclamações genéricas de rate limiting sem impacto de exploit
- Self-XSS que exige que a vítima cole código manualmente
- CI/CD injection que não faz parte do escopo do programa alvo
- Código de demo, exemplo ou apenas de testes

## Fluxo de Trabalho

1. Verifique o escopo primeiro: regras do programa, SECURITY.md, canal de divulgação e exclusões.
2. Encontre entrypoints reais: handlers HTTP, uploads, jobs em background, webhooks, parsers e endpoints de integração.
3. Execute tooling estático onde ajudar, mas trate como entrada de triagem apenas.
4. Leia o caminho de código real de ponta a ponta.
5. Prove que o controle do usuário alcança um sink significativo.
6. Confirme a exploitabilidade e o impacto com o menor PoC seguro possível.
7. Verifique duplicatas antes de elaborar um relatório.

## Exemplo de Loop de Triagem

```bash
semgrep --config=auto --severity=ERROR --severity=WARNING --json
```

Em seguida, filtre manualmente:

- descarte testes, demos, fixtures, código vendorizado
- descarte caminhos apenas locais ou não alcançáveis
- mantenha apenas achados com uma rota clara de rede ou controlada pelo usuário

## Estrutura do Relatório

```markdown
## Descrição
[O que é a vulnerabilidade e por que ela importa]

## Código Vulnerável
[Caminho do arquivo, intervalo de linhas e um pequeno trecho]

## Prova de Conceito
[Requisição ou script mínimo funcional]

## Impacto
[O que o atacante pode alcançar]

## Versão Afetada
[Versão, commit ou alvo de implantação testado]
```

## Critério de Qualidade

Antes de enviar:

- O caminho de código é alcançável a partir de um usuário real ou fronteira de rede
- A entrada é genuinamente controlada pelo usuário
- O sink é significativo e explorável
- O PoC funciona
- O problema ainda não está coberto por um advisory, CVE ou ticket aberto
- O alvo está realmente em escopo para o programa de bounty
