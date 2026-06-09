"use client";
import React, { useState, useEffect, useRef } from 'react';
import RetroWindow from './RetroWindow';

export default function MusicPlayer() {
  const [tracks, setTracks] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    fetch('/api/library')
      .then(res => res.json())
      .then(data => {
        if (data.music && data.music.length > 0) {
          setTracks(data.music);
        } else {
          // Provide a fake track so the UI looks complete even if empty
          setTracks([{ placeholder: true, url: null, name: "Drop MP3/WAV in public/library/music" }]);
        }
      })
      .catch(err => console.error("Failed to load music library", err));
  }, []);

  const currentTrack = tracks[currentTrackIndex];
  const trackName = currentTrack?.placeholder ? currentTrack.name : (currentTrack?.split('/').pop() || 'NO TRACK');

  // Initialize Web Audio API for synthesizer visualizer
  const initAudioVisualizer = () => {
    if (!audioRef.current || !canvasRef.current) return;
    
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 64; // Low res for blocky retro feel
      
      // We must check if source is already created to avoid DOMException
      if (!sourceRef.current) {
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
      }
    }

    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    drawVisualizer();
  };

  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      ctx.fillStyle = '#000'; // Black background like winamp lcd
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 1.5;
      let barHeight;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 255 * canvas.height;
        
        // Classic Winamp Green to Red gradient
        ctx.fillStyle = `rgb(${dataArray[i]}, ${255 - dataArray[i]}, 0)`;
        
        // Draw blocks instead of smooth lines for retro feel
        const blockHeight = 3;
        const gap = 1;
        const numBlocks = Math.floor(barHeight / (blockHeight + gap));
        
        for (let j = 0; j < numBlocks; j++) {
          ctx.fillRect(x, canvas.height - (j * (blockHeight + gap)) - blockHeight, barWidth - 1, blockHeight);
        }
        
        x += barWidth;
      }
    };
    
    draw();
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (currentTrack?.placeholder) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      initAudioVisualizer();
    }
  };

  const nextTrack = () => {
    if (tracks.length <= 1 || currentTrack?.placeholder) return;
    const nextIdx = (currentTrackIndex + 1) % tracks.length;
    setCurrentTrackIndex(nextIdx);
    setIsPlaying(true);
    setTimeout(() => {
      audioRef.current.play();
      initAudioVisualizer();
    }, 50);
  };

  const prevTrack = () => {
    if (tracks.length <= 1 || currentTrack?.placeholder) return;
    const prevIdx = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    setCurrentTrackIndex(prevIdx);
    setIsPlaying(true);
    setTimeout(() => {
      audioRef.current.play();
      initAudioVisualizer();
    }, 50);
  };

  const handleEnded = () => {
    nextTrack();
  };

  return (
    <RetroWindow id="music" title="Y2KAmp">
      <div className="flex flex-col bg-[#2e2e36] border-2 border-[#5a5a66] p-2 text-white w-full h-full font-sans select-none shadow-[inset_1px_1px_0_#888]">
        
        {/* LCD Screen area */}
        <div className="bg-[#000] border-2 border-[#111] border-b-[#444] border-r-[#444] p-2 mb-3 flex flex-col space-y-2 h-20">
          
          {/* Scrolling text simulator */}
          <div className="text-[10px] text-[#0f0] font-mono whitespace-nowrap overflow-hidden relative">
            <span className="inline-block animate-[marquee_5s_linear_infinite]">
              {trackName.toUpperCase()}
            </span>
          </div>

          {/* Visualizer */}
          <div className="flex-1 flex items-center justify-center bg-black overflow-hidden relative">
            <canvas ref={canvasRef} width="160" height="30" className="w-full h-full object-fill" />
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center text-[#0f0] text-[8px] font-mono">
                [ VISUALIZER OFF ]
              </div>
            )}
          </div>
        </div>

        <audio 
          ref={audioRef} 
          src={currentTrack?.placeholder ? null : currentTrack} 
          onEnded={handleEnded}
          crossOrigin="anonymous"
        />

        {/* Controls */}
        <div className="flex flex-col space-y-2">
          {/* Volume Slider */}
          <div className="flex items-center space-x-2">
            <span className="text-[9px] font-bold text-[#888]">VOL</span>
            <input 
              type="range" min="0" max="1" step="0.05"
              value={volume} 
              onChange={(e) => setVolume(parseFloat(e.target.value))} 
              className="w-full h-2 bg-black accent-[#0f0] rounded-none appearance-none cursor-pointer border border-[#555]"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between space-x-1">
            <button onClick={prevTrack} className="flex-1 bg-[#4a4a55] border-t-[#6a6a75] border-l-[#6a6a75] border-b-[#1a1a25] border-r-[#1a1a25] border p-1 text-[10px] active:border-t-[#1a1a25] active:border-l-[#1a1a25] active:border-b-[#6a6a75] active:border-r-[#6a6a75]">
              ⏮
            </button>
            <button onClick={togglePlay} className="flex-2 bg-[#4a4a55] border-t-[#6a6a75] border-l-[#6a6a75] border-b-[#1a1a25] border-r-[#1a1a25] border p-1 text-[12px] font-bold w-12 active:border-t-[#1a1a25] active:border-l-[#1a1a25] active:border-b-[#6a6a75] active:border-r-[#6a6a75] text-[#0f0]">
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button onClick={nextTrack} className="flex-1 bg-[#4a4a55] border-t-[#6a6a75] border-l-[#6a6a75] border-b-[#1a1a25] border-r-[#1a1a25] border p-1 text-[10px] active:border-t-[#1a1a25] active:border-l-[#1a1a25] active:border-b-[#6a6a75] active:border-r-[#6a6a75]">
              ⏭
            </button>
          </div>
        </div>

      </div>
    </RetroWindow>
  );
}
