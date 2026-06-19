---
name: videodb
description: Veja, Compreenda, Aja sobre vídeo e áudio. Ver — ingira de arquivos locais, URLs, feeds RTSP/ao vivo ou grave ao vivo o desktop; retorne contexto em tempo real e links de stream reproduzíveis. Compreender — extraia frames, construa índices visuais/semânticos/temporais e pesquise momentos com timestamps e clipes automáticos. Agir — transcode e normalize (codec, fps, resolução, proporção), realize edições de timeline (legendas, sobreposições de texto/imagem, branding, sobreposições de áudio, dublagem, tradução), gere assets de mídia (imagem, áudio, vídeo) e crie alertas em tempo real para eventos de streams ao vivo ou captura de desktop.
metadata:
  origin: ECC
allowed-tools: Read Grep Glob Bash(python:*)
argument-hint: "[descrição da tarefa]"
---

# Skill VideoDB

**Percepção + memória + ações para vídeo, streams ao vivo e sessões de desktop.**

## Quando Usar

### Percepção de Desktop
- Iniciar/parar uma **sessão de desktop** capturando **tela, microfone e áudio do sistema**
- Transmitir **contexto ao vivo** e armazenar **memória episódica de sessão**
- Executar **alertas/gatilhos em tempo real** sobre o que é falado e o que acontece na tela
- Produzir **resumos de sessão**, uma timeline pesquisável e **links de evidência reproduzíveis**

### Ingestão de vídeo + stream
- Ingerir um **arquivo ou URL** e retornar um **link de stream web reproduzível**
- Transcodificar/normalizar: **codec, bitrate, fps, resolução, proporção**

### Índice + pesquisa (timestamps + evidências)
- Construir índices **visuais**, **falados** e de **palavras-chave**
- Pesquisar e retornar momentos exatos com **timestamps** e **evidências reproduzíveis**
- Criar **clipes** automaticamente a partir dos resultados de pesquisa

### Edição de timeline + geração
- Legendas: **gerar**, **traduzir**, **queimar na imagem**
- Sobreposições: **texto/imagem/branding**, legendas animadas
- Áudio: **música de fundo**, **narração**, **dublagem**
- Composição programática e exportações via **operações de timeline**

### Streams ao vivo (RTSP) + monitoramento
- Conectar **feeds RTSP/ao vivo**
- Executar **compreensão visual e falada em tempo real** e emitir **eventos/alertas** para fluxos de monitoramento

## Como Funciona

### Entradas Comuns
- **Caminho de arquivo** local, **URL** pública ou **URL RTSP**
- Requisição de captura de desktop: **iniciar / parar / resumir sessão**
- Operações desejadas: obter contexto para compreensão, especificação de transcode, especificação de índice, consulta de pesquisa, intervalos de clipe, edições de timeline, regras de alerta

### Saídas Comuns
- **URL de stream**
- Resultados de pesquisa com **timestamps** e **links de evidência**
- Assets gerados: legendas, áudio, imagens, clipes
- **Payloads de evento/alerta** para streams ao vivo
- **Resumos de sessão** de desktop e entradas de memória

### Executando Código Python

Antes de executar qualquer código VideoDB, mude para o diretório do projeto e carregue as variáveis de ambiente:

```python
from dotenv import load_dotenv
load_dotenv(".env")

import videodb
conn = videodb.connect()
```

Isso lê `VIDEO_DB_API_KEY` de:
1. Ambiente (se já exportado)
2. Arquivo `.env` do projeto no diretório atual

Se a chave estiver ausente, `videodb.connect()` lança `AuthenticationError` automaticamente.

NÃO escreva um arquivo de script quando um comando inline curto funcionar.

Ao escrever Python inline (`python -c "..."`), sempre use código corretamente formatado — use ponto e vírgula para separar declarações e mantenha legível. Para qualquer coisa mais longa que ~3 declarações, use um heredoc:

```bash
python << 'EOF'
from dotenv import load_dotenv
load_dotenv(".env")

import videodb
conn = videodb.connect()
coll = conn.get_collection()
print(f"Vídeos: {len(coll.get_videos())}")
EOF
```

