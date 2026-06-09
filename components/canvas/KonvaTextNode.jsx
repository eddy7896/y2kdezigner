import React from 'react';
import { Text as KonvaText } from 'react-konva';

export default function KonvaTextNode({ node, onSelect, onDragEnd, onTransformEnd, ...commonProps }) {
  return (
    <KonvaText
      text={node.text}
      fontFamily={node.fontFamily || 'Arial'}
      fontSize={node.fontSize || 24}
      fill={node.fill || '#000'}
      align={node.align || 'left'}
      {...commonProps}
      onTransform={(e) => {
        const target = e.target;
        target.setAttrs({
          width: Math.max(5, target.width() * target.scaleX()),
          scaleX: 1,
          scaleY: 1,
        });
      }}
      onTransformEnd={onTransformEnd}
    />
  );
}
