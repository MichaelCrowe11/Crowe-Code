// Crowe Logic Design System - Pushing the boundaries of modern UI/UX
// Inspired by quantum computing interfaces, neural networks, and cyberpunk aesthetics

export const designTokens = {
  // Revolutionary Color Palette - Based on quantum states and neural activity
  colors: {
    // Primary - Electric Quantum Blue to Purple gradient
    primary: {
      50: 'rgba(239, 246, 255, 1)',
      100: 'rgba(219, 234, 254, 1)',
      200: 'rgba(191, 219, 254, 1)',
      300: 'rgba(147, 197, 253, 1)',
      400: 'rgba(96, 165, 250, 1)',
      500: 'rgba(59, 130, 246, 1)', // Base
      600: 'rgba(37, 99, 235, 1)',
      700: 'rgba(29, 78, 216, 1)',
      800: 'rgba(30, 64, 175, 1)',
      900: 'rgba(30, 58, 138, 1)',
      // Quantum glow effects
      glow: 'rgba(59, 130, 246, 0.5)',
      pulse: 'rgba(147, 197, 253, 0.3)',
    },

    // Accent - Neural Purple to Pink
    accent: {
      50: 'rgba(250, 245, 255, 1)',
      100: 'rgba(243, 232, 255, 1)',
      200: 'rgba(233, 213, 255, 1)',
      300: 'rgba(216, 180, 254, 1)',
      400: 'rgba(192, 132, 252, 1)',
      500: 'rgba(168, 85, 247, 1)', // Base
      600: 'rgba(147, 51, 234, 1)',
      700: 'rgba(126, 34, 206, 1)',
      800: 'rgba(107, 33, 168, 1)',
      900: 'rgba(88, 28, 135, 1)',
      glow: 'rgba(168, 85, 247, 0.5)',
      pulse: 'rgba(216, 180, 254, 0.3)',
    },

    // Success - Bioluminescent Green
    success: {
      base: 'rgba(34, 197, 94, 1)',
      glow: 'rgba(34, 197, 94, 0.5)',
      dark: 'rgba(22, 163, 74, 1)',
      light: 'rgba(74, 222, 128, 1)',
      pulse: 'rgba(134, 239, 172, 0.3)',
    },

    // Warning - Solar Flare Orange
    warning: {
      base: 'rgba(251, 146, 60, 1)',
      glow: 'rgba(251, 146, 60, 0.5)',
      dark: 'rgba(234, 88, 12, 1)',
      light: 'rgba(254, 215, 170, 1)',
      pulse: 'rgba(254, 215, 170, 0.3)',
    },

    // Error - Plasma Red
    error: {
      base: 'rgba(239, 68, 68, 1)',
      glow: 'rgba(239, 68, 68, 0.5)',
      dark: 'rgba(220, 38, 38, 1)',
      light: 'rgba(252, 165, 165, 1)',
      pulse: 'rgba(254, 202, 202, 0.3)',
    },

    // Dark theme with depth layers
    dark: {
      0: 'rgba(0, 0, 0, 1)', // Absolute black
      50: 'rgba(3, 7, 18, 1)', // Deep space
      100: 'rgba(10, 15, 30, 1)', // Void
      200: 'rgba(15, 23, 42, 1)', // Abyss
      300: 'rgba(30, 41, 59, 1)', // Midnight
      400: 'rgba(51, 65, 85, 1)', // Twilight
      500: 'rgba(71, 85, 105, 1)', // Dusk
      600: 'rgba(100, 116, 139, 1)', // Storm
      700: 'rgba(148, 163, 184, 1)', // Mist
      800: 'rgba(203, 213, 225, 1)', // Fog
      900: 'rgba(241, 245, 249, 1)', // Light
    },

    // Glass morphism effects
    glass: {
      light: 'rgba(255, 255, 255, 0.05)',
      medium: 'rgba(255, 255, 255, 0.1)',
      heavy: 'rgba(255, 255, 255, 0.15)',
      ultra: 'rgba(255, 255, 255, 0.25)',
      blur: '12px',
      saturation: '180%',
    },
  },

  // Typography - Futuristic and highly readable
  typography: {
    fonts: {
      display: "'Space Grotesk', 'Inter var', system-ui, -apple-system, sans-serif",
      body: "'Inter var', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      code: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
      accent: "'Orbitron', 'Space Grotesk', sans-serif", // For special headers
    },

    // Fluid typography scales
    scale: {
      xs: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
      sm: 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
      base: 'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',
      lg: 'clamp(1.125rem, 1rem + 0.625vw, 1.25rem)',
      xl: 'clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)',
      '2xl': 'clamp(1.5rem, 1.3rem + 1vw, 1.875rem)',
      '3xl': 'clamp(1.875rem, 1.5rem + 1.875vw, 2.25rem)',
      '4xl': 'clamp(2.25rem, 1.8rem + 2.25vw, 3rem)',
      '5xl': 'clamp(3rem, 2.2rem + 4vw, 4rem)',
      '6xl': 'clamp(3.75rem, 2.5rem + 6.25vw, 5rem)',
    },

    // Letter spacing for improved readability
    tracking: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
      mega: '0.2em', // For special effects
    },

    // Line heights
    leading: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '1.75',
      extra: '2',
    },
  },

  // Advanced spacing system based on golden ratio
  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem', // 2px
    1: '0.25rem', // 4px
    1.5: '0.375rem', // 6px
    2: '0.5rem', // 8px
    2.5: '0.625rem', // 10px
    3: '0.75rem', // 12px
    4: '1rem', // 16px
    5: '1.25rem', // 20px
    6: '1.5rem', // 24px
    7: '1.75rem', // 28px
    8: '2rem', // 32px
    9: '2.25rem', // 36px
    10: '2.5rem', // 40px
    11: '2.75rem', // 44px
    12: '3rem', // 48px
    14: '3.5rem', // 56px
    16: '4rem', // 64px
    20: '5rem', // 80px
    24: '6rem', // 96px
    28: '7rem', // 112px
    32: '8rem', // 128px
    36: '9rem', // 144px
    40: '10rem', // 160px
    // Golden ratio based
    golden: {
      xs: '0.382rem',
      sm: '0.618rem',
      md: '1rem',
      lg: '1.618rem',
      xl: '2.618rem',
      '2xl': '4.236rem',
      '3xl': '6.854rem',
    },
  },

  // Animation presets
  animation: {
    duration: {
      instant: '50ms',
      fast: '150ms',
      normal: '250ms',
      slow: '350ms',
      slower: '500ms',
      slowest: '1000ms',
    },

    easing: {
      linear: 'linear',
      // Smooth animations
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      smoothIn: 'cubic-bezier(0.4, 0, 1, 1)',
      smoothOut: 'cubic-bezier(0, 0, 0.2, 1)',
      // Bounce effects
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      bounceIn: 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
      bounceOut: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      // Elastic
      elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      // Quantum effects
      quantum: 'cubic-bezier(0.23, 1, 0.32, 1)',
      neural: 'cubic-bezier(0.33, 1.53, 0.69, 0.99)',
    },

    keyframes: {
      // Pulse for interactive elements
      pulse: {
        '0%, 100%': { opacity: 1 },
        '50%': { opacity: 0.5 },
      },

      // Glow effect for active elements
      glow: {
        '0%, 100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' },
        '50%': { boxShadow: '0 0 40px rgba(168, 85, 247, 0.8)' },
      },

      // Float for hovering elements
      float: {
        '0%, 100%': { transform: 'translateY(0)' },
        '50%': { transform: 'translateY(-10px)' },
      },

      // Quantum shimmer
      shimmer: {
        '0%': { backgroundPosition: '-1000px 0' },
        '100%': { backgroundPosition: '1000px 0' },
      },

      // Neural network pulse
      neural: {
        '0%': {
          opacity: 0.1,
          transform: 'scale(0.95)',
        },
        '50%': {
          opacity: 0.3,
          transform: 'scale(1.05)',
        },
        '100%': {
          opacity: 0.1,
          transform: 'scale(0.95)',
        },
      },
    },
  },

  // Shadows for depth and hierarchy
  shadows: {
    // Soft shadows
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

    // Glow shadows
    glow: {
      sm: '0 0 10px rgba(59, 130, 246, 0.3)',
      md: '0 0 20px rgba(59, 130, 246, 0.4)',
      lg: '0 0 30px rgba(59, 130, 246, 0.5)',
      xl: '0 0 40px rgba(168, 85, 247, 0.6)',
    },

    // Neon shadows
    neon: {
      blue: '0 0 20px rgba(59, 130, 246, 0.8), 0 0 40px rgba(59, 130, 246, 0.4)',
      purple: '0 0 20px rgba(168, 85, 247, 0.8), 0 0 40px rgba(168, 85, 247, 0.4)',
      green: '0 0 20px rgba(34, 197, 94, 0.8), 0 0 40px rgba(34, 197, 94, 0.4)',
    },

    // Inner shadows for depth
    inner: {
      sm: 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      lg: 'inset 0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
  },

  // Border radius for modern, smooth interfaces
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    '3xl': '2rem',
    full: '9999px',
  },

  // Z-index system
  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    fixed: 30,
    overlay: 40,
    modal: 50,
    popover: 60,
    tooltip: 70,
    notification: 80,
    max: 9999,
  },
};

