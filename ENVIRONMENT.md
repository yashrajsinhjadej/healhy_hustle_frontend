# Environment Configuration Guide

## Backend URL Configuration

This project uses environment variables to manage backend API endpoints, making it easy to switch between different environments (development, staging, production).

### Setup

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Update the backend URL in `.env.local`:**
   ```bash
   # Replace with your actual backend URL
   NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.vercel.app
   ```

### Available Environment Variables

- `NEXT_PUBLIC_BACKEND_URL` - The base URL for your backend API
- `NEXT_PUBLIC_API_URL` - Frontend API URL (usually localhost:3000 for development)
- `NEXT_PUBLIC_APP_NAME` - Application name
- `NEXT_PUBLIC_APP_VERSION` - Application version

### Environment Examples

#### Local Development
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

#### Staging
```bash
NEXT_PUBLIC_BACKEND_URL=https://your-staging-backend.vercel.app
```

#### Production
```bash
NEXT_PUBLIC_BACKEND_URL=https://your-production-backend.vercel.app
```

### API Endpoints

The application automatically constructs full URLs using the configured backend URL:

- Admin Login: `${BACKEND_URL}/api/admin/login`
- Admin Dashboard: `${BACKEND_URL}/api/admin/dashboard`
- User Management: `${BACKEND_URL}/api/admin/users`
- And more...

### Backend Configuration Utility

The `lib/backend-config.ts` file provides utility functions:

```typescript
import { getBackendApiUrl, API_ENDPOINTS } from '@/lib/backend-config'

// Get full URL for an endpoint
const loginUrl = getBackendApiUrl(API_ENDPOINTS.ADMIN_LOGIN)

// Check if backend is configured
if (!isBackendConfigured()) {
  console.error('Backend URL not configured')
}
```

### Deployment

When deploying to Vercel, make sure to set the environment variable in your Vercel dashboard:

1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Add `NEXT_PUBLIC_BACKEND_URL` with your production backend URL
4. Redeploy your application

### Troubleshooting

- **Backend not accessible**: Check that `NEXT_PUBLIC_BACKEND_URL` is correctly set
- **CORS issues**: Ensure your backend allows requests from your frontend domain
- **404 errors**: Verify that the backend endpoints match the configured paths

---

## Quick Backend URL Change

To quickly change the backend URL:

1. Edit `.env.local`
2. Update the `NEXT_PUBLIC_BACKEND_URL` value
3. Restart your development server (`npm run dev`)

The change will be applied to all API calls automatically.