import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { speechService } from "./services/speech";
import { translationService } from "./services/translation";
import { translateRequestSchema, signupSchema, loginSchema, submitFeedbackRequestSchema, updateProfileSchema, changePasswordSchema, type TranslateResponse, type UsageLimitResponse, type SignupRequest, type LoginRequest, type SubmitFeedbackRequest, type FeedbackResponse, type UpdateProfileRequest, type ChangePasswordRequest } from "@shared/schema";
import multer from "multer";
import bcrypt from "bcryptjs";
import session from "express-session";
import connectPg from "connect-pg-simple";
import rateLimit from "express-rate-limit";
import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";
import express from "express";

// Configure multer for audio uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Custom authentication middleware
function isAuthenticated(req: any, res: any, next: any) {
  if (req.session?.userId) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
}

// Session setup
function setupSession(app: Express) {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true, // Ensure sessions table exists
    ttl: sessionTtl,
    tableName: "sessions",
  });

  // Provide fallback for development
  const sessionSecret = process.env.SESSION_SECRET || (
    process.env.NODE_ENV === 'development' ? 'dev-secret-not-for-production' : undefined
  );
  
  if (!sessionSecret) {
    throw new Error('SESSION_SECRET environment variable is required in production');
  }

  app.use(session({
    secret: sessionSecret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only secure in production
      sameSite: 'lax', // CSRF protection
      maxAge: sessionTtl,
    },
  }));
}

