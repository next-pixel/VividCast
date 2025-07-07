import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Square, Video, Zap, Scaling, Pause, Mic, MicOff, FlipHorizontal } from 'lucide-react';

interface ControlsProps {
  isRecording: boolean;
  isPaused: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onTogglePause: () => void;
  aspectRatio: string;
  onAspectRatioChange: (ratio: string) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  videoDevices: MediaDeviceInfo[];
  selectedDeviceId: string;
  onCameraChange: (deviceId: string) => void;
}

export function Controls({ 
  isRecording, 
  isPaused,
  onStartRecording, 
  onStopRecording, 
  onTogglePause,
  aspectRatio, 
  onAspectRatioChange,
  isMuted,
  onToggleMute,
  videoDevices,
  selectedDeviceId,
  onCameraChange
}: ControlsProps) {
  const aspectRatios = [
    { value: '16/9', label: 'Landscape (16:9)' },
    { value: '9/16', label: 'Portrait (9:16)' },
    { value: '1/1', label: 'Square (1:1)' },
    { value: '4/3', label: 'Traditional (4:3)' },
    { value: '21/9', label: 'Cinematic (21:9)' },
    { value: '4/5', label: 'Social (4:5)' },
  ];

  return (
    <Card className="w-full max-w-lg shadow-md">
      <CardContent className="p-3 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
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
          {isRecording && (
            <Button
              size="lg"
              variant="outline"
              onClick={onTogglePause}
            >
              {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
            </Button>
          )}
          <Button size="lg" variant="outline" onClick={onToggleMute}>
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-2">
            <Select defaultValue="1080p">
                <SelectTrigger className="w-auto flex-grow sm:flex-grow-0 sm:w-[120px]">
                    <Video className="h-4 w-4 mr-2" />
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="720p">720p</SelectItem>
                    <SelectItem value="1080p">1080p</SelectItem>
                    <SelectItem value="4k">4K</SelectItem>
                </SelectContent>
            </Select>
             <Select value={selectedDeviceId} onValueChange={onCameraChange}>
                <SelectTrigger className="w-auto flex-grow sm:flex-grow-0 sm:w-[150px]">
                    <FlipHorizontal className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Select Camera" />
                </SelectTrigger>
                <SelectContent>
                    {videoDevices.map((device) => (
                        <SelectItem key={device.deviceId} value={device.deviceId}>{device.label || `Camera ${videoDevices.indexOf(device) + 1}`}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={aspectRatio} onValueChange={onAspectRatioChange}>
                <SelectTrigger className="w-auto flex-grow sm:flex-grow-0 sm:w-[180px]">
                    <Scaling className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Select Aspect Ratio" />
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
