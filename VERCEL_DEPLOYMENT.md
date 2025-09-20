# Vercel Deployment Guide for EquiTee UI

## Prerequisites
1. Vercel account (https://vercel.com) - Free tier includes custom domains
2. GitHub repository for equitee-ui
3. Domain: equitee.golf (already purchased)

## Deployment Steps

### 1. Push UI Code to GitHub
```bash
# Navigate to UI directory
cd equitee-ui

# Initialize git and commit (if not already done)
git add .
git commit -m "Configure for Vercel deployment with API connection"

# Push to your GitHub repository
git push origin main
```

### 2. Connect to Vercel
1. Go to https://vercel.com/dashboard
2. Click **Import Project**
3. Connect your GitHub account
4. Select the `equitee-ui` repository
5. Vercel will auto-detect it's a Next.js project

### 3. Configure Build Settings
Vercel should auto-detect these, but verify:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm ci`

### 4. Set Environment Variables
In Vercel dashboard → Project Settings → Environment Variables:

**Required Variables:**
```
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoiZGFubnlob2dhbiIsImEiOiJjbWZyajM0cTQwOXdiMnJxNHI4czJ1MjBnIn0.2m5NN9wrH4Vk_mPj0So_Lw
NEXT_PUBLIC_SUPABASE_URL=https://jzwhtipzltipstmbybzk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_API_URL=https://equitee-api.onrender.com
```

### 5. Deploy
- Vercel will automatically deploy after connecting the repository
- Monitor the build logs in the Vercel dashboard
- First deployment takes 2-5 minutes

### 6. Add Custom Domain (FREE!)
**Unlike Render, Vercel includes custom domains on free plan!**

1. In Vercel dashboard → Project Settings → Domains
2. Add domain: `equitee.golf`
3. Add domain: `www.equitee.golf` (optional)
4. Vercel will provide DNS instructions

### 7. Configure DNS at Domain Provider
At your domain provider (wherever you bought equitee.golf):

**For root domain (equitee.golf):**
- Add A record: `@` → `76.76.19.61`
- Add AAAA record: `@` → `2606:4700:90:0:76:76:19:61`

**For www subdomain:**
- Add CNAME record: `www` → `equitee-ui-[random].vercel.app`

**Alternative (easier):**
- Add CNAME record: `@` → `cname.vercel-dns.com`
- Add CNAME record: `www` → `cname.vercel-dns.com`

## Auto-Deployment Setup

### Files Configured:
- ✅ `vercel.json` - Vercel configuration with auto-deploy
- ✅ Updated `.env` - Points to deployed API
- ✅ Updated `.env.example` - Production settings

### Auto-Deploy Features:
- **Main branch**: Auto-deploys to production (equitee.golf)
- **Other branches**: Creates preview deployments
- **GitHub integration**: Automatic on every push
- **Build status**: Shows in GitHub PR status checks

## Architecture Overview
```
Frontend (Next.js)     →     Backend (NestJS)
equitee.golf          →     equitee-api.onrender.com
(Vercel - FREE)       →     (Render - FREE tier)
```

## Important Notes
1. **Free Custom Domain**: Unlike Render, Vercel includes custom domains on free plan
2. **API Connection**: UI is configured to connect to your deployed API
3. **Environment Variables**: Set in Vercel dashboard for production
4. **SSL Certificates**: Automatically handled by Vercel
5. **Global CDN**: Vercel provides worldwide edge locations

## Verify Deployment
After deployment:
- **Frontend**: https://equitee.golf
- **API**: https://equitee-api.onrender.com
- **API Docs**: https://equitee-api.onrender.com/api/docs

## Troubleshooting
- Check build logs in Vercel dashboard
- Verify environment variables are set correctly
- Ensure API URL is accessible from browser
- Check DNS propagation (can take up to 24 hours)

## Next Steps
1. Deploy UI to Vercel
2. Configure custom domain equitee.golf
3. Test full stack application
4. Optional: Upgrade Render to paid plan for api.equitee.golf subdomain