### Configuração

Quando o usuário pede para "configurar o videodb" ou similar:

### 1. Instalar SDK

```bash
pip install "videodb[capture]" python-dotenv
```

Se `videodb[capture]` falhar no Linux, instale sem o extra de captura:

```bash
pip install videodb python-dotenv
```

### 2. Configurar chave de API

O usuário deve definir `VIDEO_DB_API_KEY` usando **qualquer um** dos métodos:

- **Exportar no terminal** (antes de iniciar o Claude): `export VIDEO_DB_API_KEY=sua-chave`
- **Arquivo `.env` do projeto**: Salve `VIDEO_DB_API_KEY=sua-chave` no arquivo `.env` do projeto

Obtenha uma chave de API gratuita em [console.videodb.io](https://console.videodb.io) (50 uploads gratuitos, sem cartão de crédito).

**NÃO** leia, escreva ou manipule a chave de API você mesmo. Sempre deixe o usuário defini-la.

### Referência Rápida

### Fazer upload de mídia

```python
# URL
video = coll.upload(url="https://example.com/video.mp4")

# YouTube
video = coll.upload(url="https://www.youtube.com/watch?v=VIDEO_ID")

# Arquivo local
video = coll.upload(file_path="/caminho/para/video.mp4")
```

### Transcrição + legenda

```python
# force=True ignora o erro se o vídeo já estiver indexado
video.index_spoken_words(force=True)
text = video.get_transcript_text()
stream_url = video.add_subtitle()
```

### Pesquisar dentro de vídeos

```python
from videodb.exceptions import InvalidRequestError

video.index_spoken_words(force=True)

# search() lança InvalidRequestError quando nenhum resultado é encontrado.
# Sempre envolva em try/except e trate "No results found" como vazio.
try:
    results = video.search("product demo")
    shots = results.get_shots()
    stream_url = results.compile()
except InvalidRequestError as e:
    if "No results found" in str(e):
        shots = []
    else:
        raise
```

### Pesquisa de cena

```python
import re
from videodb import SearchType, IndexType, SceneExtractionType
from videodb.exceptions import InvalidRequestError

# index_scenes() não tem parâmetro force — lança um erro se um índice de cena
# já existir. Extraia o ID do índice existente do erro.
try:
    scene_index_id = video.index_scenes(
        extraction_type=SceneExtractionType.shot_based,
        prompt="Descreva o conteúdo visual nesta cena.",
    )
except Exception as e:
    match = re.search(r"id\s+([a-f0-9]+)", str(e))
    if match:
        scene_index_id = match.group(1)
    else:
        raise

# Use score_threshold para filtrar ruído de baixa relevância (recomendado: 0.3+)
try:
    results = video.search(
        query="pessoa escrevendo em um quadro branco",
        search_type=SearchType.semantic,
        index_type=IndexType.scene,
        scene_index_id=scene_index_id,
        score_threshold=0.3,
    )
    shots = results.get_shots()
    stream_url = results.compile()
except InvalidRequestError as e:
    if "No results found" in str(e):
        shots = []
    else:
        raise
```

### Edição de timeline

**Importante:** Sempre valide os timestamps antes de construir uma timeline:
- `start` deve ser >= 0 (valores negativos são aceitos silenciosamente, mas produzem saída quebrada)
- `start` deve ser < `end`
- `end` deve ser <= `video.length`

```python
from videodb.timeline import Timeline
from videodb.asset import VideoAsset, TextAsset, TextStyle

timeline = Timeline(conn)
timeline.add_inline(VideoAsset(asset_id=video.id, start=10, end=30))
timeline.add_overlay(0, TextAsset(text="Fim", duration=3, style=TextStyle(fontsize=36)))
stream_url = timeline.generate_stream()
```

### Transcodificar vídeo (mudança de resolução / qualidade)

```python
from videodb import TranscodeMode, VideoConfig, AudioConfig

# Muda resolução, qualidade ou proporção no servidor
job_id = conn.transcode(
    source="https://example.com/video.mp4",
    callback_url="https://example.com/webhook",
    mode=TranscodeMode.economy,
    video_config=VideoConfig(resolution=720, quality=23, aspect_ratio="16:9"),
    audio_config=AudioConfig(mute=False),
)
```

### Reformatar proporção (para plataformas sociais)

**Aviso:** `reframe()` é uma operação lenta no lado do servidor. Para vídeos longos pode levar
vários minutos e pode expirar. Melhores práticas:
- Sempre limite a um segmento curto usando `start`/`end` quando possível
- Para vídeos completos, use `callback_url` para processamento assíncrono
- Corte o vídeo em uma `Timeline` primeiro, depois reformate o resultado mais curto

```python
from videodb import ReframeMode

# Sempre prefira reformatar um segmento curto:
reframed = video.reframe(start=0, end=60, target="vertical", mode=ReframeMode.smart)

# Reframe assíncrono para vídeos completos (retorna None, resultado via webhook):
video.reframe(target="vertical", callback_url="https://example.com/webhook")

# Predefinições: "vertical" (9:16), "square" (1:1), "landscape" (16:9)
reframed = video.reframe(start=0, end=60, target="square")

# Dimensões personalizadas
reframed = video.reframe(start=0, end=60, target={"width": 1280, "height": 720})
```

### Mídia generativa

```python
image = coll.generate_image(
    prompt="um pôr do sol sobre montanhas",
    aspect_ratio="16:9",
)
```

## Tratamento de Erros

```python
from videodb.exceptions import AuthenticationError, InvalidRequestError

try:
    conn = videodb.connect()
except AuthenticationError:
    print("Verifique seu VIDEO_DB_API_KEY")

try:
    video = coll.upload(url="https://example.com/video.mp4")
except InvalidRequestError as e:
    print(f"Upload falhou: {e}")
```

### Armadilhas Comuns

| Cenário | Mensagem de erro | Solução |
|----------|--------------|----------|
| Indexar um vídeo já indexado | `Spoken word index for video already exists` | Use `video.index_spoken_words(force=True)` para ignorar se já indexado |
| Índice de cena já existe | `Scene index with id XXXX already exists` | Extraia o `scene_index_id` existente do erro com `re.search(r"id\s+([a-f0-9]+)", str(e))` |
| Pesquisa não encontra resultados | `InvalidRequestError: No results found` | Capture a exceção e trate como resultados vazios (`shots = []`) |
| Reframe expira | Bloqueia indefinidamente em vídeos longos | Use `start`/`end` para limitar o segmento, ou passe `callback_url` para assíncrono |
| Timestamps negativos na Timeline | Produz silenciosamente stream quebrado | Sempre valide `start >= 0` antes de criar `VideoAsset` |
| `generate_video()` / `create_collection()` falha | `Operation not allowed` ou `maximum limit` | Recursos limitados por plano — informe o usuário sobre os limites do plano |

## Exemplos

### Prompts Canônicos
- "Inicie a captura de desktop e alerte quando um campo de senha aparecer."
- "Grave minha sessão e produza um resumo acionável quando terminar."
- "Ingira este arquivo e retorne um link de stream reproduzível."
- "Indexe esta pasta e encontre cada cena com pessoas, retorne os timestamps."
- "Gere legendas, queime-as na imagem e adicione música de fundo leve."
- "Conecte esta URL RTSP e alerte quando uma pessoa entrar na zona."

### Gravação de Tela (Captura de Desktop)

Use `ws_listener.py` para capturar eventos WebSocket durante sessões de gravação. A captura de desktop suporta apenas **macOS**.

#### Início Rápido

1. **Escolha o diretório de estado**: `STATE_DIR="${VIDEODB_EVENTS_DIR:-$HOME/.local/state/videodb}"`
2. **Inicie o listener**: `VIDEODB_EVENTS_DIR="$STATE_DIR" python scripts/ws_listener.py --clear "$STATE_DIR" &`
3. **Obtenha o ID WebSocket**: `cat "$STATE_DIR/videodb_ws_id"`
4. **Execute o código de captura** (veja reference/capture.md para o fluxo completo)
5. **Eventos gravados em**: `$STATE_DIR/videodb_events.jsonl`

Use `--clear` sempre que iniciar uma nova captura para que eventos obsoletos de transcrição e visuais não contaminem a nova sessão.

#### Consultar Eventos

```python
import json
import os
import time
from pathlib import Path

events_dir = Path(os.environ.get("VIDEODB_EVENTS_DIR", Path.home() / ".local" / "state" / "videodb"))
events_file = events_dir / "videodb_events.jsonl"
events = []

if events_file.exists():
    with events_file.open(encoding="utf-8") as handle:
        for line in handle:
            try:
                events.append(json.loads(line))
            except json.JSONDecodeError:
                continue

transcripts = [e["data"]["text"] for e in events if e.get("channel") == "transcript"]
cutoff = time.time() - 300
recent_visual = [
    e for e in events
    if e.get("channel") == "visual_index" and e["unix_ts"] > cutoff
]
```

## Documentação Adicional

A documentação de referência está no diretório `reference/` adjacente a este arquivo SKILL.md. Use a ferramenta Glob para localizá-la se necessário.

- [reference/api-reference.md](reference/api-reference.md) - Referência completa da API do SDK Python do VideoDB
- [reference/search.md](reference/search.md) - Guia detalhado para pesquisa em vídeo (palavra falada e baseada em cena)
- [reference/editor.md](reference/editor.md) - Edição de timeline, assets e composição
- [reference/streaming.md](reference/streaming.md) - Streaming HLS e reprodução instantânea
- [reference/generative.md](reference/generative.md) - Geração de mídia com IA (imagens, vídeo, áudio)
- [reference/rtstream.md](reference/rtstream.md) - Fluxo de trabalho de ingestão de stream ao vivo (RTSP/RTMP)
- [reference/rtstream-reference.md](reference/rtstream-reference.md) - Métodos do SDK RTStream e pipelines de IA
- [reference/capture.md](reference/capture.md) - Fluxo de trabalho de captura de desktop
- [reference/capture-reference.md](reference/capture-reference.md) - SDK de captura e eventos WebSocket
- [reference/use-cases.md](reference/use-cases.md) - Padrões comuns de processamento de vídeo e exemplos

**Não use ffmpeg, moviepy ou ferramentas de codificação local** quando o VideoDB suportar a operação. Os seguintes são todos tratados no lado do servidor pelo VideoDB — corte, combinação de clipes, sobreposição de áudio ou música, adição de legendas, sobreposições de texto/imagem, transcodificação, mudanças de resolução, conversão de proporção, redimensionamento para requisitos de plataforma, transcrição e geração de mídia. Recorra a ferramentas locais apenas para operações listadas em Limitações em reference/editor.md (transições, mudanças de velocidade, corte/zoom, gradação de cor, mixagem de volume).

### Quando Usar o Quê

| Problema | Solução VideoDB |
|---------|-----------------|
| Plataforma rejeita proporção ou resolução do vídeo | `video.reframe()` ou `conn.transcode()` com `VideoConfig` |
| Precisa redimensionar vídeo para Twitter/Instagram/TikTok | `video.reframe(target="vertical")` ou `target="square"` |
| Precisa mudar resolução (ex.: 1080p → 720p) | `conn.transcode()` com `VideoConfig(resolution=720)` |
| Precisa sobrepor áudio/música no vídeo | `AudioAsset` em uma `Timeline` |
| Precisa adicionar legendas | `video.add_subtitle()` ou `CaptionAsset` |
| Precisa combinar/cortar clipes | `VideoAsset` em uma `Timeline` |
| Precisa gerar narração, música ou efeitos sonoros | `coll.generate_voice()`, `generate_music()`, `generate_sound_effect()` |

## Proveniência

O material de referência para esta skill está disponível localmente em `skills/videodb/reference/`.
Use as cópias locais acima em vez de seguir links de repositórios externos durante a execução.
