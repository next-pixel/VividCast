import React, { useRef, useEffect, useState } from 'react';
import type { Effects } from '@/app/page';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { VideoOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoPreviewProps {
  effects: Effects;
  isRecording: boolean;
  isPaused: boolean;
  elapsedTime: number;
  onRecordingComplete: (url: string) => void;
  selectedBackground: string;
  screenStream: MediaStream | null;
  selectedLayout: string;
}

function formatTime(seconds: number) {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
}

export function VideoPreview({ effects, isRecording, isPaused, elapsedTime, onRecordingComplete, selectedBackground, screenStream, selectedLayout }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
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
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
      screenVideoRef.current.play().catch(e => console.error("Error playing screen share video:", e));
    }
  }, [screenStream]);


  useEffect(() => {
    const video = videoRef.current;
    const screenVideo = screenVideoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const render = () => {
      const currentEffects = effectsRef.current;
      const camReady = video.readyState >= 2;
      const screenReady = screenStream && screenVideo && screenVideo.readyState >= 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.filter = `blur(${currentEffects.blur}px) hue-rotate(${currentEffects.hue}deg) opacity(${currentEffects.opacity}%)`;

      if (screenReady) {
          const drawCam = (x:number, y:number, w:number, h:number) => { if (camReady) ctx.drawImage(video, x, y, w, h); };
          const drawScreen = (x:number, y:number, w:number, h:number) => { if (screenReady) ctx.drawImage(screenVideo, x, y, w, h); };

          switch (selectedLayout) {
              case 'picture-in-picture':
              case 'presenter':
                  drawScreen(0, 0, canvas.width, canvas.height);
                  const pipWidth = canvas.width / 4;
                  const pipHeight = pipWidth * (video.videoHeight / video.videoWidth) || pipWidth * (9/16);
                  drawCam(canvas.width - pipWidth - 20, canvas.height - pipHeight - 20, pipWidth, pipHeight);
                  break;
              case 'side-by-side':
                  drawScreen(0, 0, canvas.width / 2, canvas.height);
                  drawCam(canvas.width / 2, 0, canvas.width / 2, canvas.height);
                  break;
              case 'full-screen':
              default:
                  drawScreen(0, 0, canvas.width, canvas.height);
                  break;
          }
      } else if (camReady) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      
      ctx.filter = 'none';
      animationFrameIdRef.current = requestAnimationFrame(render);
    };
    
    const startRenderLoop = () => {
        if (!animationFrameIdRef.current) {
            video.play().catch(e => console.error("Error playing video:", e));
            if (video.videoWidth > 0) {
                canvas.width = 1280;
                canvas.height = 720;
            }
            render();
        }
    };
    
    video.addEventListener('canplay', startRenderLoop);
    screenVideo?.addEventListener('canplay', startRenderLoop);
    
    if (video.readyState >= 3) { // HAVE_FUTURE_DATA
      startRenderLoop();
    }

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = undefined;
      }
      video.removeEventListener('canplay', startRenderLoop);
      screenVideo?.removeEventListener('canplay', startRenderLoop);
    };
  }, [hasCameraPermission, screenStream, selectedLayout]);

  useEffect(() => {
    if (isRecording) {
        if (mediaRecorderRef.current) return;
        recordedChunksRef.current = [];
        const canvas = canvasRef.current;
        if (!canvas) return;

        const stream = canvas.captureStream(30);
        
        const cameraAudioTracks = (videoRef.current?.srcObject as MediaStream)?.getAudioTracks();
        if (cameraAudioTracks && cameraAudioTracks.length > 0) {
            stream.addTrack(cameraAudioTracks[0]);
        }
        
        const screenAudioTracks = screenStream?.getAudioTracks();
        if (screenAudioTracks && screenAudioTracks.length > 0) {
            stream.addTrack(screenAudioTracks[0]);
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
            mediaRecorderRef.current = null;
        };

        mediaRecorderRef.current.start();
    } else {
        if(mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current?.stop();
        }
    }
  }, [isRecording, onRecordingComplete, screenStream]);

   useEffect(() => {
    if (!mediaRecorderRef.current) return;
    if (isPaused) {
      if (mediaRecorderRef.current.state === 'recording') mediaRecorderRef.current.pause();
    } else {
      if (mediaRecorderRef.current.state === 'paused') mediaRecorderRef.current.resume();
    }
  }, [isPaused]);


  return (
    <div 
      className="relative w-full h-full rounded-lg overflow-hidden shadow-lg flex items-center justify-center"
      style={{ background: selectedBackground || 'hsl(var(--card-foreground))' }}
    >
      <video ref={videoRef} autoPlay playsInline muted className="hidden"></video>
      <video ref={screenVideoRef} autoPlay playsInline muted className="hidden"></video>
      <canvas ref={canvasRef} className={cn('w-full h-full object-contain', { 'invisible': hasCameraPermission !== true })}></canvas>
      
       {isRecording && (
        <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full flex items-center gap-2 text-sm">
          <span className={cn("h-3 w-3 rounded-full bg-red-500", { 'animate-pulse': !isPaused })} />
          <span>{isPaused ? "Paused" : "REC"}</span>
          <span className="font-mono">{formatTime(elapsedTime)}</span>
        </div>
      )}

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
