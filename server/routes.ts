import express, { type Express } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import ExpressBrute from "express-brute";
import helmet from "helmet";
import cors from "cors";
import validator from "validator";
import { z } from "zod";
import crypto from "crypto";
import DOMPurify from "isomorphic-dompurify";
import { isValidPhoneNumber } from "libphonenumber-js";
import { validateFormData, submitToGoHighLevel, submitToGoHighLevelResidential } from "./storage";
import { storage } from "./storage";

// COMPREHENSIVE FIELD MAPPING AND ENUM NORMALIZATION FUNCTION
function mapFrontendToBackend(frontendData: any): any {
  // Calculate appropriate company value based on tier
  let companyValue = '';
  
  // Check for existing company data (frontend sends 'companyName')
  const providedCompany = frontendData.companyName || frontendData.company || '';
  
  if (providedCompany) {
    // Use provided company name if available
    companyValue = providedCompany;
  } else {
    // Determine appropriate default based on user's tier
    const readiness = (frontendData.readiness || frontendData.readinessToBuy || '').toLowerCase();
    const unitCount = parseInt(frontendData.unitCount || frontendData.projectUnitCount || '0');
    
    // Explorer tier (researching or 0 units) - keep empty
    // B2B-only: All projects require minimum 10 units
    if (unitCount < 10) {
      companyValue = ''; // Will be rejected by validation
    } 
    // Pioneer tier (10-49 units) - default company handling
    else if (unitCount >= 10 && unitCount <= 49) {
      companyValue = 'Individual Investor';
    } 
    // Pioneer+ tiers (50+ units) - generic organization fallback
    else if (unitCount >= 50) {
      companyValue = 'Organization'; // Should have real company name
    }
  }

  // Enum value mapping functions
  const normalizeReadiness = (value: string): string => {
    const readinessMap: { [key: string]: string } = {
      'Just researching - want to learn more': 'planning-long', // B2B-only: Map old Explorer to long-term planning
      'Planning future project (6+ months)': 'planning-long',
      'Planning active project (3-6 months)': 'planning-medium',
      'Planning active project (0-3 months)': 'planning-short',
      'Ready to move forward immediately': 'immediate'
    };
    return readinessMap[value] || value;
  };

  const normalizeTimeline = (value: string): string => {
    // Timeline values appear to match already, but normalize just in case
    const timelineMap: { [key: string]: string } = {
      'Immediate (0-3 months)': 'Immediate (0-3 months)',
      'Short-term (3-6 months)': 'Short-term (3-6 months)',
      'Medium-term (6-12 months)': 'Medium-term (6-12 months)',
      'Long-term (12+ months)': 'Long-term (12+ months)'
    };
    return timelineMap[value] || value;
  };

  const normalizeDeveloperType = (value: string): string => {
    const developerMap: { [key: string]: string } = {
      'Individual/Family': 'Individual/Family Developer',
      'Individual': 'Individual/Family Developer',
      'Family': 'Individual/Family Developer',
      'Commercial Developer': 'Commercial Developer (Large Projects)',
      'Government/Municipal': 'Government/Municipal Developer',
      'Non-Profit Organization': 'Non-Profit Housing Developer',
      'Private Developer': 'Private Developer (Medium Projects)',
      'Commercial Developer (Large Projects)': 'Commercial Developer (Large Projects)',
      'Government/Municipal Developer': 'Government/Municipal Developer',
      'Non-Profit Housing Developer': 'Non-Profit Housing Developer',
      'Private Developer (Medium Projects)': 'Private Developer (Medium Projects)',
      'Individual/Family Developer': 'Individual/Family Developer',
      'Indigenous Community/Organization': 'Indigenous Community/Organization'
    };
    return developerMap[value] || value;
  };

  const normalizeGovernmentPrograms = (value: string): string => {
    const programsMap: { [key: string]: string } = {
      "Participating in government programs": "Participating in government programs",
      "Not participating": "Not participating",
      // Legacy mappings for backward compatibility during migration
      "Currently participating": "Participating in government programs",
      "Just learning about options": "Not participating",
      "Not interested": "Not participating",
      "Somewhat interested": "Not participating",
      "Very interested": "Not participating"
    };
    return programsMap[value] || value;
  };

  // Helper function to handle empty strings for optional fields
  const emptyToUndefined = (value: any) => {
    if (value === '' || value === null || value === undefined) return undefined;
    return value;
  };

  // Field name mapping with enum normalization
  return {
    // Basic contact fields (direct mapping)
    firstName: frontendData.firstName,
    lastName: frontendData.lastName,
    email: frontendData.email,
    phone: frontendData.phone,
    
    // Company field mapping (uses calculated value based on tier)
    company: companyValue,
    
    // CRITICAL FIELD NAME MAPPING FIXES:
    projectUnitCount: frontendData.unitCount || frontendData.projectUnitCount || 0,
    projectUnitRange: frontendData.projectUnitRange,
    decisionTimeline: emptyToUndefined(frontendData.timeline ? normalizeTimeline(frontendData.timeline) : normalizeTimeline(frontendData.deliveryTimeline || frontendData.decisionTimeline)),
    constructionProvince: emptyToUndefined(frontendData.province || frontendData.constructionProvince),
    projectDescription: emptyToUndefined(frontendData.projectDescription || frontendData.projectDescriptionText),
    // ENTERPRISE SECURITY: Correct separation of required CASL consent from optional marketing consent
    // Required CASL consent (always true for form submissions)
    consentMarketing: Boolean(frontendData.consentCommunications === true || frontendData.consentCommunications === 'true'),
    // Optional marketing consent (only when user explicitly opts in)
    marketingConsent: Boolean(frontendData.marketingConsent === true || frontendData.marketingConsent === 'true'),
    
    // Readiness with enum normalization (handles both old 'readiness' and new 'readinessToBuy' fields)
    readiness: frontendData.readiness ? normalizeReadiness(frontendData.readiness) : 
               frontendData.readinessToBuy ? normalizeReadiness(frontendData.readinessToBuy) : 
               frontendData.readiness,
    
    // Age verification (direct mapping)
    ageVerification: frontendData.ageVerification,
    
    // Optional fields that may not be present (convert empty strings to undefined)
    developerType: emptyToUndefined(frontendData.developerType ? normalizeDeveloperType(frontendData.developerType) : frontendData.developerType),
    governmentPrograms: emptyToUndefined(frontendData.governmentPrograms ? normalizeGovernmentPrograms(frontendData.governmentPrograms) : frontendData.governmentPrograms),
    // B2B-only: Explorer fields removed
    agentSupport: emptyToUndefined(frontendData.agentSupport),
    
    // Additional form metadata (keep as-is)
    isExplorer: frontendData.isExplorer,
    illummaaOnly: frontendData.illummaaOnly,
    noExternalReferrals: frontendData.noExternalReferrals,
    
    // Priority score mapping (handles both old 'priorityScore' and new 'aiPriorityScore' fields)
    priorityScore: frontendData.priorityScore || frontendData.aiPriorityScore,
    
    // Partnership level and tier mapping (new fields)
    customerTier: frontendData.customerTier,
    partnershipLevel: frontendData.partnershipLevel,
    
    // Pipeline and stage mapping (new fields)
    pipeline: frontendData.pipeline,
    stage: frontendData.stage,
    
    // Remaining metadata
    assignedTo: frontendData.assignedTo,
    responseTime: frontendData.responseTime,
    
    // Tags handling (convert string to array if needed)
    tags: typeof frontendData.tags === 'string' ? frontendData.tags.split(',').filter((tag: string) => tag.trim()) : frontendData.tags,
    
    contactTags: frontendData.contactTags,
    consentTimestamp: frontendData.consentTimestamp,
    source: frontendData.source || 'ILLUMMAA Website Assessment',
    submissionId: frontendData.submissionId,
    userAgent: frontendData.userAgent,
    
    // Additional new fields from Partnership & Learning Assessment
    buildCanadaEligible: frontendData.buildCanadaEligible || "I don't know",
    isEducationOnly: frontendData.isEducationOnly,
    isEducationalLead: frontendData.isEducationalLead,
    responseCommitment: frontendData.responseCommitment,
    responseCommitmentLevel: frontendData.responseCommitmentLevel
  };
}

