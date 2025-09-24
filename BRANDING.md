# CroweCode Branding

- Name: CroweCode
- Tagline: The Codespace for Builders
- Wordmark: `crowe/code` (code-native, monospaced)

Palette

- Primary: Indigo 600 `#4F46E5`
- Secondary: Cyan 500 `#06B6D4`
- Accent: Emerald 500 `#22C55E`
- Dark BG: `#09090B`

Typography

- Sans: Geist (variable) — UI
- Mono: Geist Mono — code, wordmark

Logos & Assets

- Wordmark: `public/crowecode-wordmark.svg`
- Favicon: `public/favicon.ico`
- Avatar (AI/Community): `public/crowe-avatar.png` (not the main product logo)

Usage

- App header/footer: CroweCode wordmark (code style) with optional blinking cursor accent
- AI assistant/community: crowe-avatar as persona icon
- Gradients: left-to-right Cyan → Indigo (`.cc-gradient`, `.cc-text-gradient`)

Components

- `src/components/branding/CroweCodeLogo.tsx` – code-style wordmark
- `src/components/branding/CroweLogicBranding.tsx` – header/footer now use CroweCodeLogo

Copy

- Product: “CroweCode” (not “Crowe Logic Platform”)
- Example: “Welcome to CroweCode — A code-native, AI-assisted workspace.”

Next Ideas

- Generate OG images with wordmark + code grid
- Replace blue/purple utility classes with brand helpers where impactful
- Add VS Code-like frame theming for IDE pages
