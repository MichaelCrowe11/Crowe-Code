"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";

interface SoundSystemContextType {
  playSound: (type: SoundType) => void;
  setVolume: (volume: number) => void;
  setEnabled: (enabled: boolean) => void;
  playAmbient: (start: boolean) => void;
  volume: number;
  enabled: boolean;
}

type SoundType =
  | "click"
  | "hover"
  | "success"
  | "error"
  | "notification"
  | "typing"
  | "woosh"
  | "quantum"
  | "neural"
  | "glitch";

const SoundSystemContext = createContext<SoundSystemContextType | undefined>(undefined);

export function useSoundSystem() {
  const context = useContext(SoundSystemContext);
  if (!context) {
    throw new Error("useSoundSystem must be used within SoundSystemProvider");
  }
  return context;
}

export function SoundSystemProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);
  const ambientOscillatorRef = useRef<OscillatorNode | null>(null);
  const ambientFilterRef = useRef<BiquadFilterNode | null>(null);

  useEffect(() => {
    // Initialize Web Audio API
    if (typeof window !== "undefined" && window.AudioContext) {
      audioContextRef.current = new AudioContext();
    }

    return () => {
      // Cleanup
      if (ambientOscillatorRef.current) {
        ambientOscillatorRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const createOscillator = (frequency: number, type: OscillatorType = "sine") => {
    if (!audioContextRef.current) return null;

    const oscillator = audioContextRef.current.createOscillator();
    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    oscillator.type = type;
    return oscillator;
  };

  const createGain = (value: number) => {
    if (!audioContextRef.current) return null;

    const gain = audioContextRef.current.createGain();
    gain.gain.setValueAtTime(value * volume, audioContextRef.current.currentTime);
    return gain;
  };

  const createFilter = (frequency: number, type: BiquadFilterType = "lowpass") => {
    if (!audioContextRef.current) return null;

    const filter = audioContextRef.current.createBiquadFilter();
    filter.type = type;
    filter.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    filter.Q.setValueAtTime(1, audioContextRef.current.currentTime);
    return filter;
  };

  const playSound = (type: SoundType) => {
    if (!enabled || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    switch (type) {
      case "click": {
        // Futuristic click sound
        const osc = createOscillator(800);
        const gain = createGain(0.3);
        if (!osc || !gain) return;

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }

      case "hover": {
        // Subtle hover sound
        const osc = createOscillator(2000);
        const gain = createGain(0.1);
        if (!osc || !gain) return;

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.exponentialRampToValueAtTime(2500, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        osc.start(now);
        osc.stop(now + 0.05);
        break;
      }

      case "success": {
        // Success chord
        const frequencies = [523.25, 659.25, 783.99]; // C, E, G
        frequencies.forEach((freq, i) => {
          const osc = createOscillator(freq);
          const gain = createGain(0.2);
          if (!osc || !gain) return;

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
          osc.stop(now + 0.5);
        });
        break;
      }

      case "error": {
        // Error buzz
        const osc = createOscillator(100, "sawtooth");
        const gain = createGain(0.3);
        const filter = createFilter(200);
        if (!osc || !gain || !filter) return;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.setValueAtTime(100, now);
        osc.frequency.linearRampToValueAtTime(50, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        osc.start(now);
        osc.stop(now + 0.3);
        break;
      }

      case "notification": {
        // Notification bell
        const osc1 = createOscillator(800);
        const osc2 = createOscillator(1200);
        const gain1 = createGain(0.2);
        const gain2 = createGain(0.15);
        if (!osc1 || !osc2 || !gain1 || !gain2) return;

        osc1.connect(gain1);
        osc2.connect(gain2);
        gain1.connect(ctx.destination);
        gain2.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now + 0.1);

        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        osc1.stop(now + 0.3);
        osc2.stop(now + 0.4);
        break;
      }

      case "typing": {
        // Mechanical keyboard sound
        const osc = createOscillator(4000, "square");
        const gain = createGain(0.05);
        const filter = createFilter(2000, "highpass");
        if (!osc || !gain || !filter) return;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

        osc.start(now);
        osc.stop(now + 0.02);
        break;
      }

      case "woosh": {
        // Woosh transition
        const osc = createOscillator(200, "sawtooth");
        const gain = createGain(0.2);
        const filter = createFilter(100);
        if (!osc || !gain || !filter) return;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.exponentialRampToValueAtTime(2000, now + 0.1);
        filter.frequency.exponentialRampToValueAtTime(5000, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        osc.start(now);
        osc.stop(now + 0.2);
        break;
      }

      case "quantum": {
        // Quantum effect with modulation
        const carrier = createOscillator(440);
        const modulator = createOscillator(10);
        const modGain = createGain(100);
        const carrierGain = createGain(0.2);
        if (!carrier || !modulator || !modGain || !carrierGain) return;

        modulator.connect(modGain);
        modGain.connect(carrier.frequency);
        carrier.connect(carrierGain);
        carrierGain.connect(ctx.destination);

        carrier.start(now);
        modulator.start(now);

        carrierGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        carrier.stop(now + 0.5);
        modulator.stop(now + 0.5);
        break;
      }

      case "neural": {
        // Neural network activation
        for (let i = 0; i < 5; i++) {
          const freq = 200 + Math.random() * 1000;
          const osc = createOscillator(freq, "sine");
          const gain = createGain(0.05);
          const filter = createFilter(freq * 2);
          if (!osc || !gain || !filter) return;

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3 + i * 0.05);
          osc.stop(now + 0.3 + i * 0.05);
        }
        break;
      }

      case "glitch": {
        // Digital glitch
        const osc = createOscillator(100, "square");
        const gain = createGain(0.2);
        if (!osc || !gain) return;

        osc.connect(gain);
        gain.connect(ctx.destination);

        // Random frequency jumps
        for (let i = 0; i < 10; i++) {
          const time = now + i * 0.02;
          osc.frequency.setValueAtTime(50 + Math.random() * 500, time);
        }

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.setValueAtTime(0, now + 0.1);
        gain.gain.setValueAtTime(0.1, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        osc.start(now);
        osc.stop(now + 0.2);
        break;
      }
    }
  };

  const playAmbient = (start: boolean) => {
    if (!audioContextRef.current || !enabled) return;

    if (start) {
      // Stop existing ambient if playing
      if (ambientOscillatorRef.current) {
        ambientOscillatorRef.current.stop();
      }

      const ctx = audioContextRef.current;
      const now = ctx.currentTime;

      // Create ambient drone
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      const gain2 = ctx.createGain();
      const masterGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Setup oscillators for ambient pad
      osc1.frequency.setValueAtTime(110, now); // A2
      osc2.frequency.setValueAtTime(165, now); // E3
      osc1.type = "sine";
      osc2.type = "sine";

      // Setup gains
      gain1.gain.setValueAtTime(0.05 * volume, now);
      gain2.gain.setValueAtTime(0.03 * volume, now);
      masterGain.gain.setValueAtTime(0.3, now);

      // Setup filter for warmth
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(800, now);
      filter.Q.setValueAtTime(0.5, now);

      // Connect nodes
      osc1.connect(gain1);
      osc2.connect(gain2);
      gain1.connect(filter);
      gain2.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(ctx.destination);

      // Start oscillators
      osc1.start(now);
      osc2.start(now);

      // Slowly modulate for organic feel
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.1, now); // Very slow LFO
      lfoGain.gain.setValueAtTime(5, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc1.frequency);
      lfoGain.connect(osc2.frequency);
      lfo.start(now);

      // Store references
      ambientOscillatorRef.current = osc1;
      ambientGainRef.current = masterGain;
      ambientFilterRef.current = filter;
    } else {
      // Stop ambient
      if (ambientOscillatorRef.current) {
        ambientOscillatorRef.current.stop();
        ambientOscillatorRef.current = null;
      }
      if (ambientGainRef.current) {
        const ctx = audioContextRef.current;
        const now = ctx.currentTime;
        ambientGainRef.current.gain.exponentialRampToValueAtTime(0.001, now + 1);
      }
    }
  };

  return (
    <SoundSystemContext.Provider
      value={{
        playSound,
        setVolume,
        setEnabled,
        playAmbient,
        volume,
        enabled,
      }}
    >
      {children}

      {/* Sound control panel */}
      <SoundControls />
    </SoundSystemContext.Provider>
  );
}

// Sound control UI
function SoundControls() {
  const { volume, setVolume, enabled, setEnabled, playAmbient } = useSoundSystem();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25 flex items-center justify-center"
      >
        {enabled ? "🔊" : "🔇"}
      </button>

      {isOpen && (
        <div className="absolute bottom-20 left-0 bg-black/90 backdrop-blur-xl rounded-2xl border border-white/20 p-4 w-64">
          <h3 className="text-sm font-bold mb-3 text-white">Sound Settings</h3>

          {/* Enable/Disable */}
          <label className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400">Sound Effects</span>
            <button
              onClick={() => setEnabled(!enabled)}
              className={`w-10 h-5 rounded-full transition-colors ${
                enabled ? "bg-purple-500" : "bg-gray-600"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full mt-0.5 ml-0.5 transition-transform ${
                  enabled ? "translate-x-5" : ""
                }`}
              />
            </button>
          </label>

          {/* Volume */}
          <div className="mb-3">
            <label className="text-xs text-gray-400">Volume: {Math.round(volume * 100)}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={volume * 100}
              onChange={(e) => setVolume(parseInt(e.target.value) / 100)}
              className="w-full mt-1"
            />
          </div>

          {/* Ambient toggle */}
          <button
            onClick={() => playAmbient(true)}
            className="w-full px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-xs text-white"
          >
            Play Ambient Sound
          </button>
        </div>
      )}
    </div>
  );
}