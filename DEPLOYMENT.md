# 🚀 Deployment Checklist

## Pre-Deployment Steps

### 1. Environment Variables Setup
Before deploying, set these environment variables in your Vercel dashboard:

#### **Required Variables:**
```
NEXT_PUBLIC_BACKEND_URL=https://health-hustle-j3bf2u5on-yashrajsinhjadejs-projects.vercel.app
NEXT_PUBLIC_APP_NAME=HealthyHustle
NEXT_PUBLIC_APP_VERSION=1.0.0
```

#### **Optional Variables:**
```
NEXT_PUBLIC_API_URL=https://your-frontend-domain.vercel.app
```

### 2. Vercel Dashboard Setup

1. **Go to your Vercel project dashboard**
2. **Navigate to Settings → Environment Variables**
3. **Add each variable:**
   - Key: `NEXT_PUBLIC_BACKEND_URL`
   - Value: `https://health-hustle-j3bf2u5on-yashrajsinhjadejs-projects.vercel.app`
   - Environment: `Production` (and optionally Preview/Development)

4. **Repeat for all variables above**

### 3. Deployment Commands
```bash
# Commit your changes
git add .
git commit -m "Add environment variable configuration for production"

# Push to main branch (triggers auto-deployment)
git push origin main
```

### 4. Post-Deployment Verification

1. **Check build logs** in Vercel dashboard
2. **Verify environment variables** are loaded correctly
3. **Test API connections** to your backend
4. **Check console** for any configuration errors

### 5. Troubleshooting

#### If deployment fails:
- Check environment variables are correctly set
- Verify backend URL is accessible
- Check build logs for errors
- Ensure all dependencies are in package.json

#### If API calls fail:
- Verify `NEXT_PUBLIC_BACKEND_URL` is correct
- Check CORS settings on your backend
- Verify backend is deployed and accessible

## Environment Configurations

### Local Development
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Production
```
NEXT_PUBLIC_BACKEND_URL=https://health-hustle-j3bf2u5on-yashrajsinhjadejs-projects.vercel.app
NEXT_PUBLIC_API_URL=https://your-frontend-domain.vercel.app
```

### Staging (if needed)
```
NEXT_PUBLIC_BACKEND_URL=https://your-staging-backend.vercel.app
NEXT_PUBLIC_API_URL=https://your-staging-frontend.vercel.app
```

---

## Quick Deploy Command
```bash
npm run build  # Test locally first
git add .
git commit -m "Production deployment"
git push origin main
```