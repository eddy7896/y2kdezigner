"use client";
import React from 'react';
import { Rnd } from 'react-rnd';
import { useWindowStore } from '@/store/useWindowStore';
import { X, Minus, Square } from 'lucide-react';

export default function RetroWindow({ id, title, children }) {
  const windowState = useWindowStore(state => state.windows.find(w => w.id === id));
  const focusWindow = useWindowStore(state => state.focusWindow);
  const closeWindow = useWindowStore(state => state.closeWindow);
  const minimizeWindow = useWindowStore(state => state.minimizeWindow);
  const updateWindowBounds = useWindowStore(state => state.updateWindowBounds);
  const focusedWindowId = useWindowStore(state => state.focusedWindowId);

  if (!windowState || !windowState.isOpen || windowState.isMinimized) return null;

  const isActive = focusedWindowId === id;

  return (
    <Rnd
      size={{ width: windowState.width, height: windowState.height }}
      position={{ x: windowState.x, y: windowState.y }}
      onDragStop={(e, d) => {
        updateWindowBounds(id, { x: d.x, y: d.y });
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        updateWindowBounds(id, {
          width: parseInt(ref.style.width, 10),
          height: parseInt(ref.style.height, 10),
          ...position
        });
      }}
      onMouseDown={() => focusWindow(id)}
      minWidth={300}
      minHeight={200}
      bounds="parent"
      className="absolute"
      style={{ zIndex: windowState.zIndex }}
      dragHandleClassName="window-titlebar"
    >
      <div className={`w-full h-full flex flex-col y2k-panel ${isActive ? 'ring-1 ring-black' : ''}`}>
        {/* Title Bar */}
        <div 
          className={`window-titlebar flex justify-between items-center px-1 py-[2px] ${isActive ? 'bg-[#000080] text-white' : 'bg-[#808080] text-[#c0c0c0]'}`}
          onDoubleClick={() => {
            // Maximize toggle logic could go here
          }}
        >
          <div className="flex items-center space-x-1 font-bold text-sm tracking-wide select-none">
            {/* Optional icon here */}
            <span>{title}</span>
          </div>
          <div className="flex items-center space-x-[2px]">
            <button 
              className="bg-[#c0c0c0] text-black w-4 h-4 flex items-center justify-center border outset border-white border-b-gray-500 border-r-gray-500 active:inset"
              onClick={() => minimizeWindow(id)}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Minus size={10} strokeWidth={4} />
            </button>
            <button 
              className="bg-[#c0c0c0] text-black w-4 h-4 flex items-center justify-center border outset border-white border-b-gray-500 border-r-gray-500 active:inset"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Square size={9} strokeWidth={3} />
            </button>
            <button 
              className="bg-[#c0c0c0] text-black w-4 h-4 flex items-center justify-center border outset border-white border-b-gray-500 border-r-gray-500 active:inset ml-1"
              onClick={() => closeWindow(id)}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <X size={12} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-[#c0c0c0] overflow-hidden p-1">
          {/* Inner inset border for content */}
          <div className="w-full h-full border-2 inset border-gray-500 border-b-white border-r-white bg-white overflow-auto relative">
            {children}
          </div>
        </div>
      </div>
    </Rnd>
  );
}
