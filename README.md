# HealthyHustle Frontend

A modern, responsive fitness tracking and community platform built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Responsive Design**: Mobile-first approach with beautiful UI on all devices
- **User Authentication**: Secure login and registration system
- **User Management**: Admin dashboard for managing users
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **TypeScript**: Full type safety throughout the application
- **API Integration**: Connected to HealthyHustle backend API

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React
- **Deployment**: Vercel

## 🚀 Vercel Deployment

### Prerequisites
- GitHub repository with your code
- Vercel account
- Backend API deployed (already configured)

### Deployment Steps

1. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Project Settings**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

3. **Environment Variables** (if needed):
   - No additional environment variables required
   - Backend API URL is already configured in the code

4. **Deploy**:
   - Click "Deploy"
   - Vercel will automatically build and deploy your app
   - You'll get a production URL (e.g., `https://your-app.vercel.app`)

### Automatic Deployments
- Every push to the main branch will trigger a new deployment
- Pull requests will create preview deployments
- No manual configuration needed

## 🏃‍♂️ Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## 📱 Responsive Features

- **Mobile-First Design**: Optimized for mobile devices
- **Flexible Layouts**: Adapts to all screen sizes
- **Touch-Friendly**: Large buttons and touch targets
- **Fast Loading**: Optimized for performance

## 🔧 Build Configuration

The app is optimized for Vercel with:
- TypeScript checking enabled
- ESLint validation enabled
- Image optimization enabled
- Bundle optimization enabled
- Compression enabled

## 📄 Pages

- **Landing Page** (`/`): Welcome page with features and navigation
- **Sign Up** (`/signup`): User registration with comprehensive form
- **Login** (`/login`): User authentication
- **Dashboard** (`/dashboard`): Admin user management (protected)
- **Forgot Password** (`/forgot-password`): Password recovery
- **Reset Password** (`/reset-password`): Password reset

## 🎨 UI Components

Built with shadcn/ui components:
- Responsive forms and inputs
- Modern card layouts
- Interactive buttons and toggles
- Loading states and error handling
- Mobile-optimized navigation

## 📞 Support

For deployment issues or questions, check the Vercel documentation or contact support.

---

**Ready for Vercel Deployment! 🚀**