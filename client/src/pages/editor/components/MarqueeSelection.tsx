import React, { useState, useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
}

interface MarqueeSelectionProps {
  onSelectionComplete: (selectedIds: string[]) => void;
  disabled?: boolean;
}

export const MarqueeSelection: React.FC<MarqueeSelectionProps> = ({
  onSelectionComplete,
  disabled = false,
}) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPoint, setStartPoint] = useState<Point>({ x: 0, y: 0 });
  const [currentPoint, setCurrentPoint] = useState<Point>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled) {
      setIsSelecting(false);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isSelecting) return;
      setCurrentPoint({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      if (!isSelecting) return;
      setIsSelecting(false);

      // Compute intersection
      const rect = {
        left: Math.min(startPoint.x, currentPoint.x),
        top: Math.min(startPoint.y, currentPoint.y),
        right: Math.max(startPoint.x, currentPoint.x),
        bottom: Math.max(startPoint.y, currentPoint.y),
      };

      // Find all elements with class 'cms-block' inside the preview area
      const blocks = Array.from(document.querySelectorAll('.cms-block'));
      const selectedIds: string[] = [];

      for (const block of blocks) {
        const blockRect = block.getBoundingClientRect();
        
        // Simple AABB intersection test
        const intersects = !(
          rect.right < blockRect.left ||
          rect.left > blockRect.right ||
          rect.bottom < blockRect.top ||
          rect.top > blockRect.bottom
        );

        if (intersects) {
          if (block.id) {
            selectedIds.push(block.id);
          }
        }
      }
      
      // Deduplicate and trigger callback
      onSelectionComplete(Array.from(new Set(selectedIds)));
    };

    if (isSelecting) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isSelecting, startPoint, currentPoint, disabled, onSelectionComplete]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    if (e.button !== 0) return; // Only left click

    setIsSelecting(true);
    setStartPoint({ x: e.clientX, y: e.clientY });
    setCurrentPoint({ x: e.clientX, y: e.clientY });
  };

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 z-50 ${disabled ? 'pointer-events-none' : 'pointer-events-auto cursor-crosshair'}`}
      onMouseDown={handleMouseDown}
      style={{
        userSelect: isSelecting ? 'none' : 'auto',
      }}
    >
      {isSelecting && (
        <div
          className="fixed border border-[var(--color-text-muted)] bg-[var(--color-text)]/10 z-[100] pointer-events-none"
          style={{
            left: Math.min(startPoint.x, currentPoint.x),
            top: Math.min(startPoint.y, currentPoint.y),
            width: Math.abs(currentPoint.x - startPoint.x),
            height: Math.abs(currentPoint.y - startPoint.y),
          }}
        />
      )}
    </div>
  );
};
