---
name: cpp-coding-standards
description: Padrões de código C++ baseados nas C++ Core Guidelines (isocpp.github.io). Use ao escrever, revisar ou refatorar código C++ para reforçar práticas modernas, seguras e idiomáticas.
metadata:
  origin: ECC
---

# C++ Coding Standards (C++ Core Guidelines)

Padrões de código abrangentes para C++ moderno (C++17/20/23) derivados das [C++ Core Guidelines](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines). Reforça segurança de tipos, segurança de recursos, imutabilidade e clareza.

## Quando Usar

- Escrever novo código C++ (classes, funções, templates)
- Revisar ou refatorar código C++ existente
- Tomar decisões de arquitetura em projetos C++
- Reforçar estilo consistente em uma base de código C++
- Escolher entre recursos da linguagem (ex.: `enum` vs `enum class`, raw pointer vs smart pointer)

### Quando NÃO Usar

- Projetos que não são C++
- Bases de código C legadas que não podem adotar recursos modernos de C++
- Contextos embarcados/bare-metal onde diretrizes específicas conflitam com restrições de hardware (adapte seletivamente)

## Princípios Transversais

Estes temas se repetem por todas as diretrizes e formam a fundação:

1. **RAII em todo lugar** (P.8, R.1, E.6, CP.20): Vincule o tempo de vida do recurso ao tempo de vida do objeto
2. **Imutabilidade por padrão** (P.10, Con.1-5, ES.25): Comece com `const`/`constexpr`; a mutabilidade é a exceção
3. **Segurança de tipos** (P.4, I.4, ES.46-49, Enum.3): Use o sistema de tipos para prevenir erros em tempo de compilação
4. **Expresse a intenção** (P.3, F.1, NL.1-2, T.10): Nomes, tipos e conceitos devem comunicar o propósito
5. **Minimize a complexidade** (F.2-3, ES.5, Per.4-5): Código simples é código correto
6. **Semântica de valor sobre semântica de ponteiro** (C.10, R.3-5, F.20, CP.31): Prefira retornar por valor e objetos com escopo

## Filosofia e Interfaces (P.*, I.*)

### Regras Principais

| Regra | Resumo |
|------|---------|
| **P.1** | Expresse ideias diretamente no código |
| **P.3** | Expresse a intenção |
| **P.4** | Idealmente, um programa deveria ser estaticamente seguro em tipos |
| **P.5** | Prefira verificação em tempo de compilação à verificação em tempo de execução |
| **P.8** | Não vaze nenhum recurso |
| **P.10** | Prefira dados imutáveis a dados mutáveis |
| **I.1** | Torne as interfaces explícitas |
| **I.2** | Evite variáveis globais não-const |
| **I.4** | Torne as interfaces precisa e fortemente tipadas |
| **I.11** | Nunca transfira posse por um raw pointer ou referência |
| **I.23** | Mantenha baixo o número de argumentos de função |

### FAÇA

```cpp
// P.10 + I.4: Interface imutável, fortemente tipada
struct Temperature {
    double kelvin;
};

Temperature boil(const Temperature& water);
```

### NÃO FAÇA

```cpp
// Interface fraca: posse pouco clara, unidades pouco claras
double boil(double* temp);

// Variável global não-const
int g_counter = 0;  // violação de I.2
```

## Funções (F.*)

### Regras Principais

| Regra | Resumo |
|------|---------|
| **F.1** | Empacote operações significativas como funções cuidadosamente nomeadas |
| **F.2** | Uma função deve realizar uma única operação lógica |
| **F.3** | Mantenha funções curtas e simples |
| **F.4** | Se uma função puder ser avaliada em tempo de compilação, declare-a `constexpr` |
| **F.6** | Se sua função não deve lançar, declare-a `noexcept` |
| **F.8** | Prefira funções puras |
| **F.16** | Para parâmetros "de entrada", passe tipos de cópia barata por valor e os demais por `const&` |
| **F.20** | Para valores "de saída", prefira valores de retorno a parâmetros de saída |
| **F.21** | Para retornar múltiplos valores "de saída", prefira retornar um struct |
| **F.43** | Nunca retorne um ponteiro ou referência para um objeto local |

