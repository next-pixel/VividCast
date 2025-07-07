import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Square, Scaling, Pause, Mic, MicOff, Camera, Expand, Shrink } from 'lucide-react';

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
  isFullscreen: boolean;
  onToggleFullScreen: () => void;
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
  onCameraChange,
  isFullscreen,
  onToggleFullScreen
}: ControlsProps) {
  const aspectRatios = [
    { value: '16/9', label: 'Landscape (16:9)' },
    { value: '9/16', label: 'Portrait (9:16)' },
    { value: '1/1', label: 'Square (1:1)' },
    { value: '4/3', 'label': 'Classic (4:3)' },
    { value: '21/9', label: 'Cinematic (21:9)' },
    { value: '4/5', label: 'Social (4:5)' },
  ];

  return (
    <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-center gap-4">
        <div className="flex items-center gap-2">
            <Select value={aspectRatio} onValueChange={onAspectRatioChange}>
                <SelectTrigger className="w-auto flex-grow sm:flex-grow-0 sm:w-[180px] bg-card">
                    <Scaling className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Select Aspect Ratio" />
                </SelectTrigger>
                <SelectContent>
                    {aspectRatios.map((ratio) => (
                        <SelectItem key={ratio.value} value={ratio.value}>{ratio.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={selectedDeviceId} onValueChange={onCameraChange}>
                <SelectTrigger className="w-auto flex-grow sm:flex-grow-0 sm:w-[180px] bg-card">
                    <Camera className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Select Camera" />
                </SelectTrigger>
                <SelectContent>
                    {videoDevices.map((device) => (
                        <SelectItem key={device.deviceId} value={device.deviceId}>{device.label || `Camera ${videoDevices.indexOf(device) + 1}`}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

             <Button size="icon" variant="outline" onClick={onToggleMute} className="bg-card">
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>

            <Button size="icon" variant="outline" onClick={onToggleFullScreen} className="bg-card">
              {isFullscreen ? <Shrink className="h-5 w-5" /> : <Expand className="h-5 w-5" />}
            </Button>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="lg"
            className="w-48 transition-all duration-300 ease-in-out font-bold text-lg h-14"
            onClick={isRecording ? onStopRecording : onStartRecording}
            variant={isRecording ? 'destructive' : 'default'}
          >
            {isRecording ? (
              <>
                <Square className="mr-2 h-6 w-6" />
                Stop
              </>
            ) : (
              <>
                <Play className="mr-2 h-6 w-6" />
                Record
              </>
            )}
          </Button>
          {isRecording && (
            <Button
              size="lg"
              variant="outline"
              onClick={onTogglePause}
              className="h-14 w-14"
            >
              {isPaused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
            </Button>
          )}
        </div>
      </div>
  );
}
