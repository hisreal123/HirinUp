# Deployment Guide for HirinUp

This guide will help you deploy your HirinUp application to Vercel.

## Prerequisites

Before deploying, make sure you have:
- ✅ All environment variables ready
- ✅ Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
- ✅ Clerk account set up
- ✅ Supabase project configured
- ✅ Retell AI API key
- ✅ OpenAI API key

## Required Environment Variables

You'll need to configure these environment variables in your hosting platform:

### Authentication (Clerk)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Your Clerk publishable key
- `CLERK_SECRET_KEY` - Your Clerk secret key

### Database (Supabase)
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### AI Services
- `OPENAI_API_KEY` - Your OpenAI API key
- `RETELL_API_KEY` - Your Retell AI API key

### Application URL
- `NEXT_PUBLIC_LIVE_URL` - Your production URL (e.g., `https://your-app.vercel.app`)

---

## Deploy to Vercel

Vercel is the recommended platform for Next.js applications as it's built by the Next.js team and offers seamless integration.

### Step 1: Prepare Your Repository

1. Make sure your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket)
2. Ensure your `package.json` has the correct build script (already configured)

### Step 2: Create a Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with your GitHub/GitLab/Bitbucket account (recommended for easy integration)

### Step 3: Import Your Project

1. Click **"Add New Project"** or **"Import Project"**
2. Select your Git repository
3. Vercel will auto-detect Next.js settings

### Step 4: Configure Build Settings

Vercel should auto-detect these, but verify:
- **Framework Preset:** Next.js
- **Build Command:** `yarn build` (or `npm run build`)
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `yarn install` (or `npm install`)

### Step 5: Add Environment Variables

1. In the project settings, go to **"Environment Variables"**
2. Add all the required environment variables listed above
3. Make sure to add them for **Production**, **Preview**, and **Development** environments

### Step 6: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (usually 2-5 minutes)
3. Once deployed, you'll get a URL like `https://your-app.vercel.app`

### Step 7: Update Environment Variables

1. After the first deployment, update `NEXT_PUBLIC_LIVE_URL` with your actual Vercel URL
2. Redeploy the application (Vercel will auto-redeploy on the next push, or you can trigger a redeploy manually)

### Step 8: Configure Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow the DNS configuration instructions

### Vercel-Specific Notes

- ✅ Automatic deployments on every push to main branch
- ✅ Preview deployments for pull requests
- ✅ Built-in analytics and monitoring
- ✅ Edge functions support
- ✅ Automatic HTTPS
- ✅ Free tier includes generous limits

---

## Post-Deployment Checklist

After deploying, make sure to:

- [ ] Test the authentication flow (sign up/sign in)
- [ ] Verify API routes are working
- [ ] Test interview creation
- [ ] Test interview link generation
- [ ] Verify webhook endpoints are accessible (for Retell AI)
- [ ] Check that environment variables are correctly set
- [ ] Test on mobile devices (should show restriction message)
- [ ] Update Retell AI webhook URL to point to your production API endpoint

## Webhook Configuration

### Retell AI Webhook Setup

1. Go to your Retell AI dashboard
2. Navigate to **Settings** → **Webhooks**
3. Set the webhook URL to: `https://your-domain.com/api/response-webhook`
4. Make sure the webhook is enabled

## Troubleshooting

### Build Fails

- Check that all environment variables are set
- Verify Node.js version (should be 18+)
- Check build logs for specific errors

### API Routes Not Working

- Verify `NEXT_PUBLIC_LIVE_URL` is set correctly
- Check that API routes are accessible (not blocked by middleware)
- Verify CORS settings if making cross-origin requests

### Database Connection Issues

- Verify Supabase URL and keys are correct
- Check Supabase RLS (Row Level Security) policies
- Ensure database migrations have been run

### Authentication Issues

- Verify Clerk keys are correct
- Check that Clerk application settings match your deployment URL
- Ensure organization feature is enabled in Clerk

## Continuous Deployment

Vercel automatically deploys on every push to your main branch. Preview deployments are also created for pull requests.

## Monitoring and Analytics

Vercel provides built-in analytics and monitoring dashboard to track your application's performance and usage.

## Support

If you encounter issues:
1. Check the build logs in your hosting platform
2. Review environment variables configuration
3. Check the application logs
4. Verify all third-party services (Clerk, Supabase, Retell AI, OpenAI) are configured correctly

---

## Quick Reference: Environment Variables Summary

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI Services
OPENAI_API_KEY=sk-...
RETELL_API_KEY=...

# Application URL (update after first deployment)
NEXT_PUBLIC_LIVE_URL=https://your-app.vercel.app
```

Good luck with your deployment! 🚀

