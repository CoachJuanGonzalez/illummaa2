# ILLUMMAA Modular Homes Website

## Overview
ILLUMMAA is a B2B lead generation website for modular homes, targeting Canadian developers and builders. Its core purpose is to qualify prospects, nurture leads, and drive business growth through an assessment-based funnel. The project aims to generate 15+ qualified Canadian developer inquiries monthly with an 80% lead quality rate, focusing on developers managing 50-500+ units with projects valued at $5M+. The business vision is to become a primary source for modular home solutions in the Canadian market, leveraging an efficient digital platform to connect with high-value clients.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Frameworks**: React 18 with TypeScript, Vite for building.
- **Styling**: Tailwind CSS with shadcn/ui components for a blend of "Tesla industrial confidence" and "Apple sophistication."
- **Routing**: Wouter for client-side navigation.
- **Form Management**: React Hook Form with Zod validation.
- **State Management**: TanStack Query for server state.
- **Design System**: Mobile-first, responsive design with CSS custom properties for theming, ILLUMMAA's brand palette (green, eco-green, sky-blue, sand-beige), and Google Fonts.
- **Lead Generation UI**: Multi-step assessment form with progressive profiling and high-quality floor plan integration via a `FloorPlanViewer` component.
- **Conversion Optimization**: Includes sticky CTA buttons and optimized section ordering based on conversion psychology.

### Backend
- **Framework**: Express.js with TypeScript.
- **API Design**: RESTful API for assessment submissions.
- **Security Middleware**: CORS, Helmet for security headers, and rate limiting.
- **Input Security**: Input sanitization using DOMPurify and Zod schemas.
- **Lead Qualification**: A priority scoring system (0-150 points) based on project details, with a minimum threshold of 50+ units for developer leads.
- **Phone Number Validation**: Robust E.164 validation supporting 249+ countries, ensuring accurate international phone number handling.

### Database
- **ORM**: Drizzle ORM for PostgreSQL.
- **Design**: Schema-first approach with a dedicated assessment submissions table.
- **Migrations**: `drizzle-kit` for database versioning.

### Security
- **Headers**: Helmet.js for security headers and Content Security Policy (CSP).
- **Rate Limiting**: 100 requests per 15 minutes per IP.
- **CORS**: Configured with environment-specific origins.
- **XSS Prevention**: DOMPurify for input sanitization.
- **Validation**: Comprehensive Zod schemas for all form data.

### Lead Generation System
- **Process**: Utilizes a multi-step assessment form.
- **Scoring**: Employs an algorithm based on project size, budget, and timeline.
- **Qualification**: Strict thresholds, requiring a minimum of 50 units for developer track leads.
- **Floor Plans**: Displays high-quality floor plans (images) on model pages via a `FloorPlanViewer` component.

### GoHighLevel (GHL) Workflow Triggers
- **Strategy**: All residential leads are routed directly to ILLUMMAA, with no external referrals.
- **Lead Tiers**: Leads are categorized into Explorer, Starter, and Partnership tiers, each with specific assignment teams (Education, Residential Specialist, Partnership) and Service Level Agreements (SLAs).

## External Dependencies

### Third-Party Services
- **GoHighLevel CRM**: Used for lead management, nurturing, and webhook-based lead submission.
- **Government program databases**: Integrated for assessing funding program compatibility.

### Cloud Infrastructure
- **Neon Database**: Provides serverless PostgreSQL hosting.
- **Replit**: Serves as the development and hosting environment.

### Analytics and Monitoring
- **Google Analytics**: For website traffic and user behavior analysis.
- **Conversion tracking**: To monitor qualified conversion rates.
- **Lead quality scoring**: For automated priority assignment of leads.
- **Form analytics**: Used for optimizing user experience and tracking abandonment.