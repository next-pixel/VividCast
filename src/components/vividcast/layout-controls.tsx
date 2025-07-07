
import React from 'react';
import type { PipSettings, PipShape, PipPosition, SideBySideSettings } from '@/app/page';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  Save, Square, PictureInPicture, Columns, Maximize, MonitorUp, MonitorOff,
  Circle, CornerUpLeft, CornerUpRight, CornerDownLeft, CornerDownRight
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface LayoutControlsProps {
  selectedLayout: string;
  onLayoutChange: (layout: string) => void;
  isSharingScreen: boolean;
  onToggleScreenShare: () => void;
  pipSettings: PipSettings;
  onPipSettingsChange: (settings: PipSettings) => void;
  sideBySideSettings: SideBySideSettings;
  onSideBySideSettingsChange: (settings: SideBySideSettings) => void;
}

const layouts = [
  { id: 'full-screen', label: 'Full Screen', icon: Maximize },
  { id: 'picture-in-picture', label: 'Picture-in-Picture', icon: PictureInPicture },
  { id: 'side-by-side', label: 'Side-by-Side', icon: Columns },
  { id: 'presenter', label: 'Presenter View', icon: Square },
];

const RoundedRectangle = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        {...props}
    >
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
    </svg>
);


const pipShapeOptions: { value: PipShape, icon: React.ElementType, label: string }[] = [
  { value: 'rectangle', icon: Square, label: 'Rectangle' },
  { value: 'rounded-square', icon: RoundedRectangle, label: 'Rounded' },
  { value: 'circle', icon: Circle, label: 'Circle' },
];

const pipPositionOptions: { value: PipPosition, icon: React.ElementType }[] = [
    { value: 'top-left', icon: CornerUpLeft },
    { value: 'top-right', icon: CornerUpRight },
    { value: 'bottom-left', icon: CornerDownLeft },
    { value: 'bottom-right', icon: CornerDownRight },
];

export function LayoutControls({ 
  selectedLayout, 
  onLayoutChange, 
  isSharingScreen, 
  onToggleScreenShare, 
  pipSettings, 
  onPipSettingsChange,
  sideBySideSettings,
  onSideBySideSettingsChange
}: LayoutControlsProps) {
  return (
    <div className="space-y-6">
       <div className="space-y-2">
        <Button onClick={onToggleScreenShare} variant="outline" className="w-full">
          {isSharingScreen ? (
            <MonitorOff className="mr-2 h-4 w-4" />
          ) : (
            <MonitorUp className="mr-2 h-4 w-4" />
          )}
          {isSharingScreen ? 'Stop Sharing' : 'Share Screen'}
        </Button>
        <p className="text-xs text-muted-foreground text-center">Share your screen for presentations.</p>
      </div>

      <div className="space-y-2">
        <Label>Video Layout</Label>
        <RadioGroup
          value={selectedLayout}
          onValueChange={onLayoutChange}
          className="grid grid-cols-2 gap-2"
        >
          {layouts.map((layout) => (
            <Label
              key={layout.id}
              htmlFor={layout.id}
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                selectedLayout === layout.id && "border-primary"
              )}
            >
              <RadioGroupItem value={layout.id} id={layout.id} className="sr-only" />
              <layout.icon className="h-8 w-8" />
              <span className="text-sm font-medium">{layout.label}</span>
            </Label>
          ))}
        </RadioGroup>
      </div>
      
      {selectedLayout === 'side-by-side' && (
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-base">Layout Split</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sbs-split">Camera: {sideBySideSettings.split}%</Label>
              <Slider
                id="sbs-split"
                min={20}
                max={80}
                step={1}
                value={[sideBySideSettings.split]}
                onValueChange={(value) => onSideBySideSettingsChange({ split: value[0] })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {selectedLayout === 'picture-in-picture' && (
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-base">PiP Settings</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-4">
            <div className="space-y-2">
              <Label>Shape</Label>
              <RadioGroup
                value={pipSettings.shape}
                onValueChange={(value: PipShape) => onPipSettingsChange({ ...pipSettings, shape: value })}
                className="grid grid-cols-3 gap-2"
              >
                {pipShapeOptions.map(opt => (
                  <Label
                    key={opt.value}
                    htmlFor={`shape-${opt.value}`}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-2 gap-1 h-16 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                      pipSettings.shape === opt.value && "border-primary"
                    )}
                  >
                    <RadioGroupItem value={opt.value} id={`shape-${opt.value}`} className="sr-only" />
                    <opt.icon className="h-6 w-6" />
                    <span className="text-xs">{opt.label}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>
            <div className="space-y-2">
                <Label>Position</Label>
                <RadioGroup
                    value={pipSettings.position}
                    onValueChange={(value: PipPosition) => onPipSettingsChange({ ...pipSettings, position: value })}
                    className="grid grid-cols-4 gap-2"
                >
                    {pipPositionOptions.map(opt => (
                        <Label
                            key={opt.value}
                            htmlFor={`pip-pos-${opt.value}`}
                            className={cn(
                                "flex items-center justify-center rounded-md border-2 border-muted bg-popover p-2 h-12 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                                pipSettings.position === opt.value && "border-primary"
                            )}
                        >
                            <RadioGroupItem value={opt.value} id={`pip-pos-${opt.value}`} className="sr-only" />
                            <opt.icon className="h-5 w-5" />
                        </Label>
                    ))}
                </RadioGroup>
            </div>
            <div className="space-y-2">
                <Label htmlFor="pip-size">Size: {pipSettings.size}%</Label>
                <Slider
                    id="pip-size"
                    min={10}
                    max={50}
                    step={1}
                    value={[pipSettings.size]}
                    onValueChange={(value) => onPipSettingsChange({ ...pipSettings, size: value[0] })}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="pip-opacity">Opacity: {pipSettings.opacity}%</Label>
                <Slider
                    id="pip-opacity"
                    min={0}
                    max={100}
                    step={1}
                    value={[pipSettings.opacity]}
                    onValueChange={(value) => onPipSettingsChange({ ...pipSettings, opacity: value[0] })}
                />
            </div>
          </CardContent>
        </Card>
      )}

      <Button className="w-full">
        <Save className="mr-2 h-4 w-4" />
        Save Layout
      </Button>
    </div>
  );
}
