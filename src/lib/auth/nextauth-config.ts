import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  // Remove adapter when using JWT strategy
  // adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          role: "USER" as UserRole,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "USER" as UserRole,
        };
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user || !user.passwordHash) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name || `${user.firstName} ${user.lastName}`.trim() || user.email,
          image: user.image || user.avatar,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle OAuth sign in - create user if doesn't exist
      if (account?.provider === "github" || account?.provider === "google") {
        try {
          const email = user.email || profile?.email;
          if (!email) return false;

          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email },
          });

          if (!existingUser) {
            // Create new user from OAuth
            await prisma.user.create({
              data: {
                email,
                name: user.name || email.split("@")[0],
                image: user.image,
                role: "USER",
                passwordHash: "", // OAuth users don't have passwords
              },
            });
          }
          return true;
        } catch (error) {
          console.error("OAuth sign in error:", error);
          return false;
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl + "/dashboard";
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        // For OAuth, fetch the user from database to get the correct ID
        if (account.provider === "github" || account.provider === "google") {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.email = dbUser.email;
            token.name = dbUser.name;
            token.picture = dbUser.image;
            token.role = dbUser.role;
          }
        } else {
          // For credentials provider
          token.id = user.id;
          token.email = user.email;
          token.name = user.name;
          token.picture = user.image;
          token.role = user.role || "USER";
        }

        // Store OAuth tokens if available
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.provider = account.provider;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
        session.user.role = token.role as UserRole;
      }

      // Include access token for API calls if needed
      session.accessToken = token.accessToken as string;

      return session;
    },
    async signIn({ user, account, profile }) {
      // Allow all OAuth sign-ins (GitHub and Google)
      if (account?.provider === "github" || account?.provider === "google") {
        // With JWT strategy, we don't need to store in database here
        // The user data will be stored in the JWT token
        return true;
      }

      // Allow credentials sign-in
      return true;
    },
  },
  // Disable events for now since we're using JWT without database adapter
  // events: {
  //   async signIn({ user }) {
  //     // Update last login time
  //     await prisma.user.update({
  //       where: { id: user.id },
  //       data: { lastLoginAt: new Date() },
  //     });
  //   },
  // },
  debug: process.env.NODE_ENV === "development",
};

// Type augmentation for TypeScript
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image: string;
      role: UserRole;
    };
    accessToken?: string;
  }

  interface User {
    role?: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    accessToken?: string;
    refreshToken?: string;
    provider?: string;
  }
}