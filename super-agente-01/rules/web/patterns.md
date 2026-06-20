> Este arquivo estende [common/patterns.md](../common/patterns.md) com padrões específicos de web.

# Padrões Web

## Composição de Componentes

### Compound Components

Use compound components quando uma UI relacionada compartilha estado e semântica de interação:

```tsx
<Tabs defaultValue="overview">
  <Tabs.List>
    <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
    <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="overview">...</Tabs.Content>
  <Tabs.Content value="settings">...</Tabs.Content>
</Tabs>
```

- O pai é dono do estado
- Os filhos consomem via context
- Prefira isto a prop drilling para widgets complexos

### Render Props / Slots

- Use padrões de render props ou slots quando o comportamento é compartilhado mas a marcação precisa variar
- Mantenha o tratamento de teclado, ARIA e lógica de focus na camada headless

### Separação Container / Apresentacional

- Componentes container são donos do carregamento de dados e dos efeitos colaterais
- Componentes apresentacionais recebem props e renderizam a UI
- Componentes apresentacionais devem permanecer puros

## Gerenciamento de Estado

Trate estes separadamente:

| Aspecto | Tooling |
|---------|---------|
| Estado de servidor | TanStack Query, SWR, tRPC |
| Estado de cliente | Zustand, Jotai, signals |
| Estado de URL | search params, segmentos de rota |
| Estado de formulário | React Hook Form ou equivalente |

- Não duplique o estado de servidor em stores de cliente
- Derive valores em vez de armazenar estado computado redundante

## URL Como Estado

Persista na URL o estado compartilhável:
- filtros
- ordem de classificação
- paginação
- aba ativa
- query de busca

## Busca de Dados

### Stale-While-Revalidate

- Retorne dados em cache imediatamente
- Revalide em segundo plano
- Prefira bibliotecas existentes em vez de implementar isto manualmente

### Atualizações Otimistas

- Faça snapshot do estado atual
- Aplique a atualização otimista
- Reverta em caso de falha
- Emita feedback de erro visível ao reverter

### Carregamento Paralelo

- Busque dados independentes em paralelo
- Evite cascatas de requisições pai-filho
- Faça prefetch de rotas ou estados prováveis seguintes quando justificado
