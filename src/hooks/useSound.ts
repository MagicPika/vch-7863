import { useState, useCallback } from 'react';
import { playTacticalSound } from '../utils/sound';

export function useSound() {
  const [soundEnabled, setSoundEnabled] = useState(true);

  const triggerSound = useCallback((type: 'click' | 'radar' | 'alarm' | 'success' | 'alert') => {
    if (soundEnabled) {
      playTacticalSound(type);
    }
  }, [soundEnabled]);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
    triggerSound('click');
  }, [triggerSound]);

  return {
    soundEnabled,
    toggleSound,
    triggerSound,
  };
}
