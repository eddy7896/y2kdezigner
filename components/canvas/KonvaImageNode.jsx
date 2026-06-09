import React, { useRef, useEffect } from 'react';
import { Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import Konva from 'konva';

// Custom Posterize Filter
Konva.Filters.CustomPosterize = function (imageData) {
  const levels = typeof this.getAttr === 'function' ? this.getAttr('posterizeLevels') : 256;
  if (levels >= 256 || levels < 2) return;
  const data = imageData.data;
  const factor = 255 / (levels - 1);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.round((data[i] / 255) * (levels - 1)) * factor;
    data[i+1] = Math.round((data[i+1] / 255) * (levels - 1)) * factor;
    data[i+2] = Math.round((data[i+2] / 255) * (levels - 1)) * factor;
  }
};

// Custom Chromatic Aberration Filter
Konva.Filters.ChromaticAberration = function (imageData) {
  const val = typeof this.getAttr === 'function' ? this.getAttr('chromaticAberration') : 0;
  if (!val) return;
  const data = imageData.data;
  const copy = new Uint8ClampedArray(data);
  const w = imageData.width;
  const h = imageData.height;
  const cx = w / 2;
  const cy = h / 2;
  const maxDist = Math.sqrt(cx*cx + cy*cy);
  
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx*dx + dy*dy);
      // Quadratic dropoff: 0 at center, 1 at the extreme corners
      const intensity = Math.pow(dist / maxDist, 2); 
      
      const shiftX = Math.round(val * 10 * intensity * (dx === 0 ? 0 : dx / Math.abs(dx))); 
      
      const i = (y * w + x) * 4;
      
      // Red: shift outward horizontally
      const rx = Math.max(0, Math.min(w - 1, x + shiftX));
      const redIndex = (y * w + rx) * 4;
      data[i] = copy[redIndex];
      
      // Blue: shift inward horizontally
      const bx = Math.max(0, Math.min(w - 1, x - shiftX));
      const blueIndex = (y * w + bx) * 4;
      data[i + 2] = copy[blueIndex];
    }
  }
};

export default function KonvaImageNode({ node, onSelect, onDragEnd, onTransformEnd, ...commonProps }) {
  const [image] = useImage(node.src, 'anonymous');
  const imageRef = useRef(null);

  useEffect(() => {
    if (image && imageRef.current) {
      imageRef.current.cache();
    }
  }, [
    image, 
    node.brightness, 
    node.contrast, 
    node.saturation, 
    node.blurRadius, 
    node.posterize, 
    node.chromaticAberration
  ]);

  return (
    <KonvaImage
      ref={imageRef}
      image={image}
      {...commonProps}
      filters={[
        Konva.Filters.Brighten, 
        Konva.Filters.Contrast, 
        Konva.Filters.HSL,
        Konva.Filters.Blur,
        Konva.Filters.CustomPosterize,
        Konva.Filters.ChromaticAberration
      ]}
      brightness={node.brightness || 0}
      contrast={node.contrast || 0}
      saturation={node.saturation || 0}
      blurRadius={node.blurRadius || 0}
      posterizeLevels={node.posterize !== undefined ? node.posterize : 256}
      chromaticAberration={node.chromaticAberration || 0}
      width={node.width}
      height={node.height}
      sceneFunc={(ctx, shape) => {
        if (!image) return;
        const width = shape.width();
        const height = shape.height();
        
        if (node.strokeWidth > 0 && node.stroke) {
          const w = node.strokeWidth;
          const c = node.stroke;
          ctx.save();
          if (ctx._context) {
            ctx._context.filter = `drop-shadow(${w}px 0px 0px ${c}) drop-shadow(-${w}px 0px 0px ${c}) drop-shadow(0px ${w}px 0px ${c}) drop-shadow(0px -${w}px 0px ${c})`;
          }
          ctx.drawImage(image, 0, 0, width, height);
          ctx.restore();
        } else {
          ctx.drawImage(image, 0, 0, width, height);
        }
        
        ctx.fillStrokeShape(shape);
      }}
    />
  );
}