### Passagem de Parâmetros

```cpp
// F.16: Tipos baratos por valor, os demais por const&
void print(int x);                           // barato: por valor
void analyze(const std::string& data);       // caro: por const&
void transform(std::string s);               // sink: por valor (será movido)

// F.20 + F.21: Valores de retorno, não parâmetros de saída
struct ParseResult {
    std::string token;
    int position;
};

ParseResult parse(std::string_view input);   // BOM: retorna struct

// RUIM: parâmetros de saída
void parse(std::string_view input,
           std::string& token, int& pos);    // evite isto
```

### Funções Puras e constexpr

```cpp
// F.4 + F.8: Pura, constexpr quando possível
constexpr int factorial(int n) noexcept {
    return (n <= 1) ? 1 : n * factorial(n - 1);
}

static_assert(factorial(5) == 120);
```

### Anti-Padrões

- Retornar `T&&` de funções (F.45)
- Usar `va_arg` / variádicos no estilo C (F.55)
- Capturar por referência em lambdas passadas a outras threads (F.53)
- Retornar `const T`, o que inibe a semântica de move (F.49)

## Classes e Hierarquias de Classes (C.*)

### Regras Principais

| Regra | Resumo |
|------|---------|
| **C.2** | Use `class` se houver invariante; `struct` se os membros de dados variam independentemente |
| **C.9** | Minimize a exposição de membros |
| **C.20** | Se você puder evitar definir operações padrão, faça-o (Rule of Zero) |
| **C.21** | Se você definir ou `=delete` qualquer copy/move/destructor, trate todos eles (Rule of Five) |
| **C.35** | Destrutor da classe base: public virtual ou protected não-virtual |
| **C.41** | Um construtor deve criar um objeto totalmente inicializado |
| **C.46** | Declare construtores de argumento único como `explicit` |
| **C.67** | Uma classe polimórfica deve suprimir copy/move públicos |
| **C.128** | Funções virtuais: especifique exatamente um entre `virtual`, `override` ou `final` |

### Rule of Zero

```cpp
// C.20: Deixe o compilador gerar os membros especiais
struct Employee {
    std::string name;
    std::string department;
    int id;
    // Nenhum destrutor, construtores de copy/move ou operadores de atribuição necessários
};
```

### Rule of Five

```cpp
// C.21: Se você precisar gerenciar um recurso, defina todos os cinco
class Buffer {
public:
    explicit Buffer(std::size_t size)
        : data_(std::make_unique<char[]>(size)), size_(size) {}

    ~Buffer() = default;

    Buffer(const Buffer& other)
        : data_(std::make_unique<char[]>(other.size_)), size_(other.size_) {
        std::copy_n(other.data_.get(), size_, data_.get());
    }

    Buffer& operator=(const Buffer& other) {
        if (this != &other) {
            auto new_data = std::make_unique<char[]>(other.size_);
            std::copy_n(other.data_.get(), other.size_, new_data.get());
            data_ = std::move(new_data);
            size_ = other.size_;
        }
        return *this;
    }

    Buffer(Buffer&&) noexcept = default;
    Buffer& operator=(Buffer&&) noexcept = default;

private:
    std::unique_ptr<char[]> data_;
    std::size_t size_;
};
```

### Hierarquia de Classes

```cpp
// C.35 + C.128: Destrutor virtual, use override
class Shape {
public:
    virtual ~Shape() = default;
    virtual double area() const = 0;  // C.121: interface pura
};

class Circle : public Shape {
public:
    explicit Circle(double r) : radius_(r) {}
    double area() const override { return 3.14159 * radius_ * radius_; }

private:
    double radius_;
};
```

### Anti-Padrões

- Chamar funções virtuais em construtores/destrutores (C.82)
- Usar `memset`/`memcpy` em tipos não triviais (C.90)
- Fornecer argumentos padrão diferentes para função virtual e o overrider (C.140)
- Tornar membros de dados `const` ou referências, o que suprime move/copy (C.12)

## Gerenciamento de Recursos (R.*)

### Regras Principais

