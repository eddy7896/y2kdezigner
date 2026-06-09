"use client";
import React, { useEffect } from 'react';
import RetroWindow from './RetroWindow';
import { useCanvasStore } from '@/store/useCanvasStore';
import { Undo, Redo, Trash2, MousePointer2, Square, Circle, PenTool, Minus, Type, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

export default function ToolsWindow() {
  const present = useCanvasStore(state => state.present);
  const past = useCanvasStore(state => state.past);
  const future = useCanvasStore(state => state.future);
  const undo = useCanvasStore(state => state.undo);
  const redo = useCanvasStore(state => state.redo);
  const dispatch = useCanvasStore(state => state.dispatch);
  
  const toolMode = useCanvasStore(state => state.toolMode);
  const setToolMode = useCanvasStore(state => state.setToolMode);
  const defaultFill = useCanvasStore(state => state.defaultFill);
  const defaultStroke = useCanvasStore(state => state.defaultStroke);
  const defaultStrokeWidth = useCanvasStore(state => state.defaultStrokeWidth);
  const setDefaultStyles = useCanvasStore(state => state.setDefaultStyles);

  const selectedNodes = present.nodes.filter(n => present.selectedIds.includes(n.id));
  const activeNode = selectedNodes.length === 1 ? selectedNodes[0] : null;

  // Global Esc key listener to reset toolMode to 'select'
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setToolMode('select');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setToolMode]);

  const updateNode = (key, value) => {
    if (activeNode) {
      dispatch({ type: 'UPDATE_NODE', payload: { id: activeNode.id, data: { [key]: value } } });
    } else {
      if (key === 'fill') setDefaultStyles({ defaultFill: value });
      if (key === 'stroke') setDefaultStyles({ defaultStroke: value });
      if (key === 'strokeWidth') setDefaultStyles({ defaultStrokeWidth: Number(value) });
    }
  };

  const deleteSelected = () => {
    if (activeNode) {
      dispatch({ type: 'REMOVE_NODE', payload: { id: activeNode.id } });
      dispatch({ type: 'SET_SELECTION', payload: { ids: [] } });
    }
  };

  const ToolBtn = ({ mode, icon: Icon, label }) => (
    <button 
      onClick={() => setToolMode(mode)}
      className={`p-2 border flex flex-col items-center justify-center flex-1 ${toolMode === mode ? 'inset bg-[#dfdfdf]' : 'outset bg-[#c0c0c0]'}`}
      title={label}
    >
      <Icon size={16} />
    </button>
  );

  return (
    <RetroWindow id="tools" title="Tools">
      <div className="flex flex-col h-full bg-[#c0c0c0] p-2 space-y-4">
        
        {/* Draw Tools */}
        <div className="border inset bg-white p-2 flex flex-col space-y-1">
          <div className="text-xs font-bold mb-1">Tools</div>
          <div className="flex space-x-1">
            <ToolBtn mode="select" icon={MousePointer2} label="Select" />
            <ToolBtn mode="text" icon={Type} label="Type Tool" />
            <ToolBtn mode="rectangle" icon={Square} label="Rectangle" />
          </div>
          <div className="flex space-x-1">
            <ToolBtn mode="circle" icon={Circle} label="Circle" />
            <ToolBtn mode="line" icon={Minus} label="Line" />
            <ToolBtn mode="pen" icon={PenTool} label="Pen" />
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex justify-between space-x-2">
          <button className="flex-1 flex items-center justify-center space-x-1 border outset p-1 bg-[#c0c0c0] active:inset disabled:opacity-50" onClick={undo} disabled={past.length === 0}>
            <Undo size={14} /> <span className="text-xs font-bold">Undo</span>
          </button>
          <button className="flex-1 flex items-center justify-center space-x-1 border outset p-1 bg-[#c0c0c0] active:inset disabled:opacity-50" onClick={redo} disabled={future.length === 0}>
            <Redo size={14} /> <span className="text-xs font-bold">Redo</span>
          </button>
        </div>

        {/* Text Properties (Only visible if text is selected) */}
        {activeNode && activeNode.type === 'text' && (
          <div className="border inset p-2 bg-white flex flex-col space-y-2">
            <div className="text-xs font-bold border-b border-gray-400 pb-1 mb-2">Typography</div>
            
            <div className="flex flex-col space-y-1">
              <label className="text-[10px]">Text Content</label>
              <textarea 
                className="border inset px-1 text-xs py-1 w-full" 
                rows="2"
                value={activeNode.text || ''} 
                onChange={(e) => updateNode('text', e.target.value)} 
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[10px]">Font Family</label>
              <select 
                className="border inset text-xs p-1 w-full"
                value={activeNode.fontFamily || 'Arial'}
                onChange={(e) => updateNode('fontFamily', e.target.value)}
              >
                <option value="Arial">Arial</option>
                <option value="Orbitron">Orbitron</option>
                <option value="Audiowide">Audiowide</option>
                <option value="Syncopate">Syncopate</option>
                <option value="Bungee">Bungee</option>
                <option value="VT323">VT323</option>
                <option value='"Press Start 2P"'>Press Start 2P</option>
                <option value='"Space Mono"'>Space Mono</option>
                <option value='"Courier Prime"'>Courier Prime</option>
              </select>
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[10px]">Font Size ({activeNode.fontSize || 32}px)</label>
              <input 
                type="range" min="8" max="144" 
                value={activeNode.fontSize || 32} 
                onChange={(e) => updateNode('fontSize', parseInt(e.target.value))} 
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[10px]">Alignment</label>
              <div className="flex space-x-1">
                <button 
                  className={`p-1 flex-1 flex justify-center border ${activeNode.align === 'left' || !activeNode.align ? 'inset bg-[#dfdfdf]' : 'outset bg-[#c0c0c0]'}`}
                  onClick={() => updateNode('align', 'left')}
                ><AlignLeft size={14} /></button>
                <button 
                  className={`p-1 flex-1 flex justify-center border ${activeNode.align === 'center' ? 'inset bg-[#dfdfdf]' : 'outset bg-[#c0c0c0]'}`}
                  onClick={() => updateNode('align', 'center')}
                ><AlignCenter size={14} /></button>
                <button 
                  className={`p-1 flex-1 flex justify-center border ${activeNode.align === 'right' ? 'inset bg-[#dfdfdf]' : 'outset bg-[#c0c0c0]'}`}
                  onClick={() => updateNode('align', 'right')}
                ><AlignRight size={14} /></button>
              </div>
            </div>
          </div>
        )}

        {/* Active Node Actions */}
        <div className="border inset p-2 bg-white flex flex-col space-y-2 flex-1">
          <div className="text-xs font-bold border-b border-gray-400 pb-1 mb-2">Actions</div>
          
          <button 
            className="border outset bg-[#c0c0c0] active:inset p-1 flex items-center justify-center text-red-700 disabled:opacity-50 disabled:text-gray-500" 
            onClick={deleteSelected}
            disabled={!activeNode}
          >
            <Trash2 size={14} className="mr-1" />
            <span className="text-xs font-bold">Delete Layer</span>
          </button>
        </div>

      </div>
    </RetroWindow>
  );
}
