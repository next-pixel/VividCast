import React, { useRef } from 'react';
import type { TeleprompterSettings, TeleprompterPosition } from '@/app/page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';


interface TeleprompterControlsProps {
  onTextChange: (text: string) => void;
  settings: TeleprompterSettings;
  onSettingsChange: (settings: TeleprompterSettings) => void;
  position: TeleprompterPosition;
  onPositionChange: (position: TeleprompterPosition) => void;
}

const positionOptions: { value: TeleprompterPosition; icon: React.ElementType }[] = [
    { value: 'top', icon: ArrowUp },
    { value: 'bottom', icon: ArrowDown },
    { value: 'left', icon: ArrowLeft },
    { value: 'right', icon: ArrowRight },
];

export function TeleprompterControls({ onTextChange, settings, onSettingsChange, position, onPositionChange }: TeleprompterControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        onTextChange(e.target?.result as string);
      };
      reader.readAsText(file);
    } else if (file) {
       toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: 'Please upload a .txt file.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Script</Label>
        <Textarea
          placeholder="Paste your script here or upload a .txt file..."
          className="h-32 resize-none"
          onChange={(e) => onTextChange(e.target.value)}
        />
        <Input type="file" ref={fileInputRef} className="hidden" accept=".txt" onChange={handleFileChange} />
        <Button variant="outline" size="sm" className="w-full" onClick={() => fileInputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Text File
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="speed">Speed: {settings.speed}</Label>
          <Slider
            id="speed"
            min={1}
            max={10}
            step={1}
            value={[settings.speed]}
            onValueChange={(value) => onSettingsChange({ ...settings, speed: value[0] })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="font-size">Font Size: {settings.fontSize}px</Label>
          <Slider
            id="font-size"
            min={16}
            max={128}
            step={2}
            value={[settings.fontSize]}
            onValueChange={(value) => onSettingsChange({ ...settings, fontSize: value[0] })}
          />
        </div>
        <div className="space-y-2">
            <Label>Position</Label>
             <RadioGroup
                value={position}
                onValueChange={(value: TeleprompterPosition) => onPositionChange(value)}
                className="grid grid-cols-4 gap-2"
            >
                {positionOptions.map(opt => (
                     <Label
                        key={opt.value}
                        htmlFor={`pos-${opt.value}`}
                        className={cn(
                            "flex items-center justify-center rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                            position === opt.value && "border-primary"
                        )}
                    >
                        <RadioGroupItem value={opt.value} id={`pos-${opt.value}`} className="sr-only" />
                        <opt.icon className="h-5 w-5" />
                    </Label>
                ))}
             </RadioGroup>
        </div>
      </div>
    </div>
  );
}
