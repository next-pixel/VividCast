
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
  onPipSettingsChange: (settings: PipSettings) => void;
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
  onPipSettingsChange,
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

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const [audioFrequencyData, setAudioFrequencyData] = useState(() => new Uint8Array(16));

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
    if (!isRecording || isPaused || isMuted) {
      setAudioFrequencyData(new Uint8Array(16)); // Reset on stop/pause
      return;
    }
  
    const audioTracks = streamRef.current?.getAudioTracks();
    if (!streamRef.current || !audioTracks || audioTracks.length === 0) {
      setAudioFrequencyData(new Uint8Array(16));
      return;
    }
  
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    // Use a smaller fftSize for fewer bars, which is better for a small visualizer.
    analyser.fftSize = 32;
    const source = audioContext.createMediaStreamSource(streamRef.current!);
    source.connect(analyser);
  
    const bufferLength = analyser.frequencyBinCount; // Will be 16
    const dataArray = new Uint8Array(bufferLength);
    let animationFrameId: number;
  
    const analyse = () => {
      analyser.getByteFrequencyData(dataArray);
      // Create a copy to avoid state mutation issues
      setAudioFrequencyData(new Uint8Array(dataArray));
      animationFrameId = requestAnimationFrame(analyse);
    };
    
    analyse();
  
    return () => {
      cancelAnimationFrame(animationFrameId);
      source.disconnect();
      analyser.disconnect();
      if (audioContext.state !== 'closed') {
        audioContext.close();
      }
      setAudioFrequencyData(new Uint8Array(16));
    };
  }, [isRecording, isPaused, isMuted, selectedDeviceId]);

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

      const drawContained = (source: CanvasImageSource, dx: number, dy: number, dw: number, dh: number) => {
        const sw = (source as any).videoWidth || (source as any).naturalWidth || (source as any).width || 0;
        const sh = (source as any).videoHeight || (source as any).naturalHeight || (source as any).height || 0;
        if (!sw || !sh) return;

        const sRatio = sw / sh;
        const dRatio = dw / dh;

        let newWidth = dw;
        let newHeight = dh;

        if (sRatio > dRatio) {
            newHeight = dw / sRatio;
        } else {
            newWidth = dh * sRatio;
        }
        
        const newDx = dx + (dw - newWidth) / 2;
        const newDy = dy + (dh - newHeight) / 2;

        ctx.drawImage(source, 0, 0, sw, sh, newDx, newDy, newWidth, newHeight);
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
        // Draw a default light gray background to ensure the video isn't black
        ctx.fillStyle = '#F3F4F6'; // Corresponds to Tailwind's gray-100
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
            const pipWidth = canvas.width * (pipSettings.size / 100);
            const camAspectRatio = video.videoHeight ? video.videoWidth / video.videoHeight : 16/9;
            const pipHeight = pipWidth / camAspectRatio;
            const pipX = canvas.width * (pipSettings.position.x / 100);
            const pipY = canvas.height * (pipSettings.position.y / 100);

            ctx.save();
            ctx.globalAlpha = pipSettings.opacity / 100;
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
            const margin = 20; // Margin between the two sections
            const availableWidth = canvas.width - margin;
            const camWidth = availableWidth * (sideBySideSettings.split / 100);
            const presentationWidth = availableWidth - camWidth;
            
            drawCam(0, 0, camWidth, canvas.height);
            drawPresentation(camWidth + margin, 0, presentationWidth, canvas.height);
            break;
          case 'presenter':
            drawCam(0, 0, canvas.width, canvas.height);
            const presentationAsset = slideReady ? slideImageRef.current : (screenReady ? screenVideo : null);
            if (presentationAsset) {
                const insetWidth = canvas.width / 4;
                const insetHeight = canvas.height / 4;
                const insetX = canvas.width - insetWidth - 20;
                const insetY = canvas.height - insetHeight - 20;
                
                // Add a semi-transparent background for the inset
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(insetX, insetY, insetWidth, insetHeight);

                // Draw the presentation content contained within the box
                drawContained(presentationAsset, insetX, insetY, insetWidth, insetHeight);
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
  }, [hasCameraPermission, screenStream, slideImages.length, isSegmenterReady, effects, selectedLayout, pipSettings, logoSettings, sideBySideSettings, aspectRatio, selectedBackground, backgroundImage]);

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
        
        requestAnimationFrame(() => {
          mediaRecorderRef.current?.start();
        });
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

  const getMousePos = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!previewContainerRef.current) return { x: 0, y: 0 };
    const rect = previewContainerRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (selectedLayout !== 'picture-in-picture') return;

    const canvas = canvasRef.current;
    if (!canvas || !videoRef.current) return;

    const container = previewContainerRef.current;
    if (!container) return;

    const scaleX = canvas.width / container.clientWidth;
    const scaleY = canvas.height / container.clientHeight;

    const mousePos = getMousePos(e);
    const mouseX = mousePos.x * scaleX;
    const mouseY = mousePos.y * scaleY;

    const pipWidth = canvas.width * (pipSettings.size / 100);
    const camAspectRatio = videoRef.current.videoHeight ? videoRef.current.videoWidth / videoRef.current.videoHeight : 16/9;
    const pipHeight = pipWidth / camAspectRatio;
    const pipX = canvas.width * (pipSettings.position.x / 100);
    const pipY = canvas.height * (pipSettings.position.y / 100);

    if (mouseX > pipX && mouseX < pipX + pipWidth && mouseY > pipY && mouseY < pipY + pipHeight) {
      setIsDragging(true);
      dragOffsetRef.current = {
        x: mouseX - pipX,
        y: mouseY - pipY,
      };
      container.style.cursor = 'grabbing';
    }
  }, [selectedLayout, getMousePos, pipSettings]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      if (previewContainerRef.current) {
        // We set the cursor based on hover state in mousemove
        previewContainerRef.current.style.cursor = 'grab';
      }
    }
  }, [isDragging]);

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      if (previewContainerRef.current) {
        previewContainerRef.current.style.cursor = 'default';
      }
    }
  }, [isDragging]);
  
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = previewContainerRef.current;
    if (!container) return;

    const canvas = canvasRef.current;
    if (!canvas || !videoRef.current) return;
    
    const scaleX = canvas.width / container.clientWidth;
    const scaleY = canvas.height / container.clientHeight;
    
    const mousePos = getMousePos(e);
    const mouseX = mousePos.x * scaleX;
    const mouseY = mousePos.y * scaleY;

    const pipWidth = canvas.width * (pipSettings.size / 100);
    const camAspectRatio = videoRef.current.videoHeight ? videoRef.current.videoWidth / videoRef.current.videoHeight : 16/9;
    const pipHeight = pipWidth / camAspectRatio;
    const pipX = canvas.width * (pipSettings.position.x / 100);
    const pipY = canvas.height * (pipSettings.position.y / 100);

    if (selectedLayout === 'picture-in-picture') {
        const isHoveringPip = mouseX > pipX && mouseX < pipX + pipWidth && mouseY > pipY && mouseY < pipY + pipHeight;
        if (isDragging) {
            container.style.cursor = 'grabbing';
        } else if (isHoveringPip) {
            container.style.cursor = 'grab';
        } else {
            container.style.cursor = 'default';
        }
    } else {
        container.style.cursor = 'default';
    }

    if (!isDragging) return;

    let newX = mouseX - dragOffsetRef.current.x;
    let newY = mouseY - dragOffsetRef.current.y;

    newX = Math.max(0, Math.min(newX, canvas.width - pipWidth));
    newY = Math.max(0, Math.min(newY, canvas.height - pipHeight));

    const newXPercent = (newX / canvas.width) * 100;
    const newYPercent = (newY / canvas.height) * 100;

    onPipSettingsChange({
      ...pipSettings,
      position: { x: newXPercent, y: newYPercent },
    });
  }, [isDragging, getMousePos, pipSettings, onPipSettingsChange, selectedLayout, canvasRef, videoRef]);

  const isPresenting = screenStream || slideImages.length > 0;
  const showSegmenterLoading = !!selectedBackground && !isPresenting && !isSegmenterReady;

  const audioLevel = audioFrequencyData.length > 0
    ? (audioFrequencyData.reduce((sum, value) => sum + value, 0) / audioFrequencyData.length) / 255
    : 0;

  return (
    <div 
      ref={previewContainerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-full bg-card flex items-center justify-center overflow-hidden"
      style={{ background: selectedBackground || 'hsl(var(--muted))' }}
    >
      <video ref={videoRef} playsInline muted className="hidden" />
      <video ref={screenVideoRef} playsInline muted className="hidden" />
      <canvas ref={canvasRef} className="w-full h-full object-cover"></canvas>
      
       {isRecording && (
        <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full flex items-center gap-2 text-sm z-10">
          <div
            className="h-3 w-3 rounded-full bg-red-500 transition-transform duration-75"
            style={{ transform: `scale(${isPaused ? 1 : 1 + audioLevel * 1.2})` }}
          />
          <div className="flex items-end gap-px h-4">
            {Array.from(audioFrequencyData).map((value, i) => (
                <div
                    key={i}
                    className="w-0.5 bg-red-400"
                    style={{ height: `${Math.max(2, (value / 255) * 100)}%` }}
                />
            ))}
          </div>
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
    </div>
  );
}
