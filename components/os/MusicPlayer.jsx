"use client";
import React, { useState, useEffect, useRef } from 'react';
import RetroWindow from './RetroWindow';

// Direct MP3 URL presets from soundhelix (public domain and CORS-enabled)
const WEB_PRESETS = [
  {
    name: "CORS - Cyberpunk Beat (Track 1)",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    name: "CORS - Retro Electro (Track 4)",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
  },
  {
    name: "CORS - Ambient Journey (Track 8)",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
  }
];

// YouTube Embed parser
const getYoutubeEmbed = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}?autoplay=1` : null;
};

// Spotify Embed parser
const getSpotifyEmbed = (url) => {
  if (!url) return null;
  const match = url.match(/open\.spotify\.com\/(track|playlist|album|show|episode)\/([a-zA-Z0-9]+)/);
  return match ? `https://open.spotify.com/embed/${match[1]}/${match[2]}` : null;
};

// SoundCloud Embed parser
const getSoundCloudEmbed = (url) => {
  if (!url) return null;
  if (url.includes('soundcloud.com')) {
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23000080&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`;
  }
  return null;
};

// General Embed Parser Selector
const getEmbedUrl = (url) => {
  return getYoutubeEmbed(url) || getSpotifyEmbed(url) || getSoundCloudEmbed(url);
};

// URL validation helper for HTML5 audio sources
const isValidUrl = (url) => {
  return typeof url === 'string' && (url.startsWith('http') || url.startsWith('/') || url.startsWith('data:'));
};

export default function MusicPlayer() {
  const [tracks, setTracks] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  
  // Custom URL inputs
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');

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
        // Map local files
        const localTracks = (data.music || []).map(f => ({
          name: f.split('/').pop() || 'Unknown Local Track',
          url: f
        }));
        // Merge with presets
        const merged = [...localTracks, ...WEB_PRESETS];
        setTracks(merged);
      })
      .catch(err => {
        console.error("Failed to load music library", err);
        setTracks(WEB_PRESETS);
      });
  }, []);

  const currentTrack = tracks[currentTrackIndex];
  const trackName = currentTrack?.name || 'NO TRACK';
  const embedUrl = currentTrack ? getEmbedUrl(currentTrack.url) : null;
  const isEmbed = !!embedUrl;

  // Initialize Web Audio API for synthesizer visualizer
  const initAudioVisualizer = () => {
    if (!canvasRef.current) return;
    
    // We only need audioContext & analyser if it's NOT an embed!
    if (!isEmbed && audioRef.current) {
      if (!audioContextRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 64; // Low res for blocky retro feel
        
        if (!sourceRef.current) {
          sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
          sourceRef.current.connect(analyserRef.current);
          analyserRef.current.connect(audioContextRef.current.destination);
        }
      }

      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    }

    drawVisualizer();
  };

  const drawVisualizer = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // If it's an embed or we don't have analyser, we use 32 bins for visualizer simulation
    const bufferLength = (analyserRef.current && !isEmbed) ? analyserRef.current.frequencyBinCount : 32;
    const dataArray = new Uint8Array(bufferLength);
    let frameCount = 0;
    
    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      
      if (analyserRef.current && !isEmbed) {
        analyserRef.current.getByteFrequencyData(dataArray);
      } else if (isPlaying) {
        // Equalizer simulation for custom embeds / third party iframe players
        frameCount++;
        for (let i = 0; i < bufferLength; i++) {
          const baseVal = Math.sin(i * 0.3 + frameCount * 0.12) * 90 + 90;
          const noise = Math.random() * 60;
          const factor = 1 - (i / bufferLength) * 0.7; // falloff high frequencies
          dataArray[i] = Math.max(0, Math.min(255, (baseVal + noise) * factor));
        }
      } else {
        dataArray.fill(0);
      }
      
      ctx.fillStyle = '#000'; // Black LCD background
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 1.5;
      let barHeight;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 255 * canvas.height;
        ctx.fillStyle = `rgb(${dataArray[i]}, ${255 - dataArray[i]}, 0)`;
        
        // Draw blocks
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

  // Pause audio and visualizer animation if page/state changes
  const stopNativeAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const togglePlay = () => {
    if (!currentTrack) return;
    
    if (isPlaying) {
      stopNativeAudio();
      setIsPlaying(false);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    } else {
      if (!isEmbed) {
        if (!isValidUrl(currentTrack.url)) return;
        setIsPlaying(true);
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play().catch(err => {
              console.error("Audio play failed:", err);
            });
          }
        }, 50);
      } else {
        setIsPlaying(true);
      }
      setTimeout(() => {
        initAudioVisualizer();
      }, 100);
    }
  };

  const playTrackIndex = (idx) => {
    const track = tracks[idx];
    if (!track) return;
    
    setCurrentTrackIndex(idx);
    
    const nextEmbed = getEmbedUrl(track.url);
    
    if (!nextEmbed) {
      if (!isValidUrl(track.url)) {
        setIsPlaying(false);
        stopNativeAudio();
        return;
      }
      setIsPlaying(true);
      // Direct file play
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.src = track.url;
          audioRef.current.play().catch(err => {
            console.error("Audio play failed:", err);
          });
        }
        initAudioVisualizer();
      }, 100);
    } else {
      setIsPlaying(true);
      // Stop native audio since iframe controls it
      stopNativeAudio();
      setTimeout(() => {
        initAudioVisualizer();
      }, 100);
    }
  };

  const nextTrack = () => {
    if (tracks.length <= 1) return;
    const nextIdx = (currentTrackIndex + 1) % tracks.length;
    playTrackIndex(nextIdx);
  };

  const prevTrack = () => {
    if (tracks.length <= 1) return;
    const prevIdx = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    playTrackIndex(prevIdx);
  };

  const handleEnded = () => {
    nextTrack();
  };

  // Handle custom URL input submission
  const handleLoadUrl = () => {
    if (!urlInput.trim()) return;
    
    let displayName = urlInput.split('/').pop() || 'Custom Stream';
    if (urlInput.includes('youtube.com') || urlInput.includes('youtu.be')) {
      displayName = 'YouTube Audio Stream';
    } else if (urlInput.includes('spotify.com')) {
      displayName = 'Spotify Player';
    } else if (urlInput.includes('soundcloud.com')) {
      displayName = 'SoundCloud Stream';
    }

    const newTrack = {
      name: `📡 ${displayName}`,
      url: urlInput.trim()
    };

    setTracks(prev => [newTrack, ...prev]);
    setUrlInput('');
    setShowUrlInput(false);
    
    // Automatically play the newly added track (first item)
    setTimeout(() => {
      playTrackIndex(0);
    }, 100);
  };

  return (
    <RetroWindow id="music" title="Y2KAmp">
      <div className="flex flex-col bg-[#2e2e36] border-2 border-[#5a5a66] p-2 text-white w-full h-full font-sans select-none shadow-[inset_1px_1px_0_#888]">
        
        {/* LCD Screen area (Dynamic Height based on embed) */}
        <div className={`bg-[#000] border-2 border-[#111] border-b-[#444] border-r-[#444] p-1 mb-2 flex flex-col relative overflow-hidden transition-all ${isEmbed ? 'h-32' : 'h-20'}`}>
          {isEmbed ? (
            <div className="flex flex-col h-full space-y-1">
              {/* Embedded Player */}
              <div className="flex-1 w-full bg-black relative">
                <iframe 
                  src={embedUrl} 
                  className="w-full h-full border-none rounded-sm"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              </div>
              {/* Mini visualizer strip */}
              <div className="h-6 w-full relative">
                <canvas ref={canvasRef} width="160" height="24" className="w-full h-full object-fill" />
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center text-[#0f0] text-[8px] font-mono bg-black/80">
                    [ EMBED ACTIVE - PLAY ABOVE ]
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-1 h-full justify-between">
              {/* Scrolling text simulator */}
              <div className="text-[10px] text-[#0f0] font-mono whitespace-nowrap overflow-hidden relative h-4">
                <span className="inline-block animate-[marquee_5s_linear_infinite]">
                  {trackName.toUpperCase()}
                </span>
              </div>
              {/* Visualizer */}
              <div className="flex-1 flex items-center justify-center bg-black overflow-hidden relative">
                <canvas ref={canvasRef} width="160" height="30" className="w-full h-full object-fill" />
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center text-[#0f0] text-[8px] font-mono bg-black/80">
                    [ VISUALIZER OFF ]
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <audio 
          ref={audioRef} 
          src={currentTrack && !isEmbed && isValidUrl(currentTrack.url) ? currentTrack.url : undefined} 
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
              className="w-full h-2 bg-black accent-[#0f0] rounded-none appearance-none cursor-pointer border border-[#555] disabled:opacity-40"
              disabled={isEmbed}
            />
          </div>

          {/* Control Buttons */}
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

        {/* Custom Stream URL Loader */}
        <div className="mt-2 pt-2 border-t border-[#444] flex flex-col space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-[8px] text-[#888] font-bold uppercase">Stream Link</span>
            <button 
              onClick={() => setShowUrlInput(!showUrlInput)} 
              className="text-[8px] bg-[#4a4a55] border outset border-[#6a6a75] border-b-[#1a1a25] border-r-[#1a1a25] px-1 hover:bg-[#5a5a66] active:inset text-[#0f0] font-bold"
            >
              {showUrlInput ? 'Cancel' : 'Load URL...'}
            </button>
          </div>
          
          {showUrlInput && (
            <div className="flex space-x-1 mt-1">
              <input 
                type="text" 
                placeholder="YouTube, Spotify, SoundCloud, or direct audio link..."
                className="flex-1 bg-black text-white text-[9px] font-mono p-1 border border-[#555] focus:outline-none"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
              <button 
                onClick={handleLoadUrl}
                className="bg-[#4a4a55] border outset border-[#6a6a75] border-b-[#1a1a25] border-r-[#1a1a25] px-2 text-[9px] font-bold active:inset text-white"
              >
                Add
              </button>
            </div>
          )}
        </div>

      </div>
    </RetroWindow>
  );
}
