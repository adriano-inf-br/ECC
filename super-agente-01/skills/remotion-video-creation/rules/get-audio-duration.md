---
name: get-audio-duration
description: Getting the duration of an audio file in seconds with Mediabunny
metadata:
  tags: duration, audio, length, time, seconds, mp3, wav
---

# Obtendo a duração de áudio com Mediabunny

O Mediabunny pode extrair a duração de um arquivo de áudio. Funciona em ambientes de navegador, Node.js e Bun.

## Obtendo a duração do áudio

```tsx
import { Input, ALL_FORMATS, UrlSource } from "mediabunny";

export const getAudioDuration = async (src: string) => {
  const input = new Input({
    formats: ALL_FORMATS,
    source: new UrlSource(src, {
      getRetryDelay: () => null,
    }),
  });

  const durationInSeconds = await input.computeDuration();
  return durationInSeconds;
};
```

## Uso

```tsx
const duration = await getAudioDuration("https://remotion.media/audio.mp3");
console.log(duration); // ex.: 180.5 (segundos)
```

## Usando com arquivos locais

Para arquivos locais, use `FileSource` em vez de `UrlSource`:

```tsx
import { Input, ALL_FORMATS, FileSource } from "mediabunny";

const input = new Input({
  formats: ALL_FORMATS,
  source: new FileSource(file), // Objeto File de input ou drag-and-drop
});

const durationInSeconds = await input.computeDuration();
```

## Usando com staticFile no Remotion

```tsx
import { staticFile } from "remotion";

const duration = await getAudioDuration(staticFile("audio.mp3"));
```
