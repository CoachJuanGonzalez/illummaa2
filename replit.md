# ILLUMMAA Modular Homes Website

## Overview

ILLUMMAA is a revenue-generating B2B lead generation website for modular homes targeting Canadian developers and builders. The application is designed to qualify prospects, nurture leads, and drive business growth through an assessment-based funnel system. The primary goal is to generate 15+ qualified Canadian developer inquiries per month with an 80% lead quality rate, focusing on developers managing 50-500+ units with $5M+ projects.

## Current Status

**✅ Successfully imported and configured for Replit environment**
- Application running on port 5000 with proper host configuration
- Frontend and backend integrated with Vite development server
- All dependencies installed and npm scripts configured
- Deployment configuration set up for production

## Recent Changes

### 2025-10-01 - Health Score 100/100 Optimization
- **TypeScript Compilation Fix**: Added `"target": "ES2020"` to tsconfig.json
  - Resolved TS1501 error for regex `/gis` flag in security.ts
  - Enables modern JavaScript features and regex capabilities
  - Fully compatible with existing codebase and modern browsers
- **Production Console.log Safety**: Wrapped all 30 console.log statements with development checks
  - Files optimized: assessment-form.tsx (11), storage.ts (7), routes.ts (12)
  - Development: All debug logs remain functional for troubleshooting
  - Production: Zero console output, preventing information leakage
  - Pattern used: `if (process.env.NODE_ENV === 'development') { console.log(...) }`
- **Zero Breaking Changes**: All Phase 1 optimizations intact, application functioning normally
- **Architect Verified**: No regressions detected, security measures preserved

### 2025-09-30 - Phase 1 Backend Optimization (GHL Webhook Enhancement)
- **Database Schema Expansion**: Added three critical fields for enhanced lead processing
  - `buildCanadaEligible` (text): Tracks Build Canada funding program eligibility
  - `consentSMS` (boolean, default false): CASL-compliant SMS consent tracking
  - `marketingConsent` (boolean, default false): Additional marketing consent layer
- **Tag Generation Optimization**: Streamlined from 40+ tags to maximum 12 high-value tags
  - Preserved function signature (3 parameters) for backward compatibility
  - Removed legacy tags: optimized-tags, agent-yes, no-agent, over-budget tags
  - Added new consent tags: CASL-Compliant, SMS-Opted-In, Marketing-Opted-In
  - Enhanced government program tagging: government-active, government-priority
- **Webhook Payload Cleanup**: Reduced redundancy while maintaining all essential routing data
  - Removed: customer_tags (kept tags_array only), assigned_to, submission_timestamp
  - Added: a2p_campaign_id for 10DLC compliance
  - Kept: priority_level (retained for Phase 1, will be removed in Phase 2)
  - Enhanced consent tracking: Separate timestamps for CASL, SMS, and marketing consent
- **Security Posture**: All existing security measures preserved (sanitization, rate limiting, payload size validation)
- **Non-Breaking Implementation**: All changes architect-verified with no observed regressions
- **Next Actions**: Populate A2P_CAMPAIGN_ID environment variable; monitor consent flags and tag counts post-deployment

### 2025-09-30 - 2BR Family Floor Plan Integration
- **High-Quality Floor Plan Added**: Successfully integrated "2 BEDROOM PLAN.pdf" into 2BR Family model page
  - Converted PDF to high-quality JPG image at 300 DPI (1400x1812 pixels)
  - Added Technical Floor Plan section matching 3BR Executive layout pattern
  - Image displays crisp lines without bold appearance or conversion artifacts
  - Clickable floor plan opens original PDF in new tab for detailed viewing
  - Integrated floor plan into FloorPlanViewer component for Floor Plans & Specifications section
- **Browser Compatibility**: Image-based approach avoids Chrome Content Security Policy blocking
- **Consistent Implementation**: Follows same pattern as 1BR Compact and 3BR Executive pages

### 2025-09-30 - 1BR Compact PDF Floor Plan Integration (Browser-Safe Implementation)
- **PDF Display Implementation**: Successfully integrated "1 BEDROOM 1.5 BATH.pdf" into 1BR Compact model page
  - Added Technical Floor Plan section with clickable card that opens PDF in new tab
  - Integrated PDF into Floor Plans & Specifications section via FloorPlanViewer component
  - Updated bathroom count from "1" to "1.5" to match PDF specifications
- **Browser Compatibility Fix**: Replaced iframe approach with clickable link to prevent browser blocking
  - Removed all iframe implementations that were causing Chrome/Safari security blocks
  - Implemented elegant clickable card UI with gradient background and hover effects
  - PDF opens in new tab when clicked, ensuring compatibility with all browsers
  - No iframe security restrictions or Content Security Policy issues
- **Server Configuration**: Fixed static file serving
  - Added Express static file serving for `/attached_assets` directory
  - Fixed PDF file permissions (644) for proper web server access
  - Updated route imports to include express module
- **Component Enhancement**: FloorPlanViewer now supports both image files and PDF links with appropriate UI for each type

### 2025-09-30 - Binary Government Programs Implementation
- **Government Programs Simplified**: Transformed 5-option dropdown to strategic binary choice
  - "Participating in government programs" (+20 points)
  - "Not participating" (0 points)
