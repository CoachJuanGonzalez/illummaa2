import type { Express } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import { validateFormData, submitToGoHighLevel } from "./storage";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // v13.1 Security Configuration
  
  // Rate limiting: 100 requests per 15 minutes per IP
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." }
  });
  
  app.use(limiter);
  
  // Helmet security headers with CSP
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "https://images.unsplash.com", "data:", "blob:"],
        connectSrc: ["'self'", "https://services.leadconnectorhq.com"]
      }
    }
  }));
  
  // CORS Configuration
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://illummaa.com', 'https://*.replit.app', 'https://*.replit.dev'] 
      : true,
    credentials: true
  }));

  // Assessment submission endpoint
  app.post("/api/submit-assessment", async (req, res) => {
    try {
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
      console.error("Assessment submission error:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Please try again later"
      });
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
