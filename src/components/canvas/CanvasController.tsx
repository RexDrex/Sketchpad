import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Stage, Layer, Line, Rect, Circle, Arrow, Transformer } from 'react-konva';
import Konva from 'konva';
import { useCanvasStore } from '@/store/useCanvasStore';
import { CanvasElements } from './CanvasElements';
import { 
  Vector2D, 
  CanvasElement, 
  generateId, 
  FreehandData,
  RectData,
  CircleData,
  ArrowData,
  TriangleData,
  LineData
} from '@/types/canvas';

export interface CanvasControllerHandle {
  getStage: () => Konva.Stage | null;
}

interface CanvasControllerProps {
  onStageReady?: (stage: Konva.Stage) => void;
}

export const CanvasController = forwardRef<CanvasControllerHandle, CanvasControllerProps>(
  ({ onStageReady }, ref) => {
    const stageRef = useRef<Konva.Stage>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDrawingRef = useRef(false);
    const currentLineRef = useRef<Konva.Line | null>(null);
    const startPointRef = useRef<Vector2D | null>(null);
    const previewLayerRef = useRef<Konva.Layer | null>(null);

    const {
      elements,
      activeTool,
      brushConfig,
      viewport,
      grid,
      fillEnabled,
      fillColor,
      addElement,
      setViewportSize,
      setViewport,
      pushToHistory,
      setElements
    } = useCanvasStore();

    useImperativeHandle(ref, () => ({
      getStage: () => stageRef.current
    }));

    // Notify parent when stage is ready
    useEffect(() => {
      if (stageRef.current && onStageReady) {
        onStageReady(stageRef.current);
      }
    }, [onStageReady]);

    // Handle window resize
    useEffect(() => {
      const updateSize = () => {
        if (containerRef.current) {
          const { width, height } = containerRef.current.getBoundingClientRect();
          setViewportSize(width, height);
        }
      };

      updateSize();
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    }, [setViewportSize]);

    // Keyboard shortcuts
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        const { undo, redo, canUndo, canRedo } = useCanvasStore.getState();
        
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          if (canUndo()) undo();
        }
        if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
          e.preventDefault();
          if (canRedo()) redo();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const getPointerPosition = useCallback((): Vector2D | null => {
      const stage = stageRef.current;
      if (!stage) return null;
      
      const pos = stage.getPointerPosition();
      if (!pos) return null;

      // Account for viewport scale and offset
      return {
        x: (pos.x - viewport.offset.x) / viewport.scale,
        y: (pos.y - viewport.offset.y) / viewport.scale
      };
    }, [viewport.scale, viewport.offset]);

    const createElementStyle = useCallback(() => ({
      strokeColor: brushConfig.color,
      strokeWidth: brushConfig.size,
      fillColor: fillEnabled ? fillColor : null,
      opacity: brushConfig.opacity,
      lineCap: 'round' as const,
      lineJoin: 'round' as const,
      dashArray: []
    }), [brushConfig, fillEnabled, fillColor]);

    const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (activeTool === 'pan' || activeTool === 'select') return;

      const pos = getPointerPosition();
      if (!pos) return;

      isDrawingRef.current = true;
      startPointRef.current = pos;

      const stage = stageRef.current;
      if (!stage) return;

      // Get or create preview layer
      let previewLayer = stage.findOne('.preview-layer') as Konva.Layer;
      if (!previewLayer) {
        previewLayer = new Konva.Layer({ name: 'preview-layer' });
        stage.add(previewLayer);
      }
      previewLayerRef.current = previewLayer;

      if (activeTool === 'pencil' || activeTool === 'brush') {
        const line = new Konva.Line({
          points: [pos.x, pos.y],
          stroke: brushConfig.color,
          strokeWidth: brushConfig.size,
          opacity: brushConfig.opacity,
          lineCap: 'round',
          lineJoin: 'round',
          tension: 0.5,
          perfectDrawEnabled: false,
          globalCompositeOperation: 'source-over'
        });
        previewLayer.add(line);
        currentLineRef.current = line;
      } else if (activeTool === 'eraser') {
        handleErase(pos);
      }
    }, [activeTool, brushConfig, getPointerPosition]);

    const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (!isDrawingRef.current || activeTool === 'pan' || activeTool === 'select') return;

      const pos = getPointerPosition();
      if (!pos) return;

      const previewLayer = previewLayerRef.current;
      if (!previewLayer) return;

      if (activeTool === 'pencil' || activeTool === 'brush') {
        const line = currentLineRef.current;
        if (line) {
          const newPoints = line.points().concat([pos.x, pos.y]);
          line.points(newPoints);
          previewLayer.batchDraw();
        }
      } else if (activeTool === 'eraser') {
        handleErase(pos);
      } else if (['line', 'arrow', 'rectangle', 'circle', 'triangle'].includes(activeTool)) {
        previewLayer.destroyChildren();
        
        const start = startPointRef.current;
        if (!start) return;

        const previewShape = createPreviewShape(start, pos);
        if (previewShape) {
          previewLayer.add(previewShape);
          previewLayer.batchDraw();
        }
      }
    }, [activeTool, getPointerPosition, brushConfig, fillEnabled, fillColor]);

    const createPreviewShape = useCallback((start: Vector2D, end: Vector2D): Konva.Shape | null => {
      const style = {
        stroke: brushConfig.color,
        strokeWidth: brushConfig.size,
        opacity: brushConfig.opacity * 0.7,
        dash: [5, 5],
        fill: fillEnabled ? fillColor : undefined
      };

      switch (activeTool) {
        case 'line':
          return new Konva.Line({
            points: [start.x, start.y, end.x, end.y],
            ...style
          });
        
        case 'arrow':
          return new Konva.Arrow({
            points: [start.x, start.y, end.x, end.y],
            pointerLength: 15,
            pointerWidth: 12,
            ...style,
            fill: brushConfig.color
          });
        
        case 'rectangle': {
          const width = end.x - start.x;
          const height = end.y - start.y;
          return new Konva.Rect({
            x: width < 0 ? end.x : start.x,
            y: height < 0 ? end.y : start.y,
            width: Math.abs(width),
            height: Math.abs(height),
            ...style
          });
        }
        
        case 'circle': {
          const radius = Math.sqrt(
            Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
          );
          return new Konva.Circle({
            x: start.x,
            y: start.y,
            radius,
            ...style
          });
        }
        
        case 'triangle': {
          const midX = (start.x + end.x) / 2;
          return new Konva.Line({
            points: [midX, start.y, end.x, end.y, start.x, end.y],
            closed: true,
            ...style
          });
        }
        
        default:
          return null;
      }
    }, [activeTool, brushConfig, fillEnabled, fillColor]);

    const handleErase = useCallback((pos: Vector2D) => {
      const eraserRadius = brushConfig.size * 2;
      const state = useCanvasStore.getState();
      const updatedElements = state.elements.filter(element => {
        if (element.type === 'freehand') {
          const data = element.data as FreehandData;
          for (let i = 0; i < data.points.length; i += 2) {
            const distance = Math.sqrt(
              Math.pow(data.points[i] - pos.x, 2) + 
              Math.pow(data.points[i + 1] - pos.y, 2)
            );
            if (distance < eraserRadius) return false;
          }
        } else if (element.type === 'rectangle') {
          const data = element.data as RectData;
          if (pos.x >= data.x && pos.x <= data.x + data.width &&
              pos.y >= data.y && pos.y <= data.y + data.height) {
            return false;
          }
        } else if (element.type === 'circle') {
          const data = element.data as CircleData;
          const distance = Math.sqrt(
            Math.pow(data.x - pos.x, 2) + Math.pow(data.y - pos.y, 2)
          );
          if (distance < data.radius + eraserRadius) return false;
        } else if (element.type === 'line' || element.type === 'arrow') {
          const data = element.data as LineData;
          for (let i = 0; i < data.points.length; i += 2) {
            const distance = Math.sqrt(
              Math.pow(data.points[i] - pos.x, 2) + 
              Math.pow(data.points[i + 1] - pos.y, 2)
            );
            if (distance < eraserRadius) return false;
          }
        }
        return true;
      });

      if (updatedElements.length !== state.elements.length) {
        state.pushToHistory();
        setElements(updatedElements);
      }
    }, [brushConfig.size, setElements]);

    const handleMouseUp = useCallback(() => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;

      const pos = getPointerPosition();
      const start = startPointRef.current;
      const previewLayer = previewLayerRef.current;

      if (previewLayer) {
        previewLayer.destroyChildren();
        previewLayer.batchDraw();
      }

      if (activeTool === 'pencil' || activeTool === 'brush') {
        const line = currentLineRef.current;
        if (line && line.points().length >= 4) {
          const element: CanvasElement = {
            id: generateId(),
            type: 'freehand',
            data: {
              points: line.points(),
              tension: 0.5
            } as FreehandData,
            style: createElementStyle(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            zIndex: Date.now()
          };
          addElement(element);
        }
        currentLineRef.current = null;
      } else if (start && pos && ['line', 'arrow', 'rectangle', 'circle', 'triangle'].includes(activeTool)) {
        const style = createElementStyle();
        let element: CanvasElement | null = null;

        switch (activeTool) {
          case 'line':
            element = {
              id: generateId(),
              type: 'line',
              data: { points: [start.x, start.y, pos.x, pos.y] } as LineData,
              style,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              zIndex: Date.now()
            };
            break;

          case 'arrow':
            element = {
              id: generateId(),
              type: 'arrow',
              data: {
                points: [start.x, start.y, pos.x, pos.y],
                pointerLength: 15,
                pointerWidth: 12
              } as ArrowData,
              style: { ...style, fillColor: style.strokeColor },
              createdAt: Date.now(),
              updatedAt: Date.now(),
              zIndex: Date.now()
            };
            break;

          case 'rectangle': {
            const width = pos.x - start.x;
            const height = pos.y - start.y;
            element = {
              id: generateId(),
              type: 'rectangle',
              data: {
                x: width < 0 ? pos.x : start.x,
                y: height < 0 ? pos.y : start.y,
                width: Math.abs(width),
                height: Math.abs(height)
              } as RectData,
              style,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              zIndex: Date.now()
            };
            break;
          }

          case 'circle': {
            const radius = Math.sqrt(
              Math.pow(pos.x - start.x, 2) + Math.pow(pos.y - start.y, 2)
            );
            element = {
              id: generateId(),
              type: 'circle',
              data: { x: start.x, y: start.y, radius } as CircleData,
              style,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              zIndex: Date.now()
            };
            break;
          }

          case 'triangle': {
            const midX = (start.x + pos.x) / 2;
            element = {
              id: generateId(),
              type: 'triangle',
              data: { points: [midX, start.y, pos.x, pos.y, start.x, pos.y] } as TriangleData,
              style,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              zIndex: Date.now()
            };
            break;
          }
        }

        if (element) {
          addElement(element);
        }
      }

      startPointRef.current = null;
    }, [activeTool, getPointerPosition, createElementStyle, addElement]);

    const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      
      const stage = stageRef.current;
      if (!stage) return;

      const oldScale = viewport.scale;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const mousePointTo = {
        x: (pointer.x - viewport.offset.x) / oldScale,
        y: (pointer.y - viewport.offset.y) / oldScale
      };

      const direction = e.evt.deltaY > 0 ? -1 : 1;
      const newScale = Math.min(Math.max(oldScale + direction * 0.1, 0.1), 5);

      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale
      };

      setViewport({
        scale: newScale,
        offset: newPos
      });
    }, [viewport, setViewport]);

    const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
      if (activeTool === 'pan') {
        const stage = e.target as Konva.Stage;
        setViewport({
          offset: { x: stage.x(), y: stage.y() }
        });
      }
    }, [activeTool, setViewport]);

    return (
      <div 
        ref={containerRef} 
        className="relative flex-1 overflow-hidden bg-card"
        style={{
          backgroundImage: grid.enabled 
            ? `radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)`
            : 'none',
          backgroundSize: `${grid.size * viewport.scale}px ${grid.size * viewport.scale}px`,
          backgroundPosition: `${viewport.offset.x}px ${viewport.offset.y}px`
        }}
      >
        <Stage
          ref={stageRef}
          width={viewport.width}
          height={viewport.height}
          scaleX={viewport.scale}
          scaleY={viewport.scale}
          x={viewport.offset.x}
          y={viewport.offset.y}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          onWheel={handleWheel}
          onDragEnd={handleDragEnd}
          draggable={activeTool === 'pan'}
          style={{ 
            cursor: activeTool === 'pan' ? 'grab' : 
                    activeTool === 'eraser' ? 'crosshair' : 'crosshair'
          }}
        >
          <Layer>
            <CanvasElements elements={elements} />
          </Layer>
        </Stage>
      </div>
    );
  }
);

CanvasController.displayName = 'CanvasController';
