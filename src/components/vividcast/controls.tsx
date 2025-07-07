import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Square, Video, Zap } from 'lucide-react';

interface ControlsProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export function Controls({ isRecording, onStartRecording, onStopRecording }: ControlsProps) {
  return (
    <Card className="w-full max-w-lg shadow-md">
      <CardContent className="p-3 flex items-center justify-between gap-4">
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
        </div>
        
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

        <div className="w-[256px]"/>
      </CardContent>
    </Card>
  );
}
