import React, { useRef, useEffect } from 'react';
import type { TeleprompterSettings } from '@/app/page';

interface TeleprompterDisplayProps {
  text: string;
  settings: TeleprompterSettings;
  isRecording: boolean;
}

export function TeleprompterDisplay({ text, settings, isRecording }: TeleprompterDisplayProps) {
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

  return (
    <div
      ref={containerRef}
      className="absolute top-0 left-0 right-0 h-1/2 bg-black/50 overflow-hidden pointer-events-none"
      style={{
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
      }}
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
