/**
 * Constants and presets for @crowecode/ui components
 */

import type { ThemeColors, AnimationPreset, RGB } from '../types';

// Theme presets
export const THEME_PRESETS: Record<string, ThemeColors> = {
  cyberpunk: {
    primary: 'rgb(147, 51, 234)',      // Purple
    secondary: 'rgb(59, 130, 246)',    // Blue
    accent: 'rgb(16, 185, 129)',       // Green
    background: 'rgb(0, 0, 0)',        // Black
    surface: 'rgb(17, 24, 39)',        // Dark gray
    text: 'rgb(255, 255, 255)',        // White
    textSecondary: 'rgb(156, 163, 175)', // Gray
    border: 'rgb(75, 85, 99)',         // Border gray
    success: 'rgb(34, 197, 94)',       // Green
    warning: 'rgb(251, 191, 36)',      // Yellow
    error: 'rgb(239, 68, 68)',         // Red
    info: 'rgb(59, 130, 246)'          // Blue
  },
  neon: {
    primary: 'rgb(236, 72, 153)',      // Pink
    secondary: 'rgb(168, 85, 247)',    // Purple
    accent: 'rgb(34, 211, 238)',       // Cyan
    background: 'rgb(7, 89, 133)',     // Dark blue
    surface: 'rgb(15, 23, 42)',        // Slate
    text: 'rgb(255, 255, 255)',        // White
    textSecondary: 'rgb(203, 213, 225)', // Light gray
    border: 'rgb(51, 65, 85)',         // Border slate
    success: 'rgb(34, 197, 94)',       // Green
    warning: 'rgb(251, 191, 36)',      // Yellow
    error: 'rgb(239, 68, 68)',         // Red
    info: 'rgb(34, 211, 238)'          // Cyan
  },
  holographic: {
    primary: 'rgb(129, 140, 248)',     // Indigo
    secondary: 'rgb(139, 92, 246)',    // Violet
    accent: 'rgb(244, 114, 182)',      // Pink
    background: 'rgb(15, 23, 42)',     // Slate
    surface: 'rgb(30, 41, 59)',        // Slate 700
    text: 'rgb(248, 250, 252)',        // Slate 50
    textSecondary: 'rgb(148, 163, 184)', // Slate 400
    border: 'rgb(71, 85, 105)',        // Slate 600
    success: 'rgb(34, 197, 94)',       // Green
    warning: 'rgb(251, 191, 36)',      // Yellow
    error: 'rgb(239, 68, 68)',         // Red
    info: 'rgb(129, 140, 248)'         // Indigo
  },
  minimal: {
    primary: 'rgb(71, 85, 105)',       // Slate 600
    secondary: 'rgb(100, 116, 139)',   // Slate 500
    accent: 'rgb(59, 130, 246)',       // Blue
    background: 'rgb(255, 255, 255)',  // White
    surface: 'rgb(248, 250, 252)',     // Slate 50
    text: 'rgb(15, 23, 42)',           // Slate 900
    textSecondary: 'rgb(71, 85, 105)', // Slate 600
    border: 'rgb(226, 232, 240)',      // Slate 200
    success: 'rgb(34, 197, 94)',       // Green
    warning: 'rgb(251, 191, 36)',      // Yellow
    error: 'rgb(239, 68, 68)',         // Red
    info: 'rgb(59, 130, 246)'          // Blue
  },
  dark: {
    primary: 'rgb(99, 102, 241)',      // Indigo 500
    secondary: 'rgb(75, 85, 99)',      // Gray 600
    accent: 'rgb(34, 197, 94)',        // Green 500
    background: 'rgb(17, 24, 39)',     // Gray 900
    surface: 'rgb(31, 41, 55)',        // Gray 800
    text: 'rgb(243, 244, 246)',        // Gray 100
    textSecondary: 'rgb(156, 163, 175)', // Gray 400
    border: 'rgb(75, 85, 99)',         // Gray 600
    success: 'rgb(34, 197, 94)',       // Green 500
    warning: 'rgb(251, 191, 36)',      // Yellow 400
    error: 'rgb(239, 68, 68)',         // Red 500
    info: 'rgb(59, 130, 246)'          // Blue 500
  },
  light: {
    primary: 'rgb(99, 102, 241)',      // Indigo 500
    secondary: 'rgb(107, 114, 128)',   // Gray 500
    accent: 'rgb(34, 197, 94)',        // Green 500
    background: 'rgb(255, 255, 255)',  // White
    surface: 'rgb(249, 250, 251)',     // Gray 50
    text: 'rgb(17, 24, 39)',           // Gray 900
    textSecondary: 'rgb(75, 85, 99)',  // Gray 600
    border: 'rgb(209, 213, 219)',      // Gray 300
    success: 'rgb(34, 197, 94)',       // Green 500
    warning: 'rgb(251, 191, 36)',      // Yellow 400
    error: 'rgb(239, 68, 68)',         // Red 500
    info: 'rgb(59, 130, 246)'          // Blue 500
  }
};

