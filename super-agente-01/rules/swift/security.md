---
paths:
  - "**/*.swift"
  - "**/Package.swift"
---
# Segurança Swift

> Este arquivo estende [common/security.md](../common/security.md) com conteúdo específico de Swift.

## Gerenciamento de Segredos

- Use **Keychain Services** para dados sensíveis (tokens, senhas, chaves) — nunca `UserDefaults`
- Use variáveis de ambiente ou arquivos `.xcconfig` para segredos de tempo de build
- Nunca embuta segredos no código-fonte — ferramentas de descompilação os extraem trivialmente

```swift
let apiKey = ProcessInfo.processInfo.environment["API_KEY"]
guard let apiKey, !apiKey.isEmpty else {
    fatalError("API_KEY not configured")
}
```

## Segurança de Transporte

- O App Transport Security (ATS) é aplicado por padrão — não o desabilite
- Use certificate pinning para endpoints críticos
- Valide todos os certificados do servidor

## Validação de Entrada

- Sanitize toda entrada de usuário antes de exibi-la para evitar injeção
- Use `URL(string:)` com validação em vez de force-unwrapping
- Valide dados de fontes externas (APIs, deep links, pasteboard) antes de processar
