# Padrões Comuns

## Projetos Esqueleto

Ao implementar uma nova funcionalidade:
1. Procure por projetos esqueleto testados em campo
2. Use agents paralelos para avaliar as opções:
   - Avaliação de segurança
   - Análise de extensibilidade
   - Pontuação de relevância
   - Planejamento de implementação
3. Clone a melhor correspondência como base
4. Itere dentro de uma estrutura comprovada

## Padrões de Projeto

### Padrão Repositório

Encapsule o acesso a dados por trás de uma interface consistente:
- Defina operações padrão: findAll, findById, create, update, delete
- Implementações concretas tratam os detalhes de armazenamento (banco de dados, API, arquivo, etc.)
- A lógica de negócio depende da interface abstrata, não do mecanismo de armazenamento
- Permite a troca fácil de fontes de dados e simplifica os testes com mocks

### Formato de Resposta da API

Use um envelope consistente para todas as respostas da API:
- Inclua um indicador de sucesso/status
- Inclua o payload de dados (anulável em caso de erro)
- Inclua um campo de mensagem de erro (anulável em caso de sucesso)
- Inclua metadados para respostas paginadas (total, page, limit)
