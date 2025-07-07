import React from 'react';
import type { TeleprompterSettings, TeleprompterPosition } from '@/app/page';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mic, Film } from 'lucide-react';
import { TeleprompterControls } from './teleprompter-controls';
import { SlidesControls } from './slides-controls';

interface LeftPanelProps {
  setTeleprompterText: (text: string) => void;
  teleprompterSettings: TeleprompterSettings;
  setTeleprompterSettings: (settings: TeleprompterSettings) => void;
  teleprompterPosition: TeleprompterPosition;
  onTeleprompterPositionChange: (position: TeleprompterPosition) => void;
  onPdfUpload: (file: File) => void;
  isProcessingPdf: boolean;
  currentSlide: number;
  totalSlides: number;
  onSlideChange: (slide: number) => void;
}

export function LeftPanel({
  setTeleprompterText,
  teleprompterSettings,
  setTeleprompterSettings,
  teleprompterPosition,
  onTeleprompterPositionChange,
  onPdfUpload,
  isProcessingPdf,
  currentSlide,
  totalSlides,
  onSlideChange,
}: LeftPanelProps) {
  return (
    <Card className="w-full max-w-sm xl:w-sm sticky top-6">
      <CardContent className="p-0">
        <Tabs defaultValue="teleprompter" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-b-none rounded-t-lg">
            <TabsTrigger value="teleprompter">
              <Mic className="mr-2 h-4 w-4" />
              Teleprompter
            </TabsTrigger>
            <TabsTrigger value="slides">
              <Film className="mr-2 h-4 w-4" />
              Slides
            </TabsTrigger>
          </TabsList>
          <TabsContent value="teleprompter" className="p-4">
            <TeleprompterControls
              onTextChange={setTeleprompterText}
              settings={teleprompterSettings}
              onSettingsChange={setTeleprompterSettings}
              position={teleprompterPosition}
              onPositionChange={onTeleprompterPositionChange}
            />
          </TabsContent>
          <TabsContent value="slides" className="p-4">
            <SlidesControls
              onFileUpload={onPdfUpload}
              isProcessing={isProcessingPdf}
              currentSlide={currentSlide}
              totalSlides={totalSlides}
              onSlideChange={onSlideChange}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
