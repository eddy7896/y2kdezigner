"use client";
import React, { useState, useEffect } from 'react';
import RetroWindow from './RetroWindow';
import { useCanvasStore } from '@/store/useCanvasStore';
import { removeBackground } from '@imgly/background-removal';
import { useWindowStore } from '@/store/useWindowStore';

const Y2K_FONTS = [
  { name: 'Orbitron', label: 'Orbitron (Futuristic)' },
  { name: 'Audiowide', label: 'Audiowide (Cyber)' },
  { name: 'Syncopate', label: 'Syncopate (Wide)' },
  { name: 'Bungee', label: 'Bungee (Chunky)' },
  { name: 'VT323', label: 'VT323 (Terminal)' },
  { name: '"Press Start 2P"', label: 'Press Start 2P (Pixel)' },
  { name: '"Space Mono"', label: 'Space Mono (Code)' },
  { name: '"Courier Prime"', label: 'Courier Prime (System)' },
  { name: '"Comic Sans MS"', label: 'Comic Sans MS (Classic)' },
  { name: 'Impact', label: 'Impact (Meme/Bold)' },
  { name: '"Arial Black"', label: 'Arial Black (Heavy)' },
  { name: 'Georgia', label: 'Georgia (Serif)' },
  { name: '"Times New Roman"', label: 'Times New Roman (Formal)' },
  { name: 'Tahoma', label: 'Tahoma (Windows UI)' },
  { name: 'Verdana', label: 'Verdana (Web 1.0)' },
  { name: 'Arial', label: 'Arial (Default)' }
];

