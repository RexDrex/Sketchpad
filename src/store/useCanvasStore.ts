import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  CanvasElement, 
  ToolType, 
  BrushConfig, 
  ViewportConfig, 
  GridConfig,
  HistoryState,
  generateId 
} from '@/types/canvas';

interface CanvasStore {
  // State
  elements: CanvasElement[];
  activeTool: ToolType;
  brushConfig: BrushConfig;
  viewport: ViewportConfig;
  grid: GridConfig;
  history: HistoryState;
  isDrawing: boolean;
  fillEnabled: boolean;
  fillColor: string;

  // Actions
  setActiveTool: (tool: ToolType) => void;
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  removeElement: (id: string) => void;
  setElements: (elements: CanvasElement[]) => void;
  clearCanvas: () => void;
  
  // Brush actions
  setBrushColor: (color: string) => void;
  setBrushSize: (size: number) => void;
  setBrushOpacity: (opacity: number) => void;
  setFillEnabled: (enabled: boolean) => void;
  setFillColor: (color: string) => void;
  
  // Viewport actions
  setViewport: (viewport: Partial<ViewportConfig>) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setViewportSize: (width: number, height: number) => void;
  
  // Grid actions
  toggleGrid: () => void;
  setGridSize: (size: number) => void;
  
  // History actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  pushToHistory: () => void;
  
  // Drawing state
  setIsDrawing: (isDrawing: boolean) => void;
}

const MAX_HISTORY_SIZE = 50;
const ZOOM_STEP = 0.1;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;

export const useCanvasStore = create<CanvasStore>()(
  persist(
    (set, get) => ({
      // Initial state
      elements: [],
      activeTool: 'pencil',
      brushConfig: {
        size: 4,
        color: '#000000',
        opacity: 1,
        type: 'pencil'
      },
      viewport: {
        scale: 1,
        offset: { x: 0, y: 0 },
        width: 1200,
        height: 800
      },
      grid: {
        enabled: true,
        size: 20,
        color: '#e5e7eb'
      },
      history: {
        past: [],
        present: [],
        future: []
      },
      isDrawing: false,
      fillEnabled: false,
      fillColor: '#3B82F6',

      // Tool actions
      setActiveTool: (tool) => set({ activeTool: tool }),

      // Element actions
      addElement: (element) => {
        const state = get();
        state.pushToHistory();
        set({ elements: [...state.elements, element] });
      },

      updateElement: (id, updates) => {
        set((state) => ({
          elements: state.elements.map((el) =>
            el.id === id ? { ...el, ...updates, updatedAt: Date.now() } : el
          )
        }));
      },

      removeElement: (id) => {
        const state = get();
        state.pushToHistory();
        set({ elements: state.elements.filter((el) => el.id !== id) });
      },

      setElements: (elements) => set({ elements }),

      clearCanvas: () => {
        const state = get();
        if (state.elements.length > 0) {
          state.pushToHistory();
          set({ elements: [] });
        }
      },

      // Brush actions
      setBrushColor: (color) =>
        set((state) => ({
          brushConfig: { ...state.brushConfig, color }
        })),

      setBrushSize: (size) =>
        set((state) => ({
          brushConfig: { ...state.brushConfig, size }
        })),

      setBrushOpacity: (opacity) =>
        set((state) => ({
          brushConfig: { ...state.brushConfig, opacity }
        })),

      setFillEnabled: (enabled) => set({ fillEnabled: enabled }),
      setFillColor: (color) => set({ fillColor: color }),

      // Viewport actions
      setViewport: (viewport) =>
        set((state) => ({
          viewport: { ...state.viewport, ...viewport }
        })),

      zoomIn: () =>
        set((state) => ({
          viewport: {
            ...state.viewport,
            scale: Math.min(state.viewport.scale + ZOOM_STEP, MAX_ZOOM)
          }
        })),

      zoomOut: () =>
        set((state) => ({
          viewport: {
            ...state.viewport,
            scale: Math.max(state.viewport.scale - ZOOM_STEP, MIN_ZOOM)
          }
        })),

      resetZoom: () =>
        set((state) => ({
          viewport: {
            ...state.viewport,
            scale: 1,
            offset: { x: 0, y: 0 }
          }
        })),

      setViewportSize: (width, height) =>
        set((state) => ({
          viewport: { ...state.viewport, width, height }
        })),

      // Grid actions
      toggleGrid: () =>
        set((state) => ({
          grid: { ...state.grid, enabled: !state.grid.enabled }
        })),

      setGridSize: (size) =>
        set((state) => ({
          grid: { ...state.grid, size }
        })),

      // History actions
      pushToHistory: () => {
        set((state) => {
          const newPast = [...state.history.past, state.elements].slice(-MAX_HISTORY_SIZE);
          return {
            history: {
              past: newPast,
              present: state.elements,
              future: []
            }
          };
        });
      },

      undo: () => {
        const { history, elements } = get();
        if (history.past.length === 0) return;

        const previous = history.past[history.past.length - 1];
        const newPast = history.past.slice(0, -1);

        set({
          elements: previous,
          history: {
            past: newPast,
            present: previous,
            future: [elements, ...history.future]
          }
        });
      },

      redo: () => {
        const { history, elements } = get();
        if (history.future.length === 0) return;

        const next = history.future[0];
        const newFuture = history.future.slice(1);

        set({
          elements: next,
          history: {
            past: [...history.past, elements],
            present: next,
            future: newFuture
          }
        });
      },

      canUndo: () => get().history.past.length > 0,
      canRedo: () => get().history.future.length > 0,

      // Drawing state
      setIsDrawing: (isDrawing) => set({ isDrawing })
    }),
    {
      name: 'sketchcanvas-store',
      partialize: (state) => ({
        brushConfig: state.brushConfig,
        grid: state.grid,
        fillEnabled: state.fillEnabled,
        fillColor: state.fillColor
      })
    }
  )
);
