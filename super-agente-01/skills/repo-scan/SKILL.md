---
name: repo-scan
description: Auditoria de ativos de código-fonte cross-stack — classifica cada arquivo, detecta bibliotecas de terceiros embutidas e entrega veredictos acionáveis de quatro níveis por módulo com relatórios HTML interativos.
metadata:
  origin: community
---

# repo-scan

> Cada ecossistema tem seu próprio gerenciador de dependências, mas nenhuma ferramenta olha através de C++, Android, iOS e Web para dizer: quanto código é realmente seu, o que é de terceiros e o que é peso morto.

## Quando Usar

- Assumindo uma grande base de código legada e precisando de uma visão geral estrutural
- Antes de grandes refatorações — identifique o que é central, o que é duplicado, o que está morto
- Auditando dependências de terceiros embutidas diretamente no código-fonte (não declaradas nos gerenciadores de pacotes)
- Preparando registros de decisão de arquitetura para reorganização de monorepo

## Instalação

```bash
# Busque apenas o commit fixado para reprodutibilidade
mkdir -p ~/.claude/skills/repo-scan
git init repo-scan
cd repo-scan
git remote add origin https://github.com/haibindev/repo-scan.git
git fetch --depth 1 origin 2742664
git checkout --detach FETCH_HEAD
cp -r . ~/.claude/skills/repo-scan
```

> Revise o código-fonte antes de instalar qualquer skill de agent.

## Capacidades Principais

| Capacidade | Descrição |
|---|---|
| **Varredura cross-stack** | C/C++, Java/Android, iOS (OC/Swift), Web (TS/JS/Vue) em uma única passagem |
| **Classificação de arquivos** | Cada arquivo rotulado como código do projeto, de terceiros ou artefato de build |
| **Detecção de bibliotecas** | 50+ bibliotecas conhecidas (FFmpeg, Boost, OpenSSL…) com extração de versão |
| **Veredictos de quatro níveis** | Core Asset / Extrair & Mesclar / Reconstruir / Deprecar |
| **Relatórios HTML** | Páginas interativas com tema escuro e navegação drill-down |
| **Suporte a monorepo** | Varredura hierárquica com resumo + relatórios de sub-projetos |

## Níveis de Profundidade de Análise

| Nível | Arquivos Lidos | Caso de Uso |
|---|---|---|
| `fast` | 1-2 por módulo | Inventário rápido de diretórios enormes |
| `standard` | 2-5 por módulo | Auditoria padrão com verificações completas de dependência + arquitetura |
| `deep` | 5-10 por módulo | Adiciona segurança de thread, gerenciamento de memória, consistência de API |
| `full` | Todos os arquivos | Revisão abrangente pré-merge |

## Como Funciona

1. **Classifique a superfície do repositório**: enumere os arquivos, depois rotule cada um como código do projeto, código de terceiros embutido ou artefato de build.
2. **Detecte bibliotecas embutidas**: inspecione nomes de diretórios, cabeçalhos, arquivos de licença e marcadores de versão para identificar dependências empacotadas e prováveis versões.
3. **Pontue cada módulo**: agrupe arquivos por módulo ou subsistema, depois atribua um dos quatro veredictos com base em propriedade, duplicação e custo de manutenção.
4. **Destaque riscos estruturais**: aponte artefatos de peso morto, wrappers duplicados, código vendored desatualizado e módulos que devem ser extraídos, reconstruídos ou deprecados.
5. **Produza o relatório**: retorne um resumo conciso mais a saída HTML interativa com drill-down por módulo para que a auditoria possa ser revisada assincronamente.

## Exemplos

Em um monorepo C++ de 50.000 arquivos:
- Encontrou FFmpeg 2.x (vintage de 2015) ainda em produção
- Descobriu o mesmo wrapper de SDK duplicado 3 vezes
- Identificou 636 MB de artefatos de build Debug/ipch/obj commitados
- Classificado: 3 MB de código do projeto vs 596 MB de terceiros

## Boas Práticas

- Comece com profundidade `standard` para primeiras auditorias
- Use `fast` para monorepos com 100+ módulos para obter um inventário rápido
- Execute `deep` incrementalmente em módulos sinalizados para refatoração
- Revise a análise cross-módulo para detecção de duplicatas entre sub-projetos

## Links

- [Repositório GitHub](https://github.com/haibindev/repo-scan)
