# Quick Implementation Guide - Copy & Paste Ready Code

## 1. Add Rate Limiting (Backend Security)

### Step 1: Install Dependencies
```bash
npm install @upstash/ratelimit @upstash/redis
```

### Step 2: Create Rate Limit Middleware
**File: `/lib/rateLimit.ts`**
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'),
});

export async function checkRateLimit(identifier: string) {
  try {
    const { success } = await ratelimit.limit(identifier);
    return success;
  } catch (error) {
    // If Redis is down, allow the request
    console.error('Rate limit check failed:', error);
    return true;
  }
}
```

### Step 3: Update Login Route
**File: `/app/api/auth/login/route.ts`**
```typescript
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  
  // Check rate limit
  const allowed = await checkRateLimit(`login:${ip}`);
  if (!allowed) {
    return Response.json(
      { error: 'Too many login attempts. Try again later.' },
      { status: 429 }
    );
  }

  // Continue with login logic...
  const body = await req.json();
  // ... rest of the code
}
```

### Step 4: Add Environment Variables
**File: `.env.local`**
```
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

---

## 2. Implement Input Validation & Sanitization

### Step 1: Install DOMPurify
```bash
npm install isomorphic-dompurify
```

### Step 2: Create Validation Schema
**File: `/lib/validation.ts`**
```typescript
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

export const loginSchema = z.object({
  instu_id: z
    .string()
    .min(3, 'Institution ID must be at least 3 characters')
    .max(20, 'Institution ID must not exceed 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid institution ID format'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long'),
});

export function sanitizeInput(input: any) {
  if (typeof input === 'string') {
    return DOMPurify.sanitize(input);
  }
  if (typeof input === 'object' && input !== null) {
    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => [
        key,
        typeof value === 'string' ? DOMPurify.sanitize(value) : value,
      ])
    );
  }
  return input;
}
```

### Step 3: Use in API Route
```typescript
import { loginSchema, sanitizeInput } from '@/lib/validation';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate
    const validated = loginSchema.parse(body);
    
    // Sanitize
    const sanitized = sanitizeInput(validated);
    
    // Continue with login...
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
```

---

## 3. Implement Standardized Error Responses

### Step 1: Create Error Types
**File: `/lib/api-response.ts`**
```typescript
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    status: number;
    timestamp: string;
    details?: any;
  };
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  timestamp: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export function errorResponse(
  code: string,
  message: string,
  status: number = 500,
  details?: any
): Response {
  return Response.json(
    {
      success: false,
      error: {
        code,
        message,
        status,
        timestamp: new Date().toISOString(),
        ...(details && { details }),
      },
    },
    { status }
  );
}

export function successResponse<T>(data: T): Response {
  return Response.json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  });
}
```

### Step 2: Use in Login Route
```typescript
import { errorResponse, successResponse } from '@/lib/api-response';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // ... validation and login logic
    
    return successResponse({
      access: token,
      refresh: refreshToken,
      user: { name, email },
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return errorResponse('VALIDATION_ERROR', error.message, 400);
    }
    if (error instanceof AuthError) {
      return errorResponse('AUTH_FAILED', 'Invalid credentials', 401);
    }
    return errorResponse('INTERNAL_ERROR', 'An error occurred', 500);
  }
}
```

---

## 4. Add Security Headers Middleware

### Step 1: Create Middleware
**File: `/middleware.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // CSP Header
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  );

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

---

## 5. Implement Lazy Loading for Pricing Section

### Step 1: Update page.tsx
```typescript
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Footer from '@/components/Footer';

// Lazy load Pricing component
const Pricing = dynamic(() => import('@/components/Pricing'), {
  loading: () => (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-96 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg" />
      </div>
    </section>
  ),
});

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <Hero />
      <Features />
      <Pricing />
      <Footer />
    </main>
  );
}
```

---

## 6. Add Web Vitals Monitoring

### Step 1: Create Web Vitals Component
**File: `/components/WebVitals.tsx`**
```typescript
'use client';

import { useEffect } from 'react';

export function WebVitals() {
  useEffect(() => {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log);
      getFID(console.log);
      getFCP(console.log);
      getLCP(console.log);
      getTTFB(console.log);

      // Optional: Send to analytics
      getCLS((metric) => {
        console.log('CLS:', metric.value);
        // sendToAnalytics(metric);
      });
    });
  }, []);

  return null;
}
```

### Step 2: Add to Layout
```typescript
import { WebVitals } from '@/components/WebVitals';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <WebVitals />
      </body>
    </html>
  );
}
```

---

## 7. Implement Token Refresh Endpoint

### Step 1: Create Refresh Endpoint
**File: `/app/api/auth/refresh/route.ts`**
```typescript
import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';

