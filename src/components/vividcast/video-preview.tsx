import React, { useRef, useEffect, useState } from 'react';
import type { Effects, LogoSettings } from '@/app/page';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { VideoOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SelfieSegmentation, Results as SegmentationResults } from '@mediapipe/selfie_segmentation';

interface VideoPreviewProps {
  effects: Effects;
  isRecording: boolean;
  isPaused: boolean;
  elapsedTime: number;
  onRecordingComplete: (url: string) => void;
  selectedBackground: string;
  screenStream: MediaStream | null;
  selectedLayout: string;
  slideImages: string[];
  currentSlide: number;
  isMuted: boolean;
  selectedDeviceId: string;
  logoSettings: LogoSettings;
  aspectRatio: string;
}

function formatTime(seconds: number) {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
}

export function VideoPreview({
  effects,
  isRecording,
  isPaused,
  elapsedTime,
  onRecordingComplete,
  selectedBackground,
  screenStream,
  selectedLayout,
  slideImages,
  currentSlide,
  isMuted,
  selectedDeviceId,
  logoSettings,
  aspectRatio,
}: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderIntervalIdRef = useRef<number>();
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();
  
  const effectsRef = useRef(effects);
  const layoutRef = useRef(selectedLayout);
  const slideImageRef = useRef<HTMLImageElement | null>(null);
  const logoImageRef = useRef<HTMLImageElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const segmentationRef = useRef<SelfieSegmentation | null>(null);
  const [isSegmenterReady, setIsSegmenterReady] = useState(false);
  const lastFrameTimeRef = useRef(0);

  useEffect(() => {
    effectsRef.current = effects;
    layoutRef.current = selectedLayout;
  }, [effects, selectedLayout]);
  
  // Update canvas resolution when aspect ratio changes to prevent distortion
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const [arW, arH] = aspectRatio.split('/').map(Number);
    if (!arW || !arH) return;

    const targetAspectRatio = arW / arH;
    
    // Set a base resolution for the canvas, e.g., 1920px wide.
    const canvasWidth = 1920;
    const canvasHeight = Math.round(canvasWidth / targetAspectRatio);

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
  }, [aspectRatio]);

  // Initialize Selfie Segmentation
  useEffect(() => {
    const onResults = (results: SegmentationResults) => {
        if (!offscreenCanvasRef.current) return;
        const ctx = offscreenCanvasRef.current.getContext('2d');
        if (!ctx) return;
        
        offscreenCanvasRef.current.width = results.image.width;
        offscreenCanvasRef.current.height = results.image.height;
        
        ctx.save();
        ctx.clearRect(0, 0, offscreenCanvasRef.current.width, offscreenCanvasRef.current.height);
        ctx.drawImage(results.segmentationMask, 0, 0, offscreenCanvasRef.current.width, offscreenCanvasRef.current.height);

        ctx.globalCompositeOperation = 'source-in';
        ctx.drawImage(results.image, 0, 0, offscreenCanvasRef.current.width, offscreenCanvasRef.current.height);
        
        ctx.restore();
    };

    const initializeSegmenter = async () => {
      try {
        const selfieSegmentationModule = await import('@mediapipe/selfie_segmentation');
        const segmentation = new selfieSegmentationModule.SelfieSegmentation({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1/${file}`,
        });
        segmentation.setOptions({ modelSelection: 1 });
        segmentation.onResults(onResults);
        
        await segmentation.initialize();
        segmentationRef.current = segmentation;
        offscreenCanvasRef.current = document.createElement('canvas');
        setIsSegmenterReady(true);
      } catch (error) {
        console.error("Failed to initialize selfie segmentation:", error);
        toast({
          variant: "destructive",
          title: "Background Effects Unavailable",
          description: "Could not load the background removal feature."
        });
      }
    };

    initializeSegmenter();
    
    return () => {
        segmentationRef.current?.close();
        segmentationRef.current = null;
        offscreenCanvasRef.current = null;
        setIsSegmenterReady(false);
    };
  }, [toast]);

  useEffect(() => {
    if (slideImages.length > 0 && currentSlide < slideImages.length) {
      const img = new Image();
      img.onload = () => { slideImageRef.current = img; };
      img.onerror = () => { slideImageRef.current = null; };
      img.src = slideImages[currentSlide];
    } else {
      slideImageRef.current = null;
    }
  }, [slideImages, currentSlide]);

  useEffect(() => {
    if (logoSettings.src) {
      const img = new Image();
      img.onload = () => { logoImageRef.current = img; };
      img.onerror = () => { logoImageRef.current = null; };
      img.src = logoSettings.src;
    } else {
      logoImageRef.current = null;
    }
  }, [logoSettings.src]);

  useEffect(() => {
    if (!selectedDeviceId) return;
    
    const getCameraStream = async () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      try {
        const constraints = {
          video: { deviceId: { exact: selectedDeviceId }, width: 1920, height: 1080 },
          audio: true,
        };
        const newStream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = newStream;
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Failed',
          description: 'Could not switch camera. Please check permissions.',
        });
      }
    };

    getCameraStream();

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    }
  }, [selectedDeviceId, toast]);
  
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
    }
  }, [isMuted]);

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
    
    const render = async () => {
      if (!canvas || !ctx) return;
      const currentEffects = effectsRef.current;
      const currentLayout = layoutRef.current;
      const camReady = video.readyState >= 2;
      const screenReady = screenStream && screenVideo && screenVideo.readyState >= 2;
      const slideReady = slideImageRef.current?.complete && slideImageRef.current.naturalHeight !== 0;

      const isPresenting = screenStream || slideImages.length > 0;
      const useSegmentation = isSegmenterReady && !!selectedBackground && !isPresenting;
      
      if (useSegmentation && camReady && video.currentTime !== lastFrameTimeRef.current) {
        lastFrameTimeRef.current = video.currentTime;
        await segmentationRef.current?.send({ image: video });
      }

      const drawWithLetterbox = (source: CanvasImageSource, dx: number, dy: number, dw: number, dh: number) => {
        const sw = (source as any).videoWidth || (source as any).naturalWidth || source.width;
        const sh = (source as any).videoHeight || (source as any).naturalHeight || source.height;
        if (!sw || !sh) return;
  
        const sRatio = sw / sh;
        const dRatio = dw / dh;
        
        let w, h, x, y;
  
        if (sRatio > dRatio) {
            w = dw;
            h = dw / sRatio;
            x = dx;
            y = dy + (dh - h) / 2;
        } else {
            h = dh;
            w = dh * sRatio;
            x = dx + (dw - w) / 2;
            y = dy;
        }
        ctx.drawImage(source, x, y, w, h);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.filter = `blur(${currentEffects.blur}px) hue-rotate(${currentEffects.hue}deg) opacity(${currentEffects.opacity}%)`;
      
      const drawCam = (x: number, y: number, w: number, h: number) => {
        const source = (useSegmentation && offscreenCanvasRef.current?.width > 0) ? offscreenCanvasRef.current : video;
        if (camReady) {
          drawWithLetterbox(source, x, y, w, h);
        }
      };

      const drawScreen = (x: number, y: number, w: number, h: number) => { 
        if (screenReady) drawWithLetterbox(screenVideo!, x, y, w, h);
      };
      const drawSlide = (x: number, y: number, w: number, h: number) => { 
        if (slideReady) drawWithLetterbox(slideImageRef.current!, x, y, w, h);
      };
      
      const drawPresentation = slideReady ? drawSlide : drawScreen;

      if (isPresenting) {
        switch (currentLayout) {
          case 'full-screen':
            drawPresentation(0, 0, canvas.width, canvas.height);
            break;
          case 'picture-in-picture':
            drawPresentation(0, 0, canvas.width, canvas.height);
            const pipWidth = canvas.width / 4;
            const pipHeight = pipWidth * (video.videoHeight / video.videoWidth || 9/16);
            drawCam(canvas.width - pipWidth - 20, canvas.height - pipHeight - 20, pipWidth, pipHeight);
            break;
          case 'side-by-side':
            drawCam(0, 0, canvas.width / 2, canvas.height);
            drawPresentation(canvas.width / 2, 0, canvas.width / 2, canvas.height);
            break;
          case 'presenter':
            drawCam(0, 0, canvas.width, canvas.height);
            const presentationAsset = slideReady ? slideImageRef.current! : (screenReady ? screenVideo! : null);
            if (presentationAsset) {
                const assetWidth = 'videoWidth' in presentationAsset ? presentationAsset.videoWidth : presentationAsset.width;
                const assetHeight = 'videoHeight' in presentationAsset ? presentationAsset.videoHeight : presentationAsset.height;
                const screenPipWidth = canvas.width / 4;
                const screenPipHeight = screenPipWidth * (assetHeight / assetWidth || 9/16);
                drawPresentation(canvas.width - screenPipWidth - 20, canvas.height - screenPipHeight - 20, screenPipWidth, screenPipHeight);
            }
            break;
          default:
            drawCam(0, 0, canvas.width, canvas.height);
            break;
        }
      } else { // Not presenting, just camera
        drawCam(0, 0, canvas.width, canvas.height);
      }
      
      ctx.filter = 'none';

      if (logoImageRef.current && logoImageRef.current.complete && logoSettings.src) {
          const logoImg = logoImageRef.current;
          const canvasW = canvas.width;
          const canvasH = canvas.height;
          
          const logoW = canvasW * (logoSettings.size / 100);
          const logoH = logoW * (logoImg.naturalHeight / logoImg.naturalWidth);
          const padding = 20;

          let x = 0, y = 0;

          switch (logoSettings.position) {
              case 'top-left': x = padding; y = padding; break;
              case 'top-right': x = canvasW - logoW - padding; y = padding; break;
              case 'bottom-left': x = padding; y = canvasH - logoH - padding; break;
              case 'bottom-right': x = canvasW - logoW - padding; y = canvasH - logoH - padding; break;
          }

          ctx.globalAlpha = logoSettings.opacity / 100;
          ctx.drawImage(logoImg, x, y, logoW, logoH);
          ctx.globalAlpha = 1.0;
      }
    };
    
    const startRenderLoop = () => {
      if (renderIntervalIdRef.current) {
        clearInterval(renderIntervalIdRef.current);
      }
      video.play().catch(e => console.error("Error playing video:", e));
      renderIntervalIdRef.current = window.setInterval(render, 1000 / 30); // 30 FPS
    };
    
    startRenderLoop();

    return () => {
      if (renderIntervalIdRef.current) {
        clearInterval(renderIntervalIdRef.current);
        renderIntervalIdRef.current = undefined;
      }
    };
  }, [hasCameraPermission, screenStream, logoSettings, slideImages, selectedBackground, isSegmenterReady, aspectRatio]);

  useEffect(() => {
    if (isRecording) {
        if (mediaRecorderRef.current) return;
        recordedChunksRef.current = [];
        const canvas = canvasRef.current;
        if (!canvas || canvas.width === 0 || canvas.height === 0) {
          console.error("Canvas not ready for recording");
          toast({
            variant: "destructive",
            title: "Recording Error",
            description: "Video preview is not ready. Please try again."
          });
          return;
        }

        const canvasStream = canvas.captureStream(30);
        const finalStream = new MediaStream(canvasStream.getVideoTracks());

        const cameraAudioTracks = streamRef.current?.getAudioTracks();
        if (cameraAudioTracks && cameraAudioTracks.length > 0) {
            finalStream.addTrack(cameraAudioTracks[0].clone());
        }
        
        const screenAudioTracks = screenStream?.getAudioTracks();
        if (screenAudioTracks && screenAudioTracks.length > 0) {
            finalStream.addTrack(screenAudioTracks[0].clone());
        }

        mediaRecorderRef.current = new MediaRecorder(finalStream, { mimeType: 'video/webm' });

        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
            }
        };

        mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            onRecordingComplete(url);
            finalStream.getTracks().forEach(track => track.stop());
            mediaRecorderRef.current = null;
        };

        mediaRecorderRef.current.start();
    } else {
        if(mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current?.stop();
        }
    }
  }, [isRecording, onRecordingComplete, screenStream, toast]);

   useEffect(() => {
    if (!mediaRecorderRef.current) return;
    if (isPaused) {
      if (mediaRecorderRef.current.state === 'recording') mediaRecorderRef.current.pause();
    } else {
      if (mediaRecorderRef.current.state === 'paused') mediaRecorderRef.current.resume();
    }
  }, [isPaused]);

  useEffect(() => {
    const keepVideoPlaying = (videoElement: HTMLVideoElement | null) => {
      if (!videoElement) return () => {};
      
      const onPause = () => {
        if (videoElement.paused) {
          videoElement.play().catch(() => {});
        }
      };
      
      videoElement.addEventListener('pause', onPause);
      return () => videoElement.removeEventListener('pause', onPause);
    };

    const cleanupVideo = keepVideoPlaying(videoRef.current);
    const cleanupScreen = keepVideoPlaying(screenVideoRef.current);

    return () => {
      cleanupVideo();
      cleanupScreen();
    };
  }, []);

  const isPresenting = screenStream || slideImages.length > 0;
  const showSegmenterLoading = !!selectedBackground && !isPresenting && !isSegmenterReady;

  return (
    <div 
      className="relative w-full h-full border-2 border-muted bg-card shadow-lg flex items-center justify-center"
      style={{ background: selectedBackground || 'hsl(var(--muted))' }}
    >
      <video ref={videoRef} autoPlay playsInline muted className="hidden"></video>
      <video ref={screenVideoRef} autoPlay playsInline muted className="hidden"></video>
      <canvas ref={canvasRef} className={cn('w-full h-full', { 'invisible': hasCameraPermission !== true })}></canvas>
      
       {isRecording && (
        <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full flex items-center gap-2 text-sm z-10">
          <span className={cn("h-3 w-3 rounded-full bg-red-500", { 'animate-pulse': !isPaused })} />
          <span>{isPaused ? "Paused" : "REC"}</span>
          <span className="font-mono">{formatTime(elapsedTime)}</span>
        </div>
      )}

      {showSegmenterLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-primary-foreground bg-black/70 z-20">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Starting background removal...</p>
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
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground bg-black/50">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Requesting camera access...</p>
        </div>
      )}
    </div>
  );
}
