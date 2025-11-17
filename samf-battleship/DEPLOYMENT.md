# 🚀 Battleship Game Deployment Guide

## Quick Deploy Options

### Option 1: GitHub Pages (Recommended - FREE)

**Steps:**
1. Create a GitHub repository
2. Push your code
3. Enable GitHub Pages in repository settings
4. Your game will be live at: `https://yourusername.github.io/repo-name`

**Commands:**
```bash
cd /Users/samfoucault/CascadeProjects/windsurf-project-2/samf-battleship

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Battleship game"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main

# Then go to GitHub repo settings → Pages → Source: main branch → Save
```

### Option 2: Netlify (FREE - Easiest)

**Steps:**
1. Go to https://www.netlify.com/
2. Sign up (free)
3. Drag and drop your `samf-battleship` folder
4. Done! You get a live URL instantly

**Or use Netlify CLI:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd /Users/samfoucault/CascadeProjects/windsurf-project-2/samf-battleship
netlify deploy --prod
```

### Option 3: Vercel (FREE)

**Steps:**
1. Go to https://vercel.com/
2. Sign up (free)
3. Import your project
4. Deploy!

**Or use Vercel CLI:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd /Users/samfoucault/CascadeProjects/windsurf-project-2/samf-battleship
vercel --prod
```

### Option 4: Surge.sh (FREE - Super Simple)

**Steps:**
```bash
# Install Surge
npm install -g surge

# Deploy
cd /Users/samfoucault/CascadeProjects/windsurf-project-2/samf-battleship/public
surge
```

First time you'll create an account via CLI, then your game is live!

---

## 📁 Files to Deploy

Your game is entirely static (HTML/CSS/JS), so you only need to deploy the `public` folder:

```
samf-battleship/
└── public/
    ├── index.html
    ├── styles.css
    └── game.js
```

---

## 🎯 Recommended: GitHub Pages

**Why?**
- ✅ Free forever
- ✅ Custom domain support
- ✅ Easy updates (just push to GitHub)
- ✅ Version control included
- ✅ Professional URL

**Quick Setup:**

1. **Create GitHub repo** at https://github.com/new
   - Name it: `battleship-game`
   - Make it public
   - Don't initialize with README

2. **Push your code:**
```bash
cd /Users/samfoucault/CascadeProjects/windsurf-project-2/samf-battleship
git init
git add .
git commit -m "Deploy Battleship game"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/battleship-game.git
git push -u origin main
```

3. **Enable GitHub Pages:**
   - Go to repo Settings
   - Scroll to "Pages"
   - Source: Deploy from branch
   - Branch: `main` → `/public` folder
   - Save

4. **Your game is live!**
   - URL: `https://YOUR_USERNAME.github.io/battleship-game`
   - Updates automatically when you push changes

---

## 🔧 Need a Custom Domain?

After deploying to GitHub Pages, Netlify, or Vercel:

1. Buy a domain (Namecheap, Google Domains, etc.)
2. Add custom domain in your hosting platform settings
3. Update DNS records
4. Done! Your game at `yourgame.com`

---

## 📝 Pre-Deployment Checklist

✅ All files in `public` folder
✅ No absolute paths (all relative)
✅ Tested locally
✅ Sound effects working
✅ Responsive design working
✅ No console errors

---

## 🚀 Ready to Deploy?

Choose your method and follow the steps above. GitHub Pages is recommended for beginners!

**Questions?** All these services have great documentation and free tiers.
