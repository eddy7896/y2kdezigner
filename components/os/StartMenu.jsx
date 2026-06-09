"use client";
import React from 'react';
import { useWindowStore } from '@/store/useWindowStore';

export default function StartMenu({ isOpen, closeMenu }) {
  const openWindow = useWindowStore(state => state.openWindow);

  if (!isOpen) return null;

  const handleLaunch = (id) => {
    openWindow(id);
    closeMenu();
  };

  return (
    <div className="absolute left-0 bottom-8 flex bg-[#c0c0c0] border outset border-white border-b-gray-800 border-r-gray-800 shadow-[2px_2px_4px_rgba(0,0,0,0.5)] z-50">
      
      {/* Left Sidebar Banner */}
      <div className="w-8 bg-[#000080] flex items-end justify-center py-2 relative overflow-hidden">
        <span className="text-white text-sm font-bold tracking-widest transform -rotate-90 whitespace-nowrap absolute bottom-12 opacity-80">
          Windows 2000
        </span>
      </div>

      {/* Menu Items */}
      <div className="flex flex-col py-1 min-w-[200px] text-sm text-black">
        <MenuItem 
          icon="/windows2000/Windows 2000 MS-DOS Application.ico" 
          label="Y2K Designer" 
          onClick={() => handleLaunch('canvas')} 
        />
        <MenuItem 
          icon="/windows2000/Windows 2000 Audio CD.ico" 
          label="Y2KAmp Music Player" 
          onClick={() => handleLaunch('music')} 
        />
        <MenuItem 
          icon="/windows2000/Windows 2000 JPEG Image.ico" 
          label="Image FX" 
          onClick={() => handleLaunch('image')} 
        />
        
        <div className="w-full h-0 border-t border-gray-400 border-b border-white my-1 mx-1 px-2" />
        
        <MenuItem 
          icon="/windows2000/Windows 2000 Program Group.ico" 
          label="Layers" 
          onClick={() => handleLaunch('layers')} 
        />
        <MenuItem 
          icon="/windows2000/Windows 2000 Control Panel.ico" 
          label="Tools" 
          onClick={() => handleLaunch('tools')} 
        />
        <MenuItem 
          icon="/windows2000/Windows 2000 Bitmap Image.ico" 
          label="Colors" 
          onClick={() => handleLaunch('colors')} 
        />
        <MenuItem 
          icon="/windows2000/Windows 2000 Closed Folder.ico" 
          label="Asset Manager" 
          onClick={() => handleLaunch('assets')} 
        />
        
        <div className="w-full h-0 border-t border-gray-400 border-b border-white my-1 mx-1 px-2" />
        
        <MenuItem 
          icon="/windows2000/Windows 2000 Shut Down.ico" 
          label="Shut Down..." 
          onClick={() => {
            alert("It is now safe to turn off your computer.");
            closeMenu();
          }} 
        />
      </div>
    </div>
  );
}

function MenuItem({ icon, label, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center space-x-3 px-3 py-1 hover:bg-[#000080] hover:text-white group w-full text-left"
    >
      <img src={icon} alt={label} className="w-8 h-8 pointer-events-none" style={{ imageRendering: 'pixelated' }} />
      <span>{label}</span>
    </button>
  );
}
