# ILLUMMAA Modular Homes Website

## Overview
ILLUMMAA is a revenue-generating B2B lead generation website for modular homes, targeting Canadian developers and builders. Its primary purpose is to qualify prospects, nurture leads, and drive business growth through an assessment-based funnel system. The project aims to generate 15+ qualified Canadian developer inquiries monthly with an 80% lead quality rate, focusing on developers managing 50-500+ units with projects valued at $5M+. The website aims to blend "Tesla industrial confidence" with "Apple sophistication" in its design and user experience.

## Recent Changes (October 10, 2025)
- **Hybrid Duplicate Prevention System**: Implemented session-based tracking for unknown IPs to prevent spam while maintaining accessibility. Known IPs use 24-hour IP blocking, unknown IPs (VPNs, mobile networks) use 8-hour session blocking. Production-ready with architect approval.
- **Enhanced Mobile Focus States**: Added 150+ lines of accessibility CSS (lines 2632-2778) with enhanced focus rings (3px desktop, 4px mobile), high contrast mode support, and reduced motion compatibility.
- **Image Flash Fix**: Removed redundant Unsplash background-image causing visual flash before hero section loads.

## Previous Changes (October 9, 2025)
- **Favicon Implementation**: Created professional multi-format favicon suite using ILLUMMAA "ü" logo with primary green background. Includes standard favicons (ICO, PNG in 6 sizes), Apple Touch Icon, and PWA manifest with theme color configuration.
- **Security Fix**: Removed duplicate X-Frame-Options meta tag from HTML (already configured in Helmet middleware), eliminating browser console warning.
- **Leadership Team Updates**: Restructured team with updated names, titles, and categories (9 executives total).

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Frameworks**: React 18 with TypeScript, Vite for building.
- **Styling**: Tailwind CSS with shadcn/ui components.
- **Routing**: Wouter for client-side navigation.
- **Form Management**: React Hook Form with Zod validation.
- **State Management**: TanStack Query for server state.
- **Design Aesthetic**: Blends "Tesla industrial confidence" with "Apple sophistication."

### Backend
- **Framework**: Express.js with TypeScript.
- **API Design**: RESTful API for assessment submissions.
- **Middleware**: CORS, Helmet for security, and rate limiting.
- **Security**: Input sanitization using DOMPurify and Zod schemas.
- **Lead Qualification**: Priority scoring system (0-150 points) based on project details, with a minimum of 50 units for developer track.
- **Webhook Reliability**: Exponential backoff retry system for GoHighLevel webhook deliveries (3 attempts: 0s, 5s, 30s delays). Only retries on non-200 responses to prevent duplicates.

### Database
- **ORM**: Drizzle ORM for PostgreSQL.
- **Design**: Schema-first approach with a dedicated assessment submissions table.
- **Migrations**: drizzle-kit for database versioning.

### Security
- **Headers**: Helmet.js for security headers and Content Security Policy.
- **Rate Limiting**: Multi-tier protection with 4 layers:
  - API-wide: 5,000 req/15min (production), 10,000 (dev)
  - Form submission: 200 req/10min with SMS consent limiter (100 req/5min)
  - CSRF token: 20 req/minute
  - Health check: 10 req/minute
- **Duplicate Prevention**: Hybrid IP + Session tracking system:
  - Known IPs: 24-hour blocking per IP address
  - Unknown IPs (VPNs, mobile): 8-hour blocking per session (30s in dev)
  - Automatic cleanup every 6 hours
- **CORS**: Configured with environment-specific origins.
- **XSS Prevention**: DOMPurify for input sanitization.
- **Validation**: Comprehensive Zod schemas for form data.
- **Brute Force Protection**: 3 attempts then temporary lockout.

