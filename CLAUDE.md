# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Analyze bundle size
npm run analyze
```

### Database Operations
```bash
# Run migrations (development)
npm run db:migrate

# Push schema changes without migration
npm run db:push

# Seed database with initial data
npm run db:seed

# Open Prisma Studio GUI
npm run db:studio

# Generate Prisma client
npx prisma generate

# Deploy migrations (production)
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Testing
```bash
# Run all tests (verbose output)
npm test

# Run tests in watch mode (development)
npm run test:dev

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests with Playwright
npm run test:e2e

# Run smoke tests only
npm run test:smoke

# Run with coverage report
npm run test:coverage

# Run performance tests with Artillery
npm run test:performance

# Run specific test file
npx vitest run src/lib/ai-provider.test.ts

# Debug tests interactively
npm run test:watch
```

### Deployment & Operations
```bash
# Deploy to Fly.io (primary production)
fly deploy --app crowecode-main
# Or use the script with automatic strategy
bash scripts/deploy-fly.sh

# Deploy to other platforms
npm run deploy:gcp       # Google Cloud Platform
npm run deploy:railway   # Railway
npm run deploy:render    # Render

# Docker operations
npm run docker:build     # Build Docker image
npm run docker:run       # Run Docker container
docker-compose -f docker-compose.production.yml up --build

# Fly.io specific operations
fly ssh console -a crowecode-main         # SSH into production
fly secrets list --app crowecode-main     # List secrets
fly logs --app crowecode-main            # View logs
fly proxy 5433:5432 -a crowecode-db      # Database proxy

# OAuth setup (interactive script)
bash scripts/setup-oauth-secrets.sh

# Test OAuth configuration
node scripts/test-oauth.js
node scripts/verify-oauth.js

# Background worker
npm run worker
```

## Architecture Overview

### Service Architecture
The platform is deployed as a **Next.js 15.5.0 application** on Fly.io with the following architecture:

1. **Main Application** (`crowecode-main`): Next.js 15 with React 19, handles all UI and API routes
2. **PostgreSQL Database** (`crowecode-db`): Primary data store on Fly.io
3. **Authentication**: NextAuth v4 with OAuth providers (GitHub, Google) and credentials
4. **Real-time Features**: WebSocket support via Socket.io for collaboration
5. **Background Processing**: Worker scripts for AI tasks and analysis

### CroweCode Intelligence System
The platform features a proprietary AI system with multiple provider abstraction in `src/lib/ai-provider.ts`:
- **Primary**: CroweCode Intelligence (XAI_API_KEY) - Custom neural architecture
- **Performance**: <1 second response time, 256K context window, 94%+ code accuracy
- **Capabilities**: 50+ languages, autonomous coding, security analysis, multi-step reasoning
- **Fallbacks**: Claude Opus 4.1, GPT-4 Turbo, Grok, Gemini Pro, Codex
- **Features**: Load balancing, automatic failover, usage tracking, cost optimization
- All AI interactions branded as "CroweCode Intelligence" regardless of underlying provider

### Authentication & Security
- **NextAuth v4** with multiple providers:
  - OAuth: GitHub and Google (configured in `src/lib/auth/nextauth-config.ts`)
  - Credentials: Email/password with bcrypt hashing
  - JWT strategy with session management
- **OAuth Callback URLs** (production):
  - GitHub: `https://crowecode-main.fly.dev/api/auth/callback/github`
  - Google: `https://crowecode-main.fly.dev/api/auth/callback/google`
- **Protected Routes**: Using NextAuth middleware and session checks
- **Environment Variables**: Managed via Fly.io secrets
- **Database Security**: SSL connections to PostgreSQL

### Database Strategy
```typescript
// Primary: PostgreSQL with Prisma
const prisma = new PrismaClient()

// Secondary: MongoDB for unstructured data
const mongodb = new MongoClient(process.env.MONGODB_URI)

// Enterprise: Oracle for legacy integration
const oracle = oracledb.createPool(oracleConfig)

// Caching: Redis for sessions and queues
const redis = new Redis(process.env.REDIS_URL)
```

### Key Integration Points

#### OAuth Authentication Flow
- Login page: `src/app/login/page.tsx` - Uses NextAuth `signIn()` for all providers
- Register page: `src/app/register/page.tsx` - Auto-login after registration
- NextAuth handler: `src/app/api/auth/[...nextauth]/route.ts`
- Configuration: `src/lib/auth/nextauth-config.ts`

#### VS Code Marketplace (`src/lib/marketplace/marketplace-manager.ts`)
- Extension search and installation
- Compatibility verification
- Security scanning before installation

