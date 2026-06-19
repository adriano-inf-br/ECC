---
paths:
  - "**/*.cpp"
  - "**/*.hpp"
  - "**/*.cc"
  - "**/*.hh"
  - "**/*.cxx"
  - "**/*.h"
  - "**/CMakeLists.txt"
---
# Padrões de C++

> Este arquivo estende [common/patterns.md](../common/patterns.md) com conteúdo específico de C++.

## RAII (Resource Acquisition Is Initialization)

Vincule o tempo de vida do recurso ao tempo de vida do objeto:

```cpp
class FileHandle {
public:
    explicit FileHandle(const std::string& path) : file_(std::fopen(path.c_str(), "r")) {}
    ~FileHandle() { if (file_) std::fclose(file_); }
    FileHandle(const FileHandle&) = delete;
    FileHandle& operator=(const FileHandle&) = delete;
private:
    std::FILE* file_;
};
```

## Regra dos Cinco/Zero

- **Regra do Zero**: Prefira classes que não precisam de destrutor, construtores de cópia/movimentação ou atribuições personalizados
- **Regra dos Cinco**: Se você definir qualquer um entre destrutor/copy-ctor/copy-assign/move-ctor/move-assign, defina todos os cinco

## Semântica de Valor

- Passe tipos pequenos/triviais por valor
- Passe tipos grandes por `const&`
- Retorne por valor (conte com RVO/NRVO)
- Use semântica de movimentação para parâmetros sink

## Tratamento de Erros

- Use exceções para condições excepcionais
- Use `std::optional` para valores que podem não existir
- Use `std::expected` (C++23) ou tipos de resultado para falhas esperadas

## Referência

Veja a skill: `cpp-coding-standards` para padrões e anti-padrões abrangentes de C++.
