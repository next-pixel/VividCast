import React, { useRef } from 'react';
import type { LogoSettings, LogoPosition } from '@/app/page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload, CornerUpLeft, CornerUpRight, CornerDownLeft, CornerDownRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface BrandingControlsProps {
    logoSettings: LogoSettings;
    onLogoSettingsChange: (settings: LogoSettings) => void;
}

const positionOptions: { value: LogoPosition; icon: React.ElementType }[] = [
    { value: 'top-left', icon: CornerUpLeft },
    { value: 'top-right', icon: CornerUpRight },
    { value: 'bottom-left', icon: CornerDownLeft },
    { value: 'bottom-right', icon: CornerDownRight },
];

export function BrandingControls({ logoSettings, onLogoSettingsChange }: BrandingControlsProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                onLogoSettingsChange({ ...logoSettings, src: e.target?.result as string });
            };
            reader.readAsDataURL(file);
        } else if (file) {
           toast({
            variant: 'destructive',
            title: 'Invalid File Type',
            description: 'Please upload an image file.',
          });
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label>Logo</Label>
                <Input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                <Button variant="outline" size="sm" className="w-full" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Logo
                </Button>
                {logoSettings.src && (
                    <div className="relative mt-2 p-2 border rounded-md flex items-center justify-center">
                        <img src={logoSettings.src} alt="Logo preview" className="max-h-20" />
                        <Button variant="ghost" size="sm" className="absolute top-1 right-1" onClick={() => onLogoSettingsChange({ ...logoSettings, src: null })}>X</Button>
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <Label>Position</Label>
                <RadioGroup
                    value={logoSettings.position}
                    onValueChange={(value: LogoPosition) => onLogoSettingsChange({ ...logoSettings, position: value })}
                    className="grid grid-cols-4 gap-2"
                >
                    {positionOptions.map(opt => (
                        <Label
                            key={opt.value}
                            htmlFor={`pos-${opt.value}`}
                            className={cn(
                                "flex items-center justify-center rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                                logoSettings.position === opt.value && "border-primary"
                            )}
                        >
                            <RadioGroupItem value={opt.value} id={`pos-${opt.value}`} className="sr-only" />
                            <opt.icon className="h-5 w-5" />
                        </Label>
                    ))}
                </RadioGroup>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="logo-size">Size: {logoSettings.size}%</Label>
                <Slider
                    id="logo-size"
                    min={5}
                    max={50}
                    step={1}
                    value={[logoSettings.size]}
                    onValueChange={(value) => onLogoSettingsChange({ ...logoSettings, size: value[0] })}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="logo-opacity">Opacity: {logoSettings.opacity}%</Label>
                <Slider
                    id="logo-opacity"
                    min={0}
                    max={100}
                    step={1}
                    value={[logoSettings.opacity]}
                    onValueChange={(value) => onLogoSettingsChange({ ...logoSettings, opacity: value[0] })}
                />
            </div>
        </div>
    );
}
