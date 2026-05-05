// Web Audio API Synthesizer for Tactical Sound Effects
let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playTacticalSound(type: 'click' | 'radar' | 'alarm' | 'success' | 'alert') {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    if (type === 'click') {
      // Short metallic synth tick
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
      
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } 
    else if (type === 'radar') {
      // Echoing radar ping
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.2);
    } 
    else if (type === 'success') {
      // Upward military arpeggio
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        
        gain.gain.setValueAtTime(0.08, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.2);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.2);
      });
    } 
    else if (type === 'alert') {
      // Dual-tone warning beep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.setValueAtTime(440, now + 0.15);
      
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    }
    else if (type === 'alarm') {
      // Continuous wailing siren for 2 seconds
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.linearRampToValueAtTime(800, now + 0.4);
      osc.frequency.linearRampToValueAtTime(500, now + 0.8);
      osc.frequency.linearRampToValueAtTime(800, now + 1.2);
      osc.frequency.linearRampToValueAtTime(500, now + 1.6);
      osc.frequency.linearRampToValueAtTime(300, now + 2.0);
      
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 1.6);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 2.0);
    }
  } catch (e) {
    console.warn("Audio Context could not start due to user interaction policies", e);
  }
}
