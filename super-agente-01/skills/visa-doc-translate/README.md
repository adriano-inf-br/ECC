# Tradutor de Documentos de Visto

Traduza automaticamente documentos de solicitação de visto de imagens para PDFs profissionais em inglês.

## Funcionalidades

- **OCR Automático**: Tenta múltiplos métodos de OCR (macOS Vision, EasyOCR, Tesseract)
- **PDF Bilíngue**: Imagem original + tradução profissional em inglês
- **Múltiplos Idiomas**: Suporta chinês e outros idiomas
- **Formato Profissional**: Adequado para solicitações oficiais de visto
- **Totalmente Automatizado**: Sem intervenção manual necessária

## Documentos Suportados

- Certificados de depósito bancário (存款证明)
- Certificados de emprego (在职证明)
- Certificados de aposentadoria (退休证明)
- Certificados de renda (收入证明)
- Certificados de propriedade (房产证明)
- Alvarás de funcionamento (营业执照)
- Documentos de identidade e passaportes

## Uso

```bash
/visa-doc-translate <arquivo-de-imagem>
```

### Exemplos

```bash
/visa-doc-translate RetirementCertificate.PNG
/visa-doc-translate BankStatement.HEIC
/visa-doc-translate EmploymentLetter.jpg
```

## Saída

Cria `<nome-do-arquivo>_Translated.pdf` com:
- **Página 1**: Imagem do documento original (centralizada, tamanho A4)
- **Página 2**: Tradução profissional em inglês

## Requisitos

### Bibliotecas Python
```bash
pip install pillow reportlab
```

### OCR (uma das seguintes opções)

**macOS (recomendado)**:
```bash
pip install pyobjc-framework-Vision pyobjc-framework-Quartz
```

**Multiplataforma**:
```bash
pip install easyocr
```

**Tesseract**:
```bash
brew install tesseract tesseract-lang
pip install pytesseract
```

## Como Funciona

1. Converte HEIC para PNG se necessário
2. Verifica e aplica rotação EXIF
3. Extrai texto usando o método de OCR disponível
4. Traduz para inglês profissional
5. Gera PDF bilíngue

## Ideal Para

- Solicitações de visto para a Austrália
- Solicitações de visto para os EUA
- Solicitações de visto para o Canadá
- Solicitações de visto para o Reino Unido
- Solicitações de visto para a União Europeia

## Licença

MIT
