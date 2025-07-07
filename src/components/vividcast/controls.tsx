import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Square, Video, Zap, AspectRatio } from 'lucide-react';

interface ControlsProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  aspectRatio: string;
  onAspectRatioChange: (ratio: string) => void;
}

export function Controls({ isRecording, onStartRecording, onStopRecording, aspectRatio, onAspectRatioChange }: ControlsProps) {
  const aspectRatios = [
    { value: '16/9', label: '16:9' },
    { value: '21/9', label: '21:9' },
    { value: '4/3', label: '4:3' },
    { value: '1/1', label: '1:1' },
    { value: '9/16', label: '9:16' },
    { value: '4/5', label: '4:5' },
    { value: '2/3', label: '2:3' },
  ];

  return (
    <Card className="w-full max-w-lg shadow-md">
      <CardContent className="p-3 flex flex-col items-center gap-3">
        <Button
          size="lg"
          className="w-48 transition-all duration-300 ease-in-out"
          onClick={isRecording ? onStopRecording : onStartRecording}
          variant={isRecording ? 'destructive' : 'default'}
        >
          {isRecording ? (
            <>
              <Square className="mr-2 h-5 w-5" />
              Stop Recording
            </>
          ) : (
            <>
              <Play className="mr-2 h-5 w-5" />
              Start Recording
            </>
          )}
        </Button>
        <div className="flex items-center gap-2">
            <Select defaultValue="1080p">
                <SelectTrigger className="w-[120px]">
                    <Video className="h-4 w-4 mr-2" />
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="720p">720p</SelectItem>
                    <SelectItem value="1080p">1080p</SelectItem>
                    <SelectItem value="4k">4K</SelectItem>
                </SelectContent>
            </Select>
            <Select defaultValue="30fps">
                <SelectTrigger className="w-[120px]">
                     <Zap className="h-4 w-4 mr-2" />
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="30fps">30 fps</SelectItem>
                    <SelectItem value="60fps">60 fps</SelectItem>
                </SelectContent>
            </Select>
            <Select value={aspectRatio} onValueChange={onAspectRatioChange}>
                <SelectTrigger className="w-[120px]">
                    <AspectRatio className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Aspect Ratio" />
                </SelectTrigger>
                <SelectContent>
                    {aspectRatios.map((ratio) => (
                        <SelectItem key={ratio.value} value={ratio.value}>{ratio.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </CardContent>
    </Card>
  );
}
