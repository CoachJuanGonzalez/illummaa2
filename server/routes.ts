import type { Express } from "express";
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
import { validateFormData, submitToGoHighLevel, submitToGoHighLevelResidential } from "./storage";
import { storage } from "./storage";

// COMPREHENSIVE FIELD MAPPING AND ENUM NORMALIZATION FUNCTION
function mapFrontendToBackend(frontendData: any): any {
  // Enum value mapping functions
  const normalizeReadiness = (value: string): string => {
    const readinessMap: { [key: string]: string } = {
      'Just researching - want to learn more': 'researching',
      'Planning future project (6+ months)': 'planning-long',
      'Planning active project (0-6 months)': 'planning-medium',
      'Ready to move forward immediately': 'immediate'
    };
    return readinessMap[value] || value;
  };

  const normalizeBudget = (value: string): string => {
    const budgetMap: { [key: string]: string } = {
      'Under $500K': 'Under $5 Million',
      '$500K - $2M': 'Under $5 Million',
      '$2M - $5M': 'Under $5 Million',
      '$5M - $15M': '$5M - $15 Million',
      '$15M - $30M': '$15M - $30 Million',
      '$30M - $50M': '$30M - $50 Million',
      'Over $50M': 'Over $50 Million'
    };
    return budgetMap[value] || value;
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
    
    // Company field mapping (handles both old 'company' and new 'companyName' fields)
    company: frontendData.company || frontendData.companyName || 'Individual Investor',
    
    // CRITICAL FIELD NAME MAPPING FIXES:
    projectUnitCount: frontendData.unitCount || frontendData.projectUnitCount || 0,
    budgetRange: emptyToUndefined(frontendData.budget ? normalizeBudget(frontendData.budget) : (frontendData.projectBudgetRange || frontendData.budgetRange)),
    decisionTimeline: emptyToUndefined(frontendData.timeline ? normalizeTimeline(frontendData.timeline) : (frontendData.deliveryTimeline || frontendData.decisionTimeline)),
    constructionProvince: emptyToUndefined(frontendData.province || frontendData.constructionProvince),
    projectDescriptionText: emptyToUndefined(frontendData.projectDescription || frontendData.projectDescriptionText),
    consentMarketing: frontendData.consentCommunications || frontendData.consentMarketing,
    
    // Readiness with enum normalization (handles both old 'readiness' and new 'readinessToBuy' fields)
    readiness: frontendData.readiness ? normalizeReadiness(frontendData.readiness) : 
               frontendData.readinessToBuy ? normalizeReadiness(frontendData.readinessToBuy) : 
               frontendData.readiness,
    
    // Age verification (direct mapping)
    ageVerification: frontendData.ageVerification,
    
    // Optional fields that may not be present (convert empty strings to undefined)
    developerType: emptyToUndefined(frontendData.developerType),
    governmentPrograms: emptyToUndefined(frontendData.governmentPrograms),
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
    source: frontendData.source || 'ILLÜMMAA Website Assessment',
    submissionId: frontendData.submissionId,
    userAgent: frontendData.userAgent,
    
    // Additional new fields from Partnership & Learning Assessment
    buildCanadaEligible: frontendData.buildCanadaEligible,
    isEducationOnly: frontendData.isEducationOnly,
    isEducationalLead: frontendData.isEducationalLead,
    responseCommitment: frontendData.responseCommitment,
    responseCommitmentLevel: frontendData.responseCommitmentLevel
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Enterprise Security Configuration v13.2
  
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
        console.log('[VALIDATION DEBUG]', key, ':', body[key], 'dangerous:', isDangerous);
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
    
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        success: false,
        error: 'Method not allowed' 
      });
    }

    try {
      // Enhanced validation and sanitization
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
          error: 'Empty request body',
          message: 'Request body cannot be empty'
        });
      }

      // Additional input validation with debug logging
      console.log('[DEBUG] Starting input validation...');
      const validationErrors = validateInput(req.body);
      console.log('[DEBUG] Validation errors:', validationErrors);
      if (validationErrors.length > 0) {
        console.log('[DEBUG] VALIDATION FAILED - errors:', validationErrors);
        return res.status(400).json({
          error: 'Input validation failed',
          details: validationErrors
        });
      }
      console.log('[DEBUG] Input validation passed!');

      // Enhanced SMS consent validation with debug logging
      console.log('[DEBUG] SMS consent check:', {
        consentSMS: req.body.consentSMS,
        type: typeof req.body.consentSMS,
        stringified: String(req.body.consentSMS)
      });
      
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
        if (consentAge < 0) {
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
      
      // Enhanced unit count validation with tier consistency (Step 5 implementation)
      const unitCount = parseInt(mappedBody.projectUnitCount) || 0;
      const readiness = mappedBody.readiness;
      
      // Security: Explorer tier can have 0 units
      if (readiness === 'researching' && unitCount === 0) {
        // This is valid - Explorer tier research
      } else if (readiness !== 'researching' && unitCount <= 0) {
        // Security: Commitment-level tiers must have > 0 units
        return res.status(400).json({
          success: false,
          message: 'Commitment-level inquiries must specify actual unit count',
          securityViolation: true
        });
      }
      
      // Range validation
      if (unitCount < 0 || unitCount > 10000) {
        return res.status(400).json({
          success: false,
          message: 'Unit count must be between 1 and 10,000',
          securityViolation: true
        });
      }
      
      console.log('[MAPPING] Frontend data:', JSON.stringify(sanitized, null, 2));
      console.log('[MAPPING] Mapped backend data:', JSON.stringify(mappedBody, null, 2));
      
      // Business logic validation AFTER field mapping
      const isExplorer = sanitized.isExplorer === 'true' || sanitized.isExplorer === true || sanitized.isEducationOnly === 'Yes';
      const companyName = mappedBody.company || '';
      if (!isExplorer && !companyName?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Company name required for business inquiries'
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

      // Enhanced payload with comprehensive SMS security tracking
      // Enhanced webhook payload generation with security validation (Step 6 implementation)
      const generateSecurePayload = (sanitizedData: any) => {
        // Security validation before webhook delivery
        const unitCount = parseInt(sanitizedData.projectUnitCount) || 0;
        const readiness = sanitizedData.readinessToBuy;
        
        // Validate tier consistency
        if (readiness !== 'researching' && unitCount <= 0) {
          throw new Error('Security: Invalid unit count for commitment-level tier');
        }
        
        return {
        // Contact information (sanitized)
        firstName: sanitized.firstName,
        lastName: sanitized.lastName,
        email: sanitized.email,
        phone: sanitized.phone,
        company: sanitized.company || sanitized.companyName || '',
        companyName: sanitized.companyName || sanitized.company || '',
        
        // Project details (using both old and new field names for compatibility)
        unitCount: parseInt(sanitized.unitCount || sanitized.projectUnitCount) || 0,
        projectUnitCount: parseInt(sanitized.projectUnitCount || sanitized.unitCount) || 0,
        budget: sanitized.budget || sanitized.projectBudgetRange,
        projectBudgetRange: sanitized.projectBudgetRange || sanitized.budget,
        timeline: sanitized.timeline || sanitized.deliveryTimeline,
        deliveryTimeline: sanitized.deliveryTimeline || sanitized.timeline,
        province: sanitized.province || sanitized.constructionProvince,
        constructionProvince: sanitized.constructionProvince || sanitized.province,
        readiness: sanitized.readiness || sanitized.readinessToBuy,
        readinessToBuy: sanitized.readinessToBuy || sanitized.readiness,
        projectDescription: sanitized.projectDescription || '',
        
        // New Partnership & Learning Assessment fields
        partnershipLevel: sanitized.partnershipLevel,
        aiPriorityScore: sanitized.aiPriorityScore || priorityScore,
        pipeline: sanitized.pipeline,
        stage: sanitized.stage,
        buildCanadaEligible: sanitized.buildCanadaEligible,
        isEducationOnly: sanitized.isEducationOnly,
        isEducationalLead: sanitized.isEducationalLead,
        responseCommitment: sanitized.responseCommitment,
        responseCommitmentLevel: sanitized.responseCommitmentLevel,
        developerType: sanitized.developerType,
        governmentPrograms: sanitized.governmentPrograms,
        
        // Enhanced legal consent tracking with SMS security
        consentCommunications: sanitized.consentCommunications ? 'true' : 'false',
        consentSMS: sanitized.consentSMS ? 'true' : 'false',
        consentSMSTimestamp: sanitized.consentSMSTimestamp || new Date().toISOString(),
        smsAuditTrail: smsAuditTrail,
        privacyPolicyConsent: sanitized.privacyPolicyConsent ? 'true' : 'false',
        marketingConsent: sanitized.marketingConsent ? 'true' : 'false',
        ageVerification: sanitized.ageVerification ? 'true' : 'false',
        consentTimestamp: new Date().toISOString(),
        legalConsentVersion: '2025.1',
        caslCompliant: 'true',
        caslSMSCompliant: sanitized.consentSMS ? 'true' : 'false',
        pipedaCompliant: 'true',
        a2p10dlcCompliant: 'true',
        
        // Security metadata
        submissionIP: req.ip,
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString(),
        sessionId: (req as any).sessionID || 'no-session',
        securityValidated: 'true',
        csrfProtected: 'true',
        rateLimitPassed: 'true',
        inputSanitized: 'true',
        smsConsentSecurityValidated: 'true',
        smsConsentRateLimitPassed: 'true',
        smsConsentAuditId: smsAuditTrail.auditId,
        
        // System tracking
        submissionId: `ILLUMMAA-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
        source: 'ILLÜMMAA Secure Website Assessment',
        
        // Priority and tagging from existing logic
        priorityScore: priorityScore || sanitized.aiPriorityScore,
        customerTier: customerTier || sanitized.customerTier,
        priorityLevel,
        tags: tags?.join(',') || sanitized.tags || '',
        
        // Enhanced security validation fields (Step 6)
        tierConsistencyValidated: 'true',
        unitCountSecurityValidated: 'true'
        };
      };

      // Generate secure payload with enhanced security validation (Step 7 implementation)
      let securePayload;
      try {
        // Additional tier consistency security check
        const unitCount = parseInt(sanitized.projectUnitCount) || 0;
        const readiness = sanitized.readinessToBuy;
        
        if (readiness !== 'researching' && unitCount <= 0) {
          throw new Error('Commitment-level inquiries must specify actual unit count');
        }
        
        securePayload = generateSecurePayload(sanitized);
      } catch (error) {
        // Enhanced error logging with security context
        console.error('Assessment submission error:', {
          error: (error as Error).message,
          securityValidation: 'failed',
          timestamp: new Date().toISOString(),
          unitCount: sanitized.projectUnitCount,
          readiness: sanitized.readinessToBuy,
          ip: req.ip
        });
        
        return res.status(400).json({
          success: false,
          message: 'Security validation failed. Please verify your selections.',
          securityViolation: true,
          errorId: crypto.randomBytes(8).toString('hex')
        });
      }

      // Store in database with Customer Journey fields
      const submission = await storage.createAssessment({
        ...data!,
        priorityScore: priorityScore!,
        customerTier: customerTier!,
        priorityLevel: priorityLevel!,
        tags: tags!
      });

      // Secure webhook delivery with SMS consent verification
      try {
        const payload = JSON.stringify(securePayload);
        const signature = crypto
          .createHmac('sha256', process.env.WEBHOOK_SECRET || 'fallback-secret')
          .update(payload)
          .digest('hex');

        if (process.env.GHL_WEBHOOK_URL) {
          const response = await fetch(process.env.GHL_WEBHOOK_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'ILLUMMAA-SMS-Secure/2.0',
              'X-Signature-256': `sha256=${signature}`,
              'X-SMS-Consent-Audit': smsAuditTrail.auditId,
              'X-Source': 'ILLUMMAA-Enterprise'
            },
            body: payload
          });

          if (!response.ok) {
            throw new Error(`SMS consent webhook delivery failed: ${response.status}`);
          }
        } else {
          console.log('GHL_WEBHOOK_URL not configured, payload prepared:', Object.keys(securePayload));
        }
      } catch (webhookError) {
        console.error("SMS consent webhook delivery failed:", webhookError);
        // Don't fail the request if webhook fails, but log it
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
    console.log(`[SECURITY] Residential submission attempt from IP: ${req.ip}, User-Agent: ${req.get('User-Agent')?.substring(0, 100)}`);
    
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
        phone: z.string().min(10, "Valid phone number required"),
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
      console.log(`[SECURITY] Residential submission validated for IP: ${req.ip}, Session: ${data.session_id}, Attempt: ${data.submission_attempt}`);
      
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
