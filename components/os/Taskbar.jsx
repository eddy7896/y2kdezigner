"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useWindowStore } from '@/store/useWindowStore';
import StartMenu from './StartMenu';

export default function Taskbar() {
  const windows = useWindowStore(state => state.windows);
  const openWindow = useWindowStore(state => state.openWindow);
  const focusWindow = useWindowStore(state => state.focusWindow);
  const focusedWindowId = useWindowStore(state => state.focusedWindowId);
  const [time, setTime] = useState('');
  const [isStartOpen, setIsStartOpen] = useState(false);
  const startButtonRef = useRef(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    
    const handleClickOutside = (e) => {
      if (startButtonRef.current && !startButtonRef.current.contains(e.target)) {
        setIsStartOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      clearInterval(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="h-8 w-full bg-[#c0c0c0] border-t-2 border-[#ffffff] flex items-center justify-between px-1 absolute bottom-0 left-0 z-[100]">
      <div className="flex items-center space-x-1 h-full py-1 relative" ref={startButtonRef}>
        
        {/* Start Menu Popup */}
        <StartMenu isOpen={isStartOpen} closeMenu={() => setIsStartOpen(false)} />

        {/* Start Button */}
        <button 
          onClick={() => setIsStartOpen(!isStartOpen)}
          className={`h-full px-2 flex items-center space-x-1 font-bold text-sm bg-[#c0c0c0] border ${isStartOpen ? 'inset border-gray-500 border-b-white border-r-white bg-[#dfdfdf]' : 'outset border-white border-b-gray-500 border-r-gray-500 shadow-[1px_1px_0px_#000]'} active:inset`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" className="mr-1 drop-shadow-sm">
            <rect x="0" y="2" width="7" height="5" fill="#f00" transform="skewY(-10)" />
            <rect x="8" y="0" width="7" height="6" fill="#0f0" transform="skewY(-10)" />
            <rect x="0" y="8" width="7" height="5" fill="#00f" transform="skewY(-10)" />
            <rect x="8" y="7" width="7" height="6" fill="#ff0" transform="skewY(-10)" />
          </svg>
          <span className="italic tracking-wide">Start</span>
        </button>
        
        {/* Divider */}
        <div className="w-[2px] h-full bg-gray-400 border-r border-white mx-1"></div>

        {/* Open Windows Tabs */}
        {windows.filter(w => w.isOpen || w.isMinimized).map(w => {
          const isActive = focusedWindowId === w.id && !w.isMinimized;
          return (
            <button
              key={w.id}
              onClick={() => {
                if (w.isMinimized) openWindow(w.id);
                focusWindow(w.id);
              }}
              className={`h-full px-4 min-w-[120px] max-w-[160px] truncate text-left text-xs ${
                isActive 
                  ? 'border inset border-gray-500 border-b-white border-r-white bg-[#e0e0e0]' 
                  : 'border outset border-white border-b-gray-500 border-r-gray-500 bg-[#c0c0c0]'
              }`}
            >
              {w.title}
            </button>
          )
        })}
      </div>

      {/* System Tray */}
      <div className="h-full py-1 pr-1 flex items-center">
        <div className="h-full px-2 flex items-center border inset border-gray-500 border-b-white border-r-white bg-[#c0c0c0] text-xs">
          {time}
        </div>
      </div>
    </div>
  );
}
