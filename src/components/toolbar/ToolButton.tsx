import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ToolButtonProps {
  icon: LucideIcon;
  label: string;
  shortcut?: string;
  isActive?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const ToolButton: React.FC<ToolButtonProps> = ({
  icon: Icon,
  label,
  shortcut,
  isActive = false,
  onClick,
  disabled = false
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          disabled={disabled}
          className={cn(
            'toolbar-button',
            isActive && 'toolbar-button-active',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Icon size={20} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" className="flex items-center gap-2">
        <span>{label}</span>
        {shortcut && (
          <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded font-mono">
            {shortcut}
          </kbd>
        )}
      </TooltipContent>
    </Tooltip>
  );
};
