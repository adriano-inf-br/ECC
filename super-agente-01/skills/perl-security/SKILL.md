---
name: perl-security
description: Segurança abrangente em Perl cobrindo modo taint, validação de entrada, execução segura de processos, queries parametrizadas com DBI, segurança web (XSS/SQLi/CSRF) e políticas de segurança do perlcritic.
metadata:
  origin: ECC
---

# Padrões de Segurança em Perl

Diretrizes abrangentes de segurança para aplicações Perl cobrindo validação de entrada, prevenção de injeção e práticas de codificação segura.

## Quando Ativar

- Manipulando entrada do usuário em aplicações Perl
- Construindo aplicações web em Perl (CGI, Mojolicious, Dancer2, Catalyst)
- Revisando código Perl quanto a vulnerabilidades de segurança
- Realizando operações de arquivo com caminhos fornecidos pelo usuário
- Executando comandos do sistema a partir do Perl
- Escrevendo queries de banco de dados com DBI

## Como Funciona

Comece com fronteiras de entrada cientes do taint, depois avance para fora: valide e remova taint das entradas, mantenha o sistema de arquivos e a execução de processos restritos, e use queries parametrizadas DBI em todo lugar. Os exemplos abaixo mostram os padrões seguros que esta skill espera que você aplique antes de publicar código Perl que toca entrada do usuário, o shell ou a rede.

## Modo Taint

O modo taint do Perl (`-T`) rastreia dados de fontes externas e impede que sejam usados em operações inseguras sem validação explícita.

### Habilitando o Modo Taint

```perl
#!/usr/bin/perl -T
use v5.36;

# Contaminado: qualquer coisa de fora do programa
my $input    = $ARGV[0];        # Contaminado
my $env_path = $ENV{PATH};      # Contaminado
my $form     = <STDIN>;         # Contaminado
my $query    = $ENV{QUERY_STRING}; # Contaminado

# Saneie PATH cedo (obrigatório no modo taint)
$ENV{PATH} = '/usr/local/bin:/usr/bin:/bin';
delete @ENV{qw(IFS CDPATH ENV BASH_ENV)};
```

### Padrão de Remoção de Taint

```perl
use v5.36;

# Bom: Valide e remova taint com uma regex específica
sub untaint_username($input) {
    if ($input =~ /^([a-zA-Z0-9_]{3,30})$/) {
        return $1;  # $1 não está contaminado
    }
    die "Invalid username: must be 3-30 alphanumeric characters\n";
}

# Bom: Valide e remova taint de um caminho de arquivo
sub untaint_filename($input) {
    if ($input =~ m{^([a-zA-Z0-9._-]+)$}) {
        return $1;
    }
    die "Invalid filename: contains unsafe characters\n";
}

# Ruim: Remoção de taint excessivamente permissiva (derrota o propósito)
sub bad_untaint($input) {
    $input =~ /^(.*)$/s;
    return $1;  # Aceita QUALQUER COISA — inútil
}
```

## Validação de Entrada

### Lista de Permissões em Vez de Lista de Bloqueios

```perl
use v5.36;

# Bom: Lista de permissões — define exatamente o que é permitido
sub validate_sort_field($field) {
    my %allowed = map { $_ => 1 } qw(name email created_at updated_at);
    die "Invalid sort field: $field\n" unless $allowed{$field};
    return $field;
}

# Bom: Validar com padrões específicos
sub validate_email($email) {
    if ($email =~ /^([a-zA-Z0-9._%+-]+\@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/) {
        return $1;
    }
    die "Invalid email address\n";
}

sub validate_integer($input) {
    if ($input =~ /^(-?\d{1,10})$/) {
        return $1 + 0;  # Coerçar para número
    }
    die "Invalid integer\n";
}

# Ruim: Lista de bloqueios — sempre incompleta
sub bad_validate($input) {
    die "Invalid" if $input =~ /[<>"';&|]/;  # Não cobre ataques codificados
    return $input;
}
```

### Restrições de Tamanho

```perl
use v5.36;

sub validate_comment($text) {
    die "Comment is required\n"        unless length($text) > 0;
    die "Comment exceeds 10000 chars\n" if length($text) > 10_000;
    return $text;
}
```

## Expressões Regulares Seguras

