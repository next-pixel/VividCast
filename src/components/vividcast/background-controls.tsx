
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Input } from '@/components/ui/input';

interface BackgroundControlsProps {
    onBackgroundChange: (bg: string) => void;
    selectedBackground: string;
}

// from globals.css: --primary: 248 83% 65%;
const solidColors = [
  { name: 'White', value: '#FFFFFF' },
  { name: 'Light Gray', value: '#F3F4F6' },
  { name: 'Studio Gray', value: '#4A4A4A' },
  { name: 'Brand Blue', value: 'hsl(248 83% 65%)' },
];

const gradients = [
  { name: 'Sunrise', value: 'linear-gradient(to top right, #ff9a9e, #fad0c4)' },
  { name: 'Sunset', value: 'linear-gradient(to top right, #ff7e5f, #feb47b)' },
  { name: 'Ocean', value: 'linear-gradient(to top right, #4facfe, #00f2fe)' },
  { name: 'Royal', value: 'linear-gradient(to top right, #6a11cb, #2575fc)' },
];

const imageBackgrounds = [
    { name: 'Modern Office', src: 'https://placehold.co/300x200.png', hint: 'modern office' },
    { name: 'Home Office', src: 'https://placehold.co/300x200.png', hint: 'clean home office' },
    { name: 'Bookshelf', src: 'https://placehold.co/300x200.png', hint: 'library bookshelf' },
    { name: 'Boardroom', src: 'https://placehold.co/300x200.png', hint: 'conference room' },
    { name: 'Cafe', src: 'https://placehold.co/300x200.png', hint: 'cozy cafe' },
    { name: 'Nature', src: 'https://placehold.co/300x200.png', hint: 'serene landscape' },
    { name: 'Studio', src: 'https://placehold.co/300x200.png', hint: 'photography studio' },
    { name: 'Abstract', src: 'https://placehold.co/300x200.png', hint: 'abstract shapes' },
];

export function BackgroundControls({ onBackgroundChange, selectedBackground }: BackgroundControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageUrl = e.target?.result as string;
            onBackgroundChange(`url(${imageUrl})`);
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

  const handleSelect = (src: string) => {
      onBackgroundChange(src);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Solid & Gradients</Label>
        <div className="grid grid-cols-4 gap-2">
          <button 
             title="No Background"
             onClick={() => handleSelect('')}
             className={cn(
                "relative aspect-video w-full rounded-md border-2 border-muted flex items-center justify-center hover:border-primary", 
                selectedBackground === '' && 'border-primary'
             )}
           >
            <Ban className="h-6 w-6 text-muted-foreground" />
             <span className="sr-only">No background</span>
          </button>
          {solidColors.map((color) => (
            <button
                key={color.name}
                title={color.name}
                onClick={() => handleSelect(color.value)}
                className={cn(
                    "relative aspect-video w-full rounded-md overflow-hidden border-2 border-transparent hover:border-primary",
                    selectedBackground === color.value && 'border-primary'
                )}
            >
                <div
                    style={{ background: color.value }}
                    className="w-full h-full"
                />
            </button>
          ))}
          {gradients.map((gradient) => (
            <button 
                key={gradient.name}
                title={gradient.name}
                onClick={() => handleSelect(gradient.value)} 
                className={cn(
                    "relative aspect-video w-full rounded-md overflow-hidden border-2 border-transparent hover:border-primary", 
                    selectedBackground === gradient.value && 'border-primary'
                )}
            >
              <div
                style={{ background: gradient.value }}
                className="w-full h-full"
              />
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Image Backgrounds</Label>
        <div className="grid grid-cols-4 gap-2">
           {imageBackgrounds.map((img) => (
            <button
                key={img.name}
                title={img.name}
                onClick={() => handleSelect(`url(${img.src})`)}
                className={cn(
                    "relative group aspect-video w-full rounded-md overflow-hidden border-2 border-transparent hover:border-primary", 
                    selectedBackground === `url(${img.src})` && 'border-primary'
                )}
            >
                <Image 
                    src={img.src}
                    alt={img.name}
                    layout="fill"
                    objectFit="cover"
                    data-ai-hint={img.hint}
                />
            </button>
          ))}
        </div>
      </div>

      <Input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
        <Upload className="mr-2 h-4 w-4" />
        Upload Custom Background
      </Button>
    </div>
  );
}
