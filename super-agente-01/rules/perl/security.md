---
paths:
  - "**/*.pl"
  - "**/*.pm"
  - "**/*.t"
  - "**/*.psgi"
  - "**/*.cgi"
---
# Segurança do Perl

> Este arquivo estende [common/security.md](../common/security.md) com conteúdo específico de Perl.

## Taint Mode

- Use a flag `-T` em todos os scripts CGI/voltados para a web
- Sanitize `%ENV` (`$ENV{PATH}`, `$ENV{CDPATH}`, etc.) antes de qualquer comando externo

## Validação de Entrada

- Use regex de allowlist para "untainting" — nunca `/(.*)/s`
- Valide toda entrada do usuário com padrões explícitos:

```perl
if ($input =~ /\A([a-zA-Z0-9_-]+)\z/) {
    my $clean = $1;
}
```

## I/O de Arquivo

- **Apenas open de três argumentos** — nunca open de dois argumentos
- Previna travessia de caminho (path traversal) com `Cwd::realpath`:

```perl
use Cwd 'realpath';
my $safe_path = realpath($user_path);
die "Path traversal" unless $safe_path =~ m{\A/allowed/directory/};
```

## Execução de Processos

- Use **`system()` na forma de lista** — nunca a forma de string única
- Use **IPC::Run3** para capturar a saída
- Nunca use crases (backticks) com interpolação de variáveis

```perl
system('grep', '-r', $pattern, $directory);  # seguro
```

## Prevenção de Injeção SQL

Sempre use placeholders do DBI — nunca interpole dentro do SQL:

```perl
my $sth = $dbh->prepare('SELECT * FROM users WHERE email = ?');
$sth->execute($email);
```

## Varredura de Segurança

Execute **perlcritic** com o tema de segurança na severidade 4+:

```bash
perlcritic --severity 4 --theme security lib/
```

## Referência

Veja a skill: `perl-security` para padrões abrangentes de segurança em Perl, taint mode e I/O seguro.
