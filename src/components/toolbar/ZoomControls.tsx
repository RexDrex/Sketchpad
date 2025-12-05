import React from 'react';
import { Plus, Minus, Maximize } from 'lucide-react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { cn } from '@/lib/utils';

export const ZoomControls: React.FC = () => {
  const { viewport, zoomIn, zoomOut, resetZoom } = useCanvasStore();
  const zoomPercent = Math.round(viewport.scale * 100);

  return (
    <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-1">
      <button
        onClick={zoomOut}
        className="zoom-button"
        aria-label="Zoom out"
        disabled={viewport.scale <= 0.1}
      >
        <Minus size={16} />
      </button>
      
      <button
        onClick={resetZoom}
        className="px-2 py-1 text-sm font-mono text-foreground hover:bg-secondary rounded transition-colors min-w-[60px]"
        aria-label="Reset zoom"
      >
        {zoomPercent}%
      </button>
      
      <button
        onClick={zoomIn}
        className="zoom-button"
        aria-label="Zoom in"
        disabled={viewport.scale >= 5}
      >
        <Plus size={16} />
      </button>
      
      <div className="w-px h-6 bg-border mx-1" />
      
      <button
        onClick={resetZoom}
        className="zoom-button"
        aria-label="Fit to screen"
      >
        <Maximize size={16} />
      </button>
    </div>
  );
};
