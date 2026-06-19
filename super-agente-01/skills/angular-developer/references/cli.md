# Guia do Angular CLI para Agents

O Angular CLI (`ng`) é a principal ferramenta para gerenciar um workspace Angular. Sempre prefira comandos da CLI em vez de criação manual de arquivos ou comandos `npm` genéricos ao modificar a estrutura do projeto ou adicionar dependências específicas do Angular.

## 1. Gerenciando Dependências

**SEMPRE use `ng add` para bibliotecas Angular** em vez de `npm install`. O `ng add` instala o pacote E executa os schematics de inicialização (ex.: configurar o `angular.json`, atualizar os providers raiz).

```bash
ng add @angular/material
ng add tailwindcss
ng add @angular/fire
```

Para atualizar a aplicação e suas dependências (o que executa automaticamente as migrações de código):

```bash
ng update @angular/core@<latest or specific version> @angular/cli<latest or specific version>
```

## 2. Gerando Código (`ng generate` ou `ng g`)

Sempre use a CLI para gerar código a fim de garantir que ele siga os padrões do Angular e atualize automaticamente os arquivos de configuração necessários.

| Alvo         | Comando               | Notas                                                                                          |
| :----------- | :-------------------- | :--------------------------------------------------------------------------------------------- |
| Component    | `ng g c path/to/name` | Gera um componente. Use `--inline-style` (`-s`) ou `--inline-template` (`-t`) se solicitado.   |
| Service      | `ng g s path/to/name` | Gera um serviço `@Injectable({providedIn: 'root'})`.                                           |
| Directive    | `ng g d path/to/name` | Gera uma diretiva.                                                                             |
| Pipe         | `ng g p path/to/name` | Gera um pipe.                                                                                  |
| Guard        | `ng g g path/to/name` | Gera um route guard funcional.                                                                |
| Environments | `ng g environments`   | Faz scaffold de `src/environments/` e atualiza o `angular.json` com substituições de arquivos. |

_Nota: Não há comando para gerar uma única definição de rota. Gere um componente e depois adicione-o manualmente ao array `Routes` em `app.routes.ts`._

## 3. Servidor de Desenvolvimento e Proxy

Inicie o servidor de desenvolvimento local com hot-module replacement (HMR):

```bash
ng serve
```

### Proxy de API de Backend

Para fazer proxy de requisições de API durante o desenvolvimento (ex.: redirecionar `/api` para um servidor Node local):

1. Crie `src/proxy.conf.json`:
   ```json
   {
     "/api/**": {"target": "http://localhost:3000", "secure": false}
   }
   ```
2. Atualize o `angular.json` no target `serve`:
   ```json
   "serve": {
     "builder": "@angular/build:dev-server",
     "options": { "proxyConfig": "src/proxy.conf.json" }
   }
   ```

## 4. Fazendo o Build da Aplicação

Compile a aplicação em um diretório de saída (padrão: `dist/<project-name>/browser`). O Angular moderno usa o builder `@angular/build:application` (baseado em esbuild).

```bash
ng build
```

- `ng build` usa por padrão a configuração de produção, que habilita compilação Ahead-of-Time (AOT), minificação e tree-shaking.
- Direcione configurações específicas definidas no `angular.json` usando `--configuration`: `ng build --configuration=staging`.

## 5. Testes

- **Testes Unitários**: Execute `ng test` para rodar os testes unitários via test runner configurado (ex.: Karma ou Vitest).
- **End-to-End (E2E)**: Execute `ng e2e`. Se nenhum framework de E2E estiver configurado, a CLI solicitará a instalação de um (Cypress, Playwright, Puppeteer, etc.).

## 6. Deploy

Para fazer deploy de uma aplicação, você deve primeiro adicionar um builder de deploy e depois executar o comando de deploy:

```bash
# Exemplo para Firebase
ng add @angular/fire
ng deploy
```