### Prevenção de ReDoS

O backtracking catastrófico ocorre com quantificadores aninhados em padrões sobrepostos.

```perl
use v5.36;

# Ruim: Vulnerável a ReDoS (backtracking exponencial)
my $bad_re = qr/^(a+)+$/;           # Quantificadores aninhados
my $bad_re2 = qr/^([a-zA-Z]+)*$/;   # Quantificadores aninhados em classe
my $bad_re3 = qr/^(.*?,){10,}$/;    # Combinação repetida greedy/lazy

# Bom: Reescrever sem aninhamento
my $good_re = qr/^a+$/;             # Quantificador único
my $good_re2 = qr/^[a-zA-Z]+$/;     # Quantificador único em classe

# Bom: Use quantificadores possessivos ou grupos atômicos para evitar backtracking
my $safe_re = qr/^[a-zA-Z]++$/;             # Possessivo (5.10+)
my $safe_re2 = qr/^(?>a+)$/;                # Grupo atômico

# Bom: Aplicar timeout em padrões não confiáveis
use POSIX qw(alarm);
sub safe_match($string, $pattern, $timeout = 2) {
    my $matched;
    eval {
        local $SIG{ALRM} = sub { die "Regex timeout\n" };
        alarm($timeout);
        $matched = $string =~ $pattern;
        alarm(0);
    };
    alarm(0);
    die $@ if $@;
    return $matched;
}
```

## Operações de Arquivo Seguras

### Open com Três Argumentos

```perl
use v5.36;

# Bom: open com três args, filehandle léxico, verificar retorno
sub read_file($path) {
    open my $fh, '<:encoding(UTF-8)', $path
        or die "Cannot open '$path': $!\n";
    local $/;
    my $content = <$fh>;
    close $fh;
    return $content;
}

# Ruim: open com dois args com dados do usuário (injeção de comando)
sub bad_read($path) {
    open my $fh, $path;        # Se $path = "|rm -rf /", executa o comando!
    open my $fh, "< $path";   # Injeção de metacaractere shell
}
```

### Prevenção de TOCTOU e Travessia de Caminho

```perl
use v5.36;
use Fcntl qw(:DEFAULT :flock);
use File::Spec;
use Cwd qw(realpath);

# Criação atômica de arquivo
sub create_file_safe($path) {
    sysopen(my $fh, $path, O_WRONLY | O_CREAT | O_EXCL, 0600)
        or die "Cannot create '$path': $!\n";
    return $fh;
}

# Validar que o caminho permanece dentro do diretório permitido
sub safe_path($base_dir, $user_path) {
    my $real = realpath(File::Spec->catfile($base_dir, $user_path))
        // die "Path does not exist\n";
    my $base_real = realpath($base_dir)
        // die "Base dir does not exist\n";
    die "Path traversal blocked\n" unless $real =~ /^\Q$base_real\E(?:\/|\z)/;
    return $real;
}
```

Use `File::Temp` para arquivos temporários (`tempfile(UNLINK => 1)`) e `flock(LOCK_EX)` para prevenir condições de corrida.

## Execução Segura de Processos

### system e exec na Forma de Lista

```perl
use v5.36;

# Bom: Forma de lista — sem interpolação de shell
sub run_command(@cmd) {
    system(@cmd) == 0
        or die "Command failed: @cmd\n";
}

run_command('grep', '-r', $user_pattern, '/var/log/app/');

# Bom: Capturar saída com segurança usando IPC::Run3
use IPC::Run3;
sub capture_output(@cmd) {
    my ($stdout, $stderr);
    run3(\@cmd, \undef, \$stdout, \$stderr);
    if ($?) {
        die "Command failed (exit $?): $stderr\n";
    }
    return $stdout;
}

# Ruim: Forma de string — injeção de shell!
sub bad_search($pattern) {
    system("grep -r '$pattern' /var/log/app/");  # Se $pattern = "'; rm -rf / #"
}

# Ruim: Backticks com interpolação
my $output = `ls $user_dir`;   # Risco de injeção de shell
```

Use também `Capture::Tiny` para capturar stdout/stderr de comandos externos com segurança.

## Prevenção de Injeção SQL

### Placeholders DBI

