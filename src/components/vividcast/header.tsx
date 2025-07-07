
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Download, Moon, Sun, HelpCircle, Rocket } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Logo } from './logo';

interface HeaderProps {
    videoUrl: string | null;
    onStartTour: () => void;
}

export function Header({ videoUrl, onStartTour }: HeaderProps) {
    const { theme, setTheme } = useTheme();

    const handleDownload = () => {
        if (videoUrl) {
            const a = document.createElement('a');
            a.href = videoUrl;
            a.download = `vividcast-recording-${new Date().toISOString().slice(0,19).replace('T','_').replace(/:/g,'-')}.webm`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

  return (
    <header className="py-4 px-6 bg-background">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Logo />
          <h1 className="text-2xl font-bold text-foreground">VividCast</h1>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onStartTour}>
                <Rocket className="h-5 w-5" />
                <span className="sr-only">Start Tour</span>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/how-to-use">
                <HelpCircle className="h-5 w-5" />
                <span className="sr-only">How to Use</span>
              </Link>
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
            </Button>
            <Button onClick={handleDownload} disabled={!videoUrl} size="sm" id="tour-export-button">
              <Download className="mr-0 sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Export Video</span>
            </Button>
        </div>
      </div>
    </header>
  );
}
