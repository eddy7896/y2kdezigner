"use client";
import React from 'react';
import { useWindowStore } from '@/store/useWindowStore';

export default function ProgressBarDialog() {
  const { isProgressActive, progressText, progressPercent } = useWindowStore();

  if (!isProgressActive) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center">
      {/* Dimmed Background */}
      <div className="absolute inset-0 bg-black/20" style={{ backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVQIW2NkYGD4z8DAwMgAI0AMDA4IAX3n/7kAAAAASUVORK5CYII=")' }} />
      
      {/* OS Dialog Window */}
      <div className="relative bg-[#c0c0c0] border outset border-white border-b-gray-800 border-r-gray-800 p-1 w-80 shadow-[2px_2px_0px_#000]">
        {/* Title bar */}
        <div className="bg-[#000080] px-1 py-1 flex items-center mb-4">
          <span className="text-white text-[11px] font-bold tracking-wide">System Processing</span>
        </div>
        
        {/* Content */}
        <div className="px-4 pb-4">
          <p className="text-[11px] mb-2">{progressText || "Processing..."}</p>
          
          {/* Progress Bar Track */}
          <div className="w-full h-5 bg-white border inset border-gray-500 border-b-white border-r-white relative">
            {/* Progress Fill */}
            <div 
              className="h-full bg-[#000080] transition-all duration-100 ease-linear flex"
              style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
