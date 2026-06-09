"use client";
import React, { useState } from 'react';
import RetroWindow from './RetroWindow';
import { useCanvasStore } from '@/store/useCanvasStore';
import { removeBackground } from '@imgly/background-removal';
import { Scissors } from 'lucide-react';
import { useWindowStore } from '@/store/useWindowStore';

export default function ImageWindow() {
  const present = useCanvasStore(state => state.present);
  const dispatch = useCanvasStore(state => state.dispatch);
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedNodes = present.nodes.filter(n => present.selectedIds.includes(n.id));
  const activeNode = selectedNodes.length === 1 ? selectedNodes[0] : null;

  const updateNode = (key, value) => {
    if (activeNode) {
      dispatch({ type: 'UPDATE_NODE', payload: { id: activeNode.id, data: { [key]: value } } });
    }
  };

  const handleMagicCutout = async () => {
    if (!activeNode || activeNode.type !== 'image') return;
    setIsProcessing(true);
    const { startProgress, updateProgress, stopProgress } = useWindowStore.getState();
    startProgress("Preparing Image...");

    try {
      // Convert relative paths to absolute URLs, or leave data URLs intact
      const url = activeNode.src.startsWith('data:') || activeNode.src.startsWith('http') 
        ? activeNode.src 
        : new URL(activeNode.src, window.location.origin).href;
        
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch image data: ${response.status} ${response.statusText}`);
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        throw new Error('Server returned an HTML page instead of an image. Ensure the image path is correct.');
      }

      const blob = await response.blob();
      
      startProgress("Loading AI Models...");
      // Process background removal from the downloaded blob
      const config = {
        publicPath: window.location.origin + "/",
        progress: (key, current, total) => {
          const percent = Math.round((current / total) * 100);
          if (key.startsWith("fetch:")) {
            updateProgress(percent, `Downloading AI Data (${percent}%)...`);
          } else if (key.startsWith("compute:")) {
            updateProgress(percent, `Removing Background (${percent}%)...`);
          }
        }
      };
      const transparentBlob = await removeBackground(blob, config);
      
      // Convert result to base64
      const reader = new FileReader();
      reader.onload = (event) => {
        // Update the active node's src with the new cutout image
        updateNode('src', event.target.result);
      };
      reader.readAsDataURL(transparentBlob);
    } catch (err) {
      console.error("Background removal failed", err);
      alert(`Failed to remove background: ${err.message || err}`);
    } finally {
      setIsProcessing(false);
      useWindowStore.getState().stopProgress();
    }
  };

  return (
    <RetroWindow id="image" title="Image FX">
      <div className="flex flex-col h-full bg-[#c0c0c0] p-2 space-y-4">
        
        {!activeNode || activeNode.type !== 'image' ? (
          <div className="border inset p-2 bg-white text-center text-gray-500 text-xs italic flex-1 flex items-center justify-center">
            Select an image layer to apply effects.
          </div>
        ) : (
          <>
            {/* Magic Cutout Tool */}
            <div className="border inset p-2 bg-white flex flex-col space-y-2">
              <div className="text-xs font-bold border-b border-gray-400 pb-1 mb-1">AI Tools</div>
              <button 
                onClick={handleMagicCutout} 
                disabled={isProcessing}
                className="bg-[#c0c0c0] border outset active:inset flex items-center justify-center space-x-2 py-1 text-[10px] font-bold disabled:opacity-50"
              >
                <Scissors size={14} />
                <span>{isProcessing ? 'Processing AI...' : 'Magic Cutout (Remove BG)'}</span>
              </button>
            </div>

            {/* Adjustments */}
            <div className="border inset p-2 bg-white flex flex-col space-y-2 flex-1">
              <div className="text-xs font-bold border-b border-gray-400 pb-1 mb-2">Adjustments</div>
              
              <div className="flex flex-col space-y-1">
                <label className="text-[10px]">Brightness</label>
                <input 
                  type="range" min="-1" max="1" step="0.05"
                  value={activeNode.brightness || 0} 
                  onChange={(e) => updateNode('brightness', parseFloat(e.target.value))} 
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-[10px]">Contrast</label>
                <input 
                  type="range" min="-100" max="100" 
                  value={activeNode.contrast || 0} 
                  onChange={(e) => updateNode('contrast', parseInt(e.target.value))} 
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-[10px]">Saturation</label>
                <input 
                  type="range" min="-1" max="1" step="0.05"
                  value={activeNode.saturation || 0} 
                  onChange={(e) => updateNode('saturation', parseFloat(e.target.value))} 
                />
              </div>
              <div className="flex flex-col space-y-1 mt-2">
                <label className="text-[10px]">Blur Radius</label>
                <input 
                  type="range" min="0" max="40" 
                  value={activeNode.blurRadius || 0} 
                  onChange={(e) => updateNode('blurRadius', parseInt(e.target.value))} 
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-[10px]">Posterize (Levels)</label>
                <input 
                  type="range" min="2" max="256" step="1"
                  value={activeNode.posterize !== undefined ? activeNode.posterize : 256} 
                  onChange={(e) => updateNode('posterize', parseInt(e.target.value))} 
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-[10px]">Chromatic Aberration</label>
                <input 
                  type="range" min="0" max="5" step="0.1"
                  value={activeNode.chromaticAberration || 0} 
                  onChange={(e) => updateNode('chromaticAberration', parseFloat(e.target.value))} 
                />
              </div>
            </div>
          </>
        )}
      </div>
    </RetroWindow>
  );
}