export async function POST(req: Request) {
  const cookieStore = cookies();
  const refreshToken = cookieStore.get('refresh')?.value;

  if (!refreshToken) {
    return Response.json(
      { error: 'No refresh token' },
      { status: 401 }
    );
  }

  try {
    // Validate refresh token
    const decoded = jwtDecode(refreshToken);
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      throw new Error('Refresh token expired');
    }

    // Call backend API to get new tokens
    const response = await fetch('https://instuback.etuition.app/api/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();

    // Set new tokens in cookies
    cookieStore.set('token', data.access, {
      httpOnly: true,
      maxAge: 60 * 15,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    cookieStore.set('refresh', data.refresh, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    return Response.json({ access: data.access });
  } catch (error) {
    return Response.json(
      { error: 'Token refresh failed' },
      { status: 401 }
    );
  }
}
```

---

## 8. Add Google Analytics

### Step 1: Install Package
```bash
npm install next-google-analytics
```

### Step 2: Update Layout
```typescript
import GoogleAnalytics from 'next-google-analytics';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <GoogleAnalytics trackPageViews />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Step 3: Track Events
```typescript
import { useGoogleAnalytics } from 'next-google-analytics';

export function SignupButton() {
  const { pageView } = useGoogleAnalytics();

  const handleClick = () => {
    pageView({
      page_path: '/signup',
      page_title: 'Sign Up',
    });
    // Navigate to signup...
  };

  return <button onClick={handleClick}>Sign Up</button>;
}
```

---

## 9. Add Structured Data (JSON-LD)

### Step 1: Add to Hero Component
```typescript
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'InstuZilla',
      applicationCategory: 'EducationalApplication',
      offers: [
        {
          '@type': 'Offer',
          priceCurrency: 'USD',
          price: '29',
          name: 'Starter Plan',
        },
        {
          '@type': 'Offer',
          priceCurrency: 'USD',
          price: '79',
          name: 'Professional Plan',
        },
      ],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '500',
      },
    }),
  }}
/>
```

---

## Implementation Priority Checklist

### Week 1 (Critical Security)
- [ ] Add rate limiting
- [ ] Add input validation
- [ ] Add security headers
- [ ] Implement error standardization

### Week 2 (Performance)
- [ ] Add lazy loading for Pricing
- [ ] Add Web Vitals monitoring
- [ ] Setup Google Analytics
- [ ] Add structured data

### Week 3 (Enhancement)
- [ ] Implement token refresh
- [ ] Add image optimization
- [ ] Setup error tracking (Sentry)
- [ ] Add performance monitoring

### Week 4 (Testing)
- [ ] Unit tests for utilities
- [ ] E2E tests for auth flow
- [ ] Performance testing
- [ ] Security audit

---

## Testing Commands

```bash
# Run type checking
npm run type-check

# Build for production
npm run build

# Start production server
npm start

# Run with debug logs
DEBUG=* npm run dev

# Check bundle size
npm run analyze
```

---

## Deployment Checklist

```bash
# Before deploying to production:
npm run lint
npm run type-check
npm run build

# Test production build locally
npm start

# Check for console errors/warnings
# Check for performance issues
# Verify all links work
# Test on mobile devices
```

---

## Common Issues & Solutions

### Rate Limit Not Working
- Check UPSTASH_REDIS_REST_URL is set
- Verify Redis token is valid
- Check request IP header

### Validation Errors
- Ensure Zod schema matches API requirements
- Test with curl: `curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"instu_id":"test","username":"test","password":"password123"}'`

### Performance Issues
- Run Lighthouse audit
- Check network tab for large assets
- Monitor Core Web Vitals

---

## Next Steps

1. **Implement Rate Limiting** (1-2 hours)
2. **Add Input Validation** (1 hour)
3. **Setup Security Headers** (30 mins)
4. **Add Error Standardization** (1 hour)
5. **Implement Lazy Loading** (30 mins)
6. **Setup Monitoring** (1-2 hours)

**Total Time:** ~6-7 hours for all implementations

---

## Support Resources

- Upstash Redis: https://upstash.com/docs
- Zod Validation: https://zod.dev
- Next.js Middleware: https://nextjs.org/docs/advanced-features/middleware
- Web Vitals: https://web.dev/vitals
- OWASP: https://owasp.org/www-project-top-ten/
