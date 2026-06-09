import { create } from 'zustand';

// Initial windows
const defaultWindows = [
  {
    id: 'canvas',
    title: 'Y2K Designer - Canvas',
    isOpen: true,
    isMinimized: false,
    isMaximized: false,
    x: 200,
    y: 100,
    width: 800,
    height: 600,
    zIndex: 10,
  },
  {
    id: 'assets',
    title: 'Asset Manager',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    x: 50,
    y: 50,
    width: 300,
    height: 500,
    zIndex: 5,
  },
  {
    id: 'tools',
    title: 'Tools',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    x: 50,
    y: 100,
    width: 200,
    height: 300,
    zIndex: 6,
  },
  {
    id: 'layers',
    title: 'Layers',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    x: 800,
    y: 100,
    width: 250,
    height: 400,
    zIndex: 7,
  },
  {
    id: 'colors',
    title: 'Colors & Styles',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    x: 50,
    y: 420,
    width: 200,
    height: 250,
    zIndex: 8,
  },
  {
    id: 'image',
    title: 'Image FX',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    x: 800,
    y: 520,
    width: 250,
    height: 350,
    zIndex: 9,
  },
  {
    id: 'music',
    title: 'Y2KAmp',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    x: 300,
    y: 300,
    width: 250,
    height: 180,
    zIndex: 4,
  },
  {
    id: 'gradient',
    title: 'Gradient Creator',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    x: 100,
    y: 150,
    width: 320,
    height: 480,
    zIndex: 11,
  }
];

export const useWindowStore = create((set, get) => ({
  windows: defaultWindows,
  focusedWindowId: 'canvas',
  highestZIndex: 10,

  openWindow: (id) => set((state) => {
    const existing = state.windows.find(w => w.id === id);
    if (!existing) return state;
    
    const newZ = state.highestZIndex + 1;
    
    // If it's already open, just focus it
    if (existing.isOpen) {
      return {
        windows: state.windows.map(w => w.id === id ? { ...w, isMinimized: false, zIndex: newZ } : w),
        focusedWindowId: id,
        highestZIndex: newZ
      };
    }

    // It's not open, let's cascade it off the currently focused window
    const focusedWindow = state.windows.find(w => w.id === state.focusedWindowId);
    let newX = existing.x;
    let newY = existing.y;
    
    if (focusedWindow && typeof window !== 'undefined') {
      newX = focusedWindow.x + 30;
      newY = focusedWindow.y + 30;
      
      // Wrap around if it gets too close to the screen edge
      if (newX > window.innerWidth - 200) newX = 50;
      if (newY > window.innerHeight - 200) newY = 50;
    }

    return {
      windows: state.windows.map(w => w.id === id ? { ...w, isOpen: true, isMinimized: false, zIndex: newZ, x: newX, y: newY } : w),
      focusedWindowId: id,
      highestZIndex: newZ
    };
  }),

  closeWindow: (id) => set((state) => ({
    windows: state.windows.map(w => w.id === id ? { ...w, isOpen: false } : w),
    focusedWindowId: state.focusedWindowId === id ? null : state.focusedWindowId
  })),

  minimizeWindow: (id) => set((state) => ({
    windows: state.windows.map(w => w.id === id ? { ...w, isMinimized: true } : w),
    focusedWindowId: state.focusedWindowId === id ? null : state.focusedWindowId
  })),

  focusWindow: (id) => set((state) => {
    if (state.focusedWindowId === id) return state;
    const newZ = state.highestZIndex + 1;
    return {
      windows: state.windows.map(w => w.id === id ? { ...w, zIndex: newZ, isMinimized: false } : w),
      focusedWindowId: id,
      highestZIndex: newZ
    };
  }),

  updateWindowBounds: (id, bounds) => set((state) => ({
    windows: state.windows.map(w => w.id === id ? { ...w, ...bounds } : w)
  })),

  // Global Progress Dialog
  progressText: '',
  progressPercent: 0,
  isProgressActive: false,
  
  startProgress: (text) => set({ isProgressActive: true, progressText: text, progressPercent: 0 }),
  updateProgress: (percent, text) => set((state) => ({ progressPercent: percent, progressText: text ?? state.progressText })),
  stopProgress: () => set({ isProgressActive: false, progressPercent: 0, progressText: '' }),
}));
