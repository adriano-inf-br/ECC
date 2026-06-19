---
name: perl-patterns
description: Idiomas modernos do Perl 5.36+, boas práticas e convenções para construir aplicações Perl robustas e de fácil manutenção.
metadata:
  origin: ECC
---

# Padrões Modernos de Desenvolvimento em Perl

Padrões idiomáticos do Perl 5.36+ e boas práticas para construir aplicações robustas e de fácil manutenção.

## Quando Ativar

- Escrevendo código Perl novo ou módulos
- Revisando código Perl quanto à conformidade com idiomas
- Refatorando código Perl legado para padrões modernos
- Projetando arquitetura de módulos Perl
- Migrando código pré-5.36 para Perl moderno

## Como Funciona

Aplique estes padrões como uma tendência para os padrões modernos do Perl 5.36+: assinaturas, módulos explícitos, tratamento de erros focado e fronteiras testáveis. Os exemplos abaixo servem como pontos de partida para serem copiados e ajustados para a aplicação, pilha de dependências e modelo de implantação reais.

## Princípios Fundamentais

### 1. Use o Pragma `v5.36`

Um único `use v5.36` substitui o antigo boilerplate e habilita strict, warnings e assinaturas de sub-rotinas.

```perl
# Bom: Preâmbulo moderno
use v5.36;

sub greet($name) {
    say "Hello, $name!";
}

# Ruim: Boilerplate legado
use strict;
use warnings;
use feature 'say', 'signatures';
no warnings 'experimental::signatures';

sub greet {
    my ($name) = @_;
    say "Hello, $name!";
}
```

### 2. Assinaturas de Sub-rotinas

Use assinaturas para clareza e verificação automática de aridade.

```perl
use v5.36;

# Bom: Assinaturas com padrões
sub connect_db($host, $port = 5432, $timeout = 30) {
    # $host é obrigatório, os outros têm padrões
    return DBI->connect("dbi:Pg:host=$host;port=$port", undef, undef, {
        RaiseError => 1,
        PrintError => 0,
    });
}

# Bom: Parâmetro slurpy para args variáveis
sub log_message($level, @details) {
    say "[$level] " . join(' ', @details);
}

# Ruim: Desempacotamento manual de argumentos
sub connect_db {
    my ($host, $port, $timeout) = @_;
    $port    //= 5432;
    $timeout //= 30;
    # ...
}
```

### 3. Sensibilidade ao Contexto

Entenda o contexto escalar vs lista — um conceito central do Perl.

```perl
use v5.36;

my @items = (1, 2, 3, 4, 5);

my @copy  = @items;            # Contexto lista: todos os elementos
my $count = @items;            # Contexto escalar: contagem (5)
say "Items: " . scalar @items; # Forçar contexto escalar
```

### 4. Derreferenciação Pós-fixada

Use a sintaxe de derreferenciação pós-fixada para legibilidade com estruturas aninhadas.

```perl
use v5.36;

my $data = {
    users => [
        { name => 'Alice', roles => ['admin', 'user'] },
        { name => 'Bob',   roles => ['user'] },
    ],
};

# Bom: Derreferenciação pós-fixada
my @users = $data->{users}->@*;
my @roles = $data->{users}[0]{roles}->@*;
my %first = $data->{users}[0]->%*;

# Ruim: Derreferenciação circunfixa (mais difícil de ler em cadeias)
my @users = @{ $data->{users} };
my @roles = @{ $data->{users}[0]{roles} };
```

### 5. O Operador `isa` (5.32+)

Verificação de tipo infixo — substitui `blessed($o) && $o->isa('X')`.

```perl
use v5.36;
if ($obj isa 'My::Class') { $obj->do_something }
```

## Tratamento de Erros

### Padrão eval/die

```perl
use v5.36;

sub parse_config($path) {
    my $content = eval { path($path)->slurp_utf8 };
    die "Config error: $@" if $@;
    return decode_json($content);
}
```

### Try::Tiny (Tratamento Confiável de Exceções)

```perl
use v5.36;
use Try::Tiny;

sub fetch_user($id) {
    my $user = try {
        $db->resultset('User')->find($id)
            // die "User $id not found\n";
    }
    catch {
        warn "Failed to fetch user $id: $_";
        undef;
    };
    return $user;
}
```

### try/catch Nativo (5.40+)

```perl
use v5.40;

sub divide($x, $y) {
    try {
        die "Division by zero" if $y == 0;
        return $x / $y;
    }
    catch ($e) {
        warn "Error: $e";
        return;
    }
}
```

## OO Moderno com Moo

Prefira Moo para OO moderno e leve. Use Moose somente quando seu metaprotocolo for necessário.

