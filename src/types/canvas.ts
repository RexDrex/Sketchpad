export interface Vector2D {
  x: number;
  y: number;
}

export type ToolType = 
  | 'select'
  | 'pencil'
  | 'brush'
  | 'eraser'
  | 'line'
  | 'arrow'
  | 'rectangle'
  | 'circle'
  | 'triangle'
  | 'text'
  | 'pan';

export type ShapeType = 'line' | 'arrow' | 'rectangle' | 'circle' | 'triangle';

export interface BrushConfig {
  size: number;
  color: string;
  opacity: number;
  type: 'pencil' | 'brush' | 'marker' | 'highlighter';
}

export interface ElementStyle {
  strokeColor: string;
  strokeWidth: number;
  fillColor: string | null;
  opacity: number;
  lineCap: 'butt' | 'round' | 'square';
  lineJoin: 'miter' | 'round' | 'bevel';
  dashArray: number[];
}

export interface CanvasElement {
  id: string;
  type: 'line' | 'rectangle' | 'circle' | 'arrow' | 'triangle' | 'text' | 'freehand';
  data: LineData | RectData | CircleData | ArrowData | TriangleData | TextData | FreehandData;
  style: ElementStyle;
  createdAt: number;
  updatedAt: number;
  zIndex: number;
}

export interface LineData {
  points: number[];
}

export interface FreehandData {
  points: number[];
  tension: number;
}

export interface RectData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CircleData {
  x: number;
  y: number;
  radius: number;
}

export interface ArrowData {
  points: number[];
  pointerLength: number;
  pointerWidth: number;
}

export interface TriangleData {
  points: number[];
}

export interface TextData {
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fontFamily: string;
}

export interface ViewportConfig {
  scale: number;
  offset: Vector2D;
  width: number;
  height: number;
}

export interface GridConfig {
  enabled: boolean;
  size: number;
  color: string;
}

export interface ExportOptions {
  format: 'png' | 'jpeg';
  quality: number;
  scale: number;
  backgroundColor: string;
  includeBackground: boolean;
  padding: number;
}

export interface HistoryState {
  past: CanvasElement[][];
  present: CanvasElement[];
  future: CanvasElement[][];
}

export const DEFAULT_COLORS = [
  '#000000', '#FFFFFF', '#EF4444', '#F97316', '#EAB308', 
  '#22C55E', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899',
  '#6B7280', '#A3A3A3', '#FCA5A5', '#FDBA74', '#FDE047',
  '#86EFAC', '#67E8F9', '#93C5FD', '#C4B5FD', '#F9A8D4',
];

export const BRUSH_SIZES = [2, 4, 6, 8, 12, 16, 24, 32, 48];

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