```perl
use v5.36;
use DBI;

my $dbh = DBI->connect($dsn, $user, $pass, {
    RaiseError => 1,
    PrintError => 0,
    AutoCommit => 1,
});

# Bom: Queries parametrizadas — sempre use placeholders
sub find_user($dbh, $email) {
    my $sth = $dbh->prepare('SELECT * FROM users WHERE email = ?');
    $sth->execute($email);
    return $sth->fetchrow_hashref;
}

sub search_users($dbh, $name, $status) {
    my $sth = $dbh->prepare(
        'SELECT * FROM users WHERE name LIKE ? AND status = ? ORDER BY name'
    );
    $sth->execute("%$name%", $status);
    return $sth->fetchall_arrayref({});
}

# Ruim: Interpolação de string em SQL (vulnerabilidade SQLi!)
sub bad_find($dbh, $email) {
    my $sth = $dbh->prepare("SELECT * FROM users WHERE email = '$email'");
    # Se $email = "' OR 1=1 --", retorna todos os usuários
    $sth->execute;
    return $sth->fetchrow_hashref;
}
```

### Listas de Permissões de Colunas Dinâmicas

```perl
use v5.36;

# Bom: Validar nomes de colunas contra uma lista de permissões
sub order_by($dbh, $column, $direction) {
    my %allowed_cols = map { $_ => 1 } qw(name email created_at);
    my %allowed_dirs = map { $_ => 1 } qw(ASC DESC);

    die "Invalid column: $column\n"    unless $allowed_cols{$column};
    die "Invalid direction: $direction\n" unless $allowed_dirs{uc $direction};

    my $sth = $dbh->prepare("SELECT * FROM users ORDER BY $column $direction");
    $sth->execute;
    return $sth->fetchall_arrayref({});
}

# Ruim: Interpolando diretamente a coluna escolhida pelo usuário
sub bad_order($dbh, $column) {
    $dbh->prepare("SELECT * FROM users ORDER BY $column");  # SQLi!
}
```

### DBIx::Class (Segurança do ORM)

```perl
use v5.36;

# DBIx::Class gera queries parametrizadas seguras
my @users = $schema->resultset('User')->search({
    status => 'active',
    email  => { -like => '%@example.com' },
}, {
    order_by => { -asc => 'name' },
    rows     => 50,
});
```

## Segurança Web

### Prevenção de XSS

```perl
use v5.36;
use HTML::Entities qw(encode_entities);
use URI::Escape qw(uri_escape_utf8);

# Bom: Codificar saída para contexto HTML
sub safe_html($user_input) {
    return encode_entities($user_input);
}

# Bom: Codificar para contexto de URL
sub safe_url_param($value) {
    return uri_escape_utf8($value);
}

# Bom: Codificar para contexto JSON
use JSON::MaybeXS qw(encode_json);
sub safe_json($data) {
    return encode_json($data);  # Cuida do escape
}

# Escape automático de template (Mojolicious)
# <%= $user_input %>   — escapado automaticamente (seguro)
# <%== $raw_html %>    — saída bruta (perigoso, use apenas para conteúdo confiável)

# Escape automático de template (Template Toolkit)
# [% user_input | html %]  — codificação HTML explícita

# Ruim: Saída bruta em HTML
sub bad_html($input) {
    print "<div>$input</div>";  # XSS se $input contiver <script>
}
```

### Proteção CSRF

```perl
use v5.36;
use Crypt::URandom qw(urandom);
use MIME::Base64 qw(encode_base64url);

sub generate_csrf_token() {
    return encode_base64url(urandom(32));
}
```

Use comparação em tempo constante ao verificar tokens. A maioria dos frameworks web (Mojolicious, Dancer2, Catalyst) fornece proteção CSRF integrada — prefira essas soluções a implementações manuais.

### Segurança de Sessão e Cabeçalhos

```perl
use v5.36;

# Sessão + cabeçalhos do Mojolicious
$app->secrets(['long-random-secret-rotated-regularly']);
$app->sessions->secure(1);          # Somente HTTPS
$app->sessions->samesite('Lax');

$app->hook(after_dispatch => sub ($c) {
    $c->res->headers->header('X-Content-Type-Options' => 'nosniff');
    $c->res->headers->header('X-Frame-Options'        => 'DENY');
    $c->res->headers->header('Content-Security-Policy' => "default-src 'self'");
    $c->res->headers->header('Strict-Transport-Security' => 'max-age=31536000; includeSubDomains');
});
```

