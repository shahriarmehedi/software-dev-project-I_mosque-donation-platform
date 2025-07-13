# Production Deployment Guide

## Pre-deployment Checklist

### 1. SSLCommerz Account Setup

1. **Create SSLCommerz Merchant Account**

   - Visit [SSLCommerz](https://sslcommerz.com/)
   - Complete merchant registration
   - Get your Store ID and Store Password
   - Configure webhooks and return URLs

2. **Test in Sandbox Mode**
   - Use sandbox credentials first
   - Test all payment flows
   - Verify webhook handling

### 2. Environment Configuration

Create `.env.production` with your production values:

```bash
# Database
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/mosque-donations-prod?retryWrites=true&w=majority"

# Security
JWT_SECRET="your-super-secure-jwt-secret-at-least-32-characters-long"

# Application
NEXTAUTH_URL="https://your-domain.com"
NEXT_PUBLIC_APP_NAME="Mosque Donation System"
NEXT_PUBLIC_MOSQUE_NAME="Your Mosque Name"

# SSLCommerz Production
SSLCOMMERZ_STORE_ID="your-production-store-id"
SSLCOMMERZ_STORE_PASSWORD="your-production-store-password"
SSLCOMMERZ_IS_LIVE="true"
```

### 3. Database Setup

1. **Create Production Database**

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to production database
   npm run db:push

   # Seed with initial data (admin user + sample campaigns)
   npm run db:seed
   ```

2. **Create Admin User**
   - Default admin: admin@mosque.org / admin123
   - Change password after first login in production

## Deployment Options

### Option 1: Vercel Deployment (Recommended)

1. **Install Vercel CLI**

   ```bash
   npm i -g vercel
   vercel login
   ```

2. **Deploy to Vercel**

   ```bash
   vercel --prod
   ```

3. **Set Environment Variables in Vercel Dashboard**

   - Go to your project dashboard
   - Navigate to Settings > Environment Variables
   - Add all production environment variables

4. **Configure Domains**
   - Add your custom domain in Vercel dashboard
   - Configure SSL certificates (automatic with Vercel)

### Option 2: Docker Deployment

1. **Create Dockerfile** (create if needed)

   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Deploy with Docker**
   ```bash
   docker build -t mosque-donation-system .
   docker run -p 3000:3000 --env-file .env.production mosque-donation-system
   ```

### Option 3: Traditional VPS Deployment

1. **Setup Node.js Environment**

   ```bash
   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PM2 for process management
   npm install -g pm2
   ```

2. **Deploy Application**

   ```bash
   # Clone repository
   git clone <your-repo-url>
   cd mosque-donation-system

   # Install dependencies
   npm ci --only=production

   # Build application
   npm run build

   # Start with PM2
   pm2 start npm --name "mosque-donations" -- start
   pm2 save
   pm2 startup
   ```

## Post-Deployment Configuration

### 1. SSL Certificate Setup

- Ensure HTTPS is properly configured
- Update NEXTAUTH_URL to HTTPS domain
- Configure SSLCommerz return URLs to HTTPS

### 2. SSLCommerz Configuration

Update your SSLCommerz account with production URLs:

- Success URL: `https://your-domain.com/api/payment/success`
- Fail URL: `https://your-domain.com/api/payment/fail`
- Cancel URL: `https://your-domain.com/api/payment/cancel`
- IPN URL: `https://your-domain.com/api/payment/ipn`

### 3. Admin Setup

1. Login to admin dashboard: `https://your-domain.com/admin`
2. Change default admin password
3. Create donation campaigns
4. Configure site settings
5. Generate QR codes for campaigns

### 4. Testing

1. **Test Donation Flow**

   - Create test donation
   - Verify payment processing
   - Check email notifications (if configured)
   - Verify donation appears in admin dashboard

2. **Test Admin Features**
   - Login/logout functionality
   - Campaign management
   - Donation export
   - Analytics display

### 5. Monitoring & Maintenance

1. **Database Backups**

   - Configure automated MongoDB backups
   - Test restore procedures

2. **Error Monitoring**

   - Set up error tracking (Sentry, LogRocket, etc.)
   - Monitor API response times

3. **Security**
   - Regularly update dependencies
   - Monitor for security vulnerabilities
   - Implement rate limiting if needed

## Production Checklist

- [ ] SSLCommerz account created and verified
- [ ] Production database created and seeded
- [ ] Environment variables configured
- [ ] Application deployed and accessible
- [ ] SSL certificate configured
- [ ] SSLCommerz URLs updated
- [ ] Admin account secured
- [ ] Payment flow tested
- [ ] QR codes generated and tested
- [ ] Backup strategy implemented
- [ ] Monitoring configured

## Support & Maintenance

### Regular Tasks

- Monitor donation transactions daily
- Backup database weekly
- Update dependencies monthly
- Review security quarterly

### Troubleshooting

- Check application logs for errors
- Verify SSLCommerz webhook delivery
- Monitor database performance
- Test payment flows regularly

## Security Best Practices

1. **Environment Variables**

   - Never commit sensitive data to version control
   - Use strong, unique passwords
   - Rotate JWT secrets periodically

2. **Database Security**

   - Use MongoDB Atlas security features
   - Implement IP whitelisting
   - Enable audit logging

3. **Application Security**
   - Keep dependencies updated
   - Implement rate limiting
   - Use HTTPS everywhere
   - Validate all user inputs

## Performance Optimization

1. **Database Optimization**

   - Create appropriate indexes
   - Monitor query performance
   - Implement pagination for large datasets

2. **Application Optimization**

   - Enable Next.js caching
   - Optimize images
   - Implement CDN if needed

3. **Monitoring**
   - Track response times
   - Monitor error rates
   - Set up alerts for issues

## Vercel Runtime Error Fix

If you encounter "Function Runtimes must have a valid version" error:

1. **Simplified vercel.json Configuration**

   ```json
   {
     "framework": "nextjs",
     "buildCommand": "npm run build",
     "installCommand": "npm install",
     "env": {
       "NEXT_PUBLIC_APP_NAME": "Mosque Donation System",
       "NEXT_PUBLIC_MOSQUE_NAME": "Central Mosque"
     }
   }
   ```

2. **Node.js Version in package.json**

   ```json
   {
     "engines": {
       "node": ">=18.17.0"
     }
   }
   ```

3. **Environment Variables Setup in Vercel Dashboard**
   - DATABASE_URL
   - JWT_SECRET
   - SSLCOMMERZ_STORE_ID
   - SSLCOMMERZ_STORE_PASSWORD
   - SSLCOMMERZ_IS_LIVE
   - NEXT_PUBLIC_APP_URL

# Production URL Updates

## SSLCommerz Configuration Applied

Your SSLCommerz sandbox credentials have been configured:

```
Store ID: mosqu6873818753acb
Store Password: mosqu6873818753acb@ssl
Store Name: testmosquyque
Registered URL: https://mosque-donation-platform.shahriar.site
Session API: https://sandbox.sslcommerz.com/gwprocess/v3/api.php
Validation API: https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php
Merchant Panel: https://sandbox.sslcommerz.com/manage/
```

## Environment Variables for Production

Make sure to set these environment variables in your Vercel dashboard:

```
NEXTAUTH_URL=https://mosque-donation-platform.shahriar.site
NEXT_PUBLIC_APP_URL=https://mosque-donation-platform.shahriar.site
DATABASE_URL=your-mongodb-atlas-connection-string
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
SSLCOMMERZ_STORE_ID=mosqu6873818753acb
SSLCOMMERZ_STORE_PASSWORD=mosqu6873818753acb@ssl
SSLCOMMERZ_IS_LIVE=false
NEXT_PUBLIC_APP_NAME=Mosque Donation System
NEXT_PUBLIC_MOSQUE_NAME=Central Mosque
```

**Important**: Keep `SSLCOMMERZ_IS_LIVE=false` for sandbox testing. Change to `true` only when you get production credentials from SSLCommerz.
