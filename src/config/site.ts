// Site configuration for Crowe Logic Platform
export const siteConfig = {
  name: "Crowe Logic Platform",
  title: "Crowe Logic - Intelligent Development Platform",
  description: "The most advanced AI-powered development platform. Build, deploy, and scale with intelligence using Crowe Logic's cutting-edge technology.",
  url: "https://crowecode.com",
  ogImage: "https://crowecode.com/og.png",
  keywords: [
    "crowe logic",
    "intelligent ide",
    "ai development platform",
    "cloud ide",
    "online code editor",
    "ai coding assistant",
    "collaborative development",
    "github integration",
    "web development",
    "crowe code",
    "crowecode",
    "machine learning ide",
    "quantum computing platform"
  ],
  links: {
    github: "https://github.com/MichaelCrowe11/crowe-logic-platform",
    twitter: "https://twitter.com/crowecode",
    discord: "https://discord.gg/crowecode",
    docs: "https://docs.crowecode.com"
  },
  creator: "Michael Crowe",
  company: "Crowe Logic",
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
    primaryColor: "#3B82F6", // Blue
    secondaryColor: "#8B5CF6", // Purple
    accentColor: "#10B981", // Emerald
    gradientStart: "#3B82F6",
    gradientEnd: "#8B5CF6",
    darkBg: "#09090B", // zinc-950
    lightBg: "#FAFAFA",
    logo: {
      light: "/crowe-avatar.png",
      dark: "/crowe-avatar.png",
      favicon: "/favicon.ico",
      full: "/crowe-logo-full.png"
    },
    tagline: "Intelligent Development Environment"
  },
  social: {
    twitter: "@crowecode",
    github: "MichaelCrowe11",
    linkedin: "michael-crowe",
    email: "support@crowecode.com"
  }
}

export type SiteConfig = typeof siteConfig