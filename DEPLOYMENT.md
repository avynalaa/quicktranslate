# Deployment Guide

Quick guide for deploying QuickTranslate to GitHub and Vercel.

## Step 1: Initialize Git Repository

```bash
cd c:/Users/avyna/Downloads/QuickTranslate
git init
git add .
git commit -m "Initial commit: QuickTranslate AI Translator"
```

## Step 2: Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository named `quicktranslate` (or any name you prefer)
3. **Don't** initialize with README, .gitignore, or license (we already have these)
4. Click "Create repository"

## Step 3: Push to GitHub

```bash
git remote add origin https://github.com/YOUR-USERNAME/quicktranslate.git
git branch -M main
git push -u origin main
```

Replace `YOUR-USERNAME` with your actual GitHub username.

## Step 4: Deploy to Vercel

### Option A: Deploy from GitHub (Recommended)

1. Go to [Vercel](https://vercel.com/)
2. Sign up/login (use GitHub account for easier integration)
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Vercel will auto-detect it as a static site
6. Click "Deploy"
7. Done! Your app will be live in ~30 seconds

### Option B: Deploy via Vercel CLI

```bash
npm install -g vercel
cd c:/Users/avyna/Downloads/QuickTranslate
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- What's your project's name? **quicktranslate**
- In which directory is your code located? **./** (just press Enter)
- Want to override settings? **N**

## Step 5: Update README

After deployment, update the "Try it now" link in [`README.md`](README.md:5) with your actual Vercel URL.

Also update the GitHub issues link at the bottom of the README with your repository URL.

## Configuration Notes

- **No build step needed** - This is a pure static site
- **No environment variables needed** - Users provide their own API keys
- **No server required** - Everything runs in the browser
- **Automatic HTTPS** - Vercel provides this by default

## Updating Your Deployment

After making changes:

```bash
git add .
git commit -m "Description of your changes"
git push
```

Vercel will automatically redeploy when you push to the `main` branch.

## Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow Vercel's instructions to configure DNS

## Troubleshooting

**Deployment failed?**
- Check that all files are committed: `git status`
- Verify package.json is valid JSON
- Check Vercel deployment logs for errors

**App works locally but not on Vercel?**
- Clear browser cache
- Check browser console for errors
- Ensure API endpoints are HTTPS (required for production)

## That's It!

Your QuickTranslate app should now be live and accessible to anyone!