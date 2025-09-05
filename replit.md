# ILLÜMMAA Modular Homes Website

## Overview

ILLÜMMAA is a revenue-generating B2B lead generation website for modular homes targeting Canadian developers and builders. The application is designed to qualify prospects, nurture leads, and drive business growth through an assessment-based funnel system. The primary goal is to generate 15+ qualified Canadian developer inquiries per month with an 80% lead quality rate, focusing on developers managing 50-500+ units with $5M+ projects.

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
- **Brand-specific color palette** (ILLÜMMAA primary green, eco-green, sky-blue, sand-beige)
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

### Font and Asset Delivery
- **Google Fonts** integration (Inter, Montserrat, Architects Daughter, DM Sans, Fira Code, Geist Mono)
- **Unsplash images** for hero sections and showcase content
- **Custom SVG logo** and iconography system