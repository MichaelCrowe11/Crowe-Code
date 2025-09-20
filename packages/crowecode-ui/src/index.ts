/**
 * @crowecode/ui - Advanced React Components for Futuristic Interfaces
 *
 * A collection of high-quality, animated React components designed for
 * modern web applications with glassmorphism, holographic effects,
 * and quantum-inspired animations.
 */

// Core Components
export { default as FuturisticButton } from './components/FuturisticButton';
export { default as GlassmorphicCard } from './components/GlassmorphicCard';
export { default as HolographicDisplay } from './components/HolographicDisplay';
export { default as QuantumLoader } from './components/QuantumLoader';
export { default as NeuralBackground } from './components/NeuralBackground';

// Advanced Components
export { default as AdaptiveTheme } from './components/AdaptiveTheme';
export { default as FluidContainer } from './components/FluidContainer';
export { default as QuantumInput } from './components/QuantumInput';
export { default as HolographicTooltip } from './components/HolographicTooltip';
export { default as NeonBorder } from './components/NeonBorder';

// Layout Components
export { default as GlassPanel } from './components/GlassPanel';
export { default as FloatingElement } from './components/FloatingElement';
export { default as MorphContainer } from './components/MorphContainer';

// Interactive Components
export { default as QuantumButton } from './components/QuantumButton';
export { default as HoloSwitch } from './components/HoloSwitch';
export { default as GlowingProgress } from './components/GlowingProgress';

// Utility Components
export { default as ParticleField } from './components/ParticleField';
export { default as LightBeam } from './components/LightBeam';
export { default as EnergyOrb } from './components/EnergyOrb';

// Hooks
export { useQuantumAnimation } from './hooks/useQuantumAnimation';
export { useHolographicEffect } from './hooks/useHolographicEffect';
export { useGlassmorphism } from './hooks/useGlassmorphism';
export { useParticleSystem } from './hooks/useParticleSystem';
export { useAdaptiveTheme } from './hooks/useAdaptiveTheme';

// Types
export type {
  FuturisticButtonProps,
  GlassmorphicCardProps,
  HolographicDisplayProps,
  QuantumLoaderProps,
  ThemeVariant,
  AnimationPreset,
  GlassEffect,
  HolographicEffect,
  QuantumState
} from './types';

// Constants
export {
  THEME_PRESETS,
  ANIMATION_PRESETS,
  COLOR_PALETTES,
  GLASS_VARIANTS,
  QUANTUM_STATES
} from './constants';

// Utilities
export {
  createGlassEffect,
  generateHolographicGradient,
  calculateQuantumField,
  interpolateColors,
  createParticleSystem
} from './utils';