import React, { useRef, useEffect, useState } from 'react';
import type { Effects } from '@/app/page';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { VideoOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoPreviewProps {
  effects: Effects;
  isRecording: boolean;
  onRecordingComplete: (url: string) => void;
  selectedBackground: string;
}

export function VideoPreview({ effects, isRecording, onRecordingComplete, selectedBackground }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number>();
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();
  const effectsRef = useRef(effects);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    effectsRef.current = effects;
  }, [effects]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const getCameraPermission = async () => {
      if (typeof navigator?.mediaDevices?.getUserMedia !== 'function') {
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Unsupported Browser',
          description: 'Your browser does not support camera access.',
        });
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true,
        });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this app.',
        });
      }
    };

    getCameraPermission();

    return () => {
        stream?.getTracks().forEach((track) => track.stop());
    }
  }, [toast]);

  useEffect(() => {
    if (hasCameraPermission !== true) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const render = () => {
      const currentEffects = effectsRef.current;
      ctx.filter = `blur(${currentEffects.blur}px) hue-rotate(${currentEffects.hue}deg) opacity(${currentEffects.opacity}%)`;
      
      if (video.readyState >= video.HAVE_CURRENT_DATA) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      animationFrameIdRef.current = requestAnimationFrame(render);
    };
    
    const handleCanPlay = () => {
        video.play().catch(e => console.error("Error playing video:", e));
        
        if (video.videoWidth > 0) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
            render();
        }
    };

    video.addEventListener('canplay', handleCanPlay);
    
    if (video.readyState >= video.HAVE_ENOUGH_DATA) {
      handleCanPlay();
    }

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [hasCameraPermission]);

  useEffect(() => {
    if (isRecording) {
      recordedChunksRef.current = [];
      const canvas = canvasRef.current;
      if (!canvas) return;

      const stream = canvas.captureStream(30); // 30 fps
      const audioTracks = (videoRef.current?.srcObject as MediaStream)?.getAudioTracks();
      if (audioTracks && audioTracks.length > 0) {
        stream.addTrack(audioTracks[0]);
      }

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        onRecordingComplete(url);
      };

      mediaRecorderRef.current.start();
    } else {
      mediaRecorderRef.current?.stop();
    }
  }, [isRecording, onRecordingComplete]);

  return (
    <div 
      className="relative w-full h-full rounded-lg overflow-hidden shadow-lg flex items-center justify-center"
      style={{ background: selectedBackground || 'hsl(var(--card-foreground))' }}
    >
      <video ref={videoRef} autoPlay playsInline muted className="hidden"></video>
      <canvas ref={canvasRef} className={cn('w-full h-full object-cover', { 'invisible': hasCameraPermission !== true })}></canvas>
      
      {hasCameraPermission === false && (
         <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-muted-foreground bg-black/50">
            <VideoOff className="h-16 w-16" />
            <Alert variant="destructive" className="w-auto">
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                    Please allow camera access to use this feature.
                </AlertDescription>
            </Alert>
         </div>
      )}

      {hasCameraPermission === null && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-black/50">
          <p>Requesting camera access...</p>
        </div>
      )}
    </div>
  );
}
