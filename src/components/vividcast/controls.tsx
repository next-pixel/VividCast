
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Square, Pause, Mic, MicOff, Expand, Shrink } from 'lucide-react';

interface ControlsProps {
  isRecording: boolean;
  isPaused: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onTogglePause: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isFullscreen: boolean;
  onToggleFullScreen: () => void;
}

export function Controls({ 
  isRecording, 
  isPaused,
  onStartRecording, 
  onStopRecording, 
  onTogglePause,
  isMuted,
  onToggleMute,
  isFullscreen,
  onToggleFullScreen
}: ControlsProps) {
  
  return (
    <div id="controls-bar" className="w-full flex items-center justify-center">
      <div className="flex items-center justify-center flex-wrap gap-4 p-3 bg-card rounded-2xl shadow-lg border">
        {/* Recording Controls */}
        <div className="flex items-center gap-2">
            <Button size="icon" variant="outline" onClick={onToggleMute}>
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            <Button
                size="lg"
                className="w-32 h-12 font-bold"
                onClick={isRecording ? onStopRecording : onStartRecording}
                variant={isRecording ? 'destructive' : 'default'}
            >
                {isRecording ? (
                <>
                    <Square className="mr-2 h-5 w-5" />
                    Stop
                </>
                ) : (
                <>
                    <Play className="mr-2 h-5 w-5" />
                    Record
                </>
                )}
            </Button>
            {isRecording ? (
                <Button size="icon" variant="outline" className="w-12 h-12" onClick={onTogglePause}>
                    {isPaused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
                </Button>
            ) : <div className="w-12 h-12" /> /* Placeholder to prevent layout shift */}
        </div>
        
        {/* Fullscreen Control */}
        <div className="flex items-center">
            <Button size="icon" variant="outline" onClick={onToggleFullScreen}>
              {isFullscreen ? <Shrink className="h-5 w-5" /> : <Expand className="h-5 w-5" />}
            </Button>
        </div>
      </div>
    </div>
  );
}
