# Guia de Captura

## Visão Geral

O VideoDB Capture permite gravação de tela e áudio em tempo real com processamento de IA. A captura de desktop suporta atualmente apenas **macOS**.

Para detalhes em nível de código (métodos do SDK, estruturas de eventos, pipelines de IA), consulte [capture-reference.md](capture-reference.md).

## Início Rápido

1. **Inicie o listener WebSocket**: `python scripts/ws_listener.py --clear &`
2. **Execute o código de captura** (veja Fluxo de Trabalho Completo de Captura abaixo)
3. **Eventos gravados em**: `/tmp/videodb_events.jsonl`

---

## Fluxo de Trabalho Completo de Captura

Sem webhooks ou polling necessários. O WebSocket entrega todos os eventos, incluindo o ciclo de vida da sessão.

> **CRÍTICO:** O `CaptureClient` deve permanecer em execução durante toda a duração da captura. Ele executa o binário de gravação local que transmite dados de tela/áudio para o VideoDB. Se o processo Python que criou o `CaptureClient` for encerrado, o binário de gravação é morto e a captura para silenciosamente. Sempre execute o código de captura como um **processo de longa duração em segundo plano** (ex.: `nohup python capture_script.py &`) e use tratamento de sinais (`asyncio.Event` + `SIGINT`/`SIGTERM`) para mantê-lo ativo até que você o encerre explicitamente.

1. **Inicie o listener WebSocket** em segundo plano com a flag `--clear` para limpar eventos antigos. Aguarde até que ele crie o arquivo de ID do WebSocket.

2. **Leia o ID do WebSocket**. Este ID é necessário para a sessão de captura e os pipelines de IA.

3. **Crie uma sessão de captura** e gere um token de cliente para o cliente desktop.

4. **Inicialize o CaptureClient** com o token. Solicite permissões para microfone e captura de tela.

5. **Liste e selecione os canais** (mic, display, system_audio). Defina `store = True` nos canais que deseja persistir como vídeo.

6. **Inicie a sessão** com os canais selecionados.

7. **Aguarde a sessão ficar ativa** lendo os eventos até ver `capture_session.active`. Este evento contém o array `rtstreams`. Salve as informações da sessão (ID da sessão, IDs do RTStream) em um arquivo (ex.: `/tmp/videodb_capture_info.json`) para que outros scripts possam lê-las.

8. **Mantenha o processo ativo.** Use `asyncio.Event` com handlers de sinal para `SIGINT`/`SIGTERM` para bloquear até ser explicitamente encerrado. Grave um arquivo PID (ex.: `/tmp/videodb_capture_pid`) para que o processo possa ser parado posteriormente com `kill $(cat /tmp/videodb_capture_pid)`. O arquivo PID deve ser sobrescrito a cada execução para que novas execuções sempre tenham o PID correto.

9. **Inicie os pipelines de IA** (em um comando/script separado) em cada RTStream para indexação de áudio e indexação visual. Leia os IDs do RTStream do arquivo de informações da sessão salvo.

10. **Escreva lógica de processamento de eventos personalizada** (em um comando/script separado) para ler eventos em tempo real com base no seu caso de uso. Exemplos:
    - Registre atividade no Slack quando `visual_index` mencionar "Slack"
    - Resuma discussões quando eventos de `audio_index` chegarem
    - Acione alertas quando palavras-chave específicas aparecerem no `transcript`
    - Rastreie o uso de aplicativos a partir de descrições de tela

11. **Pare a captura** quando terminar — envie SIGTERM ao processo de captura. Ele deve chamar `client.stop_capture()` e `client.shutdown()` em seu handler de sinal.

12. **Aguarde a exportação** lendo os eventos até ver `capture_session.exported`. Este evento contém `exported_video_id`, `stream_url` e `player_url`. Isso pode levar alguns segundos após parar a captura.

13. **Pare o listener WebSocket** após receber o evento de exportação. Use `kill $(cat /tmp/videodb_ws_pid)` para encerrá-lo de forma limpa.

---

## Sequência de Encerramento

A ordem correta de encerramento é importante para garantir que todos os eventos sejam capturados:

1. **Pare a sessão de captura** — `client.stop_capture()` e depois `client.shutdown()`
2. **Aguarde o evento de exportação** — monitore `/tmp/videodb_events.jsonl` para `capture_session.exported`
3. **Pare o listener WebSocket** — `kill $(cat /tmp/videodb_ws_pid)`

NÃO encerre o listener WebSocket antes de receber o evento de exportação, ou você perderá as URLs finais do vídeo.

---

## Scripts

| Script | Descrição |
|--------|-------------|
| `scripts/ws_listener.py` | Listener de eventos WebSocket (salva em JSONL) |

### Uso do ws_listener.py

```bash
# Inicia o listener em segundo plano (adiciona aos eventos existentes)
python scripts/ws_listener.py &

# Inicia o listener com limpeza (nova sessão, apaga eventos antigos)
python scripts/ws_listener.py --clear &

# Diretório de saída personalizado
python scripts/ws_listener.py --clear /path/to/events &

# Para o listener
kill $(cat /tmp/videodb_ws_pid)
```

**Opções:**
- `--clear`: Limpa o arquivo de eventos antes de iniciar. Use ao iniciar uma nova sessão de captura.

**Arquivos de saída:**
- `videodb_events.jsonl` - Todos os eventos WebSocket
- `videodb_ws_id` - ID de conexão WebSocket (para o parâmetro `ws_connection_id`)
- `videodb_ws_pid` - ID do processo (para parar o listener)

**Funcionalidades:**
- Reconexão automática com backoff exponencial em caso de quedas de conexão
- Encerramento gracioso em SIGINT/SIGTERM
- Arquivo PID para gerenciamento fácil de processos
- Registro de status de conexão
