"use client";
import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Transformer, Circle, Line } from 'react-konva';
import { useCanvasStore } from '@/store/useCanvasStore';
import KonvaImageNode from './KonvaImageNode';
import KonvaTextNode from './KonvaTextNode';
import jsPDF from 'jspdf';

export default function Canvas() {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const layerRef = useRef(null);
  const transformerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [draftNode, setDraftNode] = useState(null);
  
  // Zoom & Pan state
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

  const nodes = useCanvasStore(state => state.present.nodes);
  const canvasWidth = useCanvasStore(state => state.present.canvasWidth);
  const canvasHeight = useCanvasStore(state => state.present.canvasHeight);
  const selectedIds = useCanvasStore(state => state.present.selectedIds);
  const dispatch = useCanvasStore(state => state.dispatch);
  
  const toolMode = useCanvasStore(state => state.toolMode);
  const defaultFill = useCanvasStore(state => state.defaultFill);
  const defaultStroke = useCanvasStore(state => state.defaultStroke);
  const defaultStrokeWidth = useCanvasStore(state => state.defaultStrokeWidth);

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight
      });
    }
  }, []);

  // Update transformer when selection changes
  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;
    if (selectedIds.length === 0 || toolMode !== 'select') {
      transformerRef.current.nodes([]);
      return;
    }
    const selectedNodes = selectedIds.map(id => stageRef.current.findOne(`#${id}`)).filter(Boolean);
    transformerRef.current.nodes(selectedNodes);
    transformerRef.current.getLayer().batchDraw();
  }, [selectedIds, nodes, toolMode]);

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const stage = stageRef.current;
    const oldScale = stage.scaleX();

    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    
    // Limit zoom
    if (newScale < 0.1 || newScale > 10) return;

    setStageScale(newScale);
    setStagePos({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  const handleMouseDown = (e) => {
    // If we click on the empty stage or a background, we should deselect
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.id() === 'bg-rect';
    
    if (toolMode === 'select') {
      if (clickedOnEmpty) {
        dispatch({ type: 'SET_SELECTION', payload: { ids: [] } });
      }
      return;
    }

    // DRAWING MODES
    if (toolMode !== 'select') {
      dispatch({ type: 'SET_SELECTION', payload: { ids: [] } });
      const pos = stageRef.current.getRelativePointerPosition();
      const baseNode = {
        id: `${toolMode}_${Date.now()}`,
        type: toolMode,
        fill: toolMode === 'pen' || toolMode === 'line' ? null : defaultFill,
        stroke: defaultStroke,
        strokeWidth: defaultStrokeWidth,
        rotation: 0, scaleX: 1, scaleY: 1,
        visible: true, locked: false
      };

      if (toolMode === 'rectangle') {
        setDraftNode({ ...baseNode, startX: pos.x, startY: pos.y, x: pos.x, y: pos.y, width: 0, height: 0 });
      } else if (toolMode === 'circle') {
        setDraftNode({ ...baseNode, x: pos.x, y: pos.y, radius: 0 });
      } else if (toolMode === 'line' || toolMode === 'pen') {
        setDraftNode({ ...baseNode, points: [pos.x, pos.y, pos.x, pos.y], tension: toolMode === 'pen' ? 0.5 : 0 });
      } else if (toolMode === 'text') {
        dispatch({
          type: 'ADD_NODE',
          payload: {
            node: { ...baseNode, fill: '#000000', text: 'New Text', fontFamily: 'Arial', fontSize: 32, x: pos.x, y: pos.y, width: 200 }
          }
        });
        // Switch back to select mode automatically for text so they can move it
        useCanvasStore.getState().setToolMode('select');
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!draftNode || toolMode === 'select') return;
    const pos = stageRef.current.getRelativePointerPosition();

    if (toolMode === 'rectangle') {
      const newWidth = pos.x - draftNode.startX;
      const newHeight = pos.y - draftNode.startY;
      setDraftNode({ 
        ...draftNode, 
        x: newWidth < 0 ? pos.x : draftNode.startX,
        y: newHeight < 0 ? pos.y : draftNode.startY,
        width: Math.abs(newWidth), 
        height: Math.abs(newHeight) 
      });
    } else if (toolMode === 'circle') {
      const dx = pos.x - draftNode.x;
      const dy = pos.y - draftNode.y;
      setDraftNode({ ...draftNode, radius: Math.sqrt(dx * dx + dy * dy) });
    } else if (toolMode === 'line') {
      setDraftNode({ ...draftNode, points: [draftNode.points[0], draftNode.points[1], pos.x, pos.y] });
    } else if (toolMode === 'pen') {
      setDraftNode({ ...draftNode, points: [...draftNode.points, pos.x, pos.y] });
    }
  };

  const handleMouseUp = () => {
    if (draftNode) {
      // Only add if it actually has size to prevent invisible ghost nodes
      const isValid = 
        (draftNode.type === 'rectangle' && draftNode.width > 2 && draftNode.height > 2) ||
        (draftNode.type === 'circle' && draftNode.radius > 2) ||
        ((draftNode.type === 'line' || draftNode.type === 'pen') && draftNode.points.length >= 4);

      if (isValid) {
        const { startX, startY, ...cleanNode } = draftNode; // remove temporary drawing vars
        dispatch({ type: 'ADD_NODE', payload: { node: cleanNode } });
      }
      setDraftNode(null);
    }
  };

  const createDragEndHandler = (node) => (e) => {
    if (toolMode !== 'select') return;
    dispatch({
      type: 'UPDATE_NODE',
      payload: { id: node.id, data: { x: e.target.x(), y: e.target.y() } }
    });
  };

  const createTransformEndHandler = (node) => (e) => {
    if (toolMode !== 'select') return;
    const nodeRef = e.target;
    dispatch({
      type: 'UPDATE_NODE',
      payload: {
        id: node.id,
        data: {
          x: nodeRef.x(), y: nodeRef.y(),
          scaleX: nodeRef.scaleX(), scaleY: nodeRef.scaleY(),
          rotation: nodeRef.rotation(),
          width: nodeRef.width(),
          height: nodeRef.height()
        }
      }
    });
  };

  const handleNodeClick = (node) => {
    if (toolMode !== 'select' || node.locked) return;
    dispatch({ type: 'SET_SELECTION', payload: { ids: [node.id] } });
  };

  const exportPNG = () => {
    if (!stageRef.current) return;
    dispatch({ type: 'SET_SELECTION', payload: { ids: [] } });
    setTimeout(() => {
      const stage = stageRef.current;
      const oldScale = stage.scaleX();
      const oldX = stage.x();
      const oldY = stage.y();
      
      stage.scale({ x: 1, y: 1 });
      stage.position({ x: 0, y: 0 });
      
      const dataURL = stage.toDataURL({ x: 0, y: 0, width: canvasWidth, height: canvasHeight, pixelRatio: 2 });
      
      stage.scale({ x: oldScale, y: oldScale });
      stage.position({ x: oldX, y: oldY });
      
      const link = document.createElement('a');
      link.download = 'y2k_design.png';
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 100);
  };

  const exportPDF = () => {
    if (!stageRef.current) return;
    dispatch({ type: 'SET_SELECTION', payload: { ids: [] } });
    setTimeout(() => {
      const stage = stageRef.current;
      const oldScale = stage.scaleX();
      const oldX = stage.x();
      const oldY = stage.y();
      
      stage.scale({ x: 1, y: 1 });
      stage.position({ x: 0, y: 0 });
      
      const dataURL = stage.toDataURL({ x: 0, y: 0, width: canvasWidth, height: canvasHeight, pixelRatio: 2 });
      
      stage.scale({ x: oldScale, y: oldScale });
      stage.position({ x: oldX, y: oldY });
      
      const pdf = new jsPDF({ orientation: canvasWidth > canvasHeight ? 'landscape' : 'portrait', unit: 'px', format: [canvasWidth, canvasHeight] });
      pdf.addImage(dataURL, 'PNG', 0, 0, canvasWidth, canvasHeight);
      pdf.save('y2k_design.pdf');
    }, 100);
  };

  const exportHTML = () => {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<title>Y2K Designer Export</title>
<style>
  body { margin: 0; padding: 0; background-color: #000000; display: flex; justify-content: center; }
  #canvas-container { position: relative; width: ${canvasWidth}px; height: ${canvasHeight}px; overflow: hidden; background-color: ${useCanvasStore.getState().present.background?.fill || '#ffffff'}; }
  .element { position: absolute; transform-origin: top left; }
</style>
</head>
<body>
<div id="canvas-container">
  ${useCanvasStore.getState().present.background?.src ? `<img class="element" src="${useCanvasStore.getState().present.background.src}" style="width: ${canvasWidth}px; height: ${canvasHeight}px; top: 0; left: 0;" />` : ''}
  ${nodes.map(n => {
    if (n.type === 'group' || n.visible === false) return '';
    const transform = `transform: translate(${n.x}px, ${n.y}px) rotate(${n.rotation || 0}deg) scale(${n.scaleX || 1}, ${n.scaleY || 1});`;
    if (n.type === 'image') return `<img class="element" src="${n.src}" style="width: ${n.width}px; height: ${n.height}px; ${transform}" />`;
    if (n.type === 'text') return `<div class="element" style="width: ${n.width}px; font-family: ${n.fontFamily}; font-size: ${n.fontSize}px; color: ${n.fill}; ${transform}">${n.text}</div>`;
    if (n.type === 'rectangle') return `<div class="element" style="width: ${n.width}px; height: ${n.height}px; background-color: ${n.fill}; border: ${n.strokeWidth}px solid ${n.stroke}; ${transform}"></div>`;
    if (n.type === 'circle') return `<div class="element" style="width: ${n.radius * 2}px; height: ${n.radius * 2}px; border-radius: 50%; background-color: ${n.fill}; border: ${n.strokeWidth}px solid ${n.stroke}; transform: translate(${n.x - n.radius}px, ${n.y - n.radius}px) rotate(${n.rotation || 0}deg) scale(${n.scaleX || 1}, ${n.scaleY || 1});"></div>`;
    return '';
  }).join('\n')}
</div>
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'y2k_website.html';
    link.click();
  };

  const [customSizeModalOpen, setCustomSizeModalOpen] = useState(false);
  const [customWidthInput, setCustomWidthInput] = useState(canvasWidth);
  const [customHeightInput, setCustomHeightInput] = useState(canvasHeight);

  const setCanvasSize = (w, h) => {
    dispatch({ type: 'UPDATE_CANVAS_SIZE', payload: { width: w, height: h } });
  };

  const handleCustomSizeSubmit = () => {
    const w = parseInt(customWidthInput);
    const h = parseInt(customHeightInput);
    if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
      setCanvasSize(w, h);
    }
    setCustomSizeModalOpen(false);
  };

  const renderNode = (node, isDraft = false) => {
    if (node.type === 'group' || node.visible === false) return null;
    
    const nodeKey = isDraft ? 'draft' : node.id;

    const commonProps = {
      id: node.id,
      x: node.x, y: node.y,
      scaleX: node.scaleX || 1, scaleY: node.scaleY || 1,
      rotation: node.rotation || 0,
      opacity: node.opacity ?? 1,
      globalCompositeOperation: node.blendMode || 'source-over',
      shadowColor: node.shadowEnabled ? (node.shadowColor || '#000000') : null,
      shadowBlur: node.shadowBlur || 0,
      shadowOffsetX: node.shadowOffsetX || 0,
      shadowOffsetY: node.shadowOffsetY || 0,
      shadowOpacity: 1, // Konva uses shadowColor alpha for opacity, but we can hardcode 1 to make it solid
      listening: !isDraft && !node.locked,
      draggable: !isDraft && !node.locked && toolMode === 'select',
      onClick: () => handleNodeClick(node),
      onTap: () => handleNodeClick(node),
      onDragEnd: createDragEndHandler(node),
      onTransformEnd: createTransformEndHandler(node)
    };

    if (node.type === 'image') return <KonvaImageNode key={nodeKey} {...commonProps} node={node} onSelect={() => handleNodeClick(node)} />;
    if (node.type === 'text') return <KonvaTextNode key={nodeKey} {...commonProps} node={node} onSelect={() => handleNodeClick(node)} />;
    
    if (node.type === 'rectangle') {
      return <Rect key={nodeKey} {...commonProps} width={node.width} height={node.height} fill={node.fill} stroke={node.stroke} strokeWidth={node.strokeWidth} />;
    }
    if (node.type === 'circle') {
      return <Circle key={nodeKey} {...commonProps} radius={node.radius} fill={node.fill} stroke={node.stroke} strokeWidth={node.strokeWidth} />;
    }
    if (node.type === 'line' || node.type === 'pen') {
      return <Line key={nodeKey} {...commonProps} x={0} y={0} points={node.points} stroke={node.stroke} strokeWidth={node.strokeWidth} tension={node.tension || 0} lineCap="round" lineJoin="round" />;
    }
    return null;
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#c0c0c0]">
      {/* File Menu */}
      <div className="flex bg-[#c0c0c0] border-b-2 border-white shadow-[0_1px_0_#808080] p-1 space-x-2 text-sm z-10 items-center">
        <div className="group relative cursor-pointer">
          <span className="px-2 py-1 hover:bg-[#000080] hover:text-white">File</span>
          <div className="hidden group-hover:block absolute top-full left-0 bg-[#c0c0c0] border-2 border-white shadow-[2px_2px_0_#000000] min-w-[150px] py-1 text-black">
            <div className="px-4 py-1 hover:bg-[#000080] hover:text-white" onClick={exportPNG}>Export to PNG</div>
            <div className="px-4 py-1 hover:bg-[#000080] hover:text-white" onClick={exportPDF}>Export to PDF</div>
            <div className="border-b border-gray-500 my-1"></div>
            <div className="px-4 py-1 hover:bg-[#000080] hover:text-white" onClick={exportHTML}>Compile to HTML Web1.0</div>
          </div>
        </div>
        <div className="group relative cursor-pointer">
          <span className="px-2 py-1 hover:bg-[#000080] hover:text-white">Edit</span>
          <div className="hidden group-hover:block absolute top-full left-0 bg-[#c0c0c0] border-2 border-white shadow-[2px_2px_0_#000000] min-w-[150px] py-1 text-black">
            <div className="px-4 py-1 hover:bg-[#000080] hover:text-white" onClick={() => dispatch({ type: 'SET_SELECTION', payload: { ids: [] } })}>Deselect All</div>
            <div className="border-b border-gray-500 my-1"></div>
            <div className="px-4 py-1 text-xs text-gray-700 font-bold">Canvas Size</div>
            <div className="px-4 py-1 hover:bg-[#000080] hover:text-white" onClick={() => setCanvasSize(800, 600)}>4:3 (800x600)</div>
            <div className="px-4 py-1 hover:bg-[#000080] hover:text-white" onClick={() => setCanvasSize(1024, 768)}>4:3 (1024x768)</div>
            <div className="px-4 py-1 hover:bg-[#000080] hover:text-white" onClick={() => setCanvasSize(1280, 720)}>16:9 (1280x720)</div>
            <div className="px-4 py-1 hover:bg-[#000080] hover:text-white" onClick={() => setCanvasSize(1920, 1080)}>16:9 (1920x1080)</div>
            <div className="px-4 py-1 hover:bg-[#000080] hover:text-white" onClick={() => setCanvasSize(1080, 1080)}>1:1 (1080x1080)</div>
            <div className="px-4 py-1 hover:bg-[#000080] hover:text-white" onClick={() => { setCustomWidthInput(canvasWidth); setCustomHeightInput(canvasHeight); setCustomSizeModalOpen(true); }}>Custom Size...</div>
          </div>
        </div>
        <div className="px-2 py-1 hover:bg-[#000080] hover:text-white cursor-pointer">View</div>
        <div className="flex-1"></div>
        <div className="flex items-center space-x-2 text-xs mr-2">
          <span>Zoom: {Math.round(stageScale * 100)}%</span>
          <button className="border outset bg-[#dfdfdf] active:inset px-2" onClick={() => { setStageScale(1); setStagePos({x:0, y:0}); }}>Reset</button>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 w-full relative" style={{ cursor: toolMode === 'select' ? 'default' : 'crosshair' }}>
        {dimensions.width > 0 && (() => {
          const buildTree = (parentId = null) => {
            return nodes.filter(n => (n.parentId || null) === parentId).map(node => ({
              ...node,
              children: node.type === 'group' ? buildTree(node.id) : []
            }));
          };
          
          const tree = buildTree(null);

          const renderTree = (nodeArray) => {
            return nodeArray.map(node => {
              if (node.type === 'group') {
                if (node.visible === false) return null;
                const groupCommonProps = {
                  id: node.id,
                  x: node.x, y: node.y,
                  scaleX: node.scaleX || 1, scaleY: node.scaleY || 1,
                  rotation: node.rotation || 0,
                  opacity: node.opacity ?? 1,
                  draggable: !node.locked && toolMode === 'select',
                  listening: !node.locked,
                  onClick: (e) => { e.cancelBubble = true; handleNodeClick(node); },
                  onTap: (e) => { e.cancelBubble = true; handleNodeClick(node); },
                  onDragEnd: createDragEndHandler(node),
                  onTransformEnd: createTransformEndHandler(node)
                };
                return (
                  <Group key={node.id} {...groupCommonProps}>
                    {renderTree(node.children)}
                  </Group>
                );
              }
              return renderNode(node);
            });
          };

          // We need Konva Group from react-konva to render groups natively
          const { Group } = require('react-konva');

          return (
            <Stage 
              ref={stageRef} width={dimensions.width} height={dimensions.height} 
              onMouseDown={handleMouseDown} onTouchStart={handleMouseDown}
              onMouseMove={handleMouseMove} onTouchMove={handleMouseMove}
              onMouseUp={handleMouseUp} onTouchEnd={handleMouseUp}
              onWheel={handleWheel}
              scaleX={stageScale} scaleY={stageScale}
              x={stagePos.x} y={stagePos.y}
            >
              <Layer ref={layerRef}>
                <Rect 
                  id="bg-rect" 
                  x={0} y={0} 
                  width={canvasWidth} height={canvasHeight} 
                  fill={useCanvasStore.getState().present.background?.fill || "#ffffff"} 
                  listening={false}
                  shadowColor="rgba(0,0,0,0.5)"
                  shadowBlur={10}
                  shadowOffsetX={5}
                  shadowOffsetY={5}
                />
                {useCanvasStore.getState().present.background?.src && (
                  <KonvaImageNode node={{ id: 'bg-image-node', src: useCanvasStore.getState().present.background.src, x: 0, y: 0, width: canvasWidth, height: canvasHeight, scaleX: 1, scaleY: 1, rotation: 0 }} onSelect={() => {}} onDragEnd={() => {}} onTransformEnd={() => {}} />
                )}

                {/* Render Recursive Tree */}
                {renderTree(tree)}
                {draftNode && renderNode(draftNode, true)}
                
                <Transformer ref={transformerRef} boundBoxFunc={(oldBox, newBox) => (newBox.width < 5 || newBox.height < 5) ? oldBox : newBox} />
              </Layer>
            </Stage>
          );
        })()}

        {customSizeModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20">
            <div className="bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-[#808080] shadow-[1px_1px_0_#000] p-[2px] w-64 select-none">
              <div className="bg-[#000080] text-white font-bold text-xs px-1 py-[2px] flex justify-between items-center cursor-default">
                <span>Canvas Properties</span>
                <button 
                  className="bg-[#c0c0c0] text-black border outset border-white border-b-gray-500 border-r-gray-500 w-4 h-4 flex items-center justify-center leading-none font-bold hover:active:inset" 
                  onClick={() => setCustomSizeModalOpen(false)}
                >
                  <span className="mb-[2px]">x</span>
                </button>
              </div>
              <div className="p-4 flex flex-col space-y-4 text-sm text-black">
                <div className="flex justify-between items-center">
                  <span>Width:</span>
                  <input type="number" className="border inset px-1 w-24 bg-white" value={customWidthInput} onChange={(e) => setCustomWidthInput(e.target.value)} />
                </div>
                <div className="flex justify-between items-center">
                  <span>Height:</span>
                  <input type="number" className="border inset px-1 w-24 bg-white" value={customHeightInput} onChange={(e) => setCustomHeightInput(e.target.value)} />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button className="border outset bg-[#c0c0c0] px-4 py-1 hover:active:inset focus:outline focus:outline-1 focus:outline-black focus:outline-offset-[-4px]" onClick={handleCustomSizeSubmit}>OK</button>
                  <button className="border outset bg-[#c0c0c0] px-4 py-1 hover:active:inset" onClick={() => setCustomSizeModalOpen(false)}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
