"use client";
import React, { useState } from 'react';
import RetroWindow from './RetroWindow';
import { useCanvasStore } from '@/store/useCanvasStore';

const GRADIENT_PRESETS = [
  {
    name: 'Liquid Chrome',
    stops: [0, '#888888', 0.25, '#ffffff', 0.5, '#333333', 0.75, '#ffffff', 1, '#777777']
  },
  {
    name: 'Cyberpunk',
    stops: [0, '#ff00ff', 0.5, '#00ffff', 1, '#ffff00']
  },
  {
    name: 'Vaporwave',
    stops: [0, '#ff77ff', 0.5, '#7777ff', 1, '#00ffff']
  },
  {
    name: 'Toxic Slime',
    stops: [0, '#00ff00', 0.5, '#113300', 1, '#00ff66']
  },
  {
    name: 'Sunset Glow',
    stops: [0, '#ff3300', 0.5, '#ff9900', 1, '#330099']
  },
  {
    name: 'Matrix',
    stops: [0, '#000000', 0.4, '#00ff00', 0.6, '#005500', 1, '#000000']
  },
  {
    name: 'Bubblegum',
    stops: [0, '#ff9a9e', 0.5, '#fecfef', 1, '#a1c4fd']
  }
];

export default function GradientWindow() {
  const present = useCanvasStore(state => state.present);
  const dispatch = useCanvasStore(state => state.dispatch);
  
  const [showAdvancedCoords, setShowAdvancedCoords] = useState(false);

  const selectedNodes = present.nodes.filter(n => present.selectedIds.includes(n.id));
  const activeNode = selectedNodes.length === 1 ? selectedNodes[0] : null;
  const background = present.background || {};

  // Determine target type & values
  const isBackground = !activeNode;
  const targetName = isBackground ? 'Canvas Background' : `${activeNode.type} layer`;
  const targetObj = isBackground ? background : activeNode;

  const fillPriority = targetObj?.fillPriority || 'color';
  const fillCurvature = targetObj?.fillCurvature ?? 0;
  
  // Angle
  const fillLinearGradientAngle = targetObj?.fillLinearGradientAngle ?? 90;

  // Linear Points
  const startX = targetObj?.fillLinearGradientStartPointRatioX ?? 0;
  const startY = targetObj?.fillLinearGradientStartPointRatioY ?? 0;
  const endX = targetObj?.fillLinearGradientEndPointRatioX ?? 1;
  const endY = targetObj?.fillLinearGradientEndPointRatioY ?? 0;

  // Radial Points
  const radStartX = targetObj?.fillRadialGradientStartPointRatioX ?? 0.5;
  const radStartY = targetObj?.fillRadialGradientStartPointRatioY ?? 0.5;
  const radEndX = targetObj?.fillRadialGradientEndPointRatioX ?? 0.5;
  const radEndY = targetObj?.fillRadialGradientEndPointRatioY ?? 0.5;
  const radStartR = targetObj?.fillRadialGradientStartRadiusRatio ?? 0;
  const radEndR = targetObj?.fillRadialGradientEndRadiusRatio ?? 0.5;

  // Stops
  const rawStops = targetObj?.fillLinearGradientColorStops || targetObj?.fillRadialGradientColorStops || [0, '#ffffff', 1, '#000000'];
  const stops = [];
  for (let i = 0; i < rawStops.length; i += 2) {
    stops.push({ offset: rawStops[i], color: rawStops[i + 1] });
  }
  stops.sort((a, b) => a.offset - b.offset);

  // Dispatch update wrapper
  const updateTarget = (data) => {
    if (activeNode) {
      dispatch({ type: 'UPDATE_NODE', payload: { id: activeNode.id, data } });
    } else {
      dispatch({ type: 'SET_BACKGROUND', payload: data });
    }
  };

  const updateStops = (newStopsArray) => {
    updateTarget({
      fillLinearGradientColorStops: newStopsArray,
      fillRadialGradientColorStops: newStopsArray
    });
  };

  const handleStopChange = (idx, key, value) => {
    const updated = [...stops];
    if (key === 'offset') {
      updated[idx] = { ...updated[idx], offset: parseFloat(value) };
    } else {
      updated[idx] = { ...updated[idx], color: value };
    }
    updated.sort((a, b) => a.offset - b.offset);
    updateStops(updated.flatMap(s => [s.offset, s.color]));
  };

  const handleStopDelete = (idx) => {
    if (stops.length <= 2) return;
    const updated = stops.filter((_, i) => i !== idx);
    updateStops(updated.flatMap(s => [s.offset, s.color]));
  };

  const handleAddStop = () => {
    const offsets = stops.map(s => s.offset);
    let newOffset = 0.5;
    while (offsets.includes(newOffset) && newOffset < 0.95) {
      newOffset += 0.05;
    }
    const updated = [...stops, { offset: newOffset, color: '#00ffff' }];
    updated.sort((a, b) => a.offset - b.offset);
    updateStops(updated.flatMap(s => [s.offset, s.color]));
  };

  const applyPreset = (presetStops) => {
    updateTarget({
      fillLinearGradientColorStops: presetStops,
      fillRadialGradientColorStops: presetStops,
      fillPriority: fillPriority === 'color' ? 'linear-gradient' : fillPriority
    });
  };

  const setAngle = (deg) => {
    updateTarget({
      fillLinearGradientAngle: deg,
      fillPriority: 'linear-gradient'
    });
  };

  return (
    <RetroWindow id="gradient" title="Gradient Creator">
      <div className="flex flex-col h-full bg-[#c0c0c0] p-2 space-y-3 overflow-y-auto text-black select-none font-sans">
        
        {/* Active Target Header */}
        <div className="border inset bg-[#000080] text-white p-1 px-2 text-[10px] font-bold shadow-[inset_1px_1px_0_#555]">
          Target: <span className="text-yellow-300 uppercase">{targetName}</span>
        </div>

        {/* Fill Mode Switch */}
        <div className="flex space-x-1 p-[2px] border inset bg-[#e0e0e0]">
          <button 
            className={`flex-1 py-1 text-[10px] border outset font-bold ${fillPriority === 'color' ? 'inset bg-[#dfdfdf] border-gray-500 border-b-white border-r-white' : 'border-white border-b-gray-500 border-r-gray-500 bg-[#c0c0c0]'}`}
            onClick={() => updateTarget({ fillPriority: 'color' })}
          >
            Solid Color
          </button>
          <button 
            className={`flex-1 py-1 text-[10px] border outset font-bold ${fillPriority === 'linear-gradient' ? 'inset bg-[#dfdfdf] border-gray-500 border-b-white border-r-white' : 'border-white border-b-gray-500 border-r-gray-500 bg-[#c0c0c0]'}`}
            onClick={() => updateTarget({ fillPriority: 'linear-gradient' })}
          >
            Linear
          </button>
          <button 
            className={`flex-1 py-1 text-[10px] border outset font-bold ${fillPriority === 'radial-gradient' ? 'inset bg-[#dfdfdf] border-gray-500 border-b-white border-r-white' : 'border-white border-b-gray-500 border-r-gray-500 bg-[#c0c0c0]'}`}
            onClick={() => updateTarget({ fillPriority: 'radial-gradient' })}
          >
            Radial
          </button>
        </div>

        {fillPriority === 'color' && (
          <div className="border inset p-3 bg-white flex flex-col items-center justify-center space-y-2 flex-1">
            <span className="text-[10px] text-gray-500 text-center font-bold">Solid Fill Mode Active</span>
            <input 
              type="color" 
              className="w-16 h-16 cursor-pointer border"
              value={targetObj?.fill || '#ffffff'}
              onChange={(e) => updateTarget({ fill: e.target.value })}
            />
            <span className="text-[10px] font-mono">{targetObj?.fill || '#ffffff'}</span>
          </div>
        )}

        {fillPriority !== 'color' && (
          <>
            {/* Breakpoints / Stops Editor */}
            <div className="border inset p-2 bg-white flex flex-col space-y-2">
              <div className="flex justify-between items-center border-b pb-1">
                <span className="text-[10px] font-bold uppercase text-gray-700">Breakpoints (Stops)</span>
                <button 
                  className="bg-[#c0c0c0] border outset border-white border-b-gray-600 border-r-gray-600 text-[9px] font-bold px-2 py-[2px] active:inset"
                  onClick={handleAddStop}
                >
                  + Add Stop
                </button>
              </div>

              {/* Stop Rows list */}
              <div className="flex flex-col space-y-2 max-h-[140px] overflow-y-auto pr-1">
                {stops.map((stop, idx) => (
                  <div key={idx} className="flex items-center space-x-2 bg-[#f0f0f0] p-1 border">
                    <input 
                      type="color" 
                      className="w-5 h-5 cursor-pointer border-none"
                      value={stop.color} 
                      onChange={(e) => handleStopChange(idx, 'color', e.target.value)}
                    />
                    
                    <div className="flex-1 flex items-center space-x-1">
                      <input 
                        type="range" min="0" max="1" step="0.01"
                        className="w-full accent-blue-900"
                        value={stop.offset} 
                        onChange={(e) => handleStopChange(idx, 'offset', e.target.value)}
                      />
                      <span className="text-[9px] font-mono w-6 text-right">{Math.round(stop.offset * 100)}%</span>
                    </div>

                    <button 
                      onClick={() => handleStopDelete(idx)} 
                      disabled={stops.length <= 2}
                      className="text-[8px] bg-red-200 hover:bg-red-300 text-red-800 font-bold border border-red-400 w-4 h-4 flex items-center justify-center disabled:opacity-30 disabled:hover:bg-red-200"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Curvature & Falloff Control */}
            <div className="border inset p-2 bg-white flex flex-col space-y-1">
              <label className="text-[10px] font-bold uppercase text-gray-700 flex justify-between">
                <span>Curvature / Falloff</span>
                <span className="font-mono text-blue-700">{fillCurvature > 0 ? `+${fillCurvature.toFixed(2)}` : fillCurvature.toFixed(2)}</span>
              </label>
              <input 
                type="range" min="-1" max="1" step="0.05"
                className="w-full accent-blue-900"
                value={fillCurvature}
                onChange={(e) => updateTarget({ fillCurvature: parseFloat(e.target.value) })}
              />
              <div className="flex justify-between text-[8px] text-gray-500 font-bold px-1">
                <span>Log (Ease-Out)</span>
                <span>Linear</span>
                <span>Exp (Ease-In)</span>
              </div>
            </div>

            {/* Direction / Angle / Position Controls */}
            {fillPriority === 'linear-gradient' && (
              <div className="border inset p-2 bg-white flex flex-col space-y-2">
                <div className="flex justify-between items-center border-b pb-1">
                  <span className="text-[10px] font-bold uppercase text-gray-700">Direction & Angles</span>
                  <label className="flex items-center text-[9px] space-x-1 cursor-pointer font-bold">
                    <input 
                      type="checkbox" 
                      checked={showAdvancedCoords} 
                      onChange={(e) => setShowAdvancedCoords(e.target.checked)} 
                    />
                    <span>Manual Pt</span>
                  </label>
                </div>

                {!showAdvancedCoords ? (
                  <>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold">Angle:</span>
                      <input 
                        type="range" min="0" max="360" step="5"
                        className="flex-1 accent-blue-900"
                        value={fillLinearGradientAngle}
                        onChange={(e) => setAngle(parseInt(e.target.value))}
                      />
                      <span className="text-[9px] font-mono w-7 text-right">{fillLinearGradientAngle}°</span>
                    </div>

                    {/* Angle Presets */}
                    <div className="grid grid-cols-3 gap-1">
                      <button onClick={() => setAngle(0)} className="bg-[#c0c0c0] border outset border-white border-b-gray-600 border-r-gray-600 text-[9px] py-[2px] active:inset">L-to-R (0°)</button>
                      <button onClick={() => setAngle(90)} className="bg-[#c0c0c0] border outset border-white border-b-gray-600 border-r-gray-600 text-[9px] py-[2px] active:inset">T-to-B (90°)</button>
                      <button onClick={() => setAngle(45)} className="bg-[#c0c0c0] border outset border-white border-b-gray-600 border-r-gray-600 text-[9px] py-[2px] active:inset">Diag (45°)</button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col space-y-1 text-[9px]">
                    <div className="flex justify-between">
                      <span>Start Point X: {Math.round(startX * 100)}%</span>
                      <input type="range" min="0" max="1" step="0.05" value={startX} onChange={(e) => updateTarget({ fillLinearGradientStartPointRatioX: parseFloat(e.target.value), fillLinearGradientAngle: undefined })} className="w-24 accent-blue-900" />
                    </div>
                    <div className="flex justify-between">
                      <span>Start Point Y: {Math.round(startY * 100)}%</span>
                      <input type="range" min="0" max="1" step="0.05" value={startY} onChange={(e) => updateTarget({ fillLinearGradientStartPointRatioY: parseFloat(e.target.value), fillLinearGradientAngle: undefined })} className="w-24 accent-blue-900" />
                    </div>
                    <div className="flex justify-between">
                      <span>End Point X: {Math.round(endX * 100)}%</span>
                      <input type="range" min="0" max="1" step="0.05" value={endX} onChange={(e) => updateTarget({ fillLinearGradientEndPointRatioX: parseFloat(e.target.value), fillLinearGradientAngle: undefined })} className="w-24 accent-blue-900" />
                    </div>
                    <div className="flex justify-between">
                      <span>End Point Y: {Math.round(endY * 100)}%</span>
                      <input type="range" min="0" max="1" step="0.05" value={endY} onChange={(e) => updateTarget({ fillLinearGradientEndPointRatioY: parseFloat(e.target.value), fillLinearGradientAngle: undefined })} className="w-24 accent-blue-900" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {fillPriority === 'radial-gradient' && (
              <div className="border inset p-2 bg-white flex flex-col space-y-1 text-[9px]">
                <span className="text-[10px] font-bold uppercase text-gray-700 border-b pb-1 mb-1">Radial Configuration</span>
                
                <div className="flex justify-between items-center">
                  <span>Start Center X: {Math.round(radStartX * 100)}%</span>
                  <input type="range" min="0" max="1" step="0.05" value={radStartX} onChange={(e) => updateTarget({ fillRadialGradientStartPointRatioX: parseFloat(e.target.value) })} className="w-24 accent-blue-900" />
                </div>
                <div className="flex justify-between items-center">
                  <span>Start Center Y: {Math.round(radStartY * 100)}%</span>
                  <input type="range" min="0" max="1" step="0.05" value={radStartY} onChange={(e) => updateTarget({ fillRadialGradientStartPointRatioY: parseFloat(e.target.value) })} className="w-24 accent-blue-900" />
                </div>
                <div className="flex justify-between items-center">
                  <span>Start Radius: {Math.round(radStartR * 100)}%</span>
                  <input type="range" min="0" max="1" step="0.05" value={radStartR} onChange={(e) => updateTarget({ fillRadialGradientStartRadiusRatio: parseFloat(e.target.value) })} className="w-24 accent-blue-900" />
                </div>
                <div className="flex justify-between items-center">
                  <span>End Center X: {Math.round(radEndX * 100)}%</span>
                  <input type="range" min="0" max="1" step="0.05" value={radEndX} onChange={(e) => updateTarget({ fillRadialGradientEndPointRatioX: parseFloat(e.target.value) })} className="w-24 accent-blue-900" />
                </div>
                <div className="flex justify-between items-center">
                  <span>End Center Y: {Math.round(radEndY * 100)}%</span>
                  <input type="range" min="0" max="1" step="0.05" value={radEndY} onChange={(e) => updateTarget({ fillRadialGradientEndPointRatioY: parseFloat(e.target.value) })} className="w-24 accent-blue-900" />
                </div>
                <div className="flex justify-between items-center">
                  <span>End Radius: {Math.round(radEndR * 100)}%</span>
                  <input type="range" min="0" max="2" step="0.05" value={radEndR} onChange={(e) => updateTarget({ fillRadialGradientEndRadiusRatio: parseFloat(e.target.value) })} className="w-24 accent-blue-900" />
                </div>
              </div>
            )}

            {/* Y2K Presets */}
            <div className="border inset p-2 bg-[#d8d8d8] flex flex-col space-y-1">
              <span className="text-[9px] font-bold text-gray-700 uppercase">Y2K Aesthetic Presets</span>
              <div className="grid grid-cols-2 gap-1 max-h-[80px] overflow-y-auto p-[2px]">
                {GRADIENT_PRESETS.map((preset) => (
                  <button 
                    key={preset.name}
                    className="bg-white border outset border-white border-b-gray-500 border-r-gray-500 text-[8px] py-[2px] font-bold hover:bg-gray-100 truncate active:inset"
                    onClick={() => applyPreset(preset.stops)}
                    title={preset.name}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

      </div>
    </RetroWindow>
  );
}
