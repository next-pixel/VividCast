import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Save, Square, PictureInPicture, Columns, Maximize } from 'lucide-react';

interface LayoutControlsProps {
  selectedLayout: string;
  onLayoutChange: (layout: string) => void;
}

const layouts = [
  { id: 'full-screen', label: 'Full Screen', icon: Maximize },
  { id: 'picture-in-picture', label: 'Picture-in-Picture', icon: PictureInPicture },
  { id: 'side-by-side', label: 'Side-by-Side', icon: Columns },
  { id: 'presenter', label: 'Presenter View', icon: Square },
];

export function LayoutControls({ selectedLayout, onLayoutChange }: LayoutControlsProps) {
  return (
    <div className="space-y-6">
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
      <Button className="w-full">
        <Save className="mr-2 h-4 w-4" />
        Save Layout
      </Button>
    </div>
  );
}