## Codificação de Saída

Sempre codifique a saída para seu contexto: `HTML::Entities::encode_entities()` para HTML, `URI::Escape::uri_escape_utf8()` para URLs, `JSON::MaybeXS::encode_json()` para JSON.

## Segurança de Módulos CPAN

- **Fixe versões** no cpanfile: `requires 'DBI', '== 1.643';`
- **Prefira módulos mantidos**: Verifique no MetaCPAN as versões recentes
- **Minimize dependências**: Cada dependência é uma superfície de ataque

## Ferramentas de Segurança

### Políticas de Segurança do perlcritic

```ini
# .perlcriticrc — configuração focada em segurança
severity = 3
theme = security + core

# Exigir open com três argumentos
[InputOutput::RequireThreeArgOpen]
severity = 5

# Exigir chamadas de sistema verificadas
[InputOutput::RequireCheckedSyscalls]
functions = :builtins
severity = 4

# Proibir eval de string
[BuiltinFunctions::ProhibitStringyEval]
severity = 5

# Proibir operadores backtick
[InputOutput::ProhibitBacktickOperators]
severity = 4

# Exigir verificação de taint em CGI
[Modules::RequireTaintChecking]
severity = 5

# Proibir open com dois argumentos
[InputOutput::ProhibitTwoArgOpen]
severity = 5

# Proibir filehandles de palavra bareta
[InputOutput::ProhibitBarewordFileHandles]
severity = 5
```

### Executando o perlcritic

```bash
# Verificar um arquivo
perlcritic --severity 3 --theme security lib/MyApp/Handler.pm

# Verificar projeto inteiro
perlcritic --severity 3 --theme security lib/

# Integração CI
perlcritic --severity 4 --theme security --quiet lib/ || exit 1
```

## Lista de Verificação de Segurança Rápida

| Verificação | O que Verificar |
|---|---|
| Modo taint | Flag `-T` em scripts CGI/web |
| Validação de entrada | Padrões de lista de permissões, limites de tamanho |
| Operações de arquivo | open com três args, verificações de travessia de caminho |
| Execução de processos | system em forma de lista, sem interpolação de shell |
| Queries SQL | Placeholders DBI, nunca interpolar |
| Saída HTML | `encode_entities()`, escape automático de template |
| Tokens CSRF | Gerados, verificados em requisições que alteram estado |
| Configuração de sessão | Cookies Secure, HttpOnly, SameSite |
| Cabeçalhos HTTP | CSP, X-Frame-Options, HSTS |
| Dependências | Versões fixas, módulos auditados |
| Segurança de regex | Sem quantificadores aninhados, padrões ancorados |
| Mensagens de erro | Sem stack traces ou caminhos vazados para usuários |

## Anti-Padrões

```perl
# 1. open com dois args com dados do usuário (injeção de comando)
open my $fh, $user_input;               # Vulnerabilidade CRÍTICA

# 2. system em forma de string (injeção de shell)
system("convert $user_file output.png"); # Vulnerabilidade CRÍTICA

# 3. Interpolação de string em SQL
$dbh->do("DELETE FROM users WHERE id = $id");  # SQLi

# 4. eval com entrada do usuário (injeção de código)
eval $user_code;                         # Execução remota de código

# 5. Confiar em $ENV sem sanitizar
my $path = $ENV{UPLOAD_DIR};             # Pode ser manipulado
system("ls $path");                      # Dupla vulnerabilidade

# 6. Desabilitar taint sem validação
($input) = $input =~ /(.*)/s;           # Remoção de taint preguiçosa — derrota o propósito

# 7. Dados brutos do usuário em HTML
print "<div>Welcome, $username!</div>";  # XSS

# 8. Redirecionamentos não validados
print $cgi->redirect($user_url);         # Redirecionamento aberto
```

**Lembre-se**: A flexibilidade do Perl é poderosa, mas requer disciplina. Use o modo taint para código voltado à web, valide toda entrada com listas de permissões, use placeholders DBI para cada query e codifique toda saída para seu contexto. Defesa em profundidade — nunca confie em uma única camada.