// Animation presets
export const ANIMATION_PRESETS: Record<AnimationPreset, object> = {
  smooth: {
    duration: 0.3,
    ease: [0.4, 0.0, 0.2, 1],
    stiffness: 100,
    damping: 15
  },
  bounce: {
    duration: 0.6,
    ease: [0.68, -0.55, 0.265, 1.55],
    stiffness: 200,
    damping: 10
  },
  elastic: {
    duration: 0.8,
    ease: [0.175, 0.885, 0.32, 1.275],
    stiffness: 150,
    damping: 8
  },
  quantum: {
    duration: 0.5,
    ease: [0.25, 0.46, 0.45, 0.94],
    stiffness: 120,
    damping: 12,
    oscillation: true
  },
  pulse: {
    duration: 1.0,
    ease: 'easeInOut',
    repeat: Infinity,
    repeatType: 'reverse'
  },
  glow: {
    duration: 2.0,
    ease: 'easeInOut',
    repeat: Infinity,
    repeatType: 'reverse',
    intensity: 1.5
  },
  shimmer: {
    duration: 1.5,
    ease: 'linear',
    repeat: Infinity,
    direction: 'right'
  }
};

// Color palettes
export const COLOR_PALETTES = {
  cyberpunk: {
    primary: [147, 51, 234] as RGB,
    secondary: [59, 130, 246] as RGB,
    accent: [16, 185, 129] as RGB,
    gradient: [
      [147, 51, 234],
      [59, 130, 246],
      [16, 185, 129]
    ] as RGB[]
  },
  neon: {
    primary: [236, 72, 153] as RGB,
    secondary: [168, 85, 247] as RGB,
    accent: [34, 211, 238] as RGB,
    gradient: [
      [236, 72, 153],
      [168, 85, 247],
      [34, 211, 238]
    ] as RGB[]
  },
  holographic: {
    primary: [129, 140, 248] as RGB,
    secondary: [139, 92, 246] as RGB,
    accent: [244, 114, 182] as RGB,
    gradient: [
      [129, 140, 248],
      [139, 92, 246],
      [244, 114, 182],
      [34, 211, 238],
      [16, 185, 129]
    ] as RGB[]
  },
  aurora: {
    primary: [34, 197, 94] as RGB,
    secondary: [59, 130, 246] as RGB,
    accent: [168, 85, 247] as RGB,
    gradient: [
      [34, 197, 94],
      [59, 130, 246],
      [168, 85, 247],
      [236, 72, 153]
    ] as RGB[]
  }
};

// Glass variants
export const GLASS_VARIANTS = {
  subtle: {
    blur: 'sm',
    opacity: 0.05,
    borderOpacity: 0.1
  },
  medium: {
    blur: 'md',
    opacity: 0.1,
    borderOpacity: 0.2
  },
  strong: {
    blur: 'lg',
    opacity: 0.15,
    borderOpacity: 0.3
  },
  intense: {
    blur: 'xl',
    opacity: 0.2,
    borderOpacity: 0.4
  }
};

// Quantum states
export const QUANTUM_STATES = {
  idle: {
    energy: 0,
    oscillation: false,
    glow: 0.5,
    particles: 0
  },
  active: {
    energy: 0.7,
    oscillation: true,
    glow: 1.0,
    particles: 10
  },
  loading: {
    energy: 1.0,
    oscillation: true,
    glow: 1.5,
    particles: 20,
    rotation: true
  },
  error: {
    energy: 0.8,
    oscillation: true,
    glow: 1.2,
    particles: 15,
    color: [239, 68, 68] as RGB
  },
  success: {
    energy: 0.6,
    oscillation: false,
    glow: 1.0,
    particles: 5,
    color: [34, 197, 94] as RGB
  }
};

// CSS custom property names
export const CSS_VARIABLES = {
  // Colors
  PRIMARY: '--crowecode-primary',
  SECONDARY: '--crowecode-secondary',
  ACCENT: '--crowecode-accent',
  BACKGROUND: '--crowecode-background',
  SURFACE: '--crowecode-surface',
  TEXT: '--crowecode-text',
  TEXT_SECONDARY: '--crowecode-text-secondary',
  BORDER: '--crowecode-border',

  // Effects
  GLASS_OPACITY: '--crowecode-glass-opacity',
  BLUR_STRENGTH: '--crowecode-blur-strength',
  BORDER_RADIUS: '--crowecode-border-radius',
  GLOW_INTENSITY: '--crowecode-glow-intensity',
  ANIMATION_SPEED: '--crowecode-animation-speed',

  // Quantum
  QUANTUM_ENERGY: '--crowecode-quantum-energy',
  QUANTUM_OSCILLATION: '--crowecode-quantum-oscillation',
  QUANTUM_PARTICLES: '--crowecode-quantum-particles',

  // Holographic
  HOLO_INTENSITY: '--crowecode-holo-intensity',
  HOLO_SPEED: '--crowecode-holo-speed',
  HOLO_COLORS: '--crowecode-holo-colors'
};