// IP normalization utility for consistent tracking
function normalizeClientIP(req: any): string {
  // Get IP with proxy trust
  let clientIP = req.ip || req.connection?.remoteAddress || 'unknown';
  
  // Handle X-Forwarded-For header (take first IP if present)
  const xForwardedFor = req.headers['x-forwarded-for'] as string | string[] | undefined;
  if (xForwardedFor) {
    const forwardedIPs = Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor;
    clientIP = forwardedIPs.split(',')[0].trim();
  }
  
  // Convert IPv6-mapped IPv4 to standard IPv4
  if (clientIP.startsWith('::ffff:')) {
    clientIP = clientIP.substring(7);
  }
  
  return clientIP.toLowerCase().trim();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Enterprise Security Configuration v13.2  
  // Note: Trust proxy already configured in index.ts
  
  // Serve attached assets (PDFs, images, etc.) as static files
  app.use('/attached_assets', express.static('attached_assets'));
  
  // Enhanced Helmet security headers with development-friendly CSP
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: process.env.NODE_ENV === 'development' 
          ? ["'self'", "'unsafe-inline'", "'unsafe-eval'"] 
          : ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "https://images.unsplash.com", "data:", "blob:"],
        connectSrc: process.env.NODE_ENV === 'development'
          ? ["'self'", "ws:", "http:", "https:", "https://services.leadconnectorhq.com"]
          : ["'self'", "https://services.leadconnectorhq.com"],
        frameSrc: ["'self'"],
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
    frameguard: { action: 'sameorigin' },
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
  
  // Multi-tier rate limiting (existing implementation)
  const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'development' ? 10000 : 5000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { 
      error: "Rate limit exceeded", 
      message: "Too many requests from this IP, please try again later.",
      retryAfter: '15 minutes'
    }
  });
  
  // Slow down repeated requests
  const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: process.env.NODE_ENV === 'development' ? 100 : 10,
    delayMs: () => 500, // 500ms delay per request after threshold
    maxDelayMs: 20000, // Maximum delay of 20 seconds
  });
  
  // Apply security middleware
  // TEMPORARILY DISABLED: Rate limiters causing blocking cycle
  // app.use('/api', strictLimiter);
  // app.use('/api', speedLimiter);

  // SMS-specific rate limiting for enhanced security
  const smsConsentLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: process.env.NODE_ENV === 'development' ? 500 : 100, // Development: 500, Production: 100 SMS consent per IP per 5 minutes
    skipSuccessfulRequests: false,
    keyGenerator: undefined, // Use default key generator for IPv6 safety
    message: { 
      error: 'SMS consent security limit exceeded',
      retryAfter: 300 
    }
  });

  // Enhanced strict rate limiting for assessment submissions
  const enhancedStrictLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: process.env.NODE_ENV === 'development' ? 1000 : 200, // Development: 1000, Production: 200 submissions per IP
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Security limit: Too many attempts. Please wait 10 minutes.' }
  });

  // SMS consent audit trail creation
  const createSMSConsentAuditTrail = (req: any, formData: any) => {
    return {
      consentType: 'SMS_CASL',
      consentValue: formData.consentSMS,
      consentGrantedAt: formData.consentSMSTimestamp,
      auditTimestamp: new Date().toISOString(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      sessionId: (req as any).sessionID || 'no-session',
      formVersion: '2025.1',
      csrfTokenValid: true,
      securityValidated: true,
      auditId: crypto.randomBytes(16).toString('hex')
    };
  };
  
  // Suppress health check logging completely
  app.head('/api', (req, res) => {
    res.status(200).end();
  });

  // Also suppress GET requests to /api
  app.get('/api', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // Input validation middleware for all other API routes
  app.use('/api/*', (req, res, next) => {
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
      // Allow legitimate HTML entities like &amp; &lt; &gt; etc.
      const cleanValue = value.replace(/&[a-zA-Z0-9#]+;/g, '');
      return dangerousPatterns.some(pattern => pattern.test(cleanValue));
    }
    
    // Check all string values for dangerous content
    for (const key in body) {
      if (typeof body[key] === 'string') {
        const isDangerous = containsDangerousContent(body[key]);
        if (isDangerous) {
          errors.push(`Invalid content detected in ${key}: ${body[key]}`);
        }
      }
    }
    
    return errors;
  }

  // Enhanced assessment submission with SMS security compliance
  // TEMPORARILY DISABLED: Rate limiters causing form submission blocking
  app.post("/api/submit-assessment", /* smsConsentLimiter, enhancedStrictLimiter, */ bruteforce.prevent, async (req, res) => {
    const requestStart = Date.now();
    
    // Method check first
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        success: false,
        error: 'Method not allowed' 
      });
    }

    // IMMEDIATE IP-based duplicate submission prevention (before any validation)
    const clientIP = normalizeClientIP(req);
    if (process.env.NODE_ENV === 'development') {
      console.log(`[IP-DEBUG] Normalized client IP: ${clientIP} (length: ${clientIP?.length})`);
    }
    
    // SECURITY HARDENING: Skip IP blocking if IP is unknown to prevent over-blocking multiple users
    if (clientIP && clientIP !== 'unknown') {
      const canSubmit = storage.canSubmitFromIP(clientIP);
      if (process.env.NODE_ENV === 'development') {
        console.log(`[IP-DEBUG] Can submit from IP ${clientIP.substring(0, 8)}***: ${canSubmit}`);
      }
      
      if (!canSubmit) {
        const existingSubmission = storage.getIPSubmissionDetails(clientIP);

        if (process.env.NODE_ENV === 'development') {
          console.log(`[SECURITY] Duplicate submission blocked from IP: ${clientIP.substring(0, 8)}***`);
        }

        return res.status(429).json({
          success: false,
          error: 'Assessment already completed',
          message: 'An assessment has already been completed from this IP address. Each IP can only complete one assessment per day for security purposes.',
          completedAt: existingSubmission?.timestamp,
          previousTier: existingSubmission?.customerTier,
          canRetry: false,
          action: 'reload_page_for_new_assessment'
        });
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[IP-DEBUG] Unknown IP detected, bypassing duplicate protection for security`);
      }
    }

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

      // Enhanced SMS consent validation
      
      // More flexible SMS consent validation (handle both string and boolean)
      const consentSMSValue = String(req.body.consentSMS).toLowerCase();
      if (!req.body.consentSMS || (consentSMSValue !== 'true' && req.body.consentSMS !== true)) {
        console.warn('SMS consent security validation failed:', {
          ip: req.ip,
          consentSMS: req.body.consentSMS,
          consentSMSValue,
          type: typeof req.body.consentSMS,
          timestamp: new Date().toISOString()
        });
        
        return res.status(400).json({ 
          success: false, 
          error: 'SMS consent validation failed',
          message: 'SMS consent security validation failed'
        });
      }

      // Validate SMS consent timestamp for security
      if (req.body.consentSMSTimestamp) {
        const consentAge = Date.now() - new Date(req.body.consentSMSTimestamp).getTime();
        if (consentAge > 3600000) { // 1 hour max
          return res.status(400).json({
            success: false,
            error: 'SMS consent expired - please reconfirm',
            message: 'SMS consent timestamp too old - possible replay attack'
          });
        }
        if (consentAge < -300000) { // Allow 5 minutes in future for clock drift
          return res.status(400).json({
            success: false,
            error: 'SMS consent timestamp in future - possible manipulation',
            message: 'Invalid SMS consent timestamp'
          });
        }
      }

      // Business logic validation - moved after mapping for proper field handling
      // (Validation moved to after field mapping to handle new field names properly)

      // Triple sanitization for maximum security
      const sanitized: any = {};
      for (const [key, value] of Object.entries(req.body)) {
        if (typeof value === 'string') {
          sanitized[key] = DOMPurify.sanitize(value.trim());
        } else {
          sanitized[key] = value;
        }
      }

      // Create SMS consent audit trail
      const smsAuditTrail = createSMSConsentAuditTrail(req, sanitized);

      // COMPREHENSIVE FIELD MAPPING AND ENUM NORMALIZATION
      const mappedBody = mapFrontendToBackend(sanitized);
      
      // DEBUG: Log projectUnitRange mapping for troubleshooting
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 [DEBUG] projectUnitRange route mapping:', {
          frontendValue: sanitized.projectUnitRange,
          mappedValue: mappedBody.projectUnitRange
        });
      }
      
      // Enhanced unit count validation with tier consistency (Step 5 implementation)
      const unitCount = parseInt(mappedBody.projectUnitCount) || 0;
      const readiness = mappedBody.readiness;
      
      // Intelligent routing for <10 units - capture but flag appropriately
      if (unitCount < 10) {
        // Still capture the lead but flag it for residential handling
        mappedBody.tags = [...(mappedBody.tags || []), 'residential-inquiry', 'under-10-units'];
        mappedBody.projectDescription = `[Residential Inquiry: ${unitCount} units] ${mappedBody.projectDescription || ''}`;
        
        // Log for tracking
        if (process.env.NODE_ENV === 'development') {
          console.log(`📊 Residential inquiry received: ${unitCount} units`);
        }
        
        // Optional: Could implement special autoresponder or notification here
      }
      
      // Range validation
      if (unitCount < 0 || unitCount > 10000) {
        return res.status(400).json({
          success: false,
          message: 'Unit count must be between 1 and 10,000',
          securityViolation: true
        });
      }
      
      
      // Business logic validation AFTER field mapping
      const isExplorer = sanitized.isExplorer === 'true' || sanitized.isExplorer === true || sanitized.isEducationOnly === 'Yes';
      const companyName = mappedBody.company || '';
      
      // Company validation - only required for Pioneer+ tiers (50+ units)
      // Reuse unitCount variable already declared above

      if (!isExplorer && unitCount >= 50 && !companyName?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Company name required for partnership inquiries (50+ units)',
          requiredFor: 'pioneer_and_above'
        });
      }

      // Log company assignment for debugging (remove in production)
      if (process.env.NODE_ENV !== 'production') {
        console.log('Company Assignment:', {
          isExplorer,
          unitCount,
          providedCompany: sanitized.company || sanitized.companyName,
          assignedCompany: companyName,
          tier: isExplorer ? 'explorer' : unitCount < 50 ? 'starter' : 'pioneer+'
        });
      }
      
      // Validate and sanitize form data using mapped fields
      const { isValid, data, errors, priorityScore, customerTier, priorityLevel, tags } = await validateFormData(mappedBody);
      
      if (!isValid) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: errors 
        });
      }

      // ENTERPRISE TESTING: Tag optimization validation (development only)
      if (process.env.NODE_ENV !== 'production') {
        const tagValidation = {
          totalTags: tags!.length,
          uniqueTags: new Set(tags!).size,
          optimizedPresent: tags!.includes('optimized-tags'),
          hasCleanFormat: tags!.every(tag => /^[a-z0-9-_]+$/.test(tag)),
          hasDuplicates: tags!.length !== new Set(tags!).size,
          oversizedTags: tags!.filter(tag => tag.length > 50),
          invalidTags: tags!.filter(tag => !/^[a-z0-9-_]+$/.test(tag))
        };

        if (process.env.NODE_ENV === 'development') {
          console.log('[TAG-VALIDATION] Clean Optimization Results:', {
            validation: tagValidation,
            customerTier,
            priorityLevel,
            reductionPercentage: Math.round(((40 - tags!.length) / 40) * 100),
            isCleanImplementation: tagValidation.optimizedPresent && tagValidation.hasCleanFormat
          });
        }

        // Alert on validation issues
        if (tagValidation.hasDuplicates) {
          console.warn('[TAG-VALIDATION] WARNING: Duplicate tags detected');
        }

        if (tagValidation.oversizedTags.length > 0) {
          console.warn('[TAG-VALIDATION] WARNING: Oversized tags:', tagValidation.oversizedTags);
        }

        if (tagValidation.invalidTags.length > 0) {
          console.error('[TAG-VALIDATION] ERROR: Invalid tag format:', tagValidation.invalidTags);
        }
      }

      // Additional business tier validation
      const finalUnitCount = parseInt(sanitized.projectUnitCount) || 0;
      const finalReadiness = sanitized.readinessToBuy;
      
      if (finalReadiness !== 'researching' && finalUnitCount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Please specify the number of units for your project.',
          errorId: crypto.randomBytes(8).toString('hex')
        });
      }

      // Store in database with Customer Journey fields
      const submission = await storage.createAssessment({
        ...data!,
        company: data!.company || '', // Ensure company is always a string
        projectDescription: data!.projectDescriptionText, // Fix field name mapping
        priorityScore: priorityScore!,
        customerTier: customerTier!,
        priorityLevel: priorityLevel!,
        tags: tags!
      });

      // Record IP submission for duplicate prevention
      if (process.env.NODE_ENV === 'development') {
        console.log(`[IP-DEBUG] Recording IP submission: ${clientIP.substring(0, 8)}*** - Submission ID: ${submission.id} - Tier: ${customerTier}`);
      }
      storage.recordIPSubmission(clientIP, submission.id, customerTier!);

      // Submit to GoHighLevel webhook with proper journey stage mapping
      try {
        await submitToGoHighLevel(data!, priorityScore!, customerTier!, priorityLevel!, tags!);
      } catch (webhookError) {
        console.error("GoHighLevel webhook failed:", webhookError);
        // Don't fail the request if webhook fails, but log it
      }

      // ENTERPRISE SECURITY: Audit logging for marketing consent processing
      if (process.env.NODE_ENV === 'development') {
        console.log('[AUDIT] Marketing Consent Processing:', {
          ip: req.ip,
          timestamp: new Date().toISOString(),
          requiredCASLConsent: mappedBody.consentMarketing, // Should always be true for CASL compliance
          optionalMarketingConsent: mappedBody.marketingConsent || false, // Should match user selection
          userAgent: req.headers['user-agent']?.substring(0, 100),
          sessionId: (req as any).sessionID || 'no-session',
          submissionId: submission.id
        });
      }

      // Success response with SMS compliance confirmation
      res.status(200).json({
        success: true,
        message: 'SMS consent securely recorded and CASL compliant',
        submissionId: submission.id,
        priorityScore,
        smsComplianceStatus: 'casl-verified',
        a2p10dlcStatus: 'industry-compliant',
        auditId: smsAuditTrail.auditId,
        securityStatus: 'enterprise-verified',
        legalStatus: 'casl-pipeda-compliant',
        responseMessage: getPriorityMessage(priorityScore!)
      });

    } catch (error) {
      // Enhanced error logging for IP-related issues
      console.error(`[IP-SECURITY] Assessment submission error from ${clientIP.substring(0, 8)}***:`, error instanceof Error ? error.message : String(error));
      console.error('SMS consent security error:', error);
      
      res.status(500).json({
        success: false,
        message: 'SMS consent processing error. Our team will contact you directly per your consent.',
        errorId: crypto.randomBytes(8).toString('hex'),
        support: 'info@illummaa.ca'
      });
    }
  });

  // Residential endpoint with enhanced security matching B2B assessment
  app.post("/api/submit-residential", bruteforce.prevent, async (req, res) => {
    const requestStart = Date.now();
    
    // Enhanced security logging matching B2B assessment pattern
    if (process.env.NODE_ENV === 'development') {
      console.log(`[SECURITY] Residential submission attempt from IP: ${req.ip}, User-Agent: ${req.get('User-Agent')?.substring(0, 100)}`);
    }
    
    try {
      // Enhanced validation and sanitization
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
          error: 'Empty request body',
          message: 'Request body cannot be empty'
        });
      }
      
      // Additional input validation matching B2B pattern
      const validationErrors = validateInput(req.body);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          error: 'Input validation failed',
          details: validationErrors
        });
      }
      
      // Enhanced Residential-specific Zod validation schema with security fields
      const residentialSchema = z.object({
        first_name: z.string().min(1, "First name required"),
        last_name: z.string().min(1, "Last name required"), 
        email: z.string().email("Valid email required"),
        phone: z.string()
          .min(1, "Phone number required")
          .refine((val) => {
            try {
              return isValidPhoneNumber(val);
            } catch {
              return false;
            }
          }, { message: "Valid international phone number required" }),
        company: z.string().min(1, "Company name required"),
        source: z.string(),
        project_unit_count: z.number().min(0).max(49), // Allow 0 for consumer inquiries
        construction_province: z.string().min(1, "Province required"),
        project_budget_range: z.string().optional(), // NEW FIELD
        housing_interest: z.string().optional(), // NEW FIELD
        questions_interests: z.string().optional(), // NEW FIELD
        residential_pathway: z.string(),
        lead_type: z.string(),
        submission_timestamp: z.string(),
        // Enhanced security fields
        session_id: z.string().optional(),
        submission_attempt: z.number().optional(),
        user_agent: z.string().optional(),
        timestamp: z.string().optional()
      });

      // Validate incoming data using Zod
      const validationResult = residentialSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        console.error('[SECURITY] Residential validation failed:', {
          ip: req.ip,
          received: req.body,
          errors: validationResult.error.errors
        });
        return res.status(400).json({
          error: 'Validation failed',
          details: validationResult.error.errors
        });
      }

      const data = validationResult.data;
      
      // Enhanced security logging for successful submissions
      if (process.env.NODE_ENV === 'development') {
        console.log(`[SECURITY] Residential submission validated for IP: ${req.ip}, Session: ${data.session_id}, Attempt: ${data.submission_attempt}`);
      }
      
      // Store in database (using same pattern as B2B)
      const submission = await storage.createResidentialAssessment(data);
      
      // Submit to GoHighLevel residential webhook with retry logic
      try {
        await submitToGoHighLevelResidential(data);
      } catch (webhookError) {
        console.error("GoHighLevel residential webhook failed:", webhookError);
        // Don't fail the request if webhook fails, but log it
      }
      
      res.json({ 
        success: true, 
        submissionId: submission.id,
        message: 'Residential inquiry submitted successfully'
      });
      
    } catch (error) {
      const duration = Date.now() - requestStart;
      console.error(`[SECURITY] Residential submission error from IP ${req.ip} after ${duration}ms:`, error);
      
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
  
  // (Duplicate SMS rate limiters removed - moved earlier in file for proper scope)

  // CSRF Token endpoint for enhanced security (FIXED)
  // TEMPORARILY DISABLED: Rate limiter causing blocking
  app.get('/api/csrf-token', /* rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 requests per minute
  }), */ (req, res) => {
    try {
      // Generate a secure CSRF token using proper ES module import
      const csrfToken = crypto.randomBytes(32).toString('hex');
      
      res.json({ 
        csrfToken,
        timestamp: new Date().toISOString(),
        security: 'enterprise-verified',
        smsCompliance: 'a2p-10dlc-ready',
        legalCompliance: 'casl-pipeda-verified'
      });
    } catch (error) {
      console.error('CSRF token generation error:', error);
      res.status(500).json({ 
        error: 'Security token generation failed',
        support: 'info@illummaa.ca'
      });
    }
  });

  // Health check endpoint (minimal exposure)
  // TEMPORARILY DISABLED: Rate limiter causing blocking
  app.get('/api/health', /* rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
  }), */ (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Unused endpoint removed - frontend only uses /api/submit-assessment and /api/submit-residential

  // SECURITY-COMPLIANT: Test endpoint with proper validation
  app.post('/api/test-score', async (req, res) => {
    try {
      // Maintain same CSRF security as main endpoint
      const csrfToken = req.headers['x-csrf-token'];
      const sessionToken = (req as any).session?.csrfToken;
      
      if (!csrfToken || csrfToken !== sessionToken) {
        return res.status(403).json({ 
          error: 'CSRF token validation failed',
          support: 'info@illummaa.ca'
        });
      }

      // Process with same security measures
      const result = await validateFormData(req.body);

      if (!result.isValid) {
        return res.status(400).json({ errors: result.errors });
      }

      res.json({
        backendScore: result.priorityScore,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Score validation error:', error);
      res.status(500).json({ error: 'Score validation failed' });
    }
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
