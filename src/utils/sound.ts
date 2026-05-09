type TacticalSoundType = 'click' | 'radar' | 'alarm' | 'success' | 'alert';

const audioContextState: {
  ctx: AudioContext | null;
} = {
  ctx: null,
};

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioContextState.ctx) {
    audioContextState.ctx = new Ctx();
  }
  return audioContextState.ctx;
}

function tone(ctx: AudioContext, frequency: number, duration: number, type: OscillatorType, gainValue: number, startAt: number) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startAt);

  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(gainValue, startAt + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.02);
}

export function playTacticalSound(type: TacticalSoundType) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const startAt = ctx.currentTime + 0.01;

  try {
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }

    switch (type) {
      case 'click':
        tone(ctx, 620, 0.05, 'square', 0.03, startAt);
        break;
      case 'radar':
        tone(ctx, 420, 0.12, 'sine', 0.025, startAt);
        tone(ctx, 680, 0.1, 'sine', 0.02, startAt + 0.08);
        break;
      case 'alarm':
        tone(ctx, 780, 0.12, 'sawtooth', 0.03, startAt);
        tone(ctx, 520, 0.12, 'sawtooth', 0.03, startAt + 0.14);
        break;
      case 'success':
        tone(ctx, 520, 0.09, 'triangle', 0.03, startAt);
        tone(ctx, 660, 0.11, 'triangle', 0.03, startAt + 0.08);
        tone(ctx, 880, 0.14, 'triangle', 0.025, startAt + 0.18);
        break;
      case 'alert':
        tone(ctx, 300, 0.16, 'square', 0.028, startAt);
        tone(ctx, 240, 0.18, 'square', 0.028, startAt + 0.12);
        break;
    }
  } catch {
    // ignore audio issues silently
  }
}