// Default component sizes
export const SIZES = {
  xs: {
    padding: '0.25rem 0.5rem',
    fontSize: '0.75rem',
    height: '1.5rem',
    borderRadius: '0.25rem'
  },
  sm: {
    padding: '0.375rem 0.75rem',
    fontSize: '0.875rem',
    height: '2rem',
    borderRadius: '0.375rem'
  },
  md: {
    padding: '0.5rem 1rem',
    fontSize: '1rem',
    height: '2.5rem',
    borderRadius: '0.5rem'
  },
  lg: {
    padding: '0.75rem 1.5rem',
    fontSize: '1.125rem',
    height: '3rem',
    borderRadius: '0.75rem'
  },
  xl: {
    padding: '1rem 2rem',
    fontSize: '1.25rem',
    height: '3.5rem',
    borderRadius: '1rem'
  },
  '2xl': {
    padding: '1.25rem 2.5rem',
    fontSize: '1.5rem',
    height: '4rem',
    borderRadius: '1.25rem'
  }
};

// Blur levels
export const BLUR_LEVELS = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '16px',
  xl: '24px'
};

// Z-index layers
export const Z_INDEX = {
  BACKGROUND: -1,
  DEFAULT: 0,
  ELEVATED: 10,
  OVERLAY: 50,
  MODAL: 100,
  POPOVER: 200,
  TOOLTIP: 300,
  NOTIFICATION: 400,
  MAX: 9999
};

// Breakpoints (Tailwind CSS compatible)
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// Accessibility constants
export const A11Y = {
  REDUCED_MOTION_QUERY: '(prefers-reduced-motion: reduce)',
  HIGH_CONTRAST_QUERY: '(prefers-contrast: high)',
  DARK_MODE_QUERY: '(prefers-color-scheme: dark)',

  // ARIA attributes
  ARIA_LABELS: {
    LOADING: 'Loading',
    CLOSE: 'Close',
    MENU: 'Menu',
    TOGGLE: 'Toggle',
    EXPAND: 'Expand',
    COLLAPSE: 'Collapse'
  },

  // Focus management
  FOCUS_VISIBLE_SELECTOR: ':focus-visible',
  FOCUSABLE_ELEMENTS: [
    'button',
    'input',
    'select',
    'textarea',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ')
};

// Performance constants
export const PERFORMANCE = {
  // Animation frame rate
  TARGET_FPS: 60,
  FRAME_TIME: 1000 / 60,

  // Debounce delays
  RESIZE_DEBOUNCE: 100,
  SCROLL_DEBOUNCE: 16,
  INPUT_DEBOUNCE: 300,

  // Intersection observer thresholds
  VISIBILITY_THRESHOLD: 0.1,
  ANIMATION_THRESHOLD: 0.5,

  // Particle system limits
  MAX_PARTICLES: 1000,
  PARTICLE_POOL_SIZE: 100
};

// Default component configurations
export const DEFAULT_CONFIG = {
  FuturisticButton: {
    variant: 'glass',
    size: 'md',
    loading: false,
    disabled: false,
    fullWidth: false
  },
  GlassmorphicCard: {
    blur: 'md',
    opacity: 0.1,
    interactive: false,
    gradient: false,
    borderGlow: false
  },
  HolographicDisplay: {
    variant: 'primary',
    intensity: 1,
    animated: true,
    speed: 1
  },
  QuantumLoader: {
    size: 'md',
    color: 'primary',
    speed: 1,
    showText: true
  },
  NeuralBackground: {
    nodeCount: 50,
    connectionDistance: 100,
    animationSpeed: 0.5,
    opacity: 0.3,
    interactive: false
  }
};

// Export all constants as a single object for convenience
export const CROWECODE_CONSTANTS = {
  THEME_PRESETS,
  ANIMATION_PRESETS,
  COLOR_PALETTES,
  GLASS_VARIANTS,
  QUANTUM_STATES,
  CSS_VARIABLES,
  SIZES,
  BLUR_LEVELS,
  Z_INDEX,
  BREAKPOINTS,
  A11Y,
  PERFORMANCE,
  DEFAULT_CONFIG
};