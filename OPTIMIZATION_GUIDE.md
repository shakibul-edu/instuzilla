# InstuZilla - Performance & Architecture Optimization Guide

## Frontend Optimizations

### 1. Code Splitting & Lazy Loading
```typescript
// Current approach: All components loaded upfront
// Recommended: Lazy load non-critical sections

// Landing page - lazy load pricing section
import dynamic from 'next/dynamic';

const Pricing = dynamic(() => import('@/components/Pricing'), {
  loading: () => <div className="h-96 bg-slate-100 animate-pulse" />,
});
```

**Benefits:**
- Reduce initial bundle size by 20-30%
- Faster First Contentful Paint (FCP)
- Better Time to Interactive (TTI)

### 2. Image Optimization
```typescript
// Current: Using simple img tags
// Recommended: Use Next.js Image component

import Image from 'next/image';

<Image
  src="/school-logo.png"
  alt="School Logo"
  width={400}
  height={300}
  quality={80}
  loading="lazy"
/>
```

**Implementation:**
- Create `/public/images` directory
- Use WebP format with fallbacks
- Set proper dimensions to prevent layout shift
- Enable responsive image sizing with `sizes` prop

### 3. Font Optimization
```typescript
// Current: Using Inter from Google Fonts
// Recommended: Use variable fonts and font-display

import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap", // Swap font while loading
  variable: "--font-inter",
  preload: true,
});
```

### 4. CSS Optimization
- Purge unused Tailwind CSS in production
- Use CSS variables for theming instead of inline styles
- Leverage Tailwind's JIT mode for smaller CSS bundles

**Current Setup:**
- Already configured in tailwind.config.js
- Only Tailwind utilities used are compiled

### 5. Performance Metrics to Monitor

```typescript
// Add to layout.tsx for monitoring Core Web Vitals
'use client';

import { useEffect } from 'react';
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export function WebVitals() {
  useEffect(() => {
    getCLS(console.log);
    getFID(console.log);
    getFCP(console.log);
    getLCP(console.log);
    getTTFB(console.log);
  }, []);

  return null;
}
```

### 6. SEO Enhancements
```typescript
// Add structured data (JSON-LD)
export const metadata: Metadata = {
  // ... existing metadata
  // Add this in the component:
};

// In Hero.tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'InstuZilla',
      applicationCategory: 'EducationalApplication',
      offers: {
        '@type': 'Offer',
        price: '29',
        priceCurrency: 'USD'
      }
    })
  }}
/>
```

---

## Backend Optimizations

### 1. Rate Limiting
```typescript
// File: /app/api/middleware/rateLimit.ts

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requests per minute
});

// In login route:
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return new Response('Rate limited', { status: 429 });
  }
  // Continue with login logic
}
```

**Benefits:**
- Prevent brute-force attacks
- Protect API from abuse
- Improve overall system stability

### 2. Input Validation & Sanitization
```typescript
// Add to fetchUser.ts

import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

const loginValidation = z.object({
  instu_id: z.string().min(3).max(20),
  username: z.string().min(3).max(50),
  password: z.string().min(8).max(100),
});

export const loginUser = async (credentials: any) => {
  // Validate input
  const validated = loginValidation.parse(credentials);

  // Sanitize
  const sanitized = {
    instu_id: DOMPurify.sanitize(validated.instu_id),
    username: DOMPurify.sanitize(validated.username),
    password: validated.password, // Don't sanitize passwords
  };

  // Continue with API call
};
```

### 3. Error Standardization
```typescript
// File: /lib/errorHandler.ts

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    status: number;
    timestamp: string;
  };
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  timestamp: string;
}

// In API routes:
export async function POST(req: Request) {
  try {
    // ... logic
    return Response.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: {
          code: 'LOGIN_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
          status: 400,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 400 }
    );
  }
}
```

### 4. Authentication Improvements

