# Hotel Management System - Client

## Production Deployment Guide

### Prerequisites

1. Node.js 18.x or later
2. npm 8.x or later
3. AWS account with S3 and CloudFront configured
4. Sentry account for error tracking

### Environment Setup

1. Create a `.env.production` file with the following variables:

```bash
VITE_API_URL=https://api.hotel-management.com/graphql
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_SENTRY=true
VITE_SENTRY_DSN=your-sentry-dsn
VITE_APP_VERSION=${npm_package_version}
```

2. Configure AWS credentials for deployment:
   - Set up AWS CLI
   - Configure S3 bucket for static hosting
   - Set up CloudFront distribution

### Build and Deploy

1. Install dependencies:

```bash
npm ci
```

2. Build for production:

```bash
npm run build
```

3. Analyze bundle size (optional):

```bash
npm run analyze
```

4. Deploy using CI/CD:

- Push to main branch to trigger automatic deployment
- Or manually deploy using AWS CLI:

```bash
aws s3 sync dist/ s3://your-bucket-name --delete
aws cloudfront create-invalidation --distribution-id your-distribution-id --paths "/*"
```

### Monitoring

1. Monitor errors in Sentry dashboard
2. Check CloudWatch logs for infrastructure issues
3. Monitor CloudFront analytics for CDN performance

### Performance Optimization

- Bundle size analysis: `npm run analyze`
- Lighthouse scores should be:
  - Performance: > 90
  - Accessibility: > 90
  - Best Practices: > 90
  - SEO: > 90

### Security

- All API requests use HTTPS
- CSP headers configured in Nginx
- Regular dependency updates with `npm audit`

### Rollback Procedure

1. Identify the last working version
2. Check out that version in git
3. Run build process
4. Deploy to S3
5. Invalidate CloudFront cache

### Troubleshooting

1. Check Sentry for error reports
2. Verify API connectivity
3. Check browser console for client-side errors
4. Verify environment variables

For development setup and local testing, see the Development Guide in CONTRIBUTING.md.
