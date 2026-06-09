import { create } from 'zustand';

// Initial empty state for our canvas scene graph
const initialState = {
  nodes: [],
  selectedIds: [],
  background: {
    fill: '#ffffff',
    src: null
  },
  canvasWidth: 800,
  canvasHeight: 600
};

export const useCanvasStore = create((set, get) => ({
  past: [],
  future: [],
  present: initialState,
  
  // Ephemeral states (not tracked in undo/redo)
  toolMode: 'select',
  defaultFill: '#008080',
  defaultStroke: '#000000',
  defaultStrokeWidth: 2,
  defaultOpacity: 1,
  defaultBlendMode: 'source-over',
  defaultShadowColor: '#000000',
  defaultShadowBlur: 0,
  defaultShadowOffsetX: 5,
  defaultShadowOffsetY: 5,

  setToolMode: (mode) => set({ toolMode: mode }),
  setDefaultStyles: (styles) => set((state) => ({ ...state, ...styles })),

  // Centralized command dispatcher
  dispatch: (command) => {
    const { type, payload } = command;
    const currentState = get().present;
    
    // We will build command handlers here
    // e.g. executeCommand(type, payload, currentState)
    let nextState = { ...currentState };

    switch (type) {
      case 'ADD_NODE':
        nextState.nodes = [...currentState.nodes, payload.node];
        break;
      case 'REMOVE_NODE':
        nextState.nodes = currentState.nodes.filter(n => n.id !== payload.id);
        break;
      case 'UPDATE_CANVAS_SIZE': {
        nextState.canvasWidth = payload.width;
        nextState.canvasHeight = payload.height;
        break;
      }
      case 'SET_BACKGROUND':
        nextState.background = { ...currentState.background, ...payload };
        break;
      case 'UPDATE_NODE':
        nextState.nodes = currentState.nodes.map(n => 
          n.id === payload.id ? { ...n, ...payload.data } : n
        );
        break;
      case 'MOVE_NODE_UP': {
        const node = nextState.nodes.find(n => n.id === payload.id);
        const siblings = nextState.nodes.filter(n => n.parentId === node.parentId);
        const localIndex = siblings.findIndex(n => n.id === node.id);
        if (localIndex < siblings.length - 1) {
          const nextSibling = siblings[localIndex + 1];
          const idx1 = nextState.nodes.findIndex(n => n.id === node.id);
          const idx2 = nextState.nodes.findIndex(n => n.id === nextSibling.id);
          nextState.nodes[idx1] = nextSibling;
          nextState.nodes[idx2] = node;
        }
        break;
      }
      case 'MOVE_NODE_DOWN': {
        const node = nextState.nodes.find(n => n.id === payload.id);
        const siblings = nextState.nodes.filter(n => n.parentId === node.parentId);
        const localIndex = siblings.findIndex(n => n.id === node.id);
        if (localIndex > 0) {
          const prevSibling = siblings[localIndex - 1];
          const idx1 = nextState.nodes.findIndex(n => n.id === node.id);
          const idx2 = nextState.nodes.findIndex(n => n.id === prevSibling.id);
          nextState.nodes[idx1] = prevSibling;
          nextState.nodes[idx2] = node;
        }
        break;
      }
      case 'SET_PARENT': {
        nextState.nodes = currentState.nodes.map(n => 
          n.id === payload.id ? { ...n, parentId: payload.parentId } : n
        );
        break;
      }
      case 'GROUP_SELECTED': {
        const selectedNodes = currentState.nodes.filter(n => currentState.selectedIds.includes(n.id));
        if (selectedNodes.length === 0) break;
        
        const newGroupId = `group_${Date.now()}`;
        const newGroup = {
          id: newGroupId,
          type: 'group',
          name: 'New Folder',
          visible: true,
          locked: false,
          parentId: selectedNodes[0].parentId || null,
          x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1
        };
        
        nextState.nodes = currentState.nodes.map(n => {
          if (currentState.selectedIds.includes(n.id)) {
            return { ...n, parentId: newGroupId };
          }
          return n;
        });
        
        nextState.nodes.push(newGroup);
        nextState.selectedIds = [newGroupId];
        break;
      }
      case 'UNGROUP_SELECTED': {
        const selectedGroups = currentState.nodes.filter(n => currentState.selectedIds.includes(n.id) && n.type === 'group');
        if (selectedGroups.length === 0) break;
        
        const groupIds = selectedGroups.map(g => g.id);
        let newlySelected = [];
        
        nextState.nodes = currentState.nodes.filter(n => !groupIds.includes(n.id)).map(n => {
          if (groupIds.includes(n.parentId)) {
            newlySelected.push(n.id);
            const parent = currentState.nodes.find(g => g.id === n.parentId);
            return { 
              ...n, 
              parentId: parent.parentId || null,
              x: n.x + parent.x, 
              y: n.y + parent.y,
              scaleX: n.scaleX * parent.scaleX,
              scaleY: n.scaleY * parent.scaleY
            };
          }
          return n;
        });
        
        nextState.selectedIds = newlySelected;
        break;
      }
      case 'SET_SELECTION':
        nextState.selectedIds = payload.ids;
        // Selection usually shouldn't clear redo stack or push to undo stack unless explicitly wanted
        set({ present: nextState });
        return; 
      default:
        console.warn(`Unknown command: ${type}`);
        return;
    }

    // Push to history stack (Undo/Redo)
    set((state) => ({
      past: [...state.past, state.present],
      present: nextState,
      future: [], // Clear future on new action
    }));
  },

  undo: () => {
    set((state) => {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, state.past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [state.present, ...state.future],
      };
    });
  },

  redo: () => {
    set((state) => {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      return {
        past: [...state.past, state.present],
        present: next,
        future: newFuture,
      };
    });
  },
}));
