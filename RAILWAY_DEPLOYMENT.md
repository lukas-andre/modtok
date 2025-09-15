# Railway Deployment Guide for MODTOK

This guide explains how to deploy the MODTOK Astro application to Railway.

## Prerequisites

- Railway account (https://railway.com)
- GitHub repository with your code
- Supabase project for database

## Configuration Files

The following files have been configured for Railway deployment:

### `railway.toml`
Railway configuration file that specifies:
- Uses Dockerfile for builds
- Sets the start command
- Configures health checks and restart policies

### `Dockerfile`
Multi-stage Docker build that:
- Uses Node.js 20 Alpine Linux
- Installs pnpm for package management
- Builds the Astro application
- Creates a minimal production image
- Runs as non-root user for security

### `package.json`
Updated with the correct start script:
```json
"start": "node ./dist/server/entry.mjs"
```

### `astro.config.mjs`
Configured with:
- Node.js adapter in standalone mode
- Server host set to `0.0.0.0` for Railway

## Deployment Steps

1. **Connect to Railway**
   ```bash
   # Install Railway CLI (optional)
   npm install -g @railway/cli

   # Login to Railway
   railway login
   ```

2. **Create New Project**
   - Go to https://railway.com/dashboard
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `modtok` repository

3. **Configure Environment Variables**
   Set the following environment variables in Railway dashboard:
   ```
   NODE_ENV=production
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Deploy**
   Railway will automatically:
   - Detect the Dockerfile
   - Build the application using pnpm
   - Deploy to a Railway domain

## Environment Variables Needed

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for admin operations)
- Any other environment variables your app requires

## Post-Deployment

1. **Custom Domain** (Optional)
   - Go to your Railway project settings
   - Add your custom domain (modtok.cl)
   - Update DNS records as instructed

2. **Database Migrations**
   - Ensure your Supabase project is configured
   - Run any necessary migrations

## Monitoring

Railway provides:
- Build logs
- Application logs
- Metrics and monitoring
- Health check status

## Troubleshooting

### Build Issues
- Check Railway build logs
- Ensure all dependencies are in `package.json`
- Verify pnpm-lock.yaml is committed

### Runtime Issues
- Check application logs in Railway dashboard
- Verify environment variables are set correctly
- Check Supabase connection

### Performance
- Monitor Railway metrics
- Consider upgrading Railway plan if needed
- Optimize Astro build if necessary

## Local Testing

To test the production build locally:

```bash
# Build the application
pnpm run build

# Start the production server
pnpm start
```

The application should run on http://localhost:4321

## Resources

- [Railway Documentation](https://docs.railway.com/)
- [Astro Node.js Adapter](https://docs.astro.build/en/guides/integrations-guide/node/)
- [Railway Astro Guide](https://docs.railway.com/guides/astro)