// Design psychology principles
export const psychologyPrinciples = {
  // Gestalt principles
  proximity: '1rem', // Group related items
  similarity: 'consistent-styles', // Similar items are perceived as related
  continuity: 'flow-direction', // Elements arranged on a line/curve are related
  closure: 'complete-shapes', // Mind completes incomplete shapes

  // Fitts's Law - larger and closer targets are easier to hit
  minTouchTarget: '44px', // Minimum touch target size

  // Miller's Law - 7±2 items in working memory
  maxMenuItems: 7,

  // Hick's Law - time to decide increases with number of choices
  progressiveDisclosure: true,

  // Von Restorff Effect - unique items stand out
  accentUsage: 'sparingly',

  // Zeigarnik Effect - incomplete tasks are remembered better
  progressIndicators: true,
};

// Accessibility standards
export const a11y = {
  // WCAG 2.1 AAA compliant contrast ratios
  contrast: {
    normal: 7, // Normal text
    large: 4.5, // Large text
    ui: 3, // UI components
  },

  // Focus indicators
  focus: {
    outline: '2px solid rgba(59, 130, 246, 1)',
    outlineOffset: '2px',
  },

  // Motion preferences
  reducedMotion: '@media (prefers-reduced-motion: reduce)',

  // Screen reader support
  srOnly: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  },
};