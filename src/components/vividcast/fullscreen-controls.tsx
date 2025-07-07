import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Square, Pause, Mic, MicOff, Shrink, ChevronLeft, ChevronRight } from 'lucide-react';

interface FullscreenControlsProps {
  isRecording: boolean;
  isPaused: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onTogglePause: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onToggleFullScreen: () => void;
  currentSlide: number;
  totalSlides: number;
  onSlideChange: (slide: number) => void;
}

export function FullscreenControls({
  isRecording,
  isPaused,
  onStartRecording,
  onStopRecording,
  onTogglePause,
  isMuted,
  onToggleMute,
  onToggleFullScreen,
  currentSlide,
  totalSlides,
  onSlideChange
}: FullscreenControlsProps) {

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-2xl px-4">
      <div className="flex items-center justify-between gap-4 p-3 bg-card/80 border backdrop-blur-sm rounded-2xl shadow-lg w-full">
        {/* Slide Navigation */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {totalSlides > 0 && (
            <>
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => onSlideChange(currentSlide - 1)} disabled={currentSlide === 0}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="text-sm font-medium text-center truncate">
                <Badge variant="secondary" className="text-xs">
                  {currentSlide + 1} / {totalSlides}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => onSlideChange(currentSlide + 1)} disabled={currentSlide >= totalSlides - 1}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>

        {/* Recording Controls */}
        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" onClick={onToggleMute}>
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          <Button
            size="lg"
            className="w-28 h-11"
            onClick={isRecording ? onStopRecording : onStartRecording}
            variant={isRecording ? 'destructive' : 'default'}
          >
            {isRecording ? <Square className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
            {isRecording ? 'Stop' : 'Record'}
          </Button>
          {isRecording ? (
            <Button size="icon" variant="outline" className="w-11 h-11" onClick={onTogglePause}>
              {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
            </Button>
          ) : <div className="w-11 h-11" />}
        </div>

        {/* Fullscreen Toggle */}
        <div className="flex items-center justify-end flex-1">
          <Button size="icon" variant="outline" onClick={onToggleFullScreen}>
            <Shrink className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
