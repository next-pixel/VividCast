
"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Header } from '@/components/vividcast/header';
import { SettingsPanel } from '@/components/vividcast/settings-panel';
import { VideoPreview } from '@/components/vividcast/video-preview';
import { Controls } from '@/components/vividcast/controls';
import { TeleprompterDisplay } from '@/components/vividcast/teleprompter-display';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import * as pdfjs from 'pdfjs-dist';
import { UITour, type TourStep } from '@/components/vividcast/ui-tour';

if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.mjs`;
}

export type Effects = {
  blur: number;
  hue: number;
  opacity: number;
};

export type TeleprompterSettings = {
  speed: number;
  fontSize: number;
};

export type TeleprompterPosition = 'top' | 'bottom' | 'left' | 'right';

export type LogoPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export type LogoSettings = {
  src: string | null;
  position: LogoPosition;
  opacity: number;
  size: number;
}

export type PipShape = 'rectangle' | 'rounded-square' | 'circle';
export type PipPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export type PipSettings = {
  shape: PipShape;
  position: PipPosition;
};

export type SideBySideSettings = {
  split: number;
};

export default function VividCastPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [effects, setEffects] = useState<Effects>({ blur: 0, hue: 0, opacity: 100 });
  const [teleprompterText, setTeleprompterText] = useState('');
  const [teleprompterSettings, setTeleprompterSettings] = useState<TeleprompterSettings>({ speed: 2, fontSize: 48 });
  const [teleprompterPosition, setTeleprompterPosition] = useState<TeleprompterPosition>('top');
  const [selectedLayout, setSelectedLayout] = useState('full-screen');
  const [selectedBackground, setSelectedBackground] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16/9');
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [slideImages, setSlideImages] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  
  const [isMuted, setIsMuted] = useState(false);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [logoSettings, setLogoSettings] = useState<LogoSettings>({
    src: null,
    position: 'bottom-right',
    opacity: 80,
    size: 15,
  })
  const [pipSettings, setPipSettings] = useState<PipSettings>({
    shape: 'rectangle',
    position: 'bottom-right'
  });
  const [sideBySideSettings, setSideBySideSettings] = useState<SideBySideSettings>({ split: 50 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);


  const { toast } = useToast();

  useEffect(() => {
    // This effect runs once on the client after hydration
    const tourCompleted = localStorage.getItem('vividcast-tour-completed');
    if (!tourCompleted) {
      // Use a timeout to ensure all elements are rendered and available
      setTimeout(() => {
        setIsTourActive(true);
      }, 500);
    }
  }, []);

  useEffect(() => {
    const getDevices = async () => {
      // Get permissions first
      try {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter((device) => device.kind === 'videoinput');
        setVideoDevices(cameras);
        if (cameras.length > 0) {
          setSelectedDeviceId(cameras[0].deviceId);
        }
      } catch (err) {
        console.error("Could not get media devices.", err);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this app.',
        });
      }
    };
    getDevices();
  }, [toast]);
  
  const toggleFullScreen = () => {
    if (!videoContainerRef.current) return;

    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen().catch(err => {
        toast({
          variant: 'destructive',
          title: 'Fullscreen Error',
          description: 'Your browser may not support fullscreen mode.',
        });
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handlePdfUpload = async (file: File) => {
    if (!file) return;
    setIsProcessingPdf(true);
    setSlideImages([]);
    setCurrentSlide(0);
    toast({ title: 'Processing PDF...', description: 'Please wait while we prepare your slides.' });

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument(arrayBuffer).promise;
      const numPages = pdf.numPages;
      const images: string[] = [];
      
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          await page.render({ canvasContext: context, viewport: viewport }).promise;
          images.push(canvas.toDataURL('image/png'));
        }
      }
      
      setSlideImages(images);
      toast({ title: 'Slides ready!', description: `Your PDF with ${numPages} pages has been imported.` });

    } catch (error) {
      console.error('Error processing PDF:', error);
      toast({
        variant: 'destructive',
        title: 'PDF Processing Failed',
        description: 'There was an error importing your slides. Please try another file.',
      });
    } finally {
      setIsProcessingPdf(false);
    }
  };

  const handleSlideChange = (newSlide: number) => {
    if (newSlide >= 0 && newSlide < slideImages.length) {
      setCurrentSlide(newSlide);
    }
  };

  const toggleScreenSharing = async () => {
    if (isSharingScreen) {
      screenStream?.getTracks().forEach(track => track.stop());
      setScreenStream(null);
      setIsSharingScreen(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        
        const screenTrack = stream.getVideoTracks()[0];
        screenTrack.onended = () => {
          screenStream?.getTracks().forEach(track => track.stop());
          setScreenStream(null);
          setIsSharingScreen(false);
        };
        
        setScreenStream(stream);
        setIsSharingScreen(true);
      } catch (err) {
        console.error("Error sharing screen:", err);
        toast({
          variant: 'destructive',
          title: 'Screen Share Failed',
          description: 'Could not start screen sharing. Please check permissions.',
        });
      }
    }
  };

  const startRecording = () => {
    setRecordedVideoUrl(null);
    setElapsedTime(0);
    setIsPaused(false);
    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev > 1) {
          return prev - 1;
        } else {
          clearInterval(countdownInterval);
          setIsRecording(true);
          return 0;
        }
      });
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);

    if (isSharingScreen) {
      screenStream?.getTracks().forEach(track => track.stop());
      setScreenStream(null);
      setIsSharingScreen(false);
    }
  };
  
  const togglePause = () => {
    setIsPaused(prev => !prev);
  }

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);
  
  const handleTourComplete = useCallback(() => {
    localStorage.setItem('vividcast-tour-completed', 'true');
    setIsTourActive(false);
  }, []);

  const startTour = useCallback(() => {
    setIsTourActive(true);
  }, []);

  const tourSteps: TourStep[] = [
    {
      selector: '#tour-teleprompter',
      title: '1. Teleprompter',
      content: 'Write or upload your script here. Control the speed and font size to match your speaking pace.',
      side: 'right',
      align: 'start',
    },
    {
      selector: '#tour-slides',
      title: '2. Slides',
      content: 'Enhance your presentation by uploading a PDF. You can navigate through your slides during the recording.',
      side: 'right',
      align: 'start',
    },
    {
      selector: '#tour-layout',
      title: '3. Layout',
      content: 'Share your screen and choose from professional layouts like Picture-in-Picture or Side-by-Side.',
      side: 'right',
      align: 'start',
    },
    {
      selector: '#tour-background',
      title: '4. Background',
      content: 'Remove your real background and replace it with a custom image or a professional gradient.',
      side: 'right',
      align: 'start',
    },
    {
        selector: '#tour-effects',
        title: '5. Effects',
        content: 'Add visual flair with effects like background blur or color adjustments.',
        side: 'right',
        align: 'start',
    },
    {
        selector: '#tour-branding',
        title: '6. Branding',
        content: 'Keep your video on-brand by adding a custom logo overlay.',
        side: 'right',
        align: 'start',
    },
    {
      selector: '#video-preview-wrapper',
      title: '7. Live Preview',
      content: 'This is your canvas. See exactly how your final video will look with all your settings applied in real-time.',
      side: 'left',
      align: 'center',
    },
    {
      selector: '#controls-bar',
      title: '8. Record',
      content: 'When you\'re ready, select your camera and hit the record button to start creating!',
      side: 'top',
      align: 'center',
    },
    {
      selector: '#tour-export-button',
      title: '9. Export Your Video',
      content: 'After you stop recording, this button will become active. Click it to download your finished video as an MP4 file.',
      side: 'bottom',
      align: 'end',
    },
  ];

  const [arW, arH] = aspectRatio.split('/').map(Number);

  return (
    <div className="bg-background min-h-screen w-full flex flex-col font-sans">
      <Header videoUrl={recordedVideoUrl} onStartTour={startTour} />
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row items-start gap-8">
        <div id="settings-panel-wrapper" className="w-full lg:w-96 lg:sticky lg:top-8">
          <SettingsPanel
            // Teleprompter
            setTeleprompterText={setTeleprompterText}
            teleprompterSettings={teleprompterSettings}
            setTeleprompterSettings={setTeleprompterSettings}
            teleprompterPosition={teleprompterPosition}
            onTeleprompterPositionChange={setTeleprompterPosition}
            // Slides
            onPdfUpload={handlePdfUpload}
            isProcessingPdf={isProcessingPdf}
            currentSlide={currentSlide}
            totalSlides={slideImages.length}
            onSlideChange={handleSlideChange}
            // Layout
            selectedLayout={selectedLayout}
            setSelectedLayout={setSelectedLayout}
            isSharingScreen={isSharingScreen}
            onToggleScreenShare={toggleScreenSharing}
            pipSettings={pipSettings}
            onPipSettingsChange={setPipSettings}
            sideBySideSettings={sideBySideSettings}
            onSideBySideSettingsChange={setSideBySideSettings}
            // Background
            setSelectedBackground={setSelectedBackground}
            selectedBackground={selectedBackground}
            // Effects
            effects={effects}
            setEffects={setEffects}
            // Branding
            logoSettings={logoSettings}
            onLogoSettingsChange={setLogoSettings}
          />
        </div>

        <div className="flex-1 flex flex-col gap-6 items-center w-full max-w-6xl mx-auto">
          <div 
            id="video-preview-wrapper"
            ref={videoContainerRef}
            className="relative w-full rounded-2xl overflow-hidden bg-muted"
            style={{ 
              aspectRatio: `${arW} / ${arH}`,
              maxHeight: 'calc(100vh - 250px)'
            }}
          >
            <VideoPreview
              effects={effects}
              isRecording={isRecording}
              isPaused={isPaused}
              elapsedTime={elapsedTime}
              onRecordingComplete={setRecordedVideoUrl}
              selectedBackground={selectedBackground}
              screenStream={screenStream}
              selectedLayout={selectedLayout}
              slideImages={slideImages}
              currentSlide={currentSlide}
              isMuted={isMuted}
              selectedDeviceId={selectedDeviceId}
              logoSettings={logoSettings}
              pipSettings={pipSettings}
              sideBySideSettings={sideBySideSettings}
              aspectRatio={aspectRatio}
            />
            {countdown > 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <span className="text-9xl font-bold text-white">{countdown}</span>
              </div>
            )}
             <TeleprompterDisplay 
                text={teleprompterText}
                settings={teleprompterSettings}
                isRecording={isRecording && !isPaused}
                position={teleprompterPosition}
              />
          </div>
          <Controls
            isRecording={isRecording}
            isPaused={isPaused}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            onTogglePause={togglePause}
            aspectRatio={aspectRatio}
            onAspectRatioChange={setAspectRatio}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted(prev => !prev)}
            videoDevices={videoDevices}
            selectedDeviceId={selectedDeviceId}
            onCameraChange={setSelectedDeviceId}
            isFullscreen={isFullscreen}
            onToggleFullScreen={toggleFullScreen}
          />
        </div>
      </main>
      <UITour steps={tourSteps} isOpen={isTourActive} onComplete={handleTourComplete} />
    </div>
  );
}
