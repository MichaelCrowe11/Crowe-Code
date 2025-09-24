// Site configuration for CroweCode Platform
export const siteConfig = {
  name: "CroweCode",
  title: "CroweCode – Code, Ship, and Scale Intelligently",
  description: "A unique, code-native AI development space. Build, deploy, and scale with precision in a codespace crafted for creators.",
  url: "https://www.crowecode.com",
  ogImage: "/og.svg",
  keywords: [
    "crowecode",
    "crowe code",
    "intelligent ide",
    "ai development platform",
    "cloud ide",
    "online code editor",
    "ai coding assistant",
    "collaborative development",
    "github integration",
    "web development",
    "machine learning ide",
    "quantum computing platform"
  ],
  links: {
    github: "https://github.com/MichaelCrowe11/Crowe-Code",
    twitter: "https://twitter.com/crowecode",
    discord: "https://discord.gg/crowecode",
  docs: "https://docs.crowecode.com"
  },
  creator: "Michael Crowe",
  company: "CroweCode",
  features: {
    ai: {
      enabled: true,
      providers: ["anthropic", "openai", "google"],
      defaultProvider: "anthropic"
    },
    collaboration: {
      enabled: true,
      maxUsers: 10,
      realtime: true
    },
    ide: {
      themes: ["dark", "light", "monokai", "dracula"],
      defaultTheme: "dark",
      languages: ["javascript", "typescript", "python", "java", "go", "rust"],
      autoSave: true,
      autoFormat: true
    },
    github: {
      enabled: true,
      integration: "crowehub",
      features: ["sync", "pr", "issues", "actions"]
    }
  },
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "https://api.crowecode.com",
    version: "v1",
    timeout: 30000
  },
  branding: {
    primaryColor: "#4F46E5", // Indigo 600
    secondaryColor: "#06B6D4", // Cyan 500
    accentColor: "#22C55E", // Emerald 500
    gradientStart: "#06B6D4",
    gradientEnd: "#4F46E5",
    darkBg: "#09090B", // zinc-950
    lightBg: "#FAFAFA",
    logo: {
  light: "/crowecode-wordmark.svg",
  dark: "/crowecode-wordmark.svg",
  favicon: "/favicon.svg",
  full: "/crowecode-wordmark.svg"
    },
    tagline: "The Codespace for Builders"
  },
  social: {
    twitter: "@crowecode",
    github: "MichaelCrowe11",
    linkedin: "michael-crowe",
    email: "support@crowecode.com"
  }
}

export type SiteConfig = typeof siteConfig