```perl
# Bom: Classe Moo
package User;
use Moo;
use Types::Standard qw(Str Int ArrayRef);
use namespace::autoclean;

has name  => (is => 'ro', isa => Str, required => 1);
has email => (is => 'ro', isa => Str, required => 1);
has age   => (is => 'ro', isa => Int, default  => sub { 0 });
has roles => (is => 'ro', isa => ArrayRef[Str], default => sub { [] });

sub is_admin($self) {
    return grep { $_ eq 'admin' } $self->roles->@*;
}

sub greet($self) {
    return "Hello, I'm " . $self->name;
}

1;

# Uso
my $user = User->new(
    name  => 'Alice',
    email => 'alice@example.com',
    roles => ['admin', 'user'],
);

# Ruim: Hashref abençoado (sem validação, sem acessores)
package User;
sub new {
    my ($class, %args) = @_;
    return bless \%args, $class;
}
sub name { return $_[0]->{name} }
1;
```

### Roles Moo

```perl
package Role::Serializable;
use Moo::Role;
use JSON::MaybeXS qw(encode_json);
requires 'TO_HASH';
sub to_json($self) { encode_json($self->TO_HASH) }
1;

package User;
use Moo;
with 'Role::Serializable';
has name  => (is => 'ro', required => 1);
has email => (is => 'ro', required => 1);
sub TO_HASH($self) { { name => $self->name, email => $self->email } }
1;
```

### Palavra-chave `class` Nativa (5.38+, Corinna)

```perl
use v5.38;
use feature 'class';
no warnings 'experimental::class';

class Point {
    field $x :param;
    field $y :param;
    method magnitude() { sqrt($x**2 + $y**2) }
}

my $p = Point->new(x => 3, y => 4);
say $p->magnitude;  # 5
```

## Expressões Regulares

### Capturas Nomeadas e a Flag `/x`

```perl
use v5.36;

# Bom: Capturas nomeadas com /x para legibilidade
my $log_re = qr{
    ^ (?<timestamp> \d{4}-\d{2}-\d{2} \s \d{2}:\d{2}:\d{2} )
    \s+ \[ (?<level> \w+ ) \]
    \s+ (?<message> .+ ) $
}x;

if ($line =~ $log_re) {
    say "Time: $+{timestamp}, Level: $+{level}";
    say "Message: $+{message}";
}

# Ruim: Capturas posicionais (difíceis de manter)
if ($line =~ /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\s+\[(\w+)\]\s+(.+)$/) {
    say "Time: $1, Level: $2";
}
```

### Padrões Pré-compilados

```perl
use v5.36;

# Bom: Compile uma vez, use várias vezes
my $email_re = qr/^[A-Za-z0-9._%+-]+\@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

sub validate_emails(@emails) {
    return grep { $_ =~ $email_re } @emails;
}
```

## Estruturas de Dados

### Referências e Acesso Profundo Seguro

```perl
use v5.36;

# Referências de hash e array
my $config = {
    database => {
        host => 'localhost',
        port => 5432,
        options => ['utf8', 'sslmode=require'],
    },
};

# Acesso profundo seguro (retorna undef se algum nível estiver faltando)
my $port = $config->{database}{port};           # 5432
my $missing = $config->{cache}{host};           # undef, sem erro

# Fatias de hash
my %subset;
@subset{qw(host port)} = @{$config->{database}}{qw(host port)};

# Fatias de array
my @first_two = $config->{database}{options}->@[0, 1];

# Loop multi-variável para (experimental em 5.36, estável em 5.40)
use feature 'for_list';
no warnings 'experimental::for_list';
for my ($key, $val) (%$config) {
    say "$key => $val";
}
```

## E/S de Arquivo

### Open com Três Argumentos

```perl
use v5.36;

# Bom: open com três args com autodie (módulo core, elimina 'or die')
use autodie;

sub read_file($path) {
    open my $fh, '<:encoding(UTF-8)', $path;
    local $/;
    my $content = <$fh>;
    close $fh;
    return $content;
}

# Ruim: open com dois args (risco de injeção de shell, veja perl-security)
open FH, $path;            # NUNCA faça isso
open FH, "< $path";        # Ainda ruim — dados do usuário na string de modo
```

### Path::Tiny para Operações de Arquivo

```perl
use v5.36;
use Path::Tiny;

my $file = path('config', 'app.json');
my $content = $file->slurp_utf8;
$file->spew_utf8($new_content);

# Iterar diretório
for my $child (path('src')->children(qr/\.pl$/)) {
    say $child->basename;
}
```

## Organização de Módulos

