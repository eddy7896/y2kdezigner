"use client";
import React from 'react';
import RetroWindow from './RetroWindow';
import { useCanvasStore } from '@/store/useCanvasStore';

export default function ColorWindow() {
  const present = useCanvasStore(state => state.present);
  const dispatch = useCanvasStore(state => state.dispatch);
  
  const defaultFill = useCanvasStore(state => state.defaultFill);
  const defaultStroke = useCanvasStore(state => state.defaultStroke);
  const defaultStrokeWidth = useCanvasStore(state => state.defaultStrokeWidth);
  const defaultOpacity = useCanvasStore(state => state.defaultOpacity);
  const defaultBlendMode = useCanvasStore(state => state.defaultBlendMode);
  const defaultShadowColor = useCanvasStore(state => state.defaultShadowColor);
  const defaultShadowBlur = useCanvasStore(state => state.defaultShadowBlur);
  const defaultShadowOffsetX = useCanvasStore(state => state.defaultShadowOffsetX);
  const defaultShadowOffsetY = useCanvasStore(state => state.defaultShadowOffsetY);
  const setDefaultStyles = useCanvasStore(state => state.setDefaultStyles);

  const selectedNodes = present.nodes.filter(n => present.selectedIds.includes(n.id));
  const activeNode = selectedNodes.length === 1 ? selectedNodes[0] : null;

  const updateNode = (key, value) => {
    if (activeNode) {
      const data = { [key]: value };
      
      // Implicitly apply defaults so users don't have to manually set both
      if (key === 'strokeWidth' && !activeNode.stroke) {
        data.stroke = defaultStroke;
      }
      if (key === 'stroke' && (!activeNode.strokeWidth || activeNode.strokeWidth === 0)) {
        data.strokeWidth = defaultStrokeWidth || 2;
      }

      dispatch({ type: 'UPDATE_NODE', payload: { id: activeNode.id, data } });
    } else {
      if (key === 'fill') setDefaultStyles({ defaultFill: value });
      if (key === 'stroke') setDefaultStyles({ defaultStroke: value });
      if (key === 'strokeWidth') setDefaultStyles({ defaultStrokeWidth: Number(value) });
      if (key === 'opacity') setDefaultStyles({ defaultOpacity: Number(value) });
      if (key === 'blendMode') setDefaultStyles({ defaultBlendMode: value });
      if (key === 'shadowColor') setDefaultStyles({ defaultShadowColor: value });
      if (key === 'shadowBlur') setDefaultStyles({ defaultShadowBlur: Number(value) });
      if (key === 'shadowOffsetX') setDefaultStyles({ defaultShadowOffsetX: Number(value) });
      if (key === 'shadowOffsetY') setDefaultStyles({ defaultShadowOffsetY: Number(value) });
    }
  };

  return (
    <RetroWindow id="colors" title="Colors & Styles">
      <div className="flex flex-col h-full bg-[#c0c0c0] p-2 space-y-4">
        
        <div className="border inset p-2 bg-white flex flex-col space-y-2 flex-1">
          {!activeNode ? (
            <div className="text-[10px] text-gray-500 italic mb-2">Editing Default Drawing Styles</div>
          ) : (
            <div className="text-[10px] text-blue-700 italic mb-2">Editing {activeNode.type} layer</div>
          )}

          <div className="flex flex-col space-y-1">
            <label className="text-[10px] font-bold">Fill Color</label>
            <input 
              type="color" 
              className="w-full h-8" 
              value={activeNode?.fill || defaultFill} 
              onChange={(e) => updateNode('fill', e.target.value)} 
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-[10px] font-bold">Stroke Color</label>
            <input 
              type="color" 
              className="w-full h-8" 
              value={activeNode?.stroke || defaultStroke} 
              onChange={(e) => updateNode('stroke', e.target.value)} 
            />
          </div>

          <div className="flex flex-col space-y-1 mt-2">
            <label className="text-[10px] font-bold">Stroke Width ({activeNode?.strokeWidth || defaultStrokeWidth}px)</label>
            <input 
              type="range" min="0" max="20" 
              value={activeNode?.strokeWidth || defaultStrokeWidth} 
              onChange={(e) => updateNode('strokeWidth', parseInt(e.target.value))} 
            />
          </div>

          <div className="flex flex-col space-y-1 mt-2">
            <label className="text-[10px] font-bold">Opacity ({Math.round((activeNode?.opacity ?? defaultOpacity) * 100)}%)</label>
            <input 
              type="range" min="0" max="1" step="0.01"
              value={activeNode?.opacity ?? defaultOpacity} 
              onChange={(e) => updateNode('opacity', parseFloat(e.target.value))} 
            />
          </div>

          <div className="flex flex-col space-y-1 mt-2">
            <label className="text-[10px] font-bold">Blend Mode</label>
            <select 
              className="border inset p-1 text-[10px]"
              value={activeNode?.blendMode || defaultBlendMode}
              onChange={(e) => updateNode('blendMode', e.target.value)}
            >
              <option value="source-over">Normal</option>
              <option value="multiply">Multiply</option>
              <option value="screen">Screen</option>
              <option value="overlay">Overlay</option>
              <option value="darken">Darken</option>
              <option value="lighten">Lighten</option>
              <option value="difference">Difference</option>
              <option value="exclusion">Exclusion</option>
            </select>
          </div>
        </div>

        {/* Shadows */}
        <div className="border inset p-2 bg-white flex flex-col space-y-2 flex-1">
          <div className="text-[10px] font-bold border-b border-gray-400 pb-1 flex justify-between items-center">
            <span>Drop Shadow</span>
            <input 
              type="checkbox" 
              checked={activeNode ? !!activeNode.shadowEnabled : false} 
              onChange={(e) => updateNode('shadowEnabled', e.target.checked)} 
            />
          </div>

          {(activeNode ? activeNode.shadowEnabled : false) && (
            <>
              <div className="flex flex-col space-y-1">
                <label className="text-[10px]">Color</label>
                <input 
                  type="color" 
                  className="w-full h-8" 
                  value={activeNode?.shadowColor || defaultShadowColor} 
                  onChange={(e) => updateNode('shadowColor', e.target.value)} 
                />
              </div>

              <div className="flex flex-col space-y-1 mt-1">
                <label className="text-[10px]">Blur ({activeNode?.shadowBlur || 0}px)</label>
                <input 
                  type="range" min="0" max="50" 
                  value={activeNode?.shadowBlur || 0} 
                  onChange={(e) => updateNode('shadowBlur', parseInt(e.target.value))} 
                />
              </div>

              <div className="flex space-x-2 mt-1">
                <div className="flex flex-col space-y-1 flex-1">
                  <label className="text-[10px]">Offset X</label>
                  <input 
                    type="number" className="border inset px-1 text-xs" 
                    value={activeNode?.shadowOffsetX ?? defaultShadowOffsetX} 
                    onChange={(e) => updateNode('shadowOffsetX', parseInt(e.target.value) || 0)} 
                  />
                </div>
                <div className="flex flex-col space-y-1 flex-1">
                  <label className="text-[10px]">Offset Y</label>
                  <input 
                    type="number" className="border inset px-1 text-xs" 
                    value={activeNode?.shadowOffsetY ?? defaultShadowOffsetY} 
                    onChange={(e) => updateNode('shadowOffsetY', parseInt(e.target.value) || 0)} 
                  />
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </RetroWindow>
  );
}
