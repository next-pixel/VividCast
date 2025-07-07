"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Header } from '@/components/vividcast/header';
import { LeftPanel } from '@/components/vividcast/left-panel';
import { RightPanel } from '@/components/vividcast/right-panel';
import { VideoPreview } from '@/components/vividcast/video-preview';
import { Controls } from '@/components/vividcast/controls';
import { TeleprompterDisplay } from '@/components/vividcast/teleprompter-display';
import { cn } from '@/lib/utils';

export type Effects = {
  blur: number;
  hue: number;
  opacity: number;
};

export type TeleprompterSettings = {
  speed: number;
  fontSize: number;
};

export type TeleprompterPosition = 'top' | 'bottom' | 'left' | 'right';

export default function VividCastPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [effects, setEffects] = useState<Effects>({ blur: 0, hue: 0, opacity: 100 });
  const [teleprompterText, setTeleprompterText] = useState('');
  const [teleprompterSettings, setTeleprompterSettings] = useState<TeleprompterSettings>({ speed: 2, fontSize: 48 });
  const [teleprompterPosition, setTeleprompterPosition] = useState<TeleprompterPosition>('top');
  const [selectedLayout, setSelectedLayout] = useState('full-screen');
  const [selectedBackground, setSelectedBackground] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16/9');
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);

  const startRecording = () => {
    setRecordedVideoUrl(null);
    setElapsedTime(0);
    setIsPaused(false);
    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev > 1) {
          return prev - 1;
        } else {
          clearInterval(countdownInterval);
          setIsRecording(true);
          return 0;
        }
      });
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
  };
  
  const togglePause = () => {
    setIsPaused(prev => !prev);
  }

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  return (
    <div className="bg-background min-h-screen w-full flex flex-col font-body">
      <Header videoUrl={recordedVideoUrl} />
      <main className="flex-1 container mx-auto p-4 flex flex-col xl:flex-row items-start gap-6">
        <div className="w-full xl:w-auto">
          <LeftPanel
            setTeleprompterText={setTeleprompterText}
            teleprompterSettings={teleprompterSettings}
            setTeleprompterSettings={setTeleprompterSettings}
            teleprompterPosition={teleprompterPosition}
            onTeleprompterPositionChange={setTeleprompterPosition}
          />
        </div>

        <div className="flex-1 flex flex-col gap-4 items-center w-full max-w-5xl mx-auto">
          <div 
            className="relative w-full transition-all"
            style={{ 
              aspectRatio: aspectRatio,
              maxHeight: 'calc(100vh - 280px)'
            }}
          >
            <VideoPreview
              effects={effects}
              isRecording={isRecording}
              isPaused={isPaused}
              elapsedTime={elapsedTime}
              onRecordingComplete={setRecordedVideoUrl}
              selectedBackground={selectedBackground}
            />
            {countdown > 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <span className="text-9xl font-bold text-white">{countdown}</span>
              </div>
            )}
             <TeleprompterDisplay 
                text={teleprompterText}
                settings={teleprompterSettings}
                isRecording={isRecording && !isPaused}
                position={teleprompterPosition}
              />
          </div>
          <Controls
            isRecording={isRecording}
            isPaused={isPaused}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            onTogglePause={togglePause}
            aspectRatio={aspectRatio}
            onAspectRatioChange={setAspectRatio}
          />
        </div>

        <div className="w-full xl:w-auto">
          <RightPanel
            effects={effects}
            setEffects={setEffects}
            selectedLayout={selectedLayout}
            setSelectedLayout={setSelectedLayout}
            setSelectedBackground={setSelectedBackground}
            selectedBackground={selectedBackground}
          />
        </div>
      </main>
    </div>
  );
}
