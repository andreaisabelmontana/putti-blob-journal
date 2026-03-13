# Deployment Guide

## Vercel Deployment

### Option 1: Deploy via CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Follow prompts:
   - Set up and deploy: Y
   - Which scope: Select your account
   - Link to existing project: N
   - What's your project's name: putti-blob-journal
   - In which directory is your code located: ./
   - Want to modify settings: N

5. For production deployment:
```bash
vercel --prod
```

### Option 2: Deploy via Vercel Dashboard

1. Go to https://vercel.com/new
2. Import Git Repository: `andreaisabelmontana/putti-blob-journal`
3. Configure Project:
   - Framework Preset: Other
   - Build Command: (leave empty)
   - Output Directory: `public`
   - Install Command: `npm install`
4. Click "Deploy"

### Auto-Deployment Setup

Once connected, Vercel will automatically deploy on every push to the main branch.

## Environment Configuration

No environment variables needed - the app uses mock AI art generation.

## Testing Deployment

After deployment, test these features:

1. Open the Vercel URL
2. Start a journal entry
3. Mold a blob (drag vertices)
4. Select an emotion
5. Add activity text
6. Complete all 6 people
7. View generated art
8. Save entry
9. View history
10. View parent dashboard

## Performance Monitoring

Check Vercel Analytics dashboard for:
- Page load times
- API response times
- Error rates

## Troubleshooting

### Blobs not rendering
- Check browser console for Three.js/CANNON.js errors
- Verify CDN scripts loaded

### API errors
- Check Vercel function logs
- Verify `/api` routes configured in vercel.json

### PWA not installing
- Verify HTTPS (required for service workers)
- Check manifest.json is accessible
- Test on Chrome mobile

## Local Development

```bash
npm install
npm run dev
```

Visit http://localhost:3000

## Production URL

After deployment, your app will be available at:
https://putti-blob-journal.vercel.app (or custom domain)
