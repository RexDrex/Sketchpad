import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DEFAULT_COLORS } from '@/types/canvas';
import { cn } from '@/lib/utils';
import { Pipette } from 'lucide-react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  onChange,
  label = 'Color'
}) => {
  const [customColor, setCustomColor] = useState(color);

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    onChange(newColor);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="w-8 h-8 rounded-lg border-2 border-toolbar-border shadow-sm transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary"
          style={{ backgroundColor: color }}
          aria-label={`Select ${label}`}
        />
      </PopoverTrigger>
      <PopoverContent 
        side="right" 
        align="start"
        className="w-auto p-3 animate-fade-in"
      >
        <div className="space-y-3">
          <div className="text-sm font-medium text-foreground">{label}</div>
          
          {/* Color grid */}
          <div className="grid grid-cols-5 gap-1.5">
            {DEFAULT_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => onChange(c)}
                className={cn(
                  'w-7 h-7 rounded-md transition-all hover:scale-110 focus:outline-none',
                  color === c && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                )}
                style={{ backgroundColor: c }}
                aria-label={`Select color ${c}`}
              />
            ))}
          </div>

          {/* Custom color input */}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <div className="relative">
              <input
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className="w-8 h-8 rounded cursor-pointer opacity-0 absolute inset-0"
              />
              <div 
                className="w-8 h-8 rounded-md border border-border flex items-center justify-center bg-secondary"
                style={{ backgroundColor: customColor }}
              >
                <Pipette size={14} className="text-muted-foreground" />
              </div>
            </div>
            <input
              type="text"
              value={color}
              onChange={(e) => onChange(e.target.value)}
              placeholder="#000000"
              className="flex-1 px-2 py-1.5 text-sm bg-secondary border border-border rounded-md font-mono focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
