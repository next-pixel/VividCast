import React, { useRef, useEffect } from 'react';
import type { Effects } from '@/app/page';

interface VideoPreviewProps {
  effects: Effects;
  isRecording: boolean;
}

export function VideoPreview({ effects }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const constraints = {
      video: { width: 1280, height: 720 },
      audio: true,
    };

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing webcam: ", err);
      }
    };
    startCamera();

    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationFrameId: number;

    const render = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.filter = `blur(${effects.blur}px) hue-rotate(${effects.hue}deg) opacity(${effects.opacity}%)`;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    }

  }, [effects]);

  return (
    <div className="w-full aspect-video bg-card-foreground rounded-lg overflow-hidden shadow-lg">
      <video ref={videoRef} autoPlay playsInline muted className="hidden"></video>
      <canvas ref={canvasRef} className="w-full h-full object-cover"></canvas>
    </div>
  );
}