// Helper function to check usage limits
async function checkUsageLimit(req: any): Promise<UsageLimitResponse> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const userId = req.session?.userId || null;
  const ipAddress = req.ip || req.connection.remoteAddress || null;
  
  // For guest tracking, prefer IP address over ephemeral session IDs
  // Only use sessionId if it's persisted (has been saved to store)
  let sessionId = null;
  if (!userId && req.sessionID && req.session.cookie.originalMaxAge) {
    sessionId = req.sessionID;
  }

  // Get current usage - prefer userId, then sessionId, then ipAddress
  const currentUsage = await storage.getDailyUsage(userId, sessionId, ipAddress, today);
  const currentCount = currentUsage?.translationCount || 0;

  if (userId) {
    // Authenticated users have more access
    return {
      canTranslate: true,
      remainingTranslations: -1, // -1 indicates unlimited
      isAuthenticated: true,
    };
  } else {
    // Guest users limited to 3 translations per day
    const limit = 3;
    const remaining = Math.max(0, limit - currentCount);
    
    return {
      canTranslate: remaining > 0,
      remainingTranslations: remaining,
      isAuthenticated: false,
      limitMessage: remaining === 0 ? 
        "You've reached your daily limit of 3 translations. Create an account for more translations!" :
        `${remaining} translations remaining today. Create an account for more access!`
    };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  app.set("trust proxy", 1);
  setupSession(app);

  // --- Static File Serving ---
  // Create public directories for uploads if they don't exist
  const audioUploadDir = path.join(process.cwd(), "public", "uploads", "audio");
  await fs.mkdir(audioUploadDir, { recursive: true });

  // Serve static files from the 'public' directory
  app.use(express.static(path.join(process.cwd(), "public")));
  // --- End Static File Serving ---

  // Rate limiting for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: { message: "Too many authentication attempts, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Signup endpoint
  app.post('/api/auth/signup', authLimiter, async (req: any, res) => {
    try {
      const result = signupSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.issues 
        });
      }

      const { email, password, ...userData } = result.data;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await storage.createUser({
        ...userData,
        email,
        password: hashedPassword,
      });

      // Set session
      req.session.userId = user.id;

      // Return user without password
      const { password: _, ...userResponse } = user;
      res.status(201).json(userResponse);
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  // Login endpoint
  app.post('/api/auth/login', authLimiter, async (req: any, res) => {
    try {
      const result = loginSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.issues 
        });
      }

      const { email, password } = result.data;
      
      // Get user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Set session
      req.session.userId = user.id;

      // Return user without password
      const { password: _, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to sign in" });
    }
  });

  // Logout endpoint
  app.post('/api/auth/logout', (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user endpoint
  app.get('/api/auth/user', async (req: any, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return user without password
      const { password: _, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Redirect old login route to new frontend route
  app.get('/api/login', (req: any, res) => {
    res.redirect('/login');
  });

  // Update user profile
  app.put('/api/auth/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const result = updateProfileSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.issues 
        });
      }

      // Update user profile
      const updatedUser = await storage.updateUserProfile(userId, result.data);

      // Return updated user without password
      const { password: _, ...userResponse } = updatedUser;
      res.json(userResponse);
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error instanceof Error && error.message === "User not found") {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Change user password
  app.put('/api/auth/change-password', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const result = changePasswordSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.issues 
        });
      }

      const { currentPassword, newPassword } = result.data;
      
      // Get current user to verify current password
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await storage.changeUserPassword(userId, hashedNewPassword);

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      if (error instanceof Error && error.message === "User not found") {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Usage limit check endpoint
  app.get('/api/usage-limit', async (req: any, res) => {
    try {
      const limitInfo = await checkUsageLimit(req);
      res.json(limitInfo);
    } catch (error) {
      console.error('Error checking usage limit:', error);
      res.status(500).json({ message: "Failed to check usage limit" });
    }
  });

  // Rate limiting for feedback endpoints
  const feedbackLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 3, // Limit each IP to 3 feedback submissions per minute
    message: { message: "Too many feedback submissions, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Submit feedback endpoint
  app.post('/api/feedback', feedbackLimiter, async (req: any, res) => {
    try {
      const result = submitFeedbackRequestSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.issues 
        });
      }

      const { starRating, feedbackMessage } = result.data;
      const userId = req.session?.userId || null;
      
      // Create feedback
      const feedback = await storage.createFeedback({
        userId,
        starRating,
        feedbackMessage: feedbackMessage || undefined,
      });

      res.status(201).json({ 
        message: "Thank you for your feedback!",
        feedback: {
          id: feedback.id,
          starRating: feedback.starRating,
          feedbackMessage: feedback.feedbackMessage,
          createdAt: feedback.createdAt.toISOString(),
        }
      });
    } catch (error) {
      console.error("Feedback submission error:", error);
      res.status(500).json({ message: "Failed to submit feedback" });
    }
  });

  // Get feedback endpoint (for admin/analytics - authenticated users only)
  app.get('/api/feedback', isAuthenticated, async (req: any, res) => {
    try {
      const feedbackList = await storage.getFeedback();
      
      const response: FeedbackResponse[] = feedbackList.map(feedback => ({
        id: feedback.id,
        starRating: feedback.starRating,
        feedbackMessage: feedback.feedbackMessage,
        createdAt: feedback.createdAt.toISOString(),
        user: feedback.userId ? {
          firstName: 'Anonymous', // We could join with users table if needed
          lastName: 'User',
        } : null,
      }));
      
      res.json(response);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  // Get all translations with stats
  app.get('/api/stats', async (req, res) => {
    try {
      // In a real app, you'd want to protect this endpoint
      const translations = await storage.getAllTranslationsWithStats();
      res.json(translations);
    } catch (error) {
      console.error("Error fetching translation stats:", error);
      res.status(500).json({ message: "Failed to fetch translation stats" });
    }
  });

  // Get translations history endpoint - scoped to current user/session
  app.get('/api/translations', async (req: any, res) => {
    try {
      const userId = req.session?.userId || null;
      const sessionId = req.sessionID || null;
      
      let translations: any[] = [];
      
      if (userId) {
        // Authenticated user - get their translations
        translations = await storage.getTranslationsByUser(userId);
      } else if (sessionId) {
        // Guest user - get translations for this session
        translations = await storage.getTranslationsBySession(sessionId);
      }
      // If no userId or sessionId, return empty array (no translations)
      
      // Convert Date objects to ISO strings for JSON serialization
      const response = translations.map(translation => ({
        ...translation,
        createdAt: translation.createdAt.toISOString(),
      }));
      
      res.json(response);
    } catch (error) {
      console.error("Error fetching translations:", error);
      res.status(500).json({ message: "Failed to fetch translations" });
    }
  });

  // Clear all translations endpoint - scoped to current user/session
  app.delete('/api/translations', async (req: any, res) => {
    try {
      const userId = req.session?.userId || null;
      const sessionId = req.sessionID || null;
      
      if (userId) {
        // Authenticated user - clear their translations
        await storage.clearTranslationsByUser(userId);
      } else if (sessionId) {
        // Guest user - clear translations for this session
        await storage.clearTranslationsBySession(sessionId);
      }
      
      res.json({ 
        message: "All translations cleared successfully",
        clearLocalStorage: true 
      });
    } catch (error) {
      console.error("Error clearing translations:", error);
      res.status(500).json({ message: "Failed to clear translations" });
    }
  });

  // Translate audio
  app.post("/api/translate", async (req: any, res) => {
    console.log("🔥 TRANSLATE ENDPOINT HIT!");
    try {
      // For guest users, ensure session persistence for tracking
      if (!req.user?.claims?.sub) {
        // Touch the session to ensure it gets saved
        req.session.guest = true;
      }

      // Check usage limits first
      const limitInfo = await checkUsageLimit(req);
      
      if (!limitInfo.canTranslate) {
        return res.status(429).json({
          message: limitInfo.limitMessage,
          canTranslate: false,
          remainingTranslations: limitInfo.remainingTranslations,
          isAuthenticated: limitInfo.isAuthenticated,
        });
      }

      const result = translateRequestSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid request data",
          errors: result.error.errors 
        });
      }

      const { audioData, sourceLanguage, targetLanguage, settings, selectedLanguages } = result.data;
      
      console.log('=== TRANSLATE REQUEST ===');
      console.log('sourceLanguage:', sourceLanguage);
      console.log('targetLanguage:', targetLanguage);
      console.log('settings:', JSON.stringify(settings, null, 2));
      console.log('selectedLanguages:', JSON.stringify(selectedLanguages, null, 2));

      // Convert base64 audio to buffer
      const audioBuffer = Buffer.from(audioData, 'base64');

      // --- Save original audio to a file ---
      const originalAudioFilename = `${randomUUID()}.wav`;
      const originalAudioPath = path.join(audioUploadDir, originalAudioFilename);
      await fs.writeFile(originalAudioPath, audioBuffer);
      const originalAudioUrl = `/uploads/audio/${originalAudioFilename}`;
      // --- End save original audio ---

      const model = settings?.model || 'gemini-2.5-flash';
      let originalText: string;
      let translatedText: string;
      let finalSourceLanguage: string;
      let finalTargetLanguage: string;
      let transcriptionDuration = 0;
      let translationDuration = 0;
      let ttsDuration = 0;
      let directTranslationDuration = 0;

      console.log('Checking mode - superFastMode:', settings?.superFastMode);
      
      if (settings?.superFastMode) {
        // Super Fast Mode: Audio directly to translated text (skip transcription + translation steps)
        console.log('Super Fast Mode: Converting audio directly to translated text...');
        const directResult = await speechService.audioToTranslatedText(audioBuffer, sourceLanguage, targetLanguage, model, selectedLanguages);
        
        directTranslationDuration = directResult.duration;
        translatedText = directResult.translatedText;
        finalTargetLanguage = directResult.targetLanguage;
        
        if (sourceLanguage === 'auto' && directResult.detectedSourceLanguage) {
          finalSourceLanguage = directResult.detectedSourceLanguage;
          console.log(`Auto-detected ${directResult.detectedSourceLanguage}, translated to ${finalTargetLanguage}`);
        } else {
          finalSourceLanguage = sourceLanguage;
        }

        // For super fast mode, we don't have the original text, so we'll use a placeholder
        originalText = '[Audio processed in super fast mode]';
      } else {
        // Standard Mode: Audio → Text → Translation
        // Step 1: Speech to Text
        console.log('Converting speech to text...');
        const sttResult = await speechService.speechToText(audioBuffer, sourceLanguage, model, selectedLanguages);
        
        transcriptionDuration = sttResult.duration + (sttResult.langDetectDuration || 0);
        originalText = typeof sttResult === 'string' ? sttResult : sttResult.text;
        const detectedLanguage = typeof sttResult === 'object' ? sttResult.detectedLanguage : undefined;
        
        if (!originalText.trim()) {
          return res.status(400).json({ 
            message: "No speech detected in audio. Please try speaking more clearly." 
          });
        }

        // Use the provided target language 
        finalSourceLanguage = detectedLanguage || sourceLanguage;
        finalTargetLanguage = targetLanguage;
        
        // Auto-adjust target language if detected source matches the requested target
        if (sourceLanguage === 'auto' && detectedLanguage && detectedLanguage === targetLanguage) {
          // If we detected the same language as the target, switch to the opposite language from the selected pair.
          if (selectedLanguages) {
            finalTargetLanguage = detectedLanguage === selectedLanguages.source
              ? selectedLanguages.target
              : selectedLanguages.source;
          } else {
            // Fallback for older clients or cases where selectedLanguages is not passed
            if (detectedLanguage === 'rw') {
              finalTargetLanguage = 'en';
            } else if (detectedLanguage === 'en') {
              finalTargetLanguage = 'rw';
            } else {
              // Cannot determine the other language in the pair, default to English
              finalTargetLanguage = 'en';
            }
          }
          console.log(`Auto-detected ${detectedLanguage}, auto-adjusted target to ${finalTargetLanguage}`);
        }
        
        console.log(`Translating from ${finalSourceLanguage} to ${finalTargetLanguage}`);

        // Step 2: Translate text
        console.log('Translating text...');
        const translationStartTime = performance.now();
        translatedText = await translationService.translateText(
          originalText, 
          finalSourceLanguage, 
          finalTargetLanguage
        );
        translationDuration = performance.now() - translationStartTime;
      }

      // Step 3: Text to Speech for translated text
      console.log('Converting translated text to speech...');
      let translatedAudioUrl: string | undefined;
      let ttsAvailable = true;
      let ttsError: string | undefined;
      
      try {
        const voiceName = settings?.voice || 'Zephyr';
        const ttsResult = await speechService.textToSpeech(translatedText, finalTargetLanguage, voiceName);
        const translatedAudioBuffer = ttsResult.audioBuffer;
        ttsDuration = ttsResult.duration;
        
        // --- Save translated audio to a file ---
        const translatedAudioFilename = `${randomUUID()}.wav`;
        const translatedAudioPath = path.join(audioUploadDir, translatedAudioFilename);
        await fs.writeFile(translatedAudioPath, translatedAudioBuffer);
        translatedAudioUrl = `/uploads/audio/${translatedAudioFilename}`;
        console.log('TTS audio generated and saved to file.');
        // --- End save translated audio ---
      } catch (error) {
        console.error('TTS error:', error);
        ttsAvailable = false;
        const errorMessage = error instanceof Error ? error.message : 'Unknown TTS error';
        
        if (errorMessage.includes('TTS generation failed: OTHER')) {
          ttsError = `Speech synthesis is not available for ${finalTargetLanguage === 'rw' ? 'Kinyarwanda' : finalTargetLanguage} at this time.`;
        } else {
          ttsError = 'Speech synthesis temporarily unavailable. Please try again later.';
        }
        
        console.log(`TTS not supported for language ${finalTargetLanguage}, continuing with text-only translation`);
        // Continue without audio - text translation is still available
      }

      // Increment usage count after successful translation
      const today = new Date().toISOString().split('T')[0];
      const userId = req.session?.userId || null;
      const ipAddress = req.ip || req.connection.remoteAddress || null;
      
      // Use same logic as checkUsageLimit for consistent tracking
      let sessionId = null;
      if (!userId && req.sessionID && req.session.cookie.originalMaxAge) {
        sessionId = req.sessionID;
      }
      
      await storage.incrementDailyUsage(userId, sessionId, ipAddress, today);
      console.log(`Usage incremented for ${userId ? 'user:' + userId : sessionId ? 'session:' + sessionId : 'ip:' + ipAddress} on ${today}`);

      // Save translation to storage for history
      const savedTranslation = await storage.createTranslation({
        userId,
        sessionId,
        originalText,
        translatedText,
        originalLanguage: finalSourceLanguage,
        targetLanguage: finalTargetLanguage,
        originalAudioUrl,
        translatedAudioUrl,
        transcriptionDuration: settings?.superFastMode ? directTranslationDuration : transcriptionDuration,
        translationDuration,
        ttsDuration,
      });
      console.log('Translation saved to storage:', savedTranslation.id);

      // Generate response with saved translation data
      const response: TranslateResponse = {
        id: savedTranslation.id,
        originalText,
        translatedText,
        originalLanguage: finalSourceLanguage,
        targetLanguage: finalTargetLanguage,
        originalAudioUrl,
        translatedAudioUrl,
        ttsAvailable,
        ttsError,
      };

      res.json(response);
    } catch (error) {
      console.error('Translation pipeline error:', error);
      
      if (error instanceof Error) {
        res.status(500).json({ 
          message: error.message 
        });
      } else {
        res.status(500).json({ 
          message: "Translation failed. Please check your internet connection and try again." 
        });
      }
    }
  });


  const httpServer = createServer(app);
  return httpServer;
}
