import React from 'react';
import type { TeleprompterSettings, TeleprompterPosition, Effects, LogoSettings } from '@/app/page';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

const TABS_CONFIG = [
  { value: 'teleprompter', icon: Mic, label: 'Teleprompter' },
  { value: 'slides', icon: Film, label: 'Slides' },
  { value: 'layout', icon: Layout, label: 'Layout' },
  { value: 'background', icon: ImageIcon, label: 'Background' },
  { value: 'effects', icon: Wand2, label: 'Effects' },
  { value: 'branding', icon: Award, label: 'Branding' },
]

export function SettingsPanel(props: SettingsPanelProps) {
  return (
    <Card className="w-full">
      <CardContent className="p-0">
        <Tabs defaultValue="teleprompter" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 rounded-b-none rounded-t-lg">
            {TABS_CONFIG.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} className="flex-col h-16 md:h-auto md:flex-row gap-1 md:gap-2">
                <tab.icon className="h-5 w-5" />
                <span className="hidden md:inline-block">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="teleprompter" className="p-4">
            <TeleprompterControls
              onTextChange={props.setTeleprompterText}
              settings={props.teleprompterSettings}
              onSettingsChange={props.setTeleprompterSettings}
              position={props.teleprompterPosition}
              onPositionChange={props.onTeleprompterPositionChange}
            />
          </TabsContent>
          <TabsContent value="slides" className="p-4">
            <SlidesControls
              onFileUpload={props.onPdfUpload}
              isProcessing={props.isProcessingPdf}
              currentSlide={props.currentSlide}
              totalSlides={props.totalSlides}
              onSlideChange={props.onSlideChange}
            />
          </TabsContent>
          <TabsContent value="layout" className="p-4">
            <LayoutControls
              selectedLayout={props.selectedLayout}
              onLayoutChange={props.setSelectedLayout}
              isSharingScreen={props.isSharingScreen}
              onToggleScreenShare={props.onToggleScreenShare}
            />
          </TabsContent>
          <TabsContent value="background" className="p-4">
            <BackgroundControls 
                onBackgroundChange={props.setSelectedBackground} 
                selectedBackground={props.selectedBackground} />
          </TabsContent>
          <TabsContent value="effects" className="p-4">
            <EffectsControls effects={props.effects} onEffectsChange={props.setEffects} />
          </TabsContent>
          <TabsContent value="branding" className="p-4">
            <BrandingControls logoSettings={props.logoSettings} onLogoSettingsChange={props.onLogoSettingsChange} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