| Regra | Resumo |
|------|---------|
| **R.1** | Gerencie recursos automaticamente usando RAII |
| **R.3** | Um raw pointer (`T*`) não detém posse |
| **R.5** | Prefira objetos com escopo; não aloque na heap desnecessariamente |
| **R.10** | Evite `malloc()`/`free()` |
| **R.11** | Evite chamar `new` e `delete` explicitamente |
| **R.20** | Use `unique_ptr` ou `shared_ptr` para representar posse |
| **R.21** | Prefira `unique_ptr` a `shared_ptr`, a menos que esteja compartilhando posse |
| **R.22** | Use `make_shared()` para criar `shared_ptr`s |

### Uso de Smart Pointers

```cpp
// R.11 + R.20 + R.21: RAII com smart pointers
auto widget = std::make_unique<Widget>("config");  // posse exclusiva
auto cache  = std::make_shared<Cache>(1024);        // posse compartilhada

// R.3: Raw pointer = observador sem posse
void render(const Widget* w) {  // NÃO detém posse de w
    if (w) w->draw();
}

render(widget.get());
```

### Padrão RAII

```cpp
// R.1: Aquisição de recurso é inicialização
class FileHandle {
public:
    explicit FileHandle(const std::string& path)
        : handle_(std::fopen(path.c_str(), "r")) {
        if (!handle_) throw std::runtime_error("Failed to open: " + path);
    }

    ~FileHandle() {
        if (handle_) std::fclose(handle_);
    }

    FileHandle(const FileHandle&) = delete;
    FileHandle& operator=(const FileHandle&) = delete;
    FileHandle(FileHandle&& other) noexcept
        : handle_(std::exchange(other.handle_, nullptr)) {}
    FileHandle& operator=(FileHandle&& other) noexcept {
        if (this != &other) {
            if (handle_) std::fclose(handle_);
            handle_ = std::exchange(other.handle_, nullptr);
        }
        return *this;
    }

private:
    std::FILE* handle_;
};
```

### Anti-Padrões

- `new`/`delete` nus (R.11)
- `malloc()`/`free()` em código C++ (R.10)
- Múltiplas alocações de recurso em uma única expressão (R.13 -- risco de segurança de exceção)
- `shared_ptr` onde `unique_ptr` basta (R.21)

## Expressões e Statements (ES.*)

### Regras Principais

| Regra | Resumo |
|------|---------|
| **ES.5** | Mantenha os escopos pequenos |
| **ES.20** | Sempre inicialize um objeto |
| **ES.23** | Prefira a sintaxe de inicializador `{}` |
| **ES.25** | Declare objetos `const` ou `constexpr`, a menos que a modificação seja intencional |
| **ES.28** | Use lambdas para inicialização complexa de variáveis `const` |
| **ES.45** | Evite constantes mágicas; use constantes simbólicas |
| **ES.46** | Evite conversões aritméticas com perda/estreitamento |
| **ES.47** | Use `nullptr` em vez de `0` ou `NULL` |
| **ES.48** | Evite casts |
| **ES.50** | Não remova o `const` por cast |

### Inicialização

```cpp
// ES.20 + ES.23 + ES.25: Sempre inicialize, prefira {}, use const por padrão
const int max_retries{3};
const std::string name{"widget"};
const std::vector<int> primes{2, 3, 5, 7, 11};

// ES.28: Lambda para inicialização const complexa
const auto config = [&] {
    Config c;
    c.timeout = std::chrono::seconds{30};
    c.retries = max_retries;
    c.verbose = debug_mode;
    return c;
}();
```

### Anti-Padrões

- Variáveis não inicializadas (ES.20)
- Usar `0` ou `NULL` como ponteiro (ES.47 -- use `nullptr`)
- Casts no estilo C (ES.48 -- use `static_cast`, `const_cast`, etc.)
- Remover o `const` por cast (ES.50)
- Números mágicos sem constantes nomeadas (ES.45)
- Misturar aritmética signed e unsigned (ES.100)
- Reutilizar nomes em escopos aninhados (ES.12)

## Tratamento de Erros (E.*)

### Regras Principais

| Regra | Resumo |
|------|---------|
| **E.1** | Desenvolva uma estratégia de tratamento de erros cedo no design |
| **E.2** | Lance uma exceção para sinalizar que uma função não pode realizar a tarefa atribuída |
| **E.6** | Use RAII para prevenir vazamentos |
| **E.12** | Use `noexcept` quando lançar for impossível ou inaceitável |
| **E.14** | Use tipos definidos pelo usuário projetados para isso como exceções |
| **E.15** | Lance por valor, capture por referência |
| **E.16** | Destrutores, desalocação e swap nunca devem falhar |
| **E.17** | Não tente capturar toda exceção em toda função |

### Hierarquia de Exceções

```cpp
// E.14 + E.15: Tipos de exceção personalizados, lance por valor, capture por referência
class AppError : public std::runtime_error {
public:
    using std::runtime_error::runtime_error;
};

class NetworkError : public AppError {
public:
    NetworkError(const std::string& msg, int code)
        : AppError(msg), status_code(code) {}
    int status_code;
};

void fetch_data(const std::string& url) {
    // E.2: Throw to signal failure
    throw NetworkError("connection refused", 503);
}

void run() {
    try {
        fetch_data("https://api.example.com");
    } catch (const NetworkError& e) {
        log_error(e.what(), e.status_code);
    } catch (const AppError& e) {
        log_error(e.what());
    }
    // E.17: Don't catch everything here -- let unexpected errors propagate
}
```

### Anti-Patterns

- Throwing built-in types like `int` or string literals (E.14)
- Catching by value (slicing risk) (E.15)
- Empty catch blocks that silently swallow errors
- Using exceptions for flow control (E.3)
- Error handling based on global state like `errno` (E.28)

## Constants & Immutability (Con.*)

### All Rules

| Rule | Summary |
|------|---------|
| **Con.1** | By default, make objects immutable |
| **Con.2** | By default, make member functions `const` |
| **Con.3** | By default, pass pointers and references to `const` |
| **Con.4** | Use `const` for values that don't change after construction |
| **Con.5** | Use `constexpr` for values computable at compile time |

```cpp
// Con.1 through Con.5: Immutability by default
class Sensor {
public:
    explicit Sensor(std::string id) : id_(std::move(id)) {}

    // Con.2: const member functions by default
    const std::string& id() const { return id_; }
    double last_reading() const { return reading_; }

    // Only non-const when mutation is required
    void record(double value) { reading_ = value; }

private:
    const std::string id_;  // Con.4: never changes after construction
    double reading_{0.0};
};

// Con.3: Pass by const reference
void display(const Sensor& s) {
    std::cout << s.id() << ": " << s.last_reading() << '\n';
}

// Con.5: Compile-time constants
constexpr double PI = 3.14159265358979;
constexpr int MAX_SENSORS = 256;
```

## Concurrency & Parallelism (CP.*)

### Key Rules

| Rule | Summary |
|------|---------|
| **CP.2** | Avoid data races |
| **CP.3** | Minimize explicit sharing of writable data |
| **CP.4** | Think in terms of tasks, rather than threads |
| **CP.8** | Don't use `volatile` for synchronization |
| **CP.20** | Use RAII, never plain `lock()`/`unlock()` |
| **CP.21** | Use `std::scoped_lock` to acquire multiple mutexes |
| **CP.22** | Never call unknown code while holding a lock |
| **CP.42** | Don't wait without a condition |
| **CP.44** | Remember to name your `lock_guard`s and `unique_lock`s |
| **CP.100** | Don't use lock-free programming unless you absolutely have to |

### Safe Locking

```cpp
// CP.20 + CP.44: RAII locks, always named
class ThreadSafeQueue {
public:
    void push(int value) {
        std::lock_guard<std::mutex> lock(mutex_);  // CP.44: named!
        queue_.push(value);
        cv_.notify_one();
    }

    int pop() {
        std::unique_lock<std::mutex> lock(mutex_);
        // CP.42: Always wait with a condition
        cv_.wait(lock, [this] { return !queue_.empty(); });
        const int value = queue_.front();
        queue_.pop();
        return value;
    }

private:
    std::mutex mutex_;             // CP.50: mutex with its data
    std::condition_variable cv_;
    std::queue<int> queue_;
};
```

