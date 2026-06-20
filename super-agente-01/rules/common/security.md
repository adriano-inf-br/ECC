# Diretrizes de Segurança

## Verificações de Segurança Obrigatórias

Antes de QUALQUER commit:
- [ ] Nenhum segredo embutido no código (chaves de API, senhas, tokens)
- [ ] Todas as entradas do usuário validadas
- [ ] Prevenção de injeção SQL (consultas parametrizadas)
- [ ] Prevenção de XSS (HTML sanitizado)
- [ ] Proteção CSRF habilitada
- [ ] Autenticação/autorização verificadas
- [ ] Rate limiting em todos os endpoints
- [ ] Mensagens de erro não vazam dados sensíveis

## Gerenciamento de Segredos

- NUNCA embuta segredos no código-fonte
- SEMPRE use variáveis de ambiente ou um gerenciador de segredos
- Valide que os segredos necessários estão presentes na inicialização
- Faça a rotação de quaisquer segredos que possam ter sido expostos

## Protocolo de Resposta de Segurança

Se um problema de segurança for encontrado:
1. PARE imediatamente
2. Use o agent **security-reviewer**
3. Corrija os problemas CRITICAL antes de continuar
4. Faça a rotação de quaisquer segredos expostos
5. Revise todo o código em busca de problemas semelhantes
