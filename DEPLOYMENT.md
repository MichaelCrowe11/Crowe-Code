# Crowe Logic Platform - Deployment Guide

## 🚀 Deploy to croweos.com

### Prerequisites
1. **Vercel Account**: Ensure billing is active at https://vercel.com/teams/michaelcrowe11s-projects/settings/billing
2. **Domain**: Configure croweos.com to point to Vercel
3. **Claude API Key**: Have your Claude API key ready

### 1. Deploy to Vercel

```bash
# In the project directory
npx vercel deploy --prod --yes

# Follow prompts to:
# - Link to existing project or create new
# - Set project name as "crowe-logic-platform"
# - Configure environment variables
```

### 2. Environment Variables

Set these in Vercel Dashboard or via CLI:

```bash
npx vercel env add ANTHROPIC_API_KEY production
# Paste your Claude API key when prompted
```

Required variables:
- `ANTHROPIC_API_KEY` - Your Claude API key for Crowe Coder AI

### 3. Custom Domain Setup

In Vercel Dashboard:
1. Go to Project Settings → Domains
2. Add `croweos.com` and `www.croweos.com`
3. Configure DNS records as shown by Vercel

### 4. Features Included

✅ **MVP Dashboard** - Bio-intelligence cultivation management
✅ **CLX Extracts** - Dual-phase extract tracking with LBR scoring
✅ **Substrate Matrix** - Species-tuned recipes with calculations
✅ **Crowe Coder IDE** - Full VS Code-style environment with:
- Monaco Editor with TypeScript support
- AI chat integration with Claude API
- Terminal with command completion
- File explorer and resizable panels
- Syntax highlighting and IntelliSense

✅ **AI Integration** - Powered by Claude API for:
- Code completion and generation
- Natural language to code conversion
- Debugging assistance
- Optimization suggestions

### 5. Production URLs

After deployment:
- **Production**: https://croweos.com
- **IDE**: https://croweos.com/ide
- **CLX Extracts**: https://croweos.com/clx  
- **Substrate Matrix**: https://croweos.com/substrate

### 6. Alternative Deployment

If Vercel issues persist, you can also deploy to:
- **Netlify**: `netlify deploy --prod`
- **Cloudflare Pages**: Connect GitHub repo
- **Railway**: `railway deploy`

### Build Status
✅ Production build successful
✅ All TypeScript errors resolved
✅ Static generation complete
✅ Monaco Editor configured for client-side rendering

### Support
For deployment issues, check:
1. Vercel billing status
2. Domain DNS configuration  
3. Environment variables are set
4. Claude API key is valid

---
© 2025 Crowe Logic™ Platform