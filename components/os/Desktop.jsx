"use client";
import React from 'react';
import DesktopIcon from './DesktopIcon';
import Taskbar from './Taskbar';
import RetroWindow from './RetroWindow';
import ToolsWindow from './ToolsWindow';
import AssetsWindow from './AssetsWindow';
import LayersWindow from './LayersWindow';
import ColorWindow from './ColorWindow';
import ImageWindow from './ImageWindow';
import ProgressBarDialog from './ProgressBarDialog';
import MusicPlayer from './MusicPlayer';
import GradientWindow from './GradientWindow';
import Canvas from '../canvas/Canvas';
import { useWindowStore } from '@/store/useWindowStore';

export default function Desktop() {
  const isProgressActive = useWindowStore(state => state.isProgressActive);

  return (
    <div 
      className={`w-full h-screen bg-[#008080] overflow-hidden flex flex-col relative font-sans select-none ${isProgressActive ? 'cursor-retro-wait' : ''}`}
      style={{ backgroundImage: "url('/system/wallpaper.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {/* Desktop Icons */}
      <div className="p-4 flex flex-col space-y-4 items-start h-[calc(100vh-32px)]">
        <DesktopIcon icon="/windows2000/Windows 2000 MS-DOS Application.ico" label="Y2K Designer" windowId="canvas" />
        <DesktopIcon icon="/windows2000/Windows 2000 Closed Folder.ico" label="Asset Manager" windowId="assets" />
        <DesktopIcon icon="/windows2000/Windows 2000 Control Panel.ico" label="Tools" windowId="tools" />
        <DesktopIcon icon="/windows2000/Windows 2000 Program Group.ico" label="Layers" windowId="layers" />
        <DesktopIcon icon="/windows2000/Windows 2000 Bitmap Image.ico" label="Colors" windowId="colors" />
        <DesktopIcon icon="/windows2000/Windows 2000 JPEG Image.ico" label="Image FX" windowId="image" />
        <DesktopIcon icon="/windows2000/Windows 2000 Audio CD.ico" label="Y2KAmp" windowId="music" />
        <DesktopIcon icon="/windows2000/Windows 2000 Administrative Tools.ico" label="Gradient Creator" windowId="gradient" />
      </div>

      {/* Windows Layer */}
      <RetroWindow id="canvas" title="Y2K Designer - Canvas">
        <div className="w-full h-full flex items-center justify-center text-gray-500 bg-[radial-gradient(#d3d3d3_1px,transparent_1px)]" style={{ backgroundSize: '20px 20px' }}>
          <Canvas />
        </div>
      </RetroWindow>

      <ToolsWindow />
      <ColorWindow />
      <AssetsWindow />
      <LayersWindow />
      <ImageWindow />
      <MusicPlayer />
      <GradientWindow />
      
      {/* Global Modals */}
      <ProgressBarDialog />

      {/* Taskbar Layer */}
      <Taskbar />
    </div>
  );
}
