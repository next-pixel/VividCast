import React from 'react';
import type { Effects } from '@/app/page';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface EffectsControlsProps {
  effects: Effects;
  onEffectsChange: (effects: Effects) => void;
}

export function EffectsControls({ effects, onEffectsChange }: EffectsControlsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="blur">Blur: {effects.blur}px</Label>
        <Slider
          id="blur"
          min={0}
          max={20}
          step={1}
          value={[effects.blur]}
          onValueChange={(value) => onEffectsChange({ ...effects, blur: value[0] })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="hue">Hue: {effects.hue}°</Label>
        <Slider
          id="hue"
          min={0}
          max={360}
          step={1}
          value={[effects.hue]}
          onValueChange={(value) => onEffectsChange({ ...effects, hue: value[0] })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="opacity">Opacity: {effects.opacity}%</Label>
        <Slider
          id="opacity"
          min={0}
          max={100}
          step={1}
          value={[effects.opacity]}
          onValueChange={(value) => onEffectsChange({ ...effects, opacity: value[0] })}
        />
      </div>
    </div>
  );
}
