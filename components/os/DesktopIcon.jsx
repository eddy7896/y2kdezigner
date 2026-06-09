"use client";
import React from 'react';
import { useWindowStore } from '@/store/useWindowStore';

export default function DesktopIcon({ icon, label, windowId }) {
  const openWindow = useWindowStore(state => state.openWindow);

  return (
    <div 
      className="flex flex-col items-center justify-center w-20 cursor-pointer group"
      onDoubleClick={() => openWindow(windowId)}
    >
      <div className="w-12 h-12 bg-transparent group-hover:bg-blue-500/50 rounded flex items-center justify-center text-4xl mb-1 border border-transparent group-hover:border-dotted group-hover:border-white">
        {typeof icon === 'string' && icon.endsWith('.ico') ? (
          <img src={icon} alt={label} className="w-8 h-8 pointer-events-none" style={{ imageRendering: 'pixelated' }} />
        ) : (
          icon
        )}
      </div>
      <span className="text-white text-xs text-center drop-shadow-[1px_1px_1px_rgba(0,0,0,0.8)] px-1 group-hover:bg-blue-600 group-hover:text-white">
        {label}
      </span>
    </div>
  );
}
