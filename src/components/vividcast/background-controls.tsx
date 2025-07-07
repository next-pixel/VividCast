import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackgroundControlsProps {
    onBackgroundChange: (bg: string) => void;
}

const presets = [
  { hint: 'office background', src: 'https://placehold.co/400x225.png' },
  { hint: 'modern living-room', src: 'https://placehold.co/400x225.png' },
  { hint: 'bookshelf library', src: 'https://placehold.co/400x225.png' },
  { hint: 'gradient abstract', src: 'https://placehold.co/400x225.png' },
  { hint: 'nature landscape', src: 'https://placehold.co/400x225.png' },
  { hint: 'beach sunset', src: 'https://placehold.co/400x225.png' },
];

export function BackgroundControls({ onBackgroundChange }: BackgroundControlsProps) {
    const [selected, setSelected] = useState('');

    const handleSelect = (src: string) => {
        setSelected(src);
        onBackgroundChange(src);
    }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Presets</Label>
        <div className="grid grid-cols-2 gap-2">
          <button 
             onClick={() => handleSelect('')}
             className={cn("relative aspect-video w-full rounded-md border-2 border-muted flex items-center justify-center hover:border-primary", selected === '' && 'border-primary')}
           >
            <Ban className="h-8 w-8 text-muted-foreground" />
          </button>
          {presets.map((preset, index) => (
            <button key={index} onClick={() => handleSelect(preset.src)} className={cn("relative aspect-video w-full rounded-md overflow-hidden border-2 border-transparent hover:border-primary", selected === preset.src && 'border-primary')}>
              <Image
                src={preset.src}
                alt={preset.hint}
                data-ai-hint={preset.hint}
                fill
                className="object-cover"
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
