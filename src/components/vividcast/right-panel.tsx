import React from 'react';
import type { Effects, LogoSettings } from '@/app/page';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layout, ImageIcon, Wand2, Award } from 'lucide-react';
import { LayoutControls } from './layout-controls';
import { BackgroundControls } from './background-controls';
import { EffectsControls } from './effects-controls';
import { BrandingControls } from './branding-controls';

interface RightPanelProps {
  effects: Effects;
  setEffects: (effects: Effects) => void;
  selectedLayout: string;
  setSelectedLayout: (layout: string) => void;
  setSelectedBackground: (bg: string) => void;
  selectedBackground: string;
  isSharingScreen: boolean;
  onToggleScreenShare: () => void;
  logoSettings: LogoSettings;
  onLogoSettingsChange: (settings: LogoSettings) => void;
}

export function RightPanel({
  effects,
  setEffects,
  selectedLayout,
  setSelectedLayout,
  setSelectedBackground,
  selectedBackground,
  isSharingScreen,
  onToggleScreenShare,
  logoSettings,
  onLogoSettingsChange,
}: RightPanelProps) {
  return (
    <Card className="w-full max-w-sm xl:w-sm sticky top-6">
      <CardContent className="p-0">
        <Tabs defaultValue="layout" className="w-full">
          <TabsList className="grid w-full grid-cols-4 rounded-b-none rounded-t-lg">
            <TabsTrigger value="layout">
              <Layout className="mr-2 h-4 w-4" />
              Layout
            </TabsTrigger>
            <TabsTrigger value="background">
              <ImageIcon className="mr-2 h-4 w-4" />
              Background
            </TabsTrigger>
            <TabsTrigger value="effects">
              <Wand2 className="mr-2 h-4 w-4" />
              Effects
            </TabsTrigger>
            <TabsTrigger value="branding">
              <Award className="mr-2 h-4 w-4" />
              Branding
            </TabsTrigger>
          </TabsList>
          <TabsContent value="layout" className="p-4">
            <LayoutControls
              selectedLayout={selectedLayout}
              onLayoutChange={setSelectedLayout}
              isSharingScreen={isSharingScreen}
              onToggleScreenShare={onToggleScreenShare}
            />
          </TabsContent>
          <TabsContent value="background" className="p-4">
            <BackgroundControls onBackgroundChange={setSelectedBackground} selectedBackground={selectedBackground} />
          </TabsContent>
          <TabsContent value="effects" className="p-4">
            <EffectsControls effects={effects} onEffectsChange={setEffects} />
          </TabsContent>
          <TabsContent value="branding" className="p-4">
            <BrandingControls logoSettings={logoSettings} onLogoSettingsChange={onLogoSettingsChange} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
