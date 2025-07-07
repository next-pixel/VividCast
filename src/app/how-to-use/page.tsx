
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/vividcast/logo';
import { ArrowLeft, Mic, Film, Layout, ImageIcon, Wand2, Award, Video } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  imageSrc: string;
  imageHint: string;
  children: React.ReactNode;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, imageSrc, imageHint, children }) => (
  <Card className="overflow-hidden">
    <div className="grid md:grid-cols-2">
      <div className="p-6 flex flex-col justify-center">
        <CardHeader className="p-0">
          <div className="flex items-center gap-3 mb-2">
            <Icon className="w-8 h-8 text-primary" />
            <CardTitle className="text-2xl">{title}</CardTitle>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-4">
          {children}
        </CardContent>
      </div>
      <div className="relative min-h-[300px] bg-muted">
        <Image
          src={imageSrc}
          alt={`${title} feature illustration`}
          layout="fill"
          objectFit="cover"
          data-ai-hint={imageHint}
        />
      </div>
    </div>
  </Card>
);

export default function HowToUsePage() {
  return (
    <div className="bg-background min-h-screen">
      <header className="py-4 px-6 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <Logo />
            <h1 className="text-2xl font-bold text-foreground">VividCast</h1>
          </Link>
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Studio
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">How to Use VividCast</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            A step-by-step guide to creating professional videos with ease.
          </p>
        </section>

        <div className="space-y-12">
          <FeatureCard
            icon={Mic}
            title="Teleprompter"
            description="Never forget your lines. Our built-in teleprompter keeps your script scrolling smoothly."
            imageSrc="https://placehold.co/800x600.png"
            imageHint="teleprompter settings panel"
          >
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Add Script:</strong> Paste your text directly or upload a .txt file.</li>
              <li><strong>Adjust Speed:</strong> Use the slider to match your speaking pace.</li>
              <li><strong>Change Font Size:</strong> Make the text larger or smaller for readability.</li>
              <li><strong>Set Position:</strong> Place the teleprompter at the top, bottom, left, or right of the screen.</li>
            </ul>
          </FeatureCard>

          <FeatureCard
            icon={Film}
            title="Slides"
            description="Enhance your presentation by importing slides directly from a PDF file."
            imageSrc="https://placehold.co/800x600.png"
            imageHint="presentation slides controls"
          >
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Upload PDF:</strong> Click 'Upload PDF' and select your file.</li>
              <li><strong>Processing:</strong> Wait a moment while we convert your PDF into high-quality images.</li>
              <li><strong>Navigate:</strong> Use the arrow buttons to move between your slides during the recording.</li>
            </ul>
          </FeatureCard>
          
          <FeatureCard
            icon={Layout}
            title="Layouts"
            description="Arrange your camera feed and presentation content with professional layouts."
            imageSrc="https://placehold.co/800x600.png"
            imageHint="video layout options"
          >
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Share Screen:</strong> Click 'Share Screen' to present an application or your entire desktop.</li>
              <li><strong>Choose a Layout:</strong> Select from Full Screen, Picture-in-Picture, Side-by-Side, or Presenter View.</li>
              <li><strong>Customize PiP:</strong> Change the shape (circle, square) and position of your Picture-in-Picture window.</li>
              <li><strong>Adjust Split:</strong> In Side-by-Side mode, use the slider to change the size ratio between camera and content.</li>
            </ul>
          </FeatureCard>
          
          <FeatureCard
            icon={ImageIcon}
            title="Backgrounds"
            description="Change your environment with real-time background removal and custom images."
            imageSrc="https://placehold.co/800x600.png"
            imageHint="background image gallery"
          >
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Select a Preset:</strong> Choose from our gallery of professional gradients and images.</li>
                <li><strong>Upload Your Own:</strong> Upload any image file to use as a custom background.</li>
                <li><strong>Automatic Removal:</strong> Our AI automatically removes your real background when a custom one is selected.</li>
            </ul>
          </FeatureCard>

          <FeatureCard
            icon={Wand2}
            title="Effects"
            description="Add a creative touch to your video with real-time visual effects."
            imageSrc="https://placehold.co/800x600.png"
            imageHint="video effects sliders"
          >
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Blur:</strong> Adjust the background blur to create a depth-of-field effect.</li>
              <li><strong>Hue:</strong> Shift the colors of your video for a unique look.</li>
              <li><strong>Opacity:</strong> Control the transparency of your video feed.</li>
            </ul>
          </FeatureCard>
          
          <FeatureCard
            icon={Award}
            title="Branding"
            description="Keep your content on-brand by adding a custom logo overlay to your video."
            imageSrc="https://placehold.co/800x600.png"
            imageHint="logo branding controls"
          >
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Upload Logo:</strong> Select an image file for your logo.</li>
                <li><strong>Adjust Position:</strong> Place your logo in any of the four corners.</li>
                <li><strong>Control Size & Opacity:</strong> Use the sliders to make your logo perfectly blend with your video.</li>
            </ul>
          </FeatureCard>

          <FeatureCard
            icon={Video}
            title="Recording & Exporting"
            description="Capture your masterpiece and download it with a single click."
            imageSrc="https://placehold.co/800x600.png"
            imageHint="video recording controls"
          >
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Setup Your Devices:</strong> Choose your preferred camera and aspect ratio before you begin.</li>
                <li><strong>Record:</strong> Hit the 'Record' button to start. A countdown will appear.</li>
                <li><strong>Pause & Resume:</strong> You can pause the recording at any time and resume when ready.</li>
                <li><strong>Stop & Export:</strong> Click 'Stop' to finish. The 'Export Video' button will become active, allowing you to download your MP4 file.</li>
            </ul>
          </FeatureCard>

        </div>
      </main>
      
      <footer className="py-8 mt-12 border-t">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} VividCast. Happy creating!</p>
        </div>
      </footer>
    </div>
  );
}
