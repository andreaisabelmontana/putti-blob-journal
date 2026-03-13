# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Run Locally

```bash
cd C:\Users\andre\Desktop\putti-blob-journal
npm install  # (already done)
npm run dev
```

Open: **http://localhost:3000**

### 2. Deploy to Vercel

**Easy Web Deployment (No CLI needed):**

1. Go to: **https://vercel.com/new**
2. Sign in with GitHub
3. Click "Import Git Repository"
4. Find: `andreaisabelmontana/putti-blob-journal`
5. Click "Import"
6. Settings:
   - Framework: **Other**
   - Build Command: (empty)
   - Output Directory: `public`
7. Click **Deploy**

Done! Your app will be live in ~2 minutes at:
`https://putti-blob-journal.vercel.app`

### 3. Auto-Deploy Setup

Once deployed, every `git push` automatically deploys to Vercel.

## ✅ Quick Test

After deployment:

1. **Welcome Screen**: Click "Start Today's Entry"
2. **Mold Blob**: Drag vertices to reshape the white blob
3. **Select Emotion**: Pick one of 8 emotion buttons
4. **Add Activity**: Type what you did today
5. **Repeat**: For all 6 people (Me, Mom, Dad, Friend 1, Friend 2, Special)
6. **View Art**: See mock-generated art
7. **Save**: Complete the entry
8. **History**: View past 7 days
9. **Dashboard**: See mood analytics

## 📱 Install as PWA

On mobile (after deployment):
1. Visit the Vercel URL
2. Chrome: Tap menu → "Add to Home Screen"
3. Safari: Tap share → "Add to Home Screen"

## 🎨 Customization

Want to customize?

**Colors**: Edit `public/css/style.css`
**Emotions**: Edit emotion buttons in `public/index.html`
**Physics**: Adjust forces in `public/js/Physics.js`

## 🔧 Troubleshooting

**Blobs not appearing?**
- Open browser console (F12)
- Check for Three.js errors
- Try refreshing the page

**API errors?**
- Check Vercel function logs
- Verify `/api` routes work

**Touch not working?**
- Ensure touch-action CSS is set
- Test on real mobile device (not emulator)

## 📊 Monitoring

After deployment, check:
- **Vercel Dashboard**: Analytics & logs
- **GitHub Actions**: Auto-deploy status

## 🎯 Key Features

- 🎨 **3D Blob Molding**: Physics-based vertex dragging
- 😊 **8 Emotions**: Color-coded with attraction/repulsion
- 👨‍👩‍👧‍👦 **6 People**: Track whole family
- 🎨 **AI Art**: Mock generation (ready for Replicate)
- 📅 **7-Day History**: Physics replays
- 📊 **Parent Dashboard**: Mood analytics
- 📱 **PWA**: Install on mobile

## 💡 Tips

- Use **2 fingers** to rotate camera (mobile)
- **Drag slowly** for precise molding
- **Large movements** create fun physics
- **Same colors attract**, different repel

## 🚀 Production Ready

- ✅ No build step needed
- ✅ Serverless functions configured
- ✅ PWA optimized
- ✅ Mobile-first design
- ✅ 60fps physics target

## 📝 Next Session

Want to enhance later?
- Add real Replicate AI art
- Connect to database (Vercel Postgres)
- Add user authentication
- Custom domain setup

---

**GitHub**: https://github.com/andreaisabelmontana/putti-blob-journal

**Support**: Check DEPLOYMENT.md and PROJECT_SUMMARY.md for details
