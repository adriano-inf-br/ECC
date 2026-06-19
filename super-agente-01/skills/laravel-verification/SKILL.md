---
name: laravel-verification
description: "Loop de verificação para projetos Laravel: verificações de ambiente, linting, análise estática, testes com cobertura, varreduras de segurança e prontidão para deploy."
metadata:
  origin: ECC
---

# Loop de Verificação Laravel

Execute antes de PRs, após grandes mudanças e antes do deploy.

## Quando Usar

- Antes de abrir um pull request para um projeto Laravel
- Após grandes refatorações ou atualizações de dependências
- Verificação pré-deploy para staging ou produção
- Executar o pipeline completo de lint -> teste -> segurança -> prontidão para deploy

## Como Funciona

- Execute as fases sequencialmente, desde as verificações de ambiente até a prontidão para deploy, para que cada camada se construa sobre a anterior.
- As verificações de ambiente e Composer bloqueiam tudo mais; pare imediatamente se falharem.
- Linting/análise estática deve estar limpo antes de executar testes completos e cobertura.
- Revisões de segurança e migration acontecem após os testes para que você verifique o comportamento antes das etapas de dados ou release.
- A prontidão de build/deploy e as verificações de fila/scheduler são os portões finais; qualquer falha bloqueia o release.

## Fase 1: Verificações de Ambiente

```bash
php -v
composer --version
php artisan --version
```

- Verifique se `.env` está presente e as chaves obrigatórias existem
- Confirme `APP_DEBUG=false` para ambientes de produção
- Confirme que `APP_ENV` corresponde ao deploy alvo (`production`, `staging`)

Se estiver usando Laravel Sail localmente:

```bash
./vendor/bin/sail php -v
./vendor/bin/sail artisan --version
```

## Fase 1.5: Composer e Autoload

```bash
composer validate
composer dump-autoload -o
```

## Fase 2: Linting e Análise Estática

```bash
vendor/bin/pint --test
vendor/bin/phpstan analyse
```

Se o projeto usar Psalm em vez do PHPStan:

```bash
vendor/bin/psalm
```

## Fase 3: Testes e Cobertura

```bash
php artisan test
```

Cobertura (CI):

```bash
XDEBUG_MODE=coverage php artisan test --coverage
```

Exemplo de CI (formatação -> análise estática -> testes):

```bash
vendor/bin/pint --test
vendor/bin/phpstan analyse
XDEBUG_MODE=coverage php artisan test --coverage
```

## Fase 4: Verificações de Segurança e Dependências

```bash
composer audit
```

## Fase 5: Banco de Dados e Migrations

```bash
php artisan migrate --pretend
php artisan migrate:status
```

- Revise migrations destrutivas com cuidado
- Garanta que os nomes de arquivo de migration sigam `Y_m_d_His_*` (ex.: `2025_03_14_154210_create_orders_table.php`) e descrevam a mudança claramente
- Garanta que rollbacks sejam possíveis
- Verifique os métodos `down()` e evite perda irreversível de dados sem backups explícitos

## Fase 6: Prontidão de Build e Deploy

```bash
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

- Garanta que os warmups de cache funcionem na configuração de produção
- Verifique se workers de fila e o scheduler estão configurados
- Confirme que `storage/` e `bootstrap/cache/` são graváveis no ambiente alvo

## Fase 7: Verificações de Fila e Scheduler

```bash
php artisan schedule:list
php artisan queue:failed
```

Se o Horizon for usado:

```bash
php artisan horizon:status
```

Se `queue:monitor` estiver disponível, use-o para verificar o backlog sem processar jobs:

```bash
php artisan queue:monitor default --max=100
```

Verificação ativa (somente staging): despache um job no-op para uma fila dedicada e execute um único worker para processá-lo (garanta que uma conexão de fila não-`sync` esteja configurada).

```bash
php artisan tinker --execute="dispatch((new App\\Jobs\\QueueHealthcheck())->onQueue('healthcheck'))"
php artisan queue:work --once --queue=healthcheck
```

Verifique se o job produziu o efeito colateral esperado (entrada de log, linha na tabela de healthcheck ou métrica).

Execute isso apenas em ambientes não produtivos onde processar um job de teste é seguro.

## Exemplos

Fluxo mínimo:

```bash
php -v
composer --version
php artisan --version
composer validate
vendor/bin/pint --test
vendor/bin/phpstan analyse
php artisan test
composer audit
php artisan migrate --pretend
php artisan config:cache
php artisan queue:failed
```

Pipeline estilo CI:

```bash
composer validate
composer dump-autoload -o
vendor/bin/pint --test
vendor/bin/phpstan analyse
XDEBUG_MODE=coverage php artisan test --coverage
composer audit
php artisan migrate --pretend
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan schedule:list
```
