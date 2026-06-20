# Loop de Valor da Plataforma ECC

O ECC 2.0 está migrando de uma camada de harness portátil para um sistema de operador
completo. A direção do produto tem três camadas:

1. Meta-harness: skills portáteis, regras, hooks, convenções MCP, gates de release,
   evals e evidências de segurança.
2. Agente ECC dedicado: um agente que opera diretamente sobre ativos ECC em vez de apenas
   lê-los como instruções estáticas.
3. Painel de controle / IDE agêntico: uma superfície de operador visível para sessões, filas,
   skills, memória, evidências, releases e fluxos de trabalho de equipe.

O painel de controle ainda é uma direção de release-candidate até ser respaldado por uma
demonstração reproduzível. A afirmação pública é:

```text
O ECC pode ser usado em pilha completa como um meta-harness + agente + painel de controle, ou
seletivamente como a camada de harness portátil dentro das ferramentas de codificação de IA
que as equipes já usam.
```

## Tese da Plataforma OSS

O antigo playbook de infraestrutura open-source era primeiro a distribuição: código-fonte
gratuito e acesso self-serve generoso criaram o vocabulário padrão do desenvolvedor, e então
infraestrutura hospedada, equipes gerenciadas, suporte e recursos empresariais capturaram
valor. Bancos de dados, plataformas de aplicativos e plataformas de borda tornaram isso óbvio:
desenvolvedores adotaram a superfície gratuita, equipes padronizaram na marca e o produto
pago tornou o fluxo de trabalho mais fácil de executar em escala.

A infraestrutura de agentes de IA deve seguir o mesmo padrão, mas o valor hospedado não é
apenas implantação. A superfície paga ou gerenciada é:

- memória de equipe e roteamento de sessão;
- filas observáveis, handoffs e execuções de agentes;
- evals gerenciados, gates de release e pacotes de evidências;
- revisão de segurança, descobertas da cadeia de suprimentos e aplicação de políticas;
- cobrança, direito, patrocinador e fluxos de trabalho de parceiros;
- integrações específicas de produto que podem se tornar skills ECC reutilizáveis.

O repositório aberto permanece útil por conta própria. A plataforma ganha valor quando
equipes sérias querem os mesmos fluxos de trabalho gerenciados, medidos, protegidos ou
conectados aos seus próprios produtos.

## Contrato de Integração de Produto

Produtos externos podem ser construídos sobre o ECC sem se tornarem produtos com a marca ECC.
O contrato é:

| Camada | O produto contribui | O ECC recebe |
| --- | --- | --- |
| Pacote de skills | Fluxos de trabalho públicos e não secretos em `skills/*/SKILL.md` | Novo comportamento de agente reutilizável e superfície de instalação |
| API controlada | Credenciais opcionais do produto como `PRODUCT_API_KEY` | Um caminho claro de upgrade/solicitação sem vazar segredos |
| Fixtures e documentação | Exemplos higienizados, sem contas privadas ou chaves ao vivo | Prova pública testável em vez de afirmações |
| Evals e gates de risco | Limites de conselho, segurança, dados e execução | Disciplina de release reutilizável e superfície de confiança |
| Estudo de caso | Um fluxo de trabalho de produto real que funciona pelo ECC | Distribuição, patrocinadores, interesse Pro, demanda de consultoria |

Cada integração precisa de:

- um fluxo de trabalho público que funcione sem credenciais privadas;
- um caminho controlado separado para dados ou ações de produto ao vivo;
- um limite de negócio claro para que cobrança e propriedade não sejam confundidas;
- testes ou comandos documentados que provem a superfície de integração;
- uma rota de suporte que não exija segredos públicos ou dados de conta privados.

## Exemplo Ito

Ito é um produto separado de cesta de mercado de previsão. O ECC ainda pode distribuir
skills em formato Ito porque os fluxos de trabalho de skill são úteis sem tornar o ECC
Tools um produto Ito.

A superfície pública segura é:

- pesquisar contexto de mercado, subjacente, local e liquidez;
- comparar cestas com as próprias notas do usuário, restrições de portfólio ou tese;
- rascunhar planilhas de planejamento de negociação não consultivas para revisão manual;
- visualizar relacionamentos de mercado/conceito e saídas de backtesting quando os dados
  estiverem disponíveis;
- usar sinais de mercado de previsão como uma entrada em pesquisa de agente mais ampla.

A superfície controlada é:

- dados de cesta Ito ao vivo;
- estado específico da conta;
- backtesting ou visualização suportados por API;
- qualquer fluxo de trabalho que exija `ITO_API_KEY`.

O limite é estrito: as skills públicas do ECC não realizam negociações, não fornecem
aconselhamento de investimento, não expõem estratégia privada e não mesclam a cobrança do
ECC Tools com a cobrança do Ito.

## Loop de Valor

O loop da plataforma deve ser explícito:

1. Uma equipe de produto constrói um fluxo de trabalho útil como um pacote de skills ECC.
2. O pacote de skills público funciona com fontes públicas ou dados locais fornecidos pelo usuário.
3. Usuários sérios solicitam acesso controlado a dados de produto ao vivo ou recursos hospedados.
4. O uso do produto produz novos padrões de operador, modos de falha e exemplos.
5. Padrões higienizados se tornam skills ECC melhores, evals, gates ou documentação.
6. O ECC ganha distribuição, mantenedores, patrocinadores, interesse Pro e leads de consultoria.
7. O produto ganha adoção porque usuários de agentes podem operá-lo por meio de um
   harness já instalado.

Isso é diferente de consultoria empresarial isolada. A consultoria pode financiar o trabalho,
mas o objetivo da plataforma é distribuição repetível: cada integração de produto útil se
torna mais um motivo para instalar o ECC, e cada usuário sério do ECC se torna um possível
patrocinador, usuário Pro, parceiro ou cliente de integração.

## Rota de Release

Manter as afirmações de release separadas:

- `1.10.1`: patch de confiabilidade estável e documentação para usuários lançados.
- `1.11.0`: momentum do catálogo de fluxo de trabalho OSS público que não requer que o
  painel de controle seja GA.
- `2.0.0-rc.x`: trabalho de painel de controle, agente dedicado, plataforma e evidências
  de release enquanto o sistema de operador completo permanece em pré-release.

Não anunciar paridade de grau ORCA/CONDUCTOR, cobrança no marketplace, listagem oficial no
diretório de plugins, negociações ao vivo ou prontidão para pagamentos nativos sem evidências
frescas e aprovação do proprietário.
