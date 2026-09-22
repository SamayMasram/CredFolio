'use client';

import { useEffect, useState } from 'react';

interface AmbientThemeProps {
  imageUrl?: string;
}

interface RgbColor {
  red: number;
  green: number;
  blue: number;
}

const fallbackColor: RgbColor = { red: 61, green: 163, blue: 93 };

function sampleImageColor(imageUrl: string): Promise<RgbColor | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const context = canvas.getContext('2d', { willReadFrequently: true });

      if (!context) {
        resolve(null);
        return;
      }

      try {
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        let red = 0;
        let green = 0;
        let blue = 0;
        let count = 0;

        for (let index = 0; index < pixels.length; index += 4) {
          if (pixels[index + 3] < 128) continue;
          red += pixels[index];
          green += pixels[index + 1];
          blue += pixels[index + 2];
          count += 1;
        }

        resolve(count ? { red: red / count, green: green / count, blue: blue / count } : null);
      } catch {
        resolve(null);
      }
    };
    image.onerror = () => resolve(null);
    image.src = imageUrl;
  });
}

export function AmbientTheme({ imageUrl }: AmbientThemeProps) {
  const [color, setColor] = useState<RgbColor>(fallbackColor);

  useEffect(() => {
    let cancelled = false;

    setColor(fallbackColor);
    if (imageUrl) {
      sampleImageColor(imageUrl).then((sampledColor) => {
        if (!cancelled && sampledColor) setColor(sampledColor);
      });
    }

    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  return (
    <div
      aria-hidden="true"
      className="ambient-layer"
      style={{
        '--ambient-rgb': `${color.red} ${color.green} ${color.blue}`,
        ...(imageUrl ? { backgroundImage: `url("${imageUrl}")` } : {}),
      } as React.CSSProperties}
    />
  );
}