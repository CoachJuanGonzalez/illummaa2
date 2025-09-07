import type { Express } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import ExpressBrute from "express-brute";
import helmet from "helmet";
import cors from "cors";
import validator from "validator";
import { z } from "zod";
import { validateFormData, submitToGoHighLevel, submitToGoHighLevelResidential } from "./storage";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Enterprise Security Configuration v13.2
  
  // Enhanced Helmet security headers with comprehensive CSP
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "https://images.unsplash.com", "data:", "blob:"],
        connectSrc: ["'self'", "https://services.leadconnectorhq.com"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: []
      }
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    noSniff: true,
    frameguard: { action: 'deny' },
    xssFilter: true
  }));
  
  // Enhanced CORS Configuration with security features
  app.use(cors({
    origin: (origin, callback) => {
      const allowedOrigins = process.env.NODE_ENV === 'production' 
        ? ['https://illummaa.com', /\.replit\.app$/, /\.replit\.dev$/]
        : [true];
      
      if (process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      
      if (!origin || allowedOrigins.some(allowed => 
        typeof allowed === 'string' ? allowed === origin :
        allowed instanceof RegExp ? allowed.test(origin) : allowed
      )) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    maxAge: 86400, // 24 hours
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining']
  }));
  
  // Brute force protection for sensitive endpoints
  const store = new ExpressBrute.MemoryStore();
  const bruteforce = new ExpressBrute(store, {
    freeRetries: 3,
    minWait: 5 * 60 * 1000, // 5 minutes
    maxWait: 60 * 60 * 1000, // 1 hour
    failCallback: (req: any, res: any) => {
      res.status(429).json({
        error: 'Too many failed attempts',
        message: 'Please try again later',
        retryAfter: '5 minutes'
      });
    }
  });
  
  // Multi-tier rate limiting
  const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'development' ? 1000 : 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: { 
      error: "Rate limit exceeded", 
      message: "Too many requests from this IP, please try again later.",
      retryAfter: '15 minutes'
    },
    // Use default key generator which properly handles IPv6
    keyGenerator: undefined
  });
  
  // Slow down repeated requests
  const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: process.env.NODE_ENV === 'development' ? 100 : 10,
    delayMs: () => 500, // 500ms delay per request after threshold
    maxDelayMs: 20000, // Maximum delay of 20 seconds
  });
  
  // Apply security middleware
  app.use('/api', strictLimiter);
  app.use('/api', speedLimiter);
  
  // Input validation middleware for all API routes
  app.use('/api', (req, res, next) => {
    // Security headers for API responses
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    });
    
    // Validate Content-Type for POST requests
    if (req.method === 'POST' && !req.is('application/json')) {
      return res.status(400).json({
        error: 'Invalid content type',
        message: 'Content-Type must be application/json'
      });
    }
    
    // Basic input sanitization
    if (req.body && typeof req.body === 'object') {
      sanitizeObject(req.body);
    }
    
    next();
  });
  
  // Utility functions for input validation and sanitization
  function sanitizeObject(obj: any): void {
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && typeof obj[key] === 'string') {
        // Light sanitization - only trim whitespace and limit length
        // Don't escape HTML entities as it breaks enum validation
        obj[key] = obj[key].trim();
        // Limit string length to prevent DoS
        if (obj[key].length > 10000) {
          obj[key] = obj[key].substring(0, 10000);
        }
        // Only remove potentially dangerous patterns
        if (obj[key].includes('<script') || obj[key].includes('javascript:')) {
          obj[key] = obj[key].replace(/<script[^>]*>.*?<\/script>/gi, '');
          obj[key] = obj[key].replace(/javascript:/gi, '');
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  }
  
  function validateInput(body: any): string[] {
    const errors: string[] = [];
    
    // Basic validation - let the main validation handle detailed checks
    // Only check for obvious malicious patterns
    const dangerousPatterns = [
      /<script[^>]*>/i,
      /javascript:/i,
      /on\w+\s*=/i, // event handlers like onclick=
      /<iframe/i,
      /<object/i,
      /<embed/i
    ];
    
    function containsDangerousContent(value: string): boolean {
      return dangerousPatterns.some(pattern => pattern.test(value));
    }
    
    // Check all string values for dangerous content
    for (const key in body) {
      if (typeof body[key] === 'string' && containsDangerousContent(body[key])) {
        errors.push(`Invalid content detected in ${key}`);
      }
    }
    
    return errors;
  }

  // Assessment submission endpoint with enhanced security
  app.post("/api/submit-assessment", bruteforce.prevent, async (req, res) => {
    const requestStart = Date.now();
    
    // Enhanced request logging for security monitoring
    console.log(`[SECURITY] Assessment submission attempt from IP: ${req.ip}, User-Agent: ${req.get('User-Agent')?.substring(0, 100)}`);
    try {
      // Enhanced validation and sanitization
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
          error: 'Empty request body',
          message: 'Request body cannot be empty'
        });
      }
      
      // Additional input validation
      const validationErrors = validateInput(req.body);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          error: 'Input validation failed',
          details: validationErrors
        });
      }
      
      // Validate and sanitize form data
      const { isValid, data, errors, priorityScore } = await validateFormData(req.body);
      
      if (!isValid) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: errors 
        });
      }

      // Check for under 50 units rejection
      if (data && data.projectUnitCount < 50) {
        return res.status(400).json({
          error: "Project does not meet minimum requirements",
          message: "Projects under 50 units are handled through our residential program. Please contact our residential team."
        });
      }

      // Store in database (data is guaranteed to exist here due to validation)
      const submission = await storage.createAssessment({
        ...data!,
        priorityScore: priorityScore!
      });

      // Submit to GoHighLevel webhook with retry logic
      try {
        await submitToGoHighLevel(data!, priorityScore!);
      } catch (webhookError) {
        console.error("GoHighLevel webhook failed:", webhookError);
        // Don't fail the request if webhook fails, but log it
      }

      res.json({
        success: true,
        submissionId: submission.id,
        priorityScore,
        message: getPriorityMessage(priorityScore!)
      });

    } catch (error) {
      const duration = Date.now() - requestStart;
      console.error(`[SECURITY] Assessment submission error from IP ${req.ip} after ${duration}ms:`, error);
      
      // Don't expose internal error details in production
      const errorMessage = process.env.NODE_ENV === 'development' 
        ? (error as Error).message 
        : 'Please try again later';
        
      res.status(500).json({
        error: "Internal server error",
        message: errorMessage,
        requestId: Date.now().toString(36)
      });
    }
  });

  // Residential endpoint following exact TypeScript patterns
  app.post("/api/submit-residential", bruteforce.prevent, async (req, res) => {
    try {
      // Residential-specific Zod validation schema
      const residentialSchema = z.object({
        first_name: z.string().min(1, "First name required"),
        last_name: z.string().min(1, "Last name required"), 
        email: z.string().email("Valid email required"),
        phone: z.string().min(10, "Valid phone number required"),
        company: z.string().min(1, "Company name required"),
        source: z.string(),
        project_unit_count: z.number().min(1).max(49),
        construction_province: z.string().min(1, "Province required"),
        project_description: z.string().optional(),
        residential_pathway: z.string(),
        lead_type: z.string(),
        submission_timestamp: z.string()
      });

      // Validate incoming data using Zod
      const validationResult = residentialSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          errors: validationResult.error.errors
        });
      }

      const data = validationResult.data;
      
      // Store in database (using same pattern as B2B)
      const submission = await storage.createResidentialAssessment(data);
      
      // Submit to GoHighLevel residential webhook  
      await submitToGoHighLevelResidential(data);
      
      res.json({ 
        success: true, 
        submissionId: submission.id,
        message: 'Residential inquiry submitted successfully'
      });
      
    } catch (error) {
      console.error('Residential submission error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error processing residential inquiry' 
      });
    }
  });
  
  // Health check endpoint (minimal exposure)
  app.get('/api/health', rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
  }), (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}

function getPriorityMessage(score: number): string {
  if (score >= 100) {
    return "PRIORITY PROJECT: Senior Sales Manager will contact within 1 hour";
  } else if (score >= 50) {
    return "QUALIFIED PROJECT: Sales Representative will contact within 4 hours";
  } else {
    return "FUTURE OPPORTUNITY: Lead Development team will contact within 24 hours";
  }
}
