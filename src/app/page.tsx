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

export default function VividCastPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [effects, setEffects] = useState<Effects>({ blur: 0, hue: 0, opacity: 100 });
  const [teleprompterText, setTeleprompterText] = useState('');
  const [teleprompterSettings, setTeleprompterSettings] = useState<TeleprompterSettings>({ speed: 2, fontSize: 48 });
  const [selectedLayout, setSelectedLayout] = useState('full-screen');
  const [selectedBackground, setSelectedBackground] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16/9');
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);

  const startRecording = () => {
    setRecordedVideoUrl(null);
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
  };

  return (
    <div className="bg-background min-h-screen w-full flex flex-col font-body">
      <Header videoUrl={recordedVideoUrl} />
      <main className="flex-1 container mx-auto p-4 flex flex-col xl:flex-row items-start gap-6">
        <div className="w-full xl:w-auto">
          <LeftPanel
            setTeleprompterText={setTeleprompterText}
            teleprompterSettings={teleprompterSettings}
            setTeleprompterSettings={setTeleprompterSettings}
          />
        </div>

        <div className="flex-1 flex flex-col gap-4 items-center w-full max-w-5xl mx-auto">
          <div className={cn("relative w-full transition-all", `aspect-[${aspectRatio}]`)}>
            <VideoPreview
              effects={effects}
              isRecording={isRecording}
              onRecordingComplete={setRecordedVideoUrl}
            />
            {countdown > 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <span className="text-9xl font-bold text-white">{countdown}</span>
              </div>
            )}
             <TeleprompterDisplay 
                text={teleprompterText}
                settings={teleprompterSettings}
                isRecording={isRecording}
              />
          </div>
          <Controls
            isRecording={isRecording}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
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
          />
        </div>
      </main>
    </div>
  );
}
