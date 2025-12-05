import React from 'react';
import { Palette, Github, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between h-12 px-4 bg-toolbar border-b border-toolbar-border">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent">
          <Palette size={18} className="text-white" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-sm font-semibold text-toolbar-foreground leading-tight">
            SketchCanvas Pro
          </h1>
          <span className="text-[10px] text-toolbar-foreground/50 leading-tight">
            Professional Digital Whiteboard
          </span>
        </div>
      </div>

      {/* Status/Info */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-toolbar-foreground/60 font-mono">
          Autosaved
        </span>
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-soft" />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-toolbar-foreground/70 hover:text-toolbar-foreground hover:bg-toolbar-hover h-8"
        >
          <HelpCircle size={16} className="mr-1.5" />
          <span className="text-xs">Help</span>
        </Button>
      </div>
    </header>
  );
};
