import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackgroundControlsProps {
    onBackgroundChange: (bg: string) => void;
    selectedBackground: string;
}

const gradients = [
  { name: 'Sunrise', value: 'linear-gradient(to top right, #ff9a9e, #fad0c4)' },
  { name: 'Sunset', value: 'linear-gradient(to top right, #ff7e5f, #feb47b)' },
  { name: 'Ocean', value: 'linear-gradient(to top right, #4facfe, #00f2fe)' },
  { name: 'Forest', value: 'linear-gradient(to top right, #43e97b, #38f9d7)' },
  { name: 'Royal', value: 'linear-gradient(to top right, #6a11cb, #2575fc)' },
  { name: 'Lush', value: 'linear-gradient(to top right, #ee9ca7, #ffdde1)' },
];


export function BackgroundControls({ onBackgroundChange, selectedBackground }: BackgroundControlsProps) {

  const handleSelect = (src: string) => {
      onBackgroundChange(src);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Presets</Label>
        <div className="grid grid-cols-2 gap-2">
          <button 
             onClick={() => handleSelect('')}
             className={cn(
                "relative aspect-video w-full rounded-md border-2 border-muted flex items-center justify-center hover:border-primary", 
                selectedBackground === '' && 'border-primary'
             )}
           >
            <Ban className="h-8 w-8 text-muted-foreground" />
          </button>
          {gradients.map((gradient, index) => (
            <button 
                key={index} 
                onClick={() => handleSelect(gradient.value)} 
                className={cn(
                    "relative aspect-video w-full rounded-md overflow-hidden border-2 border-transparent hover:border-primary", 
                    selectedBackground === gradient.value && 'border-primary'
                )}
            >
              <div
                title={gradient.name}
                style={{ background: gradient.value }}
                className="w-full h-full"
              />
            </button>
          ))}
        </div>
      </div>
      <Button variant="outline" className="w-full">
        <Upload className="mr-2 h-4 w-4" />
        Upload Custom Background
      </Button>
    </div>
  );
}
