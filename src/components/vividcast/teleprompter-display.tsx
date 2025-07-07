import React, { useRef, useEffect } from 'react';
import type { TeleprompterSettings, TeleprompterPosition } from '@/app/page';
import { cn } from '@/lib/utils';

interface TeleprompterDisplayProps {
  text: string;
  settings: TeleprompterSettings;
  isRecording: boolean;
  position: TeleprompterPosition;
}

export function TeleprompterDisplay({ text, settings, isRecording, position }: TeleprompterDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollY = useRef(0);

  useEffect(() => {
    let animationFrameId: number;
    if (isRecording) {
      const scroll = () => {
        const container = containerRef.current;
        if (container) {
          scrollY.current += settings.speed / 10;
          if (scrollY.current > container.scrollHeight - container.clientHeight) {
            scrollY.current = container.scrollHeight - container.clientHeight;
          }
          container.scrollTop = scrollY.current;
        }
        animationFrameId = requestAnimationFrame(scroll);
      };
      scroll();
    } else {
        scrollY.current = 0;
        if(containerRef.current) containerRef.current.scrollTop = 0;
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRecording, settings.speed]);

  if (!text) return null;

  const positionClasses = {
    top: 'top-0 left-0 right-0 h-1/2',
    bottom: 'bottom-0 left-0 right-0 h-1/2',
    left: 'top-0 left-0 bottom-0 w-1/3',
    right: 'top-0 right-0 bottom-0 w-1/3',
  };

  const maskStyles = {
    top: { maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)' },
    bottom: { maskImage: 'linear-gradient(to top, transparent 0%, black 20%, black 80%, transparent 100%)' },
    left: { maskImage: 'linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)' },
    right: { maskImage: 'linear-gradient(to left, transparent 0%, black 20%, black 80%, transparent 100%)' },
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute bg-black/50 overflow-hidden pointer-events-none",
        positionClasses[position]
      )}
      style={maskStyles[position]}
    >
      <div
        className="text-center text-white transition-all duration-300 ease-linear p-16"
        style={{ fontSize: `${settings.fontSize}px`, lineHeight: 1.5 }}
      >
        {text.split('\n').map((line, index) => <p key={index}>{line || '\u00A0'}</p>)}
      </div>
    </div>
  );
}
