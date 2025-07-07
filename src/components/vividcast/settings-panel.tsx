
import React from 'react';
import type { TeleprompterSettings, TeleprompterPosition, Effects, LogoSettings, PipSettings } from '@/app/page';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Mic, Film, Layout, ImageIcon, Wand2, Award } from 'lucide-react';
import { TeleprompterControls } from './teleprompter-controls';
import { SlidesControls } from './slides-controls';
import { LayoutControls } from './layout-controls';
import { BackgroundControls } from './background-controls';
import { EffectsControls } from './effects-controls';
import { BrandingControls } from './branding-controls';

interface SettingsPanelProps {
  // Teleprompter
  setTeleprompterText: (text: string) => void;
  teleprompterSettings: TeleprompterSettings;
  setTeleprompterSettings: (settings: TeleprompterSettings) => void;
  teleprompterPosition: TeleprompterPosition;
  onTeleprompterPositionChange: (position: TeleprompterPosition) => void;
  // Slides
  onPdfUpload: (file: File) => void;
  isProcessingPdf: boolean;
  currentSlide: number;
  totalSlides: number;
  onSlideChange: (slide: number) => void;
  // Layout
  selectedLayout: string;
  setSelectedLayout: (layout: string) => void;
  isSharingScreen: boolean;
  onToggleScreenShare: () => void;
  pipSettings: PipSettings;
  onPipSettingsChange: (settings: PipSettings) => void;
  // Background
  setSelectedBackground: (bg: string) => void;
  selectedBackground: string;
  // Effects
  effects: Effects;
  setEffects: (effects: Effects) => void;
  // Branding
  logoSettings: LogoSettings;
  onLogoSettingsChange: (settings: LogoSettings) => void;
}

export function SettingsPanel(props: SettingsPanelProps) {
  return (
    <Card className="w-full">
      <CardContent className="p-2">
        <Accordion type="single" collapsible defaultValue="teleprompter" className="w-full">
          <AccordionItem value="teleprompter">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <Mic className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">Teleprompter</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-4 pt-2">
              <TeleprompterControls
                onTextChange={props.setTeleprompterText}
                settings={props.teleprompterSettings}
                onSettingsChange={props.setTeleprompterSettings}
                position={props.teleprompterPosition}
                onPositionChange={props.onTeleprompterPositionChange}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="slides">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <Film className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">Slides</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-4 pt-2">
              <SlidesControls
                onFileUpload={props.onPdfUpload}
                isProcessing={props.isProcessingPdf}
                currentSlide={props.currentSlide}
                totalSlides={props.totalSlides}
                onSlideChange={props.onSlideChange}
              />
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="layout">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <Layout className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">Layout</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-4 pt-2">
              <LayoutControls
                selectedLayout={props.selectedLayout}
                onLayoutChange={props.setSelectedLayout}
                isSharingScreen={props.isSharingScreen}
                onToggleScreenShare={props.onToggleScreenShare}
                pipSettings={props.pipSettings}
                onPipSettingsChange={props.onPipSettingsChange}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="background">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <ImageIcon className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">Background</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-4 pt-2">
               <BackgroundControls 
                onBackgroundChange={props.setSelectedBackground} 
                selectedBackground={props.selectedBackground} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="effects">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <Wand2 className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">Effects</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-4 pt-2">
              <EffectsControls effects={props.effects} onEffectsChange={props.setEffects} />
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="branding" className="border-b-0">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">Branding</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-4 pt-2">
              <BrandingControls logoSettings={props.logoSettings} onLogoSettingsChange={props.onLogoSettingsChange} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
