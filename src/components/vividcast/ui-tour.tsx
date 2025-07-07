'use client';

import React, { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';

export interface TourStep {
  selector: string;
  title: string;
  content: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
}

interface UITourProps {
  steps: TourStep[];
  onComplete: () => void;
  isOpen: boolean;
}

export function UITour({ steps, onComplete, isOpen }: UITourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetElement, setTargetElement] = useState<Element | null>(null);

  // Find the target element and handle highlighting
  useEffect(() => {
    if (!isOpen) return;

    // Clean up all highlights first
    document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));

    const step = steps[currentStepIndex];
    if (step) {
      const element = document.querySelector(step.selector);
      setTargetElement(element);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        // Add a small delay for the highlight to appear after scrolling
        setTimeout(() => element.classList.add('tour-highlight'), 300);
      }
    }
  }, [currentStepIndex, isOpen, steps]);

  // Cleanup highlights when the tour is closed or unmounts
  useEffect(() => {
    return () => {
      document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
    };
  }, []);

  if (!isOpen || !targetElement) {
    return null;
  }

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 animate-in fade-in-0" onClick={handleSkip} />
      <Popover open={true}>
        <PopoverAnchor asChild>
          <div
            style={{
              position: 'fixed',
              top: targetElement.getBoundingClientRect().top,
              left: targetElement.getBoundingClientRect().left,
              width: targetElement.getBoundingClientRect().width,
              height: targetElement.getBoundingClientRect().height,
            }}
          />
        </PopoverAnchor>
        <PopoverContent
          side={step.side || 'bottom'}
          align={step.align || 'center'}
          className="z-[60] w-80 shadow-2xl"
          onOpenAutoFocus={(e) => e.preventDefault()}
          sideOffset={16}
        >
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="font-semibold text-lg">{step.title}</h3>
                <div className="text-sm text-muted-foreground">{step.content}</div>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 -mr-2 -mt-1" onClick={handleSkip}>
                <X className="h-4 w-4" />
                <span className="sr-only">Skip tour</span>
              </Button>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {currentStepIndex + 1} / {steps.length}
              </span>
              <div className="flex gap-2">
                {!isFirstStep && (
                  <Button variant="outline" size="sm" onClick={handlePrev}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                )}
                <Button size="sm" onClick={handleNext}>
                  {isLastStep ? 'Finish' : 'Next'}
                  {!isLastStep && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
