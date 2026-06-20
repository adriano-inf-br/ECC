---
name: get-video-dimensions
description: Getting the width and height of a video file with Mediabunny
metadata:
  tags: dimensions, width, height, resolution, size, video
---

# Obtendo as dimensões de vídeo com Mediabunny

O Mediabunny pode extrair a largura e a altura de um arquivo de vídeo. Funciona em ambientes de navegador, Node.js e Bun.

## Obtendo as dimensões do vídeo

```tsx
import { Input, ALL_FORMATS, UrlSource } from "mediabunny";

export const getVideoDimensions = async (src: string) => {
  const input = new Input({
    formats: ALL_FORMATS,
    source: new UrlSource(src, {
      getRetryDelay: () => null,
    }),
  });

  const videoTrack = await input.getPrimaryVideoTrack();
  if (!videoTrack) {
    throw new Error("No video track found");
  }

  return {
    width: videoTrack.displayWidth,
    height: videoTrack.displayHeight,
  };
};
```

## Uso

```tsx
const dimensions = await getVideoDimensions("https://remotion.media/video.mp4");
console.log(dimensions.width);  // ex.: 1920
console.log(dimensions.height); // ex.: 1080
```

## Usando com arquivos locais

Para arquivos locais, use `FileSource` em vez de `UrlSource`:

```tsx
import { Input, ALL_FORMATS, FileSource } from "mediabunny";

const input = new Input({
  formats: ALL_FORMATS,
  source: new FileSource(file), // Objeto File de input ou drag-and-drop
});

const videoTrack = await input.getPrimaryVideoTrack();
const width = videoTrack.displayWidth;
const height = videoTrack.displayHeight;
```

## Usando com staticFile no Remotion

```tsx
import { staticFile } from "remotion";

const dimensions = await getVideoDimensions(staticFile("video.mp4"));
```