- **Backward Compatibility**: Legacy values auto-convert to "Not participating" via normalization
- **Enhanced Tagging**: Binary system adds "government-active", "government-priority" tags for participants
- **Scoring Unchanged**: Same +20 points for participation, improved logging for transparency

### 2025-09-29 - Security & UX Enhancements
- **Security Audit Complete**: Enhanced XSS protection across all form fields with event handler removal
- **Company Name Field**: Increased limit to 250 characters for long B2B names while preserving space handling
- **Project Description Restored**: Added missing textarea field to Step 3 with 1000-char limit and character counter
- **Form Security**: All fields now have equal protection (HTML tag removal, JS injection blocking, event handler stripping)

### 2025-09-27 - Replit Environment Setup
- Fixed npm scripts to use `npx tsx` for proper TypeScript execution
- Configured workflow to serve application on port 5000 with webview output
- Verified Vite server configuration includes `allowedHosts: true` for Replit proxy
- Set up autoscale deployment configuration for production builds
- Confirmed application loads successfully with proper hero section and navigation

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server for fast hot reloading
- **Tailwind CSS** with shadcn/ui components for consistent, modern styling
- **Wouter** for client-side routing (lightweight React Router alternative)
- **React Hook Form** with Zod validation for form handling and data validation
- **TanStack Query** for server state management and API calls
- **Component-based architecture** with reusable UI components in `/client/src/components/ui/`

### Backend Architecture
- **Express.js** server with TypeScript for API endpoints
- **RESTful API design** with dedicated routes for assessment submissions
- **Middleware stack** including CORS, Helmet for security, and rate limiting
- **Form validation and sanitization** using DOMPurify and Zod schemas
- **Memory storage** with interface design for easy database integration
- **Priority scoring system** for lead qualification (0-150 points)

### Database Layer
- **Drizzle ORM** configured for PostgreSQL with type-safe database operations
- **Schema-first approach** with assessment submissions table design
- **Migration system** using drizzle-kit for database versioning
- **Neon Database** integration for serverless PostgreSQL hosting

### Security Implementation
- **Helmet.js** for security headers and Content Security Policy
- **Rate limiting** (100 requests per 15 minutes per IP)
- **CORS configuration** with environment-specific origins
- **Input sanitization** using DOMPurify for XSS prevention
- **Form validation** with comprehensive Zod schemas

### Lead Generation System
- **Multi-step assessment form** with progressive profiling
- **Priority scoring algorithm** based on project size, budget, and timeline
- **Lead qualification thresholds** (50+ units minimum for developer track)
- **Form abandonment prevention** with step-by-step progress tracking

### Styling and Design System
- **Design tokens** with CSS custom properties for consistent theming
- **Responsive design** with mobile-first approach
- **shadcn/ui component library** for accessible, customizable UI components
- **Brand-specific color palette** (ILLUMMAA primary green, eco-green, sky-blue, sand-beige)
- **Tesla industrial confidence × Apple sophistication** design aesthetic

## External Dependencies

### Third-Party Services
- **GoHighLevel CRM** integration for lead management and nurturing
- **Webhook-based lead submission** to external CRM systems
- **Government program databases** for funding program compatibility

### Cloud Infrastructure
- **Neon Database** for PostgreSQL hosting and management
- **Replit** development and hosting environment
- **Environment-based configuration** for development and production deployments

### Analytics and Monitoring
- **Conversion tracking** for 3% qualified conversion rate targets
- **Lead quality scoring** and automated priority assignment
- **Form analytics** for optimization and abandonment tracking

### Email and Communication
- **Multi-touch email automation** sequences for lead nurturing
- **Assessment result delivery** and follow-up communications
- **Developer-specific messaging** based on qualification tier

### STEP 7: Updated GHL Workflow Triggers (ILLUMMAA-Only Routing)
- **Complete Remax elimination** - All residential leads now stay with ILLUMMAA teams
- **Unified ILLUMMAA pathways** - No external referrals until after ILLUMMAA consultation

#### Tier 0 - Explorer Leads (Researching/Education Phase)
- **Assign to:** ILLUMMAA Education Team
- **Workflow:** Educational nurturing sequence
- **Response SLA:** 48 hours
- **Focus:** Learning resources, not sales
- **Pathway:** illummaa_education
- **Trigger conditions:** readiness="researching" OR projectUnitCount=0

#### Tier 1 - Starter Leads (Under 50 Units)
- **Assign to:** ILLUMMAA Residential Specialist
- **Workflow:** Residential project development
- **Response SLA:** 24 hours
- **Focus:** Project planning and development
- **Pathway:** illummaa_residential
- **Trigger conditions:** projectUnitCount < 50 AND readiness != "researching"

#### Tier 2+ - Partnership Leads (50+ Units)
- **Assign to:** ILLUMMAA Partnership Team
- **Workflow:** Commercial partnership development
- **Response SLA:** 12 hours (Pioneer), 6 hours (Preferred), 2 hours (Elite)
- **Focus:** B2B partnership and large-scale project development
- **Pathway:** illummaa_partnership
- **Critical flags:** illummaaOnly="TRUE", noExternalReferrals="TRUE"

### Font and Asset Delivery
- **Google Fonts** integration (Inter, Montserrat, Architects Daughter, DM Sans, Fira Code, Geist Mono)
- **Unsplash images** for hero sections and showcase content
- **Custom SVG logo** and iconography system