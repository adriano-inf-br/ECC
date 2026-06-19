---
paths:
  - "**/*.pl"
  - "**/*.pm"
  - "**/*.t"
  - "**/*.psgi"
  - "**/*.cgi"
---
# Padrões do Perl

> Este arquivo estende [common/patterns.md](../common/patterns.md) com conteúdo específico de Perl.

## Padrão de Repositório

Use **DBI** ou **DBIx::Class** por trás de uma interface:

```perl
package MyApp::Repo::User;
use Moo;

has dbh => (is => 'ro', required => 1);

sub find_by_id ($self, $id) {
    my $sth = $self->dbh->prepare('SELECT * FROM users WHERE id = ?');
    $sth->execute($id);
    return $sth->fetchrow_hashref;
}
```

## DTOs / Objetos de Valor

Use classes **Moo** com **Types::Standard** (equivalente às dataclasses do Python):

```perl
package MyApp::DTO::User;
use Moo;
use Types::Standard qw(Str Int);

has name  => (is => 'ro', isa => Str, required => 1);
has email => (is => 'ro', isa => Str, required => 1);
has age   => (is => 'ro', isa => Int);
```

## Gerenciamento de Recursos

- Sempre use **open de três argumentos** com `autodie`
- Use **Path::Tiny** para operações de arquivo

```perl
use autodie;
use Path::Tiny;

my $content = path('config.json')->slurp_utf8;
```

## Interface de Módulo

Use `Exporter 'import'` com `@EXPORT_OK` — nunca `@EXPORT`:

```perl
use Exporter 'import';
our @EXPORT_OK = qw(parse_config validate_input);
```

## Gerenciamento de Dependências

Use **cpanfile** + **carton** para instalações reproduzíveis:

```bash
carton install
carton exec prove -lr t/
```

## Referência

Veja a skill: `perl-patterns` para padrões e idiomas modernos abrangentes de Perl.
