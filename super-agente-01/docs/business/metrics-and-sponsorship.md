# Playbook de Métricas e Patrocínio

Este arquivo é um roteiro prático para chamadas com patrocinadores e revisões com parceiros
do ecossistema.

## O Que Rastrear

Use quatro categorias em cada atualização:

1. **Distribuição** — pacotes npm e instalações do GitHub App
2. **Adoção** — estrelas, forks, contribuidores, cadência de release
3. **Superfície do produto** — comandos/skills/agentes e suporte multiplataforma
4. **Confiabilidade** — contagens de testes aprovados e tempo de resposta a bugs em produção

## Obter Métricas ao Vivo

### Downloads npm

```bash
# Downloads semanais
curl -s https://api.npmjs.org/downloads/point/last-week/ecc-universal
curl -s https://api.npmjs.org/downloads/point/last-week/ecc-agentshield

# Últimos 30 dias
curl -s https://api.npmjs.org/downloads/point/last-month/ecc-universal
curl -s https://api.npmjs.org/downloads/point/last-month/ecc-agentshield
```

### Adoção do repositório GitHub

```bash
gh api repos/affaan-m/ECC \
  --jq '{stars:.stargazers_count,forks:.forks_count,contributors_url:.contributors_url,open_issues:.open_issues_count}'
```

### Tráfego do GitHub (acesso de mantenedor necessário)

```bash
gh api repos/affaan-m/ECC/traffic/views
gh api repos/affaan-m/ECC/traffic/clones
```

### Instalações do GitHub App

A contagem de instalações do GitHub App é atualmente mais confiável no painel do
Marketplace/App. Use o valor mais recente de:

- [ECC Tools Marketplace](https://github.com/marketplace/ecc-tools)

## O Que Não Pode Ser Medido Publicamente (ainda)

- As contagens de instalação/download do plugin do Claude não estão atualmente expostas
  via uma API pública.
- Para conversas com parceiros, use métricas npm + instalações do GitHub App + tráfego do
  repositório como o pacote proxy.

## Empacotamento Sugerido para Patrocinadores

Use estes como pontos de partida na negociação:

- **Parceiro Piloto:** `$200/mês`
  - Ideal para primeira validação de parceria e atualizações mensais simples de patrocinador.
- **Parceiro de Crescimento:** `$500/mês`
  - Inclui check-ins de roadmap e loop de feedback de implementação.
- **Parceiro Estratégico:** `$1.000+/mês`
  - Colaboração multi-toque, suporte ao lançamento e alinhamento operacional mais profundo.

## Roteiro de 60 Segundos

Use isto em chamadas:

> O ECC agora está posicionado como um sistema de desempenho de harness de agentes, não um
> repositório de configuração. Rastreamos a adoção por meio da distribuição npm, instalações
> do GitHub App e crescimento do repositório. As instalações de plugins do Claude são
> estruturalmente subestimadas publicamente, por isso usamos um modelo de métricas misto.
> O projeto suporta Claude Code, Cursor, OpenCode e Codex app/CLI com confiabilidade de
> hook de nível produção e um conjunto extenso de testes aprovados.

Para trechos de texto de lançamento em redes sociais prontos para uso, veja [`social-launch-copy.md`](./social-launch-copy.md).
