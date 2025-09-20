/**
 * Type definitions for @crowecode/ui components
 */

import { ReactNode, CSSProperties, HTMLAttributes } from 'react';

// Base component props
export interface BaseComponentProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

// Animation types
export type AnimationPreset =
  | 'smooth'
  | 'bounce'
  | 'elastic'
  | 'quantum'
  | 'pulse'
  | 'glow'
  | 'shimmer';

export type AnimationSpeed = 'slow' | 'normal' | 'fast' | 'instant';

// Theme types
export type ThemeVariant =
  | 'cyberpunk'
  | 'neon'
  | 'holographic'
  | 'minimal'
  | 'dark'
  | 'light';

export type ColorVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

// Size types
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Glass effect types
export type GlassEffect = {
  blur: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  opacity: number;
  borderGlow: boolean;
  gradient: boolean;
};

export type BlurLevel = 'none' | 'sm' | 'md' | 'lg' | 'xl';

// Holographic effect types
export type HolographicEffect = {
  intensity: number;
  speed: number;
  colors: string[];
  animated: boolean;
};

// Quantum state types
export type QuantumState =
  | 'idle'
  | 'active'
  | 'loading'
  | 'error'
  | 'success';

// Component-specific prop types

// FuturisticButton
export interface FuturisticButtonProps extends BaseComponentProps {
  variant?: 'glass' | 'neon' | 'quantum' | 'holographic';
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  loadingText?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

// GlassmorphicCard
export interface GlassmorphicCardProps extends BaseComponentProps {
  blur?: BlurLevel;
  opacity?: number;
  interactive?: boolean;
  gradient?: boolean;
  borderGlow?: boolean;
  hoverEffect?: boolean;
}

// HolographicDisplay
export interface HolographicDisplayProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'badge';
  intensity?: number;
  color?: string;
  animated?: boolean;
  speed?: number;
}

// QuantumLoader
export interface QuantumLoaderProps extends BaseComponentProps {
  size?: Size;
  color?: ColorVariant | string;
  text?: string;
  speed?: number;
  showText?: boolean;
}

// NeuralBackground
export interface NeuralBackgroundProps extends BaseComponentProps {
  nodeCount?: number;
  connectionDistance?: number;
  animationSpeed?: number;
  color?: string;
  opacity?: number;
  interactive?: boolean;
}

// AdaptiveTheme
export interface AdaptiveThemeProps extends BaseComponentProps {
  preset?: ThemeVariant;
  adaptToTime?: boolean;
  followSystem?: boolean;
  customColors?: Partial<ThemeColors>;
}

// Theme colors
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

// FluidContainer
export interface FluidContainerProps extends BaseComponentProps {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: Size;
  centered?: boolean;
  responsive?: boolean;
}

// QuantumInput
export interface QuantumInputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'search';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
  success?: boolean;
  icon?: ReactNode;
  size?: Size;
  variant?: 'glass' | 'neon' | 'quantum';
}

// HolographicTooltip
export interface HolographicTooltipProps extends BaseComponentProps {
  content: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click' | 'focus';
  delay?: number;
  offset?: number;
}

// NeonBorder
export interface NeonBorderProps extends BaseComponentProps {
  color?: string;
  intensity?: number;
  animated?: boolean;
  width?: number;
  radius?: number;
}

// GlassPanel
export interface GlassPanelProps extends BaseComponentProps {
  position?: 'left' | 'right' | 'top' | 'bottom' | 'center';
  blur?: BlurLevel;
  opacity?: number;
  backdrop?: boolean;
  closable?: boolean;
  onClose?: () => void;
}

// FloatingElement
export interface FloatingElementProps extends BaseComponentProps {
  offset?: { x: number; y: number };
  duration?: number;
  amplitude?: number;
  autoStart?: boolean;
}

// MorphContainer
export interface MorphContainerProps extends BaseComponentProps {
  shape?: 'circle' | 'square' | 'rounded' | 'pill' | 'diamond';
  morphOnHover?: boolean;
  duration?: number;
  scale?: number;
}

