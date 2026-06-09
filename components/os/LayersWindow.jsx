"use client";
import React, { useState } from 'react';
import RetroWindow from './RetroWindow';
import { useCanvasStore } from '@/store/useCanvasStore';
import { Eye, EyeOff, Lock, Unlock, ArrowUp, ArrowDown, FolderPlus } from 'lucide-react';

export default function LayersWindow() {
  const nodes = useCanvasStore(state => state.present.nodes);
  const selectedIds = useCanvasStore(state => state.present.selectedIds);
  const dispatch = useCanvasStore(state => state.dispatch);

  // We display layers in reverse order so top of array (z-index 0) is at bottom, 
  // but wait, standard Photoshop: Top of list = Top of stack (highest index).
  // So we reverse the nodes for rendering.
  const reversedNodes = [...nodes].reverse();

  const [draggedNodeId, setDraggedNodeId] = useState(null);

  const toggleVisibility = (node) => {
    dispatch({ type: 'UPDATE_NODE', payload: { id: node.id, data: { visible: node.visible === false ? true : false } } });
  };

  const toggleLock = (node) => {
    dispatch({ type: 'UPDATE_NODE', payload: { id: node.id, data: { locked: !node.locked } } });
    if (!node.locked && selectedIds.includes(node.id)) {
      dispatch({ type: 'SET_SELECTION', payload: { ids: [] } });
    }
  };

  const moveUp = (node, e) => {
    e.stopPropagation();
    dispatch({ type: 'MOVE_NODE_UP', payload: { id: node.id } });
  };

  const moveDown = (node, e) => {
    e.stopPropagation();
    dispatch({ type: 'MOVE_NODE_DOWN', payload: { id: node.id } });
  };

  const addGroup = () => {
    dispatch({
      type: 'ADD_NODE',
      payload: {
        node: {
          id: `group_${Date.now()}`,
          type: 'group',
          name: 'New Folder',
          visible: true,
          locked: false,
          parentId: null,
          x: 0, y: 0, width: 0, height: 0, rotation: 0, scaleX: 1, scaleY: 1
        }
      }
    });
  };

  const groupSelected = () => {
    dispatch({ type: 'GROUP_SELECTED', payload: {} });
  };

  const ungroupSelected = () => {
    dispatch({ type: 'UNGROUP_SELECTED', payload: {} });
  };

  const selectNode = (node, e) => {
    if (node.locked) return;
    
    // Support multi-select with shift key
    if (e.shiftKey) {
      if (selectedIds.includes(node.id)) {
        dispatch({ type: 'SET_SELECTION', payload: { ids: selectedIds.filter(id => id !== node.id) } });
      } else {
        dispatch({ type: 'SET_SELECTION', payload: { ids: [...selectedIds, node.id] } });
      }
    } else {
      dispatch({ type: 'SET_SELECTION', payload: { ids: [node.id] } });
    }
  };

  const handleDragStart = (e, node) => {
    e.stopPropagation();
    setDraggedNodeId(node.id);
    e.dataTransfer.setData('text/plain', node.id);
  };

  const handleDragOver = (e, node) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e, targetNode) => {
    e.preventDefault();
    e.stopPropagation();
    const sourceId = e.dataTransfer.getData('text/plain');
    setDraggedNodeId(null);
    
    if (sourceId && sourceId !== targetNode.id) {
      // If dropped on a folder, move it inside
      if (targetNode.type === 'group') {
        // Prevent cyclic parenting (can't drop a folder into itself or its children)
        // For now, keep it simple
        dispatch({ type: 'SET_PARENT', payload: { id: sourceId, parentId: targetNode.id } });
      } else {
        // If dropped on a regular node, move it to the same parent
        dispatch({ type: 'SET_PARENT', payload: { id: sourceId, parentId: targetNode.parentId || null } });
      }
    }
  };

  // Build recursive tree
  const buildTree = (parentId = null) => {
    // Reverse to show top layers at top of list
    const siblings = nodes.filter(n => (n.parentId || null) === parentId).reverse();
    return siblings.map(node => ({
      ...node,
      children: node.type === 'group' ? buildTree(node.id) : []
    }));
  };

  const tree = buildTree(null);

  const renderLayerList = (nodeArray, depth = 0) => {
    return nodeArray.map((node, i) => {
      const isSelected = selectedIds.includes(node.id);
      const isTop = i === 0;
      const isBottom = i === nodeArray.length - 1;
      
      return (
        <div key={node.id} className="flex flex-col">
          <div 
            onClick={(e) => selectNode(node, e)}
            draggable
            onDragStart={(e) => handleDragStart(e, node)}
            onDragOver={(e) => handleDragOver(e, node)}
            onDrop={(e) => handleDrop(e, node)}
            className={`flex items-center p-1 text-xs border ${isSelected ? 'bg-[#000080] text-white border-dashed border-gray-400' : 'bg-[#c0c0c0] text-black border-transparent'} cursor-pointer ${draggedNodeId === node.id ? 'opacity-50' : ''}`}
            style={{ paddingLeft: `${(depth * 12) + 4}px` }}
          >
            {/* Visibility */}
            <button onClick={(e) => { e.stopPropagation(); toggleVisibility(node); }} className="mr-1 p-1 hover:bg-gray-400">
              {node.visible === false ? <EyeOff size={12} /> : <Eye size={12} />}
            </button>
            
            {/* Lock */}
            <button onClick={(e) => { e.stopPropagation(); toggleLock(node); }} className="mr-2 p-1 hover:bg-gray-400">
              {node.locked ? <Lock size={12} /> : <Unlock size={12} />}
            </button>
            
            {/* Icon */}
            <span className="mr-2 text-gray-500">
              {node.type === 'group' ? '📁' : node.type === 'image' ? '🖼️' : node.type === 'text' ? 'T' : '⬛'}
            </span>
            
            {/* Name */}
            <span className="flex-1 truncate">
              {node.name || `${node.type} ${node.id.slice(-4)}`}
            </span>
            
            {/* Reorder buttons */}
            <div className="flex flex-col ml-2 space-y-[2px]">
              <button 
                disabled={isTop} 
                onClick={(e) => moveUp(node, e)} 
                className="p-[2px] bg-[#dfdfdf] border outset disabled:opacity-50"
              >
                <ArrowUp size={8} />
              </button>
              <button 
                disabled={isBottom} 
                onClick={(e) => moveDown(node, e)} 
                className="p-[2px] bg-[#dfdfdf] border outset disabled:opacity-50"
              >
                <ArrowDown size={8} />
              </button>
            </div>
          </div>
          
          {/* Render children if group */}
          {node.type === 'group' && node.children.length > 0 && (
            <div className="flex flex-col">
              {renderLayerList(node.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <RetroWindow id="layers" title="Layers">
      <div className="flex flex-col h-full bg-[#c0c0c0]">
        
        {/* Toolbar */}
        <div className="flex space-x-1 p-1 border-b-2 border-white shadow-[0_1px_0_#808080]">
          <button 
            onClick={addGroup}
            className="p-1 border outset border-white border-b-gray-500 border-r-gray-500 active:inset hover:bg-[#dfdfdf] flex items-center space-x-1"
            title="New Group"
          >
            <FolderPlus size={14} />
          </button>
          <div className="border-l border-gray-400 border-r border-white h-4 my-auto mx-1"></div>
          <button 
            onClick={groupSelected}
            disabled={selectedIds.length === 0}
            className="px-2 py-1 text-[10px] border outset active:inset hover:bg-[#dfdfdf] disabled:opacity-50"
            title="Group Selected Layers"
          >
            Group
          </button>
          <button 
            onClick={ungroupSelected}
            disabled={selectedIds.length === 0}
            className="px-2 py-1 text-[10px] border outset active:inset hover:bg-[#dfdfdf] disabled:opacity-50"
            title="Ungroup Selected Folders"
          >
            Ungroup
          </button>
        </div>

        {/* Layers List */}
        <div 
          className="flex-1 overflow-auto bg-white border-2 border-gray-500 border-b-white border-r-white m-1 p-1 space-y-1"
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onDrop={(e) => {
            // Drop on the root background to unparent
            e.preventDefault();
            e.stopPropagation();
            const sourceId = e.dataTransfer.getData('text/plain');
            setDraggedNodeId(null);
            if (sourceId) {
              dispatch({ type: 'SET_PARENT', payload: { id: sourceId, parentId: null } });
            }
          }}
        >
          {renderLayerList(tree, 0)}
          {nodes.length === 0 && <div className="text-center text-gray-500 text-xs mt-4">No layers</div>}
        </div>
      </div>
    </RetroWindow>
  );
}
