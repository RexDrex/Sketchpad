import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { BRUSH_SIZES } from '@/types/canvas';
import { cn } from '@/lib/utils';

interface BrushSizeSliderProps {
  size: number;
  color: string;
  onChange: (size: number) => void;
}

export const BrushSizeSlider: React.FC<BrushSizeSliderProps> = ({
  size,
  color,
  onChange
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="w-10 h-10 rounded-lg bg-toolbar-hover border border-toolbar-border flex items-center justify-center transition-all hover:bg-toolbar-active/20"
          aria-label="Brush size"
        >
          <div
            className="rounded-full transition-all"
            style={{
              width: Math.min(size, 24),
              height: Math.min(size, 24),
              backgroundColor: color
            }}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        side="right" 
        align="start"
        className="w-56 p-4 animate-fade-in"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Brush Size</span>
            <span className="text-sm text-muted-foreground font-mono">
              {size}px
            </span>
          </div>

          {/* Slider */}
          <Slider
            value={[size]}
            onValueChange={([value]) => onChange(value)}
            min={1}
            max={50}
            step={1}
            className="w-full"
          />

          {/* Preset sizes */}
          <div className="flex items-center justify-between gap-1">
            {BRUSH_SIZES.map((presetSize) => (
              <button
                key={presetSize}
                onClick={() => onChange(presetSize)}
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-md transition-all',
                  'hover:bg-secondary',
                  size === presetSize && 'bg-primary/20 ring-1 ring-primary'
                )}
                aria-label={`Set brush size to ${presetSize}px`}
              >
                <div
                  className="rounded-full bg-foreground"
                  style={{
                    width: Math.min(presetSize, 20),
                    height: Math.min(presetSize, 20)
                  }}
                />
              </button>
            ))}
          </div>

          {/* Preview */}
          <div className="flex items-center justify-center p-4 bg-secondary rounded-lg">
            <div
              className="rounded-full transition-all"
              style={{
                width: size,
                height: size,
                backgroundColor: color
              }}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
