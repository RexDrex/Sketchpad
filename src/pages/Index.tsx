import React, { useRef, useState, useCallback } from 'react';
import Konva from 'konva';
import { Header } from '@/components/header/Header';
import { Toolbar } from '@/components/toolbar/Toolbar';
import { CanvasController, CanvasControllerHandle } from '@/components/canvas/CanvasController';
import { ZoomControls } from '@/components/toolbar/ZoomControls';
import { ExportModal } from '@/components/modals/ExportModal';

const Index: React.FC = () => {
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [stage, setStage] = useState<Konva.Stage | null>(null);
  const canvasRef = useRef<CanvasControllerHandle>(null);

  const handleStageReady = useCallback((stageInstance: Konva.Stage) => {
    setStage(stageInstance);
  }, []);

  const stageRef = useRef<Konva.Stage | null>(null);
  stageRef.current = stage;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Toolbar */}
        <Toolbar onExport={() => setExportModalOpen(true)} />

        {/* Canvas Area */}
        <main className="relative flex-1 overflow-hidden">
          <CanvasController 
            ref={canvasRef} 
            onStageReady={handleStageReady}
          />
          <ZoomControls />
        </main>
      </div>

      {/* Export Modal */}
      <ExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        stageRef={stageRef as React.RefObject<Konva.Stage>}
      />
    </div>
  );
};

export default Index;