### Multiple Mutexes

```cpp
// CP.21: std::scoped_lock for multiple mutexes (deadlock-free)
void transfer(Account& from, Account& to, double amount) {
    std::scoped_lock lock(from.mutex_, to.mutex_);
    from.balance_ -= amount;
    to.balance_ += amount;
}
```

### Anti-Patterns

- `volatile` for synchronization (CP.8 -- it's for hardware I/O only)
- Detaching threads (CP.26 -- lifetime management becomes nearly impossible)
- Unnamed lock guards: `std::lock_guard<std::mutex>(m);` destroys immediately (CP.44)
- Holding locks while calling callbacks (CP.22 -- deadlock risk)
- Lock-free programming without deep expertise (CP.100)

## Templates & Generic Programming (T.*)

### Key Rules

| Rule | Summary |
|------|---------|
| **T.1** | Use templates to raise the level of abstraction |
| **T.2** | Use templates to express algorithms for many argument types |
| **T.10** | Specify concepts for all template arguments |
| **T.11** | Use standard concepts whenever possible |
| **T.13** | Prefer shorthand notation for simple concepts |
| **T.43** | Prefer `using` over `typedef` |
| **T.120** | Use template metaprogramming only when you really need to |
| **T.144** | Don't specialize function templates (overload instead) |

### Concepts (C++20)

```cpp
#include <concepts>

// T.10 + T.11: Constrain templates with standard concepts
template<std::integral T>
T gcd(T a, T b) {
    while (b != 0) {
        a = std::exchange(b, a % b);
    }
    return a;
}

// T.13: Shorthand concept syntax
void sort(std::ranges::random_access_range auto& range) {
    std::ranges::sort(range);
}

// Custom concept for domain-specific constraints
template<typename T>
concept Serializable = requires(const T& t) {
    { t.serialize() } -> std::convertible_to<std::string>;
};

template<Serializable T>
void save(const T& obj, const std::string& path);
```

### Anti-Patterns

- Unconstrained templates in visible namespaces (T.47)
- Specializing function templates instead of overloading (T.144)
- Template metaprogramming where `constexpr` suffices (T.120)
- `typedef` instead of `using` (T.43)

## Standard Library (SL.*)

### Key Rules

| Rule | Summary |
|------|---------|
| **SL.1** | Use libraries wherever possible |
| **SL.2** | Prefer the standard library to other libraries |
| **SL.con.1** | Prefer `std::array` or `std::vector` over C arrays |
| **SL.con.2** | Prefer `std::vector` by default |
| **SL.str.1** | Use `std::string` to own character sequences |
| **SL.str.2** | Use `std::string_view` to refer to character sequences |
| **SL.io.50** | Avoid `endl` (use `'\n'` -- `endl` forces a flush) |

```cpp
// SL.con.1 + SL.con.2: Prefer vector/array over C arrays
const std::array<int, 4> fixed_data{1, 2, 3, 4};
std::vector<std::string> dynamic_data;

// SL.str.1 + SL.str.2: string owns, string_view observes
std::string build_greeting(std::string_view name) {
    return "Hello, " + std::string(name) + "!";
}

// SL.io.50: Use '\n' not endl
std::cout << "result: " << value << '\n';
```

## Enumerations (Enum.*)

### Key Rules

| Rule | Summary |
|------|---------|
| **Enum.1** | Prefer enumerations over macros |
| **Enum.3** | Prefer `enum class` over plain `enum` |
| **Enum.5** | Don't use ALL_CAPS for enumerators |
| **Enum.6** | Avoid unnamed enumerations |

```cpp
// Enum.3 + Enum.5: Scoped enum, no ALL_CAPS
enum class Color { red, green, blue };
enum class LogLevel { debug, info, warning, error };

// BAD: plain enum leaks names, ALL_CAPS clashes with macros
enum { RED, GREEN, BLUE };           // Enum.3 + Enum.5 + Enum.6 violation
#define MAX_SIZE 100                  // Enum.1 violation -- use constexpr
```

## Source Files & Naming (SF.*, NL.*)

### Key Rules

| Rule | Summary |
|------|---------|
| **SF.1** | Use `.cpp` for code files and `.h` for interface files |
| **SF.7** | Don't write `using namespace` at global scope in a header |
| **SF.8** | Use `#include` guards for all `.h` files |
| **SF.11** | Header files should be self-contained |
| **NL.5** | Avoid encoding type information in names (no Hungarian notation) |
| **NL.8** | Use a consistent naming style |
| **NL.9** | Use ALL_CAPS for macro names only |
| **NL.10** | Prefer `underscore_style` names |

### Header Guard

```cpp
// SF.8: Include guard (or #pragma once)
#ifndef PROJECT_MODULE_WIDGET_H
#define PROJECT_MODULE_WIDGET_H

// SF.11: Self-contained -- include everything this header needs
#include <string>
#include <vector>

namespace project::module {

class Widget {
public:
    explicit Widget(std::string name);
    const std::string& name() const;

private:
    std::string name_;
};

}  // namespace project::module

#endif  // PROJECT_MODULE_WIDGET_H
```

### Naming Conventions

```cpp
// NL.8 + NL.10: Consistent underscore_style
namespace my_project {

constexpr int max_buffer_size = 4096;  // NL.9: not ALL_CAPS (it's not a macro)

class tcp_connection {                 // underscore_style class
public:
    void send_message(std::string_view msg);
    bool is_connected() const;

private:
    std::string host_;                 // trailing underscore for members
    int port_;
};

}  // namespace my_project
```

### Anti-Patterns

- `using namespace std;` in a header at global scope (SF.7)
- Headers that depend on inclusion order (SF.10, SF.11)
- Hungarian notation like `strName`, `iCount` (NL.5)
- ALL_CAPS for anything other than macros (NL.9)

## Performance (Per.*)

### Key Rules

| Rule | Summary |
|------|---------|
| **Per.1** | Don't optimize without reason |
| **Per.2** | Don't optimize prematurely |
| **Per.6** | Don't make claims about performance without measurements |
| **Per.7** | Design to enable optimization |
| **Per.10** | Rely on the static type system |
| **Per.11** | Move computation from run time to compile time |
| **Per.19** | Access memory predictably |

### Guidelines

```cpp
// Per.11: Compile-time computation where possible
constexpr auto lookup_table = [] {
    std::array<int, 256> table{};
    for (int i = 0; i < 256; ++i) {
        table[i] = i * i;
    }
    return table;
}();

// Per.19: Prefer contiguous data for cache-friendliness
std::vector<Point> points;           // GOOD: contiguous
std::vector<std::unique_ptr<Point>> indirect_points; // BAD: pointer chasing
```

### Anti-Patterns

- Optimizing without profiling data (Per.1, Per.6)
- Choosing "clever" low-level code over clear abstractions (Per.4, Per.5)
- Ignoring data layout and cache behavior (Per.19)

## Quick Reference Checklist

Before marking C++ work complete:

- [ ] No raw `new`/`delete` -- use smart pointers or RAII (R.11)
- [ ] Objects initialized at declaration (ES.20)
- [ ] Variables are `const`/`constexpr` by default (Con.1, ES.25)
- [ ] Member functions are `const` where possible (Con.2)
- [ ] `enum class` instead of plain `enum` (Enum.3)
- [ ] `nullptr` instead of `0`/`NULL` (ES.47)
- [ ] No narrowing conversions (ES.46)
- [ ] No C-style casts (ES.48)
- [ ] Single-argument constructors are `explicit` (C.46)
- [ ] Rule of Zero or Rule of Five applied (C.20, C.21)
- [ ] Base class destructors are public virtual or protected non-virtual (C.35)
- [ ] Templates are constrained with concepts (T.10)
- [ ] No `using namespace` in headers at global scope (SF.7)
- [ ] Headers have include guards and are self-contained (SF.8, SF.11)
- [ ] Locks use RAII (`scoped_lock`/`lock_guard`) (CP.20)
- [ ] Exceptions are custom types, thrown by value, caught by reference (E.14, E.15)
- [ ] `'\n'` instead of `std::endl` (SL.io.50)
- [ ] No magic numbers (ES.45)
