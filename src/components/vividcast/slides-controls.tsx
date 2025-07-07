import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface SlidesControlsProps {
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
  currentSlide: number;
  totalSlides: number;
  onSlideChange: (slide: number) => void;
}

export function SlidesControls({ onFileUpload, isProcessing, currentSlide, totalSlides, onSlideChange }: SlidesControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      onFileUpload(file);
    } else if (file) {
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: 'Please upload a PDF file.',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Upload Slides</Label>
        <Input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileChange} />
        <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()} disabled={isProcessing}>
          {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          {isProcessing ? 'Processing...' : 'Upload PDF'}
        </Button>
        <p className="text-xs text-muted-foreground text-center">Upload a PDF to use as slides in your video.</p>
      </div>

      {totalSlides > 0 && (
        <div className="space-y-2">
          <Label>Slide Navigation</Label>
          <div className="flex items-center justify-between p-2 border rounded-lg">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onSlideChange(currentSlide - 1)} disabled={currentSlide === 0}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="text-sm font-medium">
              Slide <Badge variant="secondary">{currentSlide + 1}</Badge> of <Badge variant="secondary">{totalSlides}</Badge>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onSlideChange(currentSlide + 1)} disabled={currentSlide === totalSlides - 1}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