// QuantumButton (enhanced button)
export interface QuantumButtonProps extends BaseComponentProps {
  variant?: 'quantum' | 'plasma' | 'energy' | 'void';
  size?: Size;
  energy?: number;
  charging?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  onClick?: () => void;
}

// HoloSwitch
export interface HoloSwitchProps extends BaseComponentProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: Size;
  label?: string;
  color?: string;
}

// GlowingProgress
export interface GlowingProgressProps extends BaseComponentProps {
  value: number;
  max?: number;
  size?: Size;
  color?: string;
  animated?: boolean;
  showValue?: boolean;
  label?: string;
}

// ParticleField
export interface ParticleFieldProps extends BaseComponentProps {
  count?: number;
  size?: number;
  speed?: number;
  color?: string;
  opacity?: number;
  interactive?: boolean;
  shape?: 'circle' | 'square' | 'triangle' | 'star';
}

// LightBeam
export interface LightBeamProps extends BaseComponentProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  color?: string;
  intensity?: number;
  animated?: boolean;
  width?: number;
}

// EnergyOrb
export interface EnergyOrbProps extends BaseComponentProps {
  size?: number;
  color?: string;
  intensity?: number;
  pulsing?: boolean;
  floating?: boolean;
  energy?: number;
}

// Hook return types

// useQuantumAnimation
export interface QuantumAnimationState {
  style: CSSProperties;
  controls: {
    start: () => void;
    stop: () => void;
    reset: () => void;
    setIntensity: (intensity: number) => void;
  };
  isAnimating: boolean;
}

export interface QuantumAnimationOptions {
  intensity?: number;
  speed?: number;
  autoPlay?: boolean;
  loop?: boolean;
}

// useHolographicEffect
export interface HolographicEffectState {
  colors: {
    current: string;
    next: string;
    previous: string;
  };
  cycle: () => void;
  reset: () => void;
  isAnimating: boolean;
}

export interface HolographicEffectOptions {
  baseColor?: [number, number, number];
  intensity?: number;
  speed?: number;
  autoPlay?: boolean;
}

// useGlassmorphism
export interface GlassmorphismOptions {
  blur?: BlurLevel;
  opacity?: number;
  borderGlow?: boolean;
  gradient?: boolean;
  interactive?: boolean;
}

// useParticleSystem
export interface ParticleSystemState {
  particles: Particle[];
  update: () => void;
  reset: () => void;
  addParticle: (particle: Partial<Particle>) => void;
  removeParticle: (id: string) => void;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  life: number;
  maxLife: number;
}

// useAdaptiveTheme
export interface AdaptiveThemeState {
  theme: ThemeVariant;
  colors: ThemeColors;
  setTheme: (theme: ThemeVariant) => void;
  toggleTheme: () => void;
  isDark: boolean;
  isLight: boolean;
}

// Utility types
export type RGB = [number, number, number];
export type RGBA = [number, number, number, number];
export type HSL = [number, number, number];

export interface Point {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Event types
export interface QuantumEvent {
  type: 'start' | 'end' | 'change';
  value?: any;
  timestamp: number;
}

export interface HolographicEvent {
  type: 'colorChange' | 'intensityChange' | 'cycle';
  value?: any;
  timestamp: number;
}

export interface ParticleEvent {
  type: 'spawn' | 'destroy' | 'collision';
  particle?: Particle;
  timestamp: number;
}

// Configuration types
export interface ComponentConfig {
  defaultProps?: Record<string, any>;
  animations?: Record<string, AnimationPreset>;
  themes?: Record<string, Partial<ThemeColors>>;
}

export interface LibraryConfig {
  theme?: ThemeVariant;
  animations?: {
    duration: number;
    easing: string;
    reducedMotion: boolean;
  };
  accessibility?: {
    highContrast: boolean;
    reducedMotion: boolean;
    screenReader: boolean;
  };
}