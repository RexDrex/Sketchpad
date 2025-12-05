import React from 'react';
import { Line, Rect, Circle, Arrow, RegularPolygon, Text } from 'react-konva';
import { CanvasElement, FreehandData, RectData, CircleData, ArrowData, TriangleData, LineData, TextData } from '@/types/canvas';

interface CanvasElementsProps {
  elements: CanvasElement[];
}

export const CanvasElements: React.FC<CanvasElementsProps> = ({ elements }) => {
  return (
    <>
      {elements.map((element) => {
        const { id, type, data, style } = element;
        const commonProps = {
          key: id,
          stroke: style.strokeColor,
          strokeWidth: style.strokeWidth,
          opacity: style.opacity,
          lineCap: style.lineCap,
          lineJoin: style.lineJoin,
          dash: style.dashArray.length > 0 ? style.dashArray : undefined,
          perfectDrawEnabled: false,
        };

        switch (type) {
          case 'freehand': {
            const freehandData = data as FreehandData;
            return (
              <Line
                {...commonProps}
                points={freehandData.points}
                tension={freehandData.tension}
                fill={undefined}
              />
            );
          }

          case 'line': {
            const lineData = data as LineData;
            return (
              <Line
                {...commonProps}
                points={lineData.points}
                fill={undefined}
              />
            );
          }

          case 'rectangle': {
            const rectData = data as RectData;
            return (
              <Rect
                {...commonProps}
                x={rectData.x}
                y={rectData.y}
                width={rectData.width}
                height={rectData.height}
                fill={style.fillColor || undefined}
              />
            );
          }

          case 'circle': {
            const circleData = data as CircleData;
            return (
              <Circle
                {...commonProps}
                x={circleData.x}
                y={circleData.y}
                radius={circleData.radius}
                fill={style.fillColor || undefined}
              />
            );
          }

          case 'arrow': {
            const arrowData = data as ArrowData;
            return (
              <Arrow
                {...commonProps}
                points={arrowData.points}
                pointerLength={arrowData.pointerLength}
                pointerWidth={arrowData.pointerWidth}
                fill={style.strokeColor}
              />
            );
          }

          case 'triangle': {
            const triangleData = data as TriangleData;
            return (
              <Line
                {...commonProps}
                points={triangleData.points}
                closed={true}
                fill={style.fillColor || undefined}
              />
            );
          }

          case 'text': {
            const textData = data as TextData;
            return (
              <Text
                key={id}
                x={textData.x}
                y={textData.y}
                text={textData.text}
                fontSize={textData.fontSize}
                fontFamily={textData.fontFamily}
                fill={style.strokeColor}
                opacity={style.opacity}
              />
            );
          }

          default:
            return null;
        }
      })}
    </>
  );
};