#### Token Refresh Rotation
```typescript
// Implement automatic refresh token rotation
// Benefits: Enhanced security, reduces token compromise window

// Current: Refresh token lasts 9 hours
// Improved: Rotate refresh token on each use

// In /app/api/auth/refresh route:
export async function POST(req: Request) {
  const oldRefreshToken = cookies().get('refresh')?.value;

  // Validate old token
  // Generate new access + refresh tokens
  // Invalidate old refresh token in database

  cookies().set('refresh', newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return Response.json({
    access: newAccessToken,
    refresh: newRefreshToken,
  });
}
```

### 5. CORS Security
```typescript
// File: /app/api/middleware/cors.ts

export function corsHeaders(origin: string) {
  const allowedOrigins = [
    'https://instuzilla.com',
    'https://www.instuzilla.com',
    process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null,
  ].filter(Boolean);

  return {
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

// Use in API routes:
export async function POST(req: Request) {
  const origin = req.headers.get('origin') || '';
  const headers = corsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers });
  }
  // Continue with logic
}
```

### 6. Caching Strategy

#### Server-Side Caching
```typescript
// Cache user profiles and school data
import { cache } from 'react';

export const getCachedUser = cache(async (userId: string) => {
  // Will be called only once per request, even if called multiple times
  return fetchUserFromDatabase(userId);
});
```

#### HTTP Caching Headers
```typescript
// In API routes
export async function GET(req: Request) {
  const response = new Response(JSON.stringify(data));
  response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  return response;
}
```

### 7. Database Optimization

```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_user_id ON users(id);
CREATE INDEX idx_student_instu_id ON students(instu_id);
CREATE INDEX idx_attendance_student_date ON attendance(student_id, date);

-- Use connection pooling
-- Enable query result caching
```

### 8. Security Headers
```typescript
// File: /app/api/middleware/security.ts

export function securityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  };
}
```

---

## Infrastructure Recommendations

### 1. CDN Setup
- Use Vercel's built-in CDN for static assets
- Configure image optimization through Vercel
- Enable automatic GZIP compression

### 2. Monitoring & Analytics
```typescript
// Add Sentry for error tracking
import * as Sentry from "@sentry/nextjs";

export async function POST(req: Request) {
  try {
    // ... logic
  } catch (error) {
    Sentry.captureException(error);
    // Handle error
  }
}
```

### 3. Load Testing
```bash
# Use tools like k6 for load testing
k6 run load-test.js

# Monitor response times and error rates
# Set up alerts for SLA violations
```

---

## Implementation Priority

### Phase 1 (Week 1) - Critical
- [ ] Add rate limiting to auth endpoints
- [ ] Implement input validation & sanitization
- [ ] Add security headers middleware
- [ ] Set up error standardization

### Phase 2 (Week 2) - Important
- [ ] Implement code splitting & lazy loading
- [ ] Add image optimization
- [ ] Implement caching strategy
- [ ] Add Core Web Vitals monitoring

### Phase 3 (Week 3) - Enhancement
- [ ] Token refresh rotation
- [ ] Implement refresh token endpoint
- [ ] Database query optimization
- [ ] Add structured data (JSON-LD)

### Phase 4 (Ongoing)
- [ ] Performance monitoring & alerts
- [ ] User analytics
- [ ] A/B testing for conversions
- [ ] Continuous optimization

---

## Key Metrics to Track

```typescript
// Performance Metrics
- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- Time to Interactive (TTI): < 3.8s

// Business Metrics
- Landing page conversion rate
- Signup completion rate
- API response time (p95): < 200ms
- Error rate: < 0.1%
```

---

## Quick Wins (No Code Required)

1. **Enable Gzip Compression** - Already enabled on Vercel
2. **Browser Caching** - Set proper cache headers
3. **Minification** - Already done by Next.js
4. **Remove Unused Dependencies** - Clean up package.json
5. **Update Dependencies** - Security and performance patches

---

## Resources

- [Next.js Performance Optimization](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Web Vitals](https://web.dev/vitals/)
- [Security Headers](https://securityheaders.com/)
- [OWASP Security Best Practices](https://owasp.org/www-project-top-ten/)
