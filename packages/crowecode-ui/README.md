# @crowecode/ui

Advanced React components for futuristic user interfaces with glassmorphism, holographic effects, and quantum-inspired animations.

[![npm version](https://badge.fury.io/js/%40crowecode%2Fui.svg)](https://badge.fury.io/js/%40crowecode%2Fui)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🎨 **Glassmorphism Effects** - Beautiful frosted glass interfaces
- 🌈 **Holographic Displays** - Iridescent, color-shifting components
- ⚡ **Quantum Animations** - Smooth, physics-inspired motion
- 🎯 **TypeScript First** - Fully typed with excellent IntelliSense
- 📱 **Responsive Design** - Mobile-first and adaptive layouts
- 🔧 **Highly Customizable** - Extensive theming and styling options
- ⚡ **Performance Optimized** - Minimal bundle size, maximum impact

## 📦 Installation

```bash
npm install @crowecode/ui framer-motion lucide-react
```

```bash
yarn add @crowecode/ui framer-motion lucide-react
```

```bash
pnpm add @crowecode/ui framer-motion lucide-react
```

## 🚀 Quick Start

```tsx
import { FuturisticButton, GlassmorphicCard, HolographicDisplay } from '@crowecode/ui';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900">
      <GlassmorphicCard className="p-8">
        <HolographicDisplay>
          <h1 className="text-3xl font-bold">Welcome to the Future</h1>
        </HolographicDisplay>

        <FuturisticButton variant="quantum" size="lg">
          Get Started
        </FuturisticButton>
      </GlassmorphicCard>
    </div>
  );
}
```

## 📚 Components

### Core Components

#### FuturisticButton
Advanced button component with multiple visual variants and animations.

```tsx
import { FuturisticButton } from '@crowecode/ui';

<FuturisticButton
  variant="quantum"
  size="lg"
  loading={false}
  icon={<Sparkles />}
  onClick={() => console.log('Clicked!')}
>
  Click Me
</FuturisticButton>
```

**Props:**
- `variant`: `'glass' | 'neon' | 'quantum' | 'holographic'`
- `size`: `'sm' | 'md' | 'lg' | 'xl'`
- `loading`: `boolean`
- `disabled`: `boolean`
- `fullWidth`: `boolean`
- `icon`: `ReactNode`

#### GlassmorphicCard
Beautiful card component with glassmorphism effects.

```tsx
import { GlassmorphicCard } from '@crowecode/ui';

<GlassmorphicCard
  blur="md"
  opacity={0.1}
  interactive={true}
  gradient={true}
>
  <div className="p-6">
    <h2>Glass Card</h2>
    <p>Beautiful frosted glass effect</p>
  </div>
</GlassmorphicCard>
```

**Props:**
- `blur`: `'none' | 'sm' | 'md' | 'lg' | 'xl'`
- `opacity`: `number` (0-1)
- `interactive`: `boolean`
- `gradient`: `boolean`
- `borderGlow`: `boolean`

#### HolographicDisplay
Iridescent display component with color-shifting effects.

```tsx
import { HolographicDisplay } from '@crowecode/ui';

<HolographicDisplay
  variant="primary"
  intensity={1}
  color="59, 130, 246"
  animated={true}
>
  <span>Holographic Text</span>
</HolographicDisplay>
```

**Props:**
- `variant`: `'primary' | 'secondary' | 'accent' | 'badge'`
- `intensity`: `number` (0-2)
- `color`: `string` (RGB values)
- `animated`: `boolean`

#### QuantumLoader
Animated loading component with quantum field effects.

```tsx
import { QuantumLoader } from '@crowecode/ui';

<QuantumLoader
  size="lg"
  color="purple"
  text="Loading..."
  speed={1}
/>
```

**Props:**
- `size`: `'sm' | 'md' | 'lg' | 'xl'`
- `color`: `'purple' | 'blue' | 'green' | 'red' | 'yellow'`
- `text`: `string`
- `speed`: `number`

### Advanced Components

#### NeuralBackground
Animated background with neural network patterns.

```tsx
import { NeuralBackground } from '@crowecode/ui';

<NeuralBackground
  nodeCount={50}
  connectionDistance={100}
  animationSpeed={0.5}
  color="rgba(147, 51, 234, 0.3)"
/>
```

#### AdaptiveTheme
Context provider for dynamic theming.

```tsx
import { AdaptiveTheme } from '@crowecode/ui';

<AdaptiveTheme
  preset="cyberpunk"
  adaptToTime={true}
  followSystem={true}
>
  <App />
</AdaptiveTheme>
```

## 🎨 Styling

All components are designed to work with Tailwind CSS and support custom styling through className props.

### CSS Variables

The components use CSS custom properties for theming:

```css
:root {
  --crowecode-primary: 147, 51, 234;
  --crowecode-secondary: 59, 130, 246;
  --crowecode-accent: 16, 185, 129;
  --crowecode-glass-opacity: 0.1;
  --crowecode-blur-strength: 16px;
  --crowecode-border-radius: 12px;
}
```

### Theme Presets

```tsx
import { THEME_PRESETS } from '@crowecode/ui';

// Available presets:
// - cyberpunk
// - neon
// - holographic
// - minimal
// - dark
// - light
```

## 🪝 Hooks

### useQuantumAnimation
Hook for creating quantum field animations.

```tsx
import { useQuantumAnimation } from '@crowecode/ui';

function MyComponent() {
  const { style, controls } = useQuantumAnimation({
    intensity: 1,
    speed: 0.5,
    autoPlay: true
  });

  return <div style={style}>Animated content</div>;
}
```

### useHolographicEffect
Hook for holographic color effects.

```tsx
import { useHolographicEffect } from '@crowecode/ui';

function MyComponent() {
  const { colors, cycle } = useHolographicEffect({
    baseColor: [147, 51, 234],
    intensity: 1,
    speed: 2
  });

  return <div style={{ background: colors.current }}>Holographic</div>;
}
```

### useGlassmorphism
Hook for glassmorphism effects.

```tsx
import { useGlassmorphism } from '@crowecode/ui';

function MyComponent() {
  const glassStyle = useGlassmorphism({
    blur: 'md',
    opacity: 0.1,
    borderGlow: true
  });

  return <div style={glassStyle}>Glass content</div>;
}
```

## 🛠️ Customization

### Creating Custom Variants

```tsx
import { FuturisticButton } from '@crowecode/ui';

// Extend with custom styles
<FuturisticButton
  className="my-custom-button"
  style={{
    '--button-glow-color': '255, 100, 50',
    '--button-animation-speed': '2s'
  }}
>
  Custom Button
</FuturisticButton>
```

### CSS Custom Properties

Each component exposes CSS custom properties for fine-tuned control:

```css
.my-custom-button {
  --button-bg-opacity: 0.2;
  --button-border-width: 2px;
  --button-glow-intensity: 1.5;
  --button-animation-duration: 0.3s;
}
```

## 📱 Responsive Design

All components are built with mobile-first responsive design:

```tsx
<FuturisticButton
  size="sm md:md lg:lg"
  className="w-full md:w-auto"
>
  Responsive Button
</FuturisticButton>
```

## ⚡ Performance

### Bundle Size
- Core components: ~15KB gzipped
- Full library: ~45KB gzipped
- Tree-shakeable for optimal builds

### Optimization Tips

1. **Import only what you need:**
```tsx
import { FuturisticButton } from '@crowecode/ui';
// ✅ Good - tree-shakeable

import * as CroweUI from '@crowecode/ui';
// ❌ Avoid - imports everything
```

2. **Use CSS variables for theming instead of inline styles**
3. **Leverage the built-in memoization for complex animations**

## 🧪 Testing

Components include comprehensive test coverage:

```bash
npm test
```

### Testing with Your App

```tsx
import { render, screen } from '@testing-library/react';
import { FuturisticButton } from '@crowecode/ui';

test('renders button with text', () => {
  render(<FuturisticButton>Click me</FuturisticButton>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

## 🔧 TypeScript Support

Full TypeScript support with detailed type definitions:

```tsx
import type {
  FuturisticButtonProps,
  ThemeVariant,
  AnimationPreset
} from '@crowecode/ui';

interface MyComponentProps {
  button: FuturisticButtonProps;
  theme: ThemeVariant;
}
```

## 🌟 Examples

### Agriculture Dashboard

```tsx
import {
  GlassmorphicCard,
  HolographicDisplay,
  QuantumLoader,
  FuturisticButton
} from '@crowecode/ui';

function AgricultureDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <GlassmorphicCard gradient>
        <div className="p-6">
          <HolographicDisplay variant="badge">
            <span>Crop Health: 94%</span>
          </HolographicDisplay>

          <h3 className="text-lg font-semibold mt-4">Field Status</h3>
          <p className="text-gray-400">All systems operational</p>

          <FuturisticButton variant="quantum" className="mt-4">
            View Details
          </FuturisticButton>
        </div>
      </GlassmorphicCard>
    </div>
  );
}
```

### Lab Interface

```tsx
import {
  NeuralBackground,
  GlassmorphicCard,
  QuantumLoader,
  HolographicDisplay
} from '@crowecode/ui';

function LabInterface() {
  return (
    <div className="relative min-h-screen">
      <NeuralBackground nodeCount={30} />

      <div className="relative z-10 p-8">
        <GlassmorphicCard className="max-w-2xl mx-auto">
          <div className="p-8">
            <HolographicDisplay>
              <h1 className="text-3xl font-bold">Sample Analysis</h1>
            </HolographicDisplay>

            <div className="mt-6">
              <QuantumLoader text="Analyzing sample..." />
            </div>
          </div>
        </GlassmorphicCard>
      </div>
    </div>
  );
}
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Documentation](https://ui.crowecode.com)
- [Examples](https://ui.crowecode.com/examples)
- [GitHub](https://github.com/crowecode-platform/ui)
- [npm](https://www.npmjs.com/package/@crowecode/ui)

## 🙏 Acknowledgments

- [Framer Motion](https://www.framer.com/motion/) for animations
- [Lucide React](https://lucide.dev/) for icons
- [Tailwind CSS](https://tailwindcss.com/) for styling
- The React community for inspiration

---

Built with ❤️ by the CroweCode team