---
name: get-video-duration
description: Getting the duration of a video file in seconds with Mediabunny
metadata:
  tags: duration, video, length, time, seconds
---

# Obtendo a duração de vídeo com Mediabunny

O Mediabunny pode extrair a duração de um arquivo de vídeo. Funciona em ambientes de navegador, Node.js e Bun.

## Obtendo a duração do vídeo

```tsx
import { Input, ALL_FORMATS, UrlSource } from "mediabunny";

export const getVideoDuration = async (src: string) => {
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
const duration = await getVideoDuration("https://remotion.media/video.mp4");
console.log(duration); // ex.: 10.5 (segundos)
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

const duration = await getVideoDuration(staticFile("video.mp4"));
```
