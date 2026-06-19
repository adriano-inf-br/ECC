# Guia do RTStream

## Visão Geral

O RTStream permite a ingestão em tempo real de streams de vídeo ao vivo (RTSP/RTMP) e sessões de captura de desktop. Uma vez conectado, você pode gravar, indexar, pesquisar e exportar conteúdo de fontes ao vivo.

Para detalhes em nível de código (métodos do SDK, parâmetros, exemplos), consulte [rtstream-reference.md](rtstream-reference.md).

## Casos de Uso

- **Segurança e Monitoramento**: Conecte câmeras RTSP, detecte eventos, acione alertas
- **Transmissões ao Vivo**: Ingira streams RTMP, indexe em tempo real, habilite pesquisa instantânea
- **Gravação de Reuniões**: Capture tela e áudio do desktop, transcreva ao vivo, exporte gravações
- **Processamento de Eventos**: Monitore feeds ao vivo, execute análises de IA, responda ao conteúdo detectado

## Início Rápido

1. **Conecte-se a um stream ao vivo** (URL RTSP/RTMP) ou obtenha um RTStream de uma sessão de captura

2. **Inicie a ingestão** para começar a gravar o conteúdo ao vivo

3. **Inicie pipelines de IA** para indexação em tempo real (áudio, visual, transcrição)

4. **Monitore eventos** via WebSocket para resultados de IA ao vivo e alertas

5. **Pare a ingestão** quando terminar

6. **Exporte para vídeo** para armazenamento permanente e processamento adicional

7. **Pesquise a gravação** para encontrar momentos específicos

## Fontes do RTStream

### De Streams RTSP/RTMP

Conecte-se diretamente a uma fonte de vídeo ao vivo:

```python
rtstream = coll.connect_rtstream(
    url="rtmp://your-stream-server/live/stream-key",
    name="My Live Stream",
)
```

### De Sessões de Captura

Obtenha RTStreams a partir de capturas de desktop (microfone, tela, áudio do sistema):

```python
session = conn.get_capture_session(session_id)

mics = session.get_rtstream("mic")
displays = session.get_rtstream("screen")
system_audios = session.get_rtstream("system_audio")
```

Para o fluxo de trabalho de sessão de captura, consulte [capture.md](capture.md).

---

## Scripts

| Script | Descrição |
|--------|-------------|
| `scripts/ws_listener.py` | Listener de eventos WebSocket para resultados de IA em tempo real |
