# The Fur Finder - Deployment Guide

## Prerequisites

- Node.js 18+
- Neon PostgreSQL database
- Vercel account (for hosting)

## Environment Setup

### 1. Database Setup

Create a Neon PostgreSQL database and run the migration:

```bash
psql your_database_url < scripts/schema.sql
```

### 2. Environment Variables

Create a `.env.local` file in the project root:

```
DATABASE_URL=postgresql://user:password@host/database
JWT_SECRET=your-secure-secret-key-here
NEXT_PUBLIC_API_URL=https://yourdomain.com/api/v1
NODE_ENV=production
```

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your database credentials
```

3. Run database migration:
```bash
npm run db:migrate
```

4. Start development server:
```bash
npm run dev
```

Visit http://localhost:3000

## Deployment to Vercel

### 1. Connect GitHub Repository

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Select your repository

### 2. Configure Environment Variables

In Vercel project settings, add:

- `DATABASE_URL`: Your Neon PostgreSQL connection string
- `JWT_SECRET`: A secure random string
- `NEXT_PUBLIC_API_URL`: Your production API URL

### 3. Deploy

```bash
vercel
```

Or push to your GitHub branch and Vercel will auto-deploy.

## Security Checklist

- [ ] Generate a strong JWT_SECRET (use `openssl rand -hex 32`)
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Configure CORS properly
- [ ] Enable rate limiting on API routes
- [ ] Set up monitoring and logging
- [ ] Regular security audits
- [ ] Keep dependencies updated

## Database Backups

With Neon, backups are automatically handled. For additional safety:

1. Export database regularly
2. Store backups securely
3. Test restore procedures

## Monitoring

Set up monitoring for:

- API response times
- Database performance
- Error rates
- User activity logs

## Scaling

As your application grows:

1. Implement caching (Redis/Upstash)
2. Optimize database queries
3. Set up CDN for static assets
4. Consider API rate limiting

## Troubleshooting

### Database Connection Errors

Verify your DATABASE_URL is correct and the server is accessible.

### JWT Token Issues

Ensure JWT_SECRET is set consistently across environments.

### Build Failures

Clear `.next` folder and rebuild:
```bash
rm -rf .next
npm run build
```

## Support

For deployment and production support:

- Platform and app support: `support@thefurfinder.com`
- Partnership and commercial requests: `partnerships@thefurfinder.com`
- Privacy and compliance requests: `privacy@thefurfinder.com`
