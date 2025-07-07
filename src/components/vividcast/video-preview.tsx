
import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { Effects, LogoSettings, PipSettings, SideBySideSettings } from '@/app/page';
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
  pipSettings: PipSettings;
  sideBySideSettings: SideBySideSettings;
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
  pipSettings,
  sideBySideSettings,
  aspectRatio,
}: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();
  
  const slideImageRef = useRef<HTMLImageElement | null>(null);
  const logoImageRef = useRef<HTMLImageElement | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const segmentationRef = useRef<SelfieSegmentation | null>(null);
  const [isSegmenterReady, setIsSegmenterReady] = useState(false);
  const lastFrameTimeRef = useRef(0);
  const animationFrameId = useRef<number>();

  useEffect(() => {
    // This effect runs only once on mount to initialize the segmenter
    if (segmentationRef.current) return;

    let segmenter: SelfieSegmentation | null = null;
    
    const initialize = async () => {
        try {
            const { SelfieSegmentation } = await import('@mediapipe/selfie_segmentation');
            segmenter = new SelfieSegmentation({
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1/${file}`,
            });
            segmenter.setOptions({ modelSelection: 1 });
            
            segmenter.onResults((results: SegmentationResults) => {
              if (!offscreenCanvasRef.current) return;
              const ctx = offscreenCanvasRef.current.getContext('2d');
              if (!ctx || !results.image) return;
              
              const { width, height } = results.image;
              offscreenCanvasRef.current.width = width;
              offscreenCanvasRef.current.height = height;

              ctx.save();
              ctx.clearRect(0, 0, width, height);
              
              // Smooth the mask edges with a blur for a better effect
              ctx.filter = 'blur(4px)';
              ctx.drawImage(results.segmentationMask, 0, 0, width, height);
              ctx.filter = 'none';
          
              ctx.globalCompositeOperation = 'source-in';
              ctx.drawImage(results.image, 0, 0, width, height);
              
              ctx.restore();
            });
            
            await segmenter.initialize();

            segmentationRef.current = segmenter;
            offscreenCanvasRef.current = document.createElement('canvas');
            setIsSegmenterReady(true);
        } catch (error) {
            console.error("Failed to initialize selfie segmentation:", error);
            toast({
              variant: "destructive",
              title: "Background Engine Failed",
              description: "Could not start the background removal feature."
            })
        }
    };

    initialize();

    return () => {
      segmenter?.close();
      segmentationRef.current = null;
    };
  }, [toast]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const [arW, arH] = aspectRatio.split('/').map(Number);
    if (!arW || !arH) return;

    const targetAspectRatio = arW / arH;
    
    const canvasWidth = 1920;
    const canvasHeight = Math.round(canvasWidth / targetAspectRatio);

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
  }, [aspectRatio]);

  useEffect(() => {
    if (selectedBackground && selectedBackground.startsWith('url(')) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            setBackgroundImage(img);
        };
        img.onerror = () => {
            setBackgroundImage(null);
            console.error('Failed to load background image:', selectedBackground);
            toast({
                variant: 'destructive',
                title: 'Background Error',
                description: 'Could not load the selected background image.',
            });
        };
        // Handles url("...") and url(...)
        img.src = selectedBackground.replace(/^url\((['"]?)(.*)\1\)$/, '$2');
    } else {
        setBackgroundImage(null);
    }
  }, [selectedBackground, toast]);

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

  // This effect will run once and set up the handler for camera video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      video.play().catch(e => {
        console.error("Video play failed", e);
        // Do not toast here as it can be spammy if the browser blocks autoplay
      });
    }
    video.addEventListener('loadeddata', handlePlay)
    
    return () => video.removeEventListener('loadeddata', handlePlay)
  }, []);

  // This effect will run once and set up the handler for screen share video
  useEffect(() => {
    const video = screenVideoRef.current;
    if (video) {
      video.onloadeddata = () => {
        video.play().catch(e => console.error("Screen share video play failed", e));
      };
    }
  }, []);

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
    }
  }, [screenStream]);


  useEffect(() => {
    const video = videoRef.current;
    const screenVideo = screenVideoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || hasCameraPermission !== true) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const render = () => {
      animationFrameId.current = requestAnimationFrame(render);
      if (!canvas || !ctx) return;
      
      const camReady = video.readyState >= 2;
      const screenReady = screenStream && screenVideo && screenVideo.readyState >= 2;
      const slideReady = slideImageRef.current?.complete && slideImageRef.current.naturalHeight !== 0;
      const isPresenting = screenStream || slideImages.length > 0;
      const useSegmentation = isSegmenterReady && !!selectedBackground;
      
      if (useSegmentation && camReady && video.currentTime !== lastFrameTimeRef.current) {
        lastFrameTimeRef.current = video.currentTime;
        if(segmentationRef.current) {
          segmentationRef.current.send({ image: video });
        }
      }

      const drawCovered = (source: CanvasImageSource, dx: number, dy: number, dw: number, dh: number) => {
        const sw = (source as any).videoWidth || (source as any).naturalWidth || (source as any).width || 0;
        const sh = (source as any).videoHeight || (source as any).naturalHeight || (source as any).height || 0;
        if (!sw || !sh) return;
  
        const sRatio = sw / sh;
        const dRatio = dw / dh;
        
        let sx = 0, sy = 0, sWidth = sw, sHeight = sh;

        if (sRatio > dRatio) {
            sWidth = sh * dRatio;
            sx = (sw - sWidth) / 2;
        } else {
            sHeight = sw / dRatio;
            sy = (sh - sHeight) / 2;
        }
        ctx.drawImage(source, sx, sy, sWidth, sHeight, dx, dy, dw, dh);
      }
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // --- Draw background onto canvas so it gets recorded ---
      if (selectedBackground) {
        if (selectedBackground.startsWith('url(') && backgroundImage?.complete && backgroundImage.naturalWidth > 0) {
            drawCovered(backgroundImage, 0, 0, canvas.width, canvas.height);
        } else if (selectedBackground.startsWith('linear-gradient')) {
            let gradient: CanvasGradient | null = null;
            if (selectedBackground === 'linear-gradient(to top right, #ff9a9e, #fad0c4)') {
                gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                gradient.addColorStop(0, '#ff9a9e');
                gradient.addColorStop(1, '#fad0c4');
            } else if (selectedBackground === 'linear-gradient(to top right, #ff7e5f, #feb47b)') {
                gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                gradient.addColorStop(0, '#ff7e5f');
                gradient.addColorStop(1, '#feb47b');
            } else if (selectedBackground === 'linear-gradient(to top right, #4facfe, #00f2fe)') {
                gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                gradient.addColorStop(0, '#4facfe');
                gradient.addColorStop(1, '#00f2fe');
            } else if (selectedBackground === 'linear-gradient(to top right, #6a11cb, #2575fc)') {
                gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                gradient.addColorStop(0, '#6a11cb');
                gradient.addColorStop(1, '#2575fc');
            }
            if (gradient) {
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        } else if (selectedBackground.startsWith('#') || selectedBackground.startsWith('hsl')) {
            ctx.fillStyle = selectedBackground;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      } else {
        // Draw a default background matching the theme's muted color for consistency in recording
        ctx.fillStyle = '#E5E7EB'; // A neutral light gray as a fallback.
        try {
            // Attempt to get the computed style for a more accurate color
            const style = getComputedStyle(canvas);
            const mutedColor = style.getPropertyValue('--muted');
            if (mutedColor) ctx.fillStyle = `hsl(${mutedColor})`;
        } catch(e) { /* ignore */ }
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      // --- End background drawing ---

      ctx.filter = `blur(${effects.blur}px) hue-rotate(${effects.hue}deg) opacity(${effects.opacity}%)`;
      
      const drawCam = (x: number, y: number, w: number, h: number) => {
        const source = (useSegmentation && offscreenCanvasRef.current?.width > 0) ? offscreenCanvasRef.current : video;
        if (camReady) {
          drawCovered(source!, x, y, w, h);
        }
      };

      const drawScreen = (x: number, y: number, w: number, h: number) => { 
        if (screenReady) drawCovered(screenVideo!, x, y, w, h);
      };
      const drawSlide = (x: number, y: number, w: number, h: number) => { 
        if (slideReady) drawCovered(slideImageRef.current!, x, y, w, h);
      };
      
      const drawPresentation = slideReady ? drawSlide : drawScreen;

      if (isPresenting) {
        switch (selectedLayout) {
          case 'full-screen':
            drawPresentation(0, 0, canvas.width, canvas.height);
            break;
          case 'picture-in-picture':
            drawPresentation(0, 0, canvas.width, canvas.height);
            const pipWidth = canvas.width / 4;
            const camAspectRatio = video.videoHeight ? video.videoWidth / video.videoHeight : 16/9;
            const pipHeight = pipWidth / camAspectRatio;
            const padding = 20;

            let pipX = 0, pipY = 0;
            switch(pipSettings.position) {
              case 'top-left': pipX = padding; pipY = padding; break;
              case 'top-right': pipX = canvas.width - pipWidth - padding; pipY = padding; break;
              case 'bottom-left': pipX = padding; pipY = canvas.height - pipHeight - padding; break;
              case 'bottom-right': pipX = canvas.width - pipWidth - padding; pipY = canvas.height - pipHeight - padding; break;
            }

            ctx.save();
            ctx.beginPath();
            if (pipSettings.shape === 'circle') {
              ctx.arc(pipX + pipWidth / 2, pipY + pipHeight / 2, Math.min(pipWidth, pipHeight) / 2, 0, 2 * Math.PI);
            } else if (pipSettings.shape === 'rounded-square') {
              ctx.roundRect(pipX, pipY, pipWidth, pipHeight, 30);
            } else {
              ctx.rect(pipX, pipY, pipWidth, pipHeight);
            }
            ctx.clip();
            drawCam(pipX, pipY, pipWidth, pipHeight);
            ctx.restore();
            break;
          case 'side-by-side':
            const camWidth = canvas.width * (sideBySideSettings.split / 100);
            const presentationWidth = canvas.width - camWidth;
            drawCam(0, 0, camWidth, canvas.height);
            drawPresentation(camWidth, 0, presentationWidth, canvas.height);
            break;
          case 'presenter':
            drawCam(0, 0, canvas.width, canvas.height);
            const presentationAsset = slideReady ? slideImageRef.current : (screenReady ? screenVideo : null);
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
    
    render();

    return () => {
      if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [hasCameraPermission, screenStream, slideImages.length, isSegmenterReady, effects, selectedLayout, logoSettings, pipSettings, sideBySideSettings, aspectRatio, selectedBackground, backgroundImage]);

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

  const isPresenting = screenStream || slideImages.length > 0;
  const showSegmenterLoading = !!selectedBackground && !isPresenting && !isSegmenterReady;

  return (
    <div 
      className="relative w-full h-full bg-card flex items-center justify-center overflow-hidden"
      style={{ background: selectedBackground || 'hsl(var(--muted))' }}
    >
      <video ref={videoRef} playsInline muted className="hidden" />
      <video ref={screenVideoRef} playsInline muted className="hidden" />
      <canvas ref={canvasRef} className="w-full h-full object-cover"></canvas>
      
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
