# Git & Vercel Deployment Guide

## 🚀 Deploy Narikootam Run! from GitHub

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Production ready - Narikootam Run v10.4"

# Add your GitHub repository as remote
git remote add origin https://github.com/summathaa987-code/narikootam-run.git

# Push to GitHub
git push -u origin main
```

**Note:** If your default branch is `master` instead of `main`, use:
```bash
git push -u origin master
```

---

### Step 2: Create Repository on GitHub

1. Go to https://github.com/summathaa987-code
2. Click **"New repository"** (green button)
3. Repository name: `narikootam-run` (or any name you prefer)
4. Description: "A cooperative puzzle platformer game - 1-4 players"
5. Keep it **Public** (so it's free on Vercel)
6. **Don't** initialize with README (you already have one)
7. Click **"Create repository"**

---

### Step 3: Connect to Vercel

#### Option A: Vercel Dashboard (Easiest)

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click **"Add New Project"**
4. Select your repository: `summathaa987-code/narikootam-run`
5. Click **"Import"**
6. Vercel will auto-detect settings (no configuration needed!)
7. Click **"Deploy"**
8. Wait 30-60 seconds
9. Done! 🎉

#### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

---

### Step 4: Your Game is Live! 🎮

Vercel will give you a URL like:
- `https://narikootam-run.vercel.app`
- Or a custom domain if you set one up

---

## 📝 Git Commands Reference

### First Time Setup
```bash
git init
git add .
git commit -m "Initial commit - Production ready"
git remote add origin https://github.com/summathaa987-code/narikootam-run.git
git push -u origin main
```

### Future Updates
```bash
# After making changes
git add .
git commit -m "Description of changes"
git push

# Vercel will auto-deploy on every push!
```

---

## 🔄 Auto-Deployment

Once connected, Vercel will automatically:
- ✅ Deploy on every push to `main` branch
- ✅ Create preview deployments for other branches
- ✅ Show deployment status in GitHub
- ✅ Provide instant rollback if needed

---

## 📁 What Gets Deployed

Everything in your repository:
```
✅ index.html
✅ main.js
✅ vercel.json
✅ assets/ (70 character images)
✅ data/
✅ levels/ (20 JSON files)
✅ objects/
✅ scenes/
✅ systems/
✅ README.md

❌ .git/ (ignored automatically)
❌ .vscode/ (ignored by .vercelignore)
```

---

## 🎯 Repository Settings

### Recommended Settings:

**Repository Name:** `narikootam-run`

**Description:** 
```
🐾 Narikootam Run! - A cooperative puzzle platformer game built with Phaser 3. Play solo or with up to 4 friends locally!
```

**Topics/Tags:**
- `game`
- `phaser`
- `platformer`
- `multiplayer`
- `javascript`
- `puzzle-game`
- `cooperative`

**Website:** (Add after Vercel deployment)
```
https://narikootam-run.vercel.app
```

---

## 🌐 Custom Domain (Optional)

If you want a custom domain:

1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings** → **Domains**
4. Add your custom domain
5. Follow DNS configuration instructions

---

## 📊 Deployment Status

After deployment, you can:
- ✅ View deployment logs
- ✅ See build time
- ✅ Check performance metrics
- ✅ Monitor traffic
- ✅ Rollback to previous versions

---

## 🔧 Troubleshooting

### If push fails:
```bash
# Pull first if repository exists
git pull origin main --allow-unrelated-histories

# Then push
git push -u origin main
```

### If branch name is different:
```bash
# Check current branch
git branch

# Rename to main if needed
git branch -M main

# Then push
git push -u origin main
```

---

## ✅ Checklist

- [ ] Create GitHub repository
- [ ] Push code to GitHub
- [ ] Connect repository to Vercel
- [ ] Deploy on Vercel
- [ ] Test live URL
- [ ] Share with friends! 🎮

---

## 🎉 You're Done!

Your game will be live at:
**https://narikootam-run.vercel.app** (or similar)

Share it with your friends and enjoy! 🎮

---

**Made with ❤️ by the Narikootam Team**
