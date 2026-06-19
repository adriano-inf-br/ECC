---
name: nutrient-document-processing
description: Processe, converta, faça OCR, extraia, redija, assine e preencha documentos usando a API Nutrient DWS. Funciona com PDFs, DOCX, XLSX, PPTX, HTML e imagens.
metadata:
  origin: ECC
---

# Processamento de Documentos com Nutrient

> **Nota:** Esta skill integra com a API comercial do Nutrient. Revise os termos de uso antes de utilizá-la.

Processe documentos com a [API Nutrient DWS Processor](https://www.nutrient.io/api/). Converta formatos, extraia texto e tabelas, faça OCR em documentos digitalizados, redija PII, adicione marcas d'água, assine digitalmente e preencha formulários PDF.

## Configuração

Obtenha uma chave de API gratuita em **[nutrient.io](https://dashboard.nutrient.io/sign_up/?product=processor)**

```bash
export NUTRIENT_API_KEY="pdf_live_..."
```

Todas as requisições vão para `https://api.nutrient.io/build` como POST multipart com um campo JSON `instructions`.

## Operações

### Converter Documentos

```bash
# DOCX para PDF
curl -X POST https://api.nutrient.io/build \
  -H "Authorization: Bearer $NUTRIENT_API_KEY" \
  -F "document.docx=@document.docx" \
  -F 'instructions={"parts":[{"file":"document.docx"}]}' \
  -o output.pdf

# PDF para DOCX
curl -X POST https://api.nutrient.io/build \
  -H "Authorization: Bearer $NUTRIENT_API_KEY" \
  -F "document.pdf=@document.pdf" \
  -F 'instructions={"parts":[{"file":"document.pdf"}],"output":{"type":"docx"}}' \
  -o output.docx

# HTML para PDF
curl -X POST https://api.nutrient.io/build \
  -H "Authorization: Bearer $NUTRIENT_API_KEY" \
  -F "index.html=@index.html" \
  -F 'instructions={"parts":[{"html":"index.html"}]}' \
  -o output.pdf
```

Entradas suportadas: PDF, DOCX, XLSX, PPTX, DOC, XLS, PPT, PPS, PPSX, ODT, RTF, HTML, JPG, PNG, TIFF, HEIC, GIF, WebP, SVG, TGA, EPS.

### Extrair Texto e Dados

```bash
# Extrair texto simples
curl -X POST https://api.nutrient.io/build \
  -H "Authorization: Bearer $NUTRIENT_API_KEY" \
  -F "document.pdf=@document.pdf" \
  -F 'instructions={"parts":[{"file":"document.pdf"}],"output":{"type":"text"}}' \
  -o output.txt

# Extrair tabelas como Excel
curl -X POST https://api.nutrient.io/build \
  -H "Authorization: Bearer $NUTRIENT_API_KEY" \
  -F "document.pdf=@document.pdf" \
  -F 'instructions={"parts":[{"file":"document.pdf"}],"output":{"type":"xlsx"}}' \
  -o tables.xlsx
```

### OCR em Documentos Digitalizados

```bash
# OCR para PDF pesquisável (suporta mais de 100 idiomas)
curl -X POST https://api.nutrient.io/build \
  -H "Authorization: Bearer $NUTRIENT_API_KEY" \
  -F "scanned.pdf=@scanned.pdf" \
  -F 'instructions={"parts":[{"file":"scanned.pdf"}],"actions":[{"type":"ocr","language":"english"}]}' \
  -o searchable.pdf
```

Idiomas: Suporta mais de 100 idiomas via códigos ISO 639-2 (ex.: `eng`, `deu`, `fra`, `spa`, `jpn`, `kor`, `chi_sim`, `chi_tra`, `ara`, `hin`, `rus`). Nomes completos de idiomas como `english` ou `german` também funcionam. Veja a [tabela completa de idiomas OCR](https://www.nutrient.io/guides/document-engine/ocr/language-support/) para todos os códigos suportados.

### Redigir Informações Sensíveis

```bash
# Baseado em padrão (CPF, e-mail)
curl -X POST https://api.nutrient.io/build \
  -H "Authorization: Bearer $NUTRIENT_API_KEY" \
  -F "document.pdf=@document.pdf" \
  -F 'instructions={"parts":[{"file":"document.pdf"}],"actions":[{"type":"redaction","strategy":"preset","strategyOptions":{"preset":"social-security-number"}},{"type":"redaction","strategy":"preset","strategyOptions":{"preset":"email-address"}}]}' \
  -o redacted.pdf

# Baseado em regex
curl -X POST https://api.nutrient.io/build \
  -H "Authorization: Bearer $NUTRIENT_API_KEY" \
  -F "document.pdf=@document.pdf" \
  -F 'instructions={"parts":[{"file":"document.pdf"}],"actions":[{"type":"redaction","strategy":"regex","strategyOptions":{"regex":"\\b[A-Z]{2}\\d{6}\\b"}}]}' \
  -o redacted.pdf
```

Presets: `social-security-number`, `email-address`, `credit-card-number`, `international-phone-number`, `north-american-phone-number`, `date`, `time`, `url`, `ipv4`, `ipv6`, `mac-address`, `us-zip-code`, `vin`.

### Adicionar Marcas d'Água

```bash
curl -X POST https://api.nutrient.io/build \
  -H "Authorization: Bearer $NUTRIENT_API_KEY" \
  -F "document.pdf=@document.pdf" \
  -F 'instructions={"parts":[{"file":"document.pdf"}],"actions":[{"type":"watermark","text":"CONFIDENTIAL","fontSize":72,"opacity":0.3,"rotation":-45}]}' \
  -o watermarked.pdf
```

### Assinaturas Digitais

```bash
# Assinatura CMS autoassinada
curl -X POST https://api.nutrient.io/build \
  -H "Authorization: Bearer $NUTRIENT_API_KEY" \
  -F "document.pdf=@document.pdf" \
  -F 'instructions={"parts":[{"file":"document.pdf"}],"actions":[{"type":"sign","signatureType":"cms"}]}' \
  -o signed.pdf
```

### Preencher Formulários PDF

```bash
curl -X POST https://api.nutrient.io/build \
  -H "Authorization: Bearer $NUTRIENT_API_KEY" \
  -F "form.pdf=@form.pdf" \
  -F 'instructions={"parts":[{"file":"form.pdf"}],"actions":[{"type":"fillForm","formFields":{"name":"Jane Smith","email":"jane@example.com","date":"2026-02-06"}}]}' \
  -o filled.pdf
```

## Servidor MCP (Alternativa)

Para integração nativa de tools, use o servidor MCP em vez de curl:

```json
{
  "mcpServers": {
    "nutrient-dws": {
      "command": "npx",
      "args": ["-y", "@nutrient-sdk/dws-mcp-server"],
      "env": {
        "NUTRIENT_DWS_API_KEY": "YOUR_API_KEY",
        "SANDBOX_PATH": "/path/to/working/directory"
      }
    }
  }
}
```

## Quando Usar

- Convertendo documentos entre formatos (PDF, DOCX, XLSX, PPTX, HTML, imagens)
- Extraindo texto, tabelas ou pares chave-valor de PDFs
- OCR em documentos ou imagens digitalizados
- Redigindo PII antes de compartilhar documentos
- Adicionando marcas d'água a rascunhos ou documentos confidenciais
- Assinando digitalmente contratos ou acordos
- Preenchendo formulários PDF programaticamente

## Links

- [Playground da API](https://dashboard.nutrient.io/processor-api/playground/)
- [Documentação Completa da API](https://www.nutrient.io/guides/dws-processor/)
- [Servidor MCP no npm](https://www.npmjs.com/package/@nutrient-sdk/dws-mcp-server)
