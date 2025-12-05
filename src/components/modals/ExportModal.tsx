import React, { useState, useCallback } from 'react';
import Konva from 'konva';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Image, FileImage, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stageRef: React.RefObject<Konva.Stage>;
}

type ExportPreset = 'web' | 'print' | 'presentation' | 'custom';

const presets = {
  web: { scale: 1, quality: 0.9, label: 'Web', description: '1x scale, optimized' },
  print: { scale: 3, quality: 1.0, label: 'Print', description: '300 DPI quality' },
  presentation: { scale: 2, quality: 1.0, label: 'Slides', description: 'Presentation ready' },
  custom: { scale: 1, quality: 1.0, label: 'Custom', description: 'Configure manually' }
};

export const ExportModal: React.FC<ExportModalProps> = ({
  open,
  onOpenChange,
  stageRef
}) => {
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [preset, setPreset] = useState<ExportPreset>('web');
  const [scale, setScale] = useState(1);
  const [quality, setQuality] = useState(0.9);
  const [includeBackground, setIncludeBackground] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [isExporting, setIsExporting] = useState(false);

  const handlePresetChange = (newPreset: ExportPreset) => {
    setPreset(newPreset);
    if (newPreset !== 'custom') {
      setScale(presets[newPreset].scale);
      setQuality(presets[newPreset].quality);
    }
  };

  const handleExport = useCallback(async () => {
    const stage = stageRef.current;
    if (!stage) return;

    setIsExporting(true);

    try {
      // Create a temporary stage for export
      const width = stage.width();
      const height = stage.height();

      const dataURL = stage.toDataURL({
        mimeType: format === 'png' ? 'image/png' : 'image/jpeg',
        quality: quality,
        pixelRatio: scale,
        x: 0,
        y: 0,
        width: width,
        height: height
      });

      // If we need to add background, we need to composite
      if (includeBackground && format === 'png') {
        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          const img = new window.Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
            const finalDataURL = canvas.toDataURL(`image/${format}`, quality);
            downloadImage(finalDataURL);
            setIsExporting(false);
          };
          img.src = dataURL;
          return;
        }
      }

      downloadImage(dataURL);
    } catch (error) {
      console.error('Export failed:', error);
    }

    setIsExporting(false);
  }, [stageRef, format, scale, quality, includeBackground, backgroundColor]);

  const downloadImage = (dataURL: string) => {
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.download = `sketchcanvas-${timestamp}.${format}`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onOpenChange(false);
  };

  const estimatedSize = Math.round(
    (stageRef.current?.width() || 1200) * scale * 
    (stageRef.current?.height() || 800) * scale * 
    (format === 'png' ? 4 : 3) / 1024 / 1024 * 10
  ) / 10;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download size={20} />
            Export Drawing
          </DialogTitle>
          <DialogDescription>
            Choose your export settings and format
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Format</Label>
            <RadioGroup
              value={format}
              onValueChange={(v) => setFormat(v as 'png' | 'jpeg')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="png" id="png" />
                <Label htmlFor="png" className="flex items-center gap-2 cursor-pointer">
                  <Image size={16} />
                  PNG
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="jpeg" id="jpeg" />
                <Label htmlFor="jpeg" className="flex items-center gap-2 cursor-pointer">
                  <FileImage size={16} />
                  JPEG
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Preset Selection */}
          <div className="space-y-3">
            <Label>Preset</Label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(presets) as ExportPreset[]).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePresetChange(p)}
                  className={cn(
                    'export-preset',
                    preset === p && 'export-preset-active'
                  )}
                >
                  <span className="text-sm font-medium">{presets[p].label}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {presets[p].description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Settings */}
          {preset === 'custom' && (
            <div className="space-y-4 p-4 bg-secondary rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Scale</Label>
                  <span className="text-sm text-muted-foreground">{scale}x</span>
                </div>
                <Slider
                  value={[scale]}
                  onValueChange={([v]) => setScale(v)}
                  min={0.5}
                  max={4}
                  step={0.5}
                />
              </div>

              {format === 'jpeg' && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Quality</Label>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(quality * 100)}%
                    </span>
                  </div>
                  <Slider
                    value={[quality]}
                    onValueChange={([v]) => setQuality(v)}
                    min={0.1}
                    max={1}
                    step={0.1}
                  />
                </div>
              )}
            </div>
          )}

          {/* Background Options */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="background"
                checked={includeBackground}
                onCheckedChange={(checked) => setIncludeBackground(checked as boolean)}
              />
              <Label htmlFor="background" className="cursor-pointer">
                Include background
              </Label>
            </div>
            {includeBackground && (
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border border-border"
              />
            )}
          </div>

          {/* Estimated Size */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Estimated file size</span>
            <span className="font-mono">~{estimatedSize} MB</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download size={16} className="mr-2" />
                Export
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
