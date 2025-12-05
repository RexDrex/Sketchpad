import React from 'react';
import { 
  Pencil, 
  Square, 
  Circle, 
  Minus, 
  ArrowRight,
  Triangle,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Download,
  Hand,
  MousePointer,
  Grid3X3
} from 'lucide-react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { ToolButton } from './ToolButton';
import { ColorPicker } from './ColorPicker';
import { BrushSizeSlider } from './BrushSizeSlider';
import { ToolType } from '@/types/canvas';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ToolbarProps {
  onExport: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onExport }) => {
  const {
    activeTool,
    setActiveTool,
    brushConfig,
    setBrushColor,
    setBrushSize,
    fillEnabled,
    setFillEnabled,
    fillColor,
    setFillColor,
    undo,
    redo,
    canUndo,
    canRedo,
    clearCanvas,
    grid,
    toggleGrid
  } = useCanvasStore();

  const drawingTools: { tool: ToolType; icon: typeof Pencil; label: string; shortcut?: string }[] = [
    { tool: 'select', icon: MousePointer, label: 'Select', shortcut: 'V' },
    { tool: 'pencil', icon: Pencil, label: 'Pencil', shortcut: 'P' },
    { tool: 'eraser', icon: Eraser, label: 'Eraser', shortcut: 'E' },
    { tool: 'pan', icon: Hand, label: 'Pan', shortcut: 'H' },
  ];

  const shapeTools: { tool: ToolType; icon: typeof Square; label: string; shortcut?: string }[] = [
    { tool: 'line', icon: Minus, label: 'Line', shortcut: 'L' },
    { tool: 'arrow', icon: ArrowRight, label: 'Arrow', shortcut: 'A' },
    { tool: 'rectangle', icon: Square, label: 'Rectangle', shortcut: 'R' },
    { tool: 'circle', icon: Circle, label: 'Circle', shortcut: 'C' },
    { tool: 'triangle', icon: Triangle, label: 'Triangle', shortcut: 'T' },
  ];

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      const shortcuts: Record<string, ToolType> = {
        'v': 'select',
        'p': 'pencil',
        'e': 'eraser',
        'h': 'pan',
        'l': 'line',
        'a': 'arrow',
        'r': 'rectangle',
        'c': 'circle',
        't': 'triangle',
      };

      const tool = shortcuts[e.key.toLowerCase()];
      if (tool) {
        setActiveTool(tool);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTool]);

  return (
    <aside className="flex flex-col w-14 bg-toolbar border-r border-toolbar-border py-3">
      {/* Drawing Tools */}
      <div className="flex flex-col items-center gap-1 px-2">
        {drawingTools.map(({ tool, icon, label, shortcut }) => (
          <ToolButton
            key={tool}
            icon={icon}
            label={label}
            shortcut={shortcut}
            isActive={activeTool === tool}
            onClick={() => setActiveTool(tool)}
          />
        ))}
      </div>

      <div className="tool-divider mx-auto" />

      {/* Shape Tools */}
      <div className="flex flex-col items-center gap-1 px-2">
        {shapeTools.map(({ tool, icon, label, shortcut }) => (
          <ToolButton
            key={tool}
            icon={icon}
            label={label}
            shortcut={shortcut}
            isActive={activeTool === tool}
            onClick={() => setActiveTool(tool)}
          />
        ))}
      </div>

      <div className="tool-divider mx-auto" />

      {/* Color and Size */}
      <div className="flex flex-col items-center gap-2 px-2">
        <ColorPicker
          color={brushConfig.color}
          onChange={setBrushColor}
          label="Stroke Color"
        />
        <BrushSizeSlider
          size={brushConfig.size}
          color={brushConfig.color}
          onChange={setBrushSize}
        />
      </div>

      <div className="tool-divider mx-auto" />

      {/* Fill Options */}
      <div className="flex flex-col items-center gap-2 px-2">
        <div className="flex items-center gap-1">
          <Checkbox
            id="fill"
            checked={fillEnabled}
            onCheckedChange={(checked) => setFillEnabled(checked as boolean)}
            className="border-toolbar-border data-[state=checked]:bg-primary"
          />
        </div>
        {fillEnabled && (
          <ColorPicker
            color={fillColor}
            onChange={setFillColor}
            label="Fill Color"
          />
        )}
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex flex-col items-center gap-1 px-2">
        <ToolButton
          icon={Grid3X3}
          label="Toggle Grid"
          isActive={grid.enabled}
          onClick={toggleGrid}
        />
        <ToolButton
          icon={Undo2}
          label="Undo"
          shortcut="Ctrl+Z"
          onClick={undo}
          disabled={!canUndo()}
        />
        <ToolButton
          icon={Redo2}
          label="Redo"
          shortcut="Ctrl+Y"
          onClick={redo}
          disabled={!canRedo()}
        />
        <ToolButton
          icon={Trash2}
          label="Clear Canvas"
          onClick={clearCanvas}
        />
        <ToolButton
          icon={Download}
          label="Export"
          onClick={onExport}
        />
      </div>
    </aside>
  );
};