export default function AssetsWindow() {
  const [images, setImages] = useState([]);
  const [library, setLibrary] = useState({ backgrounds: [], elements: [], overlays: [] });
  const [isProcessingBg, setIsProcessingBg] = useState(false);
  const [activeTab, setActiveTab] = useState('images');
  const dispatch = useCanvasStore(state => state.dispatch);

  useEffect(() => {
    fetch('/api/library')
      .then(res => res.json())
      .then(data => setLibrary(data))
      .catch(err => console.error("Failed to load library", err));
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const { startProgress, stopProgress } = useWindowStore.getState();
    startProgress(`Uploading ${file.name}...`);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setImages(prev => [...prev, { id: Date.now().toString(), src: event.target.result, name: file.name }]);
      stopProgress();
    };
    // Fake a small delay for the UI to show the progress popup so the user can feel the Y2K vibe
    setTimeout(() => {
      reader.readAsDataURL(file);
    }, 400);
  };

  const handleRemoveBackground = async (imageObj) => {
    setIsProcessingBg(true);
    const { startProgress, updateProgress, stopProgress } = useWindowStore.getState();
    startProgress("Preparing Image...");

    try {
      const response = await fetch(imageObj.src);
      const blob = await response.blob();
      
      startProgress("Loading AI Models...");
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
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setImages(prev => [...prev, { id: Date.now().toString(), src: event.target.result, name: `Cutout_${imageObj.name}` }]);
      };
      reader.readAsDataURL(transparentBlob);
    } catch (err) {
      console.error("Background removal failed", err);
      alert("Failed to remove background. Please try another image.");
    } finally {
      setIsProcessingBg(false);
      useWindowStore.getState().stopProgress();
    }
  };

  const spawnImage = (src) => {
    dispatch({
      type: 'ADD_NODE',
      payload: {
        node: {
          id: `img_${Date.now()}`,
          type: 'image', src,
          x: 100, y: 100, width: 200, height: 200,
          scaleX: 1, scaleY: 1, rotation: 0
        }
      }
    });
  };

  const setBackground = (src) => {
    dispatch({
      type: 'SET_BACKGROUND',
      payload: { src }
    });
  };

  const spawnText = (fontFamily) => {
    dispatch({
      type: 'ADD_NODE',
      payload: {
        node: {
          id: `text_${Date.now()}`,
          type: 'text', text: 'Double click to edit...',
          fontFamily, fontSize: 32, fill: '#000000',
          x: 100, y: 100, width: 200,
          scaleX: 1, scaleY: 1, rotation: 0
        }
      }
    });
  };

  return (
    <RetroWindow id="assets" title="Asset Manager">
      <div className="flex flex-col h-full bg-[#c0c0c0]">
        
        {/* Tabs */}
        <div className="flex space-x-1 p-1 border-b-2 border-white shadow-[0_1px_0_#808080] overflow-x-auto whitespace-nowrap">
          <button className={`px-2 py-1 text-[10px] border outset ${activeTab === 'images' ? 'inset bg-[#dfdfdf] border-gray-500 border-b-white border-r-white font-bold' : 'border-white border-b-gray-500 border-r-gray-500'}`} onClick={() => setActiveTab('images')}>Uploads</button>
          <button className={`px-2 py-1 text-[10px] border outset ${activeTab === 'library' ? 'inset bg-[#dfdfdf] border-gray-500 border-b-white border-r-white font-bold' : 'border-white border-b-gray-500 border-r-gray-500'}`} onClick={() => setActiveTab('library')}>Elements</button>
          <button className={`px-2 py-1 text-[10px] border outset ${activeTab === 'backgrounds' ? 'inset bg-[#dfdfdf] border-gray-500 border-b-white border-r-white font-bold' : 'border-white border-b-gray-500 border-r-gray-500'}`} onClick={() => setActiveTab('backgrounds')}>Backgrounds</button>
          <button className={`px-2 py-1 text-[10px] border outset ${activeTab === 'text' ? 'inset bg-[#dfdfdf] border-gray-500 border-b-white border-r-white font-bold' : 'border-white border-b-gray-500 border-r-gray-500'}`} onClick={() => setActiveTab('text')}>Fonts</button>
        </div>

        <div className="flex-1 overflow-auto p-2">
          {activeTab === 'images' && (
            <div className="flex flex-col space-y-4">
              <div className="border inset p-2 bg-white flex flex-col items-center">
                <label className="cursor-pointer bg-[#c0c0c0] border outset border-white border-b-gray-500 border-r-gray-500 px-4 py-1 text-sm font-bold active:inset">
                  Upload Image
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>

              {isProcessingBg && <div className="text-xs text-blue-800 font-bold animate-pulse text-center">Processing ML Background Removal...</div>}

              <div className="grid grid-cols-2 gap-2">
                {images.map(img => (
                  <div key={img.id} className="border inset bg-white p-1 flex flex-col">
                    <img src={img.src} alt={img.name} className="w-full h-24 object-contain cursor-pointer" onClick={() => spawnImage(img.src)} title="Click to add to canvas" />
                    <div className="text-[10px] truncate w-full text-center mt-1">{img.name}</div>
                    <button onClick={() => handleRemoveBackground(img)} disabled={isProcessingBg || img.name.startsWith('Cutout_')} className="mt-1 text-[10px] bg-[#c0c0c0] border outset px-1 active:inset disabled:opacity-50">
                      {img.name.startsWith('Cutout_') ? 'Is Cutout' : 'Magic Cutout'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'library' && (
            <div className="grid grid-cols-2 gap-2">
              {library.elements.map(src => (
                <div key={src} className="border inset bg-white p-1 flex flex-col">
                  <img src={src} className="w-full h-24 object-contain cursor-pointer" onClick={() => spawnImage(src)} title="Click to add to canvas" />
                </div>
              ))}
              {library.elements.length === 0 && <p className="text-xs text-gray-500 col-span-2 text-center">Drop PNGs in public/library/elements/</p>}
            </div>
          )}

          {activeTab === 'backgrounds' && (
            <div className="grid grid-cols-2 gap-2">
              {library.backgrounds.map(src => (
                <div key={src} className="border inset bg-white p-1 flex flex-col">
                  <img src={src} className="w-full h-24 object-cover cursor-pointer" onClick={() => setBackground(src)} title="Click to set canvas background" />
                </div>
              ))}
              {library.backgrounds.length === 0 && <p className="text-xs text-gray-500 col-span-2 text-center">Drop PNGs in public/library/backgrounds/</p>}
            </div>
          )}

          {activeTab === 'text' && (
            <div className="flex flex-col space-y-2">
              {Y2K_FONTS.map(font => (
                <button key={font.name} onClick={() => spawnText(font.name)} className="bg-white border inset p-2 text-left hover:bg-[#000080] hover:text-white" style={{ fontFamily: font.name }}>
                  {font.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </RetroWindow>
  );
}