### Layout Padrão de Projeto

```text
MyApp/
├── lib/
│   └── MyApp/
│       ├── App.pm           # Módulo principal
│       ├── Config.pm        # Configuração
│       ├── DB.pm            # Camada de banco de dados
│       └── Util.pm          # Utilitários
├── bin/
│   └── myapp                # Script de ponto de entrada
├── t/
│   ├── 00-load.t            # Testes de compilação
│   ├── unit/                # Testes unitários
│   └── integration/         # Testes de integração
├── cpanfile                 # Dependências
├── Makefile.PL              # Sistema de build
└── .perlcriticrc            # Configuração de linting
```

### Padrões de Exportação

```perl
package MyApp::Util;
use v5.36;
use Exporter 'import';

our @EXPORT_OK   = qw(trim);
our %EXPORT_TAGS = (all => \@EXPORT_OK);

sub trim($str) { $str =~ s/^\s+|\s+$//gr }

1;
```

## Ferramentas

### Configuração do perltidy (.perltidyrc)

```text
-i=4        # Indentação de 4 espaços
-l=100      # Comprimento de linha de 100 caracteres
-ci=4       # Indentação de continuação
-ce         # else agrupado
-bar        # chave de abertura na mesma linha
-nolq       # não recuar strings longas entre aspas
```

### Configuração do perlcritic (.perlcriticrc)

```ini
severity = 3
theme = core + pbp + security

[InputOutput::RequireCheckedSyscalls]
functions = :builtins
exclude_functions = say print

[Subroutines::ProhibitExplicitReturnUndef]
severity = 4

[ValuesAndExpressions::ProhibitMagicNumbers]
allowed_values = 0 1 2 -1
```

### Gerenciamento de Dependências (cpanfile + carton)

```bash
cpanm App::cpanminus Carton   # Instalar ferramentas
carton install                 # Instalar deps do cpanfile
carton exec -- perl bin/myapp  # Executar com deps locais
```

```perl
# cpanfile
requires 'Moo', '>= 2.005';
requires 'Path::Tiny';
requires 'JSON::MaybeXS';
requires 'Try::Tiny';

on test => sub {
    requires 'Test2::V0';
    requires 'Test::MockModule';
};
```

## Referência Rápida: Idiomas Modernos do Perl

| Padrão Legado | Substituto Moderno |
|---|---|
| `use strict; use warnings;` | `use v5.36;` |
| `my ($x, $y) = @_;` | `sub foo($x, $y) { ... }` |
| `@{ $ref }` | `$ref->@*` |
| `%{ $ref }` | `$ref->%*` |
| `open FH, "< $file"` | `open my $fh, '<:encoding(UTF-8)', $file` |
| `blessed hashref` | Classe `Moo` com tipos |
| `$1, $2, $3` | `$+{name}` (capturas nomeadas) |
| `eval { }; if ($@)` | `Try::Tiny` ou `try/catch` nativo (5.40+) |
| `BEGIN { require Exporter; }` | `use Exporter 'import';` |
| Operações de arquivo manuais | `Path::Tiny` |
| `blessed($o) && $o->isa('X')` | `$o isa 'X'` (5.32+) |
| `builtin::true / false` | `use builtin 'true', 'false';` (5.36+, experimental) |

## Anti-Padrões

```perl
# 1. open com dois args (risco de segurança)
open FH, $filename;                     # NUNCA

# 2. Sintaxe de objeto indireto (análise ambígua)
my $obj = new Foo(bar => 1);            # Ruim
my $obj = Foo->new(bar => 1);           # Bom

# 3. Dependência excessiva em $_
map { process($_) } grep { validate($_) } @items;  # Difícil de seguir
my @valid = grep { validate($_) } @items;           # Melhor: divida
my @results = map { process($_) } @valid;

# 4. Desabilitar strict refs
no strict 'refs';                        # Quase sempre errado
${"My::Package::$var"} = $value;         # Use um hash em vez disso

# 5. Variáveis globais como configuração
our $TIMEOUT = 30;                       # Ruim: global mutável
use constant TIMEOUT => 30;              # Melhor: constante
# Melhor ainda: atributo Moo com padrão

# 6. eval de string para carregar módulos
eval "require $module";                  # Ruim: risco de injeção de código
eval "use $module";                      # Ruim
use Module::Runtime 'require_module';    # Bom: carregamento seguro de módulo
require_module($module);
```

**Lembre-se**: Perl moderno é limpo, legível e seguro. Deixe o `use v5.36` cuidar do boilerplate, use Moo para objetos e prefira os módulos testados em campo do CPAN a soluções desenvolvidas manualmente.