### Lead Generation System
- **Process**: Multi-step assessment form with progressive profiling.
- **Scoring**: Algorithm based on project size, budget, and timeline (accepts 1-1,000,000 units).
- **Floor Plans**: Integration of high-quality floor plans (PDFs and images) into model pages with a `FloorPlanViewer` component.
- **GoHighLevel (GHL) Workflow Triggers**: Elimination of external referrals; all residential leads stay with ILLUMMAA. Lead tiers (Explorer, Starter, Partnership) with specific team assignments and SLA.
- **UX Optimization**: Section order optimized for conversion psychology, and a sticky "Apply Now" CTA button for zero-friction conversion.

### Styling and Design System
- **Theming**: CSS custom properties for design tokens.
- **Responsiveness**: Mobile-first design approach with comprehensive device support (320px to 2560px+).
- **Components**: shadcn/ui library for accessible UI.
- **Branding**: ILLUMMAA primary green, eco-green, sky-blue, sand-beige palette.
- **Fonts**: Google Fonts (Inter, Montserrat, Architects Daughter, DM Sans, Fira Code, Geist Mono).
- **Assets**: Unsplash images, custom SVG logo and iconography.
- **Favicon**: Professional multi-format favicon suite with ILLUMMAA "ü" logo on primary green background (#10b981). Includes ICO, PNG (16x16, 32x32, 48x48, 192x192, 512x512), Apple Touch Icon (180x180), and PWA manifest for comprehensive device support.
- **Design Philosophy**: Modern frameless UI with subtle elevation, no heavy shadows or borders.
- **Device Coverage**: 
  - Extra Small Mobile (320px-374px): iPhone SE, older Android
  - Small Mobile (375px-639px): iPhone 12/13/14, modern Android
  - Tablet (768px-1023px): iPad, tablet landscape
  - Desktop (1024px-1919px): Standard displays
  - Large Display (1920px+): 4K monitors
  - Ultra-Wide (2560px+): Ultra-wide displays
  - Foldable Devices: Galaxy Z Fold, Surface Duo
- **Accessibility**: WCAG AA compliance, touch-friendly (48px minimum targets), keyboard navigation support.
- **Performance**: GPU acceleration, smooth scrolling, optimized for Retina/HiDPI displays.
- **Future-Proof**: Container queries, aspect ratio locks, legacy browser fallbacks (Flexbox for no-grid support).

## External Dependencies

### Third-Party Services
- **GoHighLevel CRM**: For lead management, nurturing, and webhook-based lead submission.
- **Government program databases**: For funding program compatibility.

### Cloud Infrastructure
- **Neon Database**: For serverless PostgreSQL hosting.
- **Replit**: Development and hosting environment.

### Analytics and Monitoring
- **Google Analytics**: For tracking and analytics.
- **Conversion tracking**: For qualified conversion rate targets.
- **Lead quality scoring**: Automated priority assignment.
- **Form analytics**: For optimization and abandonment tracking.

### Email and Communication
- **Multi-touch email automation**: For lead nurturing.
- **Assessment result delivery**: And follow-up communications.
- **Developer-specific messaging**: Based on qualification tier.

## Replit Environment Setup

### Current Configuration (October 3, 2025)
- **Storage**: PostgreSQL database (Neon-backed) via Replit's built-in database
- **Port**: Application runs on port 5000 (both frontend and backend on same port)
- **Host**: Server binds to 0.0.0.0 to work with Replit's proxy
- **Vite Configuration**: `allowedHosts: true` configured for Replit iframe preview
- **Workflow**: "Start application" runs `npm run dev` and waits for port 5000 with webview output
- **Deployment**: Configured for autoscale deployment with `npm run build` and `npm start`
- **Database Schema**: Pushed to PostgreSQL using `npm run db:push`

### Development
- Run `npm run dev` to start the development server
- The Vite dev server and Express backend are integrated on the same port
- Hot Module Replacement (HMR) is enabled for instant updates

### Production Build
- `npm run build` - Builds both frontend (Vite) and backend (esbuild)
- `npm start` - Runs the production server from dist/index.js