#### Autonomous AI Agents (`src/lib/ai/autonomous-agent.ts`)
Multi-mode agent system with phases:
1. **Orchestrator**: Task breakdown and planning
2. **Architect**: System design and structure
3. **Coder**: Implementation
4. **Debugger**: Error detection and fixing
5. **Reviewer**: Code quality and best practices
6. **Tester**: Test generation and validation

#### Real-time Collaboration (`src/lib/collaboration/real-time-collaboration.ts`)
- WebSocket-based shared editing
- Voice/video support integration
- AI assistance in collaborative sessions
- Conflict resolution with CRDTs

#### CI/CD Pipeline Integration (`src/lib/ci-cd/pipeline-integration.ts`)
Supports GitHub Actions, GitLab CI, Jenkins, Azure DevOps with:
- Automated deployment triggers
- Pipeline status monitoring
- AI-optimized build configurations

### Environment Configuration
Critical environment variables for Fly.io production:
```bash
# Core Authentication (Required)
NEXTAUTH_URL=https://crowecode-main.fly.dev
NEXTAUTH_SECRET=<generated-secret>

# OAuth Providers (Required for social login)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Database (Fly.io internal connection)
DATABASE_URL=postgres://postgres:password@crowecode-db.flycast:5432/crowecode_platform?sslmode=disable

# AI Providers
XAI_API_KEY=             # Primary AI system
ANTHROPIC_API_KEY=       # Claude fallback
OPENAI_API_KEY=          # GPT-4 fallback

# Optional Services
REDIS_URL=               # For caching/sessions
STRIPE_SECRET_KEY=       # For billing
STRIPE_PUBLISHABLE_KEY=  # For client-side Stripe
SENTRY_DSN=              # Error tracking

# Feature Flags (set in fly.toml)
ENABLE_QUANTUM_MODULE=true
ENABLE_ML_LAB=true
ENABLE_AGRICULTURE=true
```

### UI/UX Design System
The platform features a revolutionary sci-fi aesthetic with custom components:
- **NeuralBackground**: Interactive particle network animations
- **GlassmorphicCard**: Glassmorphism effects with blur and transparency
- **HolographicDisplay**: Holographic UI elements with glitch effects
- **QuantumLoader**: Advanced loading animations (orbit, quantum, pulse variants)
- **FuturisticButton**: Buttons with quantum, neural, and holographic variants
- **AdaptiveTheme**: Dynamic theming system
- **SoundSystem**: Audio feedback for interactions

### File Structure Patterns
- **API Routes**: `src/app/api/[feature]/route.ts` using Next.js 15 route handlers
- **Components**: `src/components/[category]/[component].tsx` with TypeScript
- **UI Components**: `src/components/ui/[component].tsx` for design system
- **Services**: `src/lib/[service]/[module].ts` for business logic
- **Database**: `prisma/schema.prisma` for models, `migrations/` for SQL scripts

### Development Workflow

When implementing new features:
1. Check existing patterns in similar files first
2. Use the established AI provider abstraction - never call AI APIs directly
3. Add database changes via Prisma migrations, not direct SQL
4. Implement real-time features through the WebSocket service
5. Queue long-running tasks to the AI Worker service
6. Use the existing security middleware for protected routes

### Testing Requirements
- Unit tests go in `__tests__/` directories using Vitest
- E2E tests in `tests/` directory using Playwright
- Mock AI providers using the test utilities in `src/lib/test-utils/`
- Database tests should use transactions that rollback

### Deployment Notes
- **Primary Production**: Fly.io (https://crowecode-main.fly.dev)
  - App: `crowecode-main` in `iad` region (US East)
  - Database: `crowecode-db` PostgreSQL cluster
  - Automatic SSL via Fly.io proxy
  - Health checks on `/api/health`
  - Auto-scaling with min 1 machine
- **Deployment Strategy**: Immediate deployment without staging
- **Database Migrations**: Run manually or via release_command
- **Monitoring**: Fly.io metrics dashboard
- **Secrets Management**: Via `fly secrets set`

### Common Troubleshooting

#### OAuth Authentication Issues
- Verify callback URLs match exactly: `/api/auth/callback/[provider]`
- Check environment variables are set: `fly secrets list --app crowecode-main`
- Test configuration: `node scripts/test-oauth.js`

#### Database Connection Issues
- Use internal connection string for Fly.io: `crowecode-db.flycast:5432`
- For local development, use proxy: `fly proxy 5433:5432 -a crowecode-db`
- Connection string format: `postgres://user:pass@host:port/database?sslmode=disable`

#### Deployment Failures
- Check build logs: `fly logs --app crowecode-main`
- Verify secrets are set before deploying
- Ensure Dockerfile is present and valid
- Use `--strategy immediate` for faster deployments