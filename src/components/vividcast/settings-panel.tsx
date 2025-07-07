
import React from 'react';
import type { TeleprompterSettings, TeleprompterPosition, Effects, LogoSettings, PipSettings, SideBySideSettings } from '@/app/page';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Mic, Film, Layout, ImageIcon, Wand2, Award, Settings, Camera, Scaling } from 'lucide-react';
import { TeleprompterControls } from './teleprompter-controls';
import { SlidesControls } from './slides-controls';
import { LayoutControls } from './layout-controls';
import { BackgroundControls } from './background-controls';
import { EffectsControls } from './effects-controls';
import { BrandingControls } from './branding-controls';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SettingsPanelProps {
  // Device
  aspectRatio: string;
  onAspectRatioChange: (ratio: string) => void;
  videoDevices: MediaDeviceInfo[];
  selectedDeviceId: string;
  onCameraChange: (deviceId: string) => void;
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
  sideBySideSettings: SideBySideSettings;
  onSideBySideSettingsChange: (settings: SideBySideSettings) => void;
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

const aspectRatios = [
    { value: '16/9', label: 'Landscape (16:9)' },
    { value: '9/16', label: 'Portrait (9:16)' },
    { value: '1/1', label: 'Square (1:1)' },
    { value: '4/3', label: 'Classic (4:3)' },
    { value: '21/9', label: 'Cinematic (21:9)' },
    { value: '4/5', label: 'Social (4:5)' },
  ];

export function SettingsPanel(props: SettingsPanelProps) {
  return (
    <Card className="w-full">
      <CardContent className="p-2">
        <Accordion type="single" collapsible defaultValue="device-settings" className="w-full">
          <AccordionItem value="device-settings">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">Device Settings</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-4 pt-2">
               <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Aspect Ratio</Label>
                        <Select value={props.aspectRatio} onValueChange={props.onAspectRatioChange}>
                            <SelectTrigger>
                                <Scaling className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Aspect Ratio" />
                            </SelectTrigger>
                            <SelectContent>
                                {aspectRatios.map((ratio) => (
                                    <SelectItem key={ratio.value} value={ratio.value}>{ratio.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Camera</Label>
                        <Select value={props.selectedDeviceId} onValueChange={props.onCameraChange} disabled={props.videoDevices.length === 0}>
                            <SelectTrigger>
                                <Camera className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Select Camera" />
                            </SelectTrigger>
                            <SelectContent>
                                {props.videoDevices.map((device, index) => (
                                    <SelectItem key={device.deviceId} value={device.deviceId}>{device.label || `Camera ${index + 1}`}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
               </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="teleprompter" id="tour-teleprompter">
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

          <AccordionItem value="slides" id="tour-slides">
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
          
          <AccordionItem value="layout" id="tour-layout">
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
                sideBySideSettings={props.sideBySideSettings}
                onSideBySideSettingsChange={props.onSideBySideSettingsChange}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="background" id="tour-background">
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

          <AccordionItem value="effects" id="tour-effects">
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
          
          <AccordionItem value="branding" id="tour-branding" className="border-b-0">
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
