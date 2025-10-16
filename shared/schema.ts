import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, index, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { getDisplayVoiceNames } from "./voice-mapping";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable(
  "users",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    email: varchar("email").unique().notNull(),
    firstName: varchar("first_name").notNull(),
    lastName: varchar("last_name").notNull(),
    password: varchar("password").notNull(), // hashed password
    country: varchar("country").notNull(),
    currentCountryOfResident: varchar("current_country_of_resident").notNull(),
    howTheyHeard: varchar("how_they_heard").notNull(),
    organization: varchar("organization"), // optional
    whatTheyDo: varchar("what_they_do").notNull(),
    profileImageUrl: varchar("profile_image_url"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    emailIndex: index("email_idx").on(table.email),
  }),
);

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Auth schemas for signup and login
export const signupSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50, "First name must be less than 50 characters"),
  lastName: z.string().trim().min(1, "Last name is required").max(50, "Last name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100, "Password must be less than 100 characters"),
  country: z.string().trim().min(1, "Country is required").max(100, "Country name must be less than 100 characters"),
  currentCountryOfResident: z.string().trim().min(1, "Current country of resident is required").max(100, "Country name must be less than 100 characters"),
  howTheyHeard: z.string().trim().min(1, "Please tell us how you heard about us").max(200, "Response must be less than 200 characters"),
  organization: z.string().trim().max(100, "Organization name must be less than 100 characters").optional(),
  whatTheyDo: z.string().trim().min(1, "Please tell us what you do").max(200, "Response must be less than 200 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type SignupRequest = z.infer<typeof signupSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;

// Profile update schema
export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50, "First name must be less than 50 characters"),
  lastName: z.string().trim().min(1, "Last name is required").max(50, "Last name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  country: z.string().trim().min(1, "Country is required").max(100, "Country name must be less than 100 characters"),
  currentCountryOfResident: z.string().trim().min(1, "Current country of resident is required").max(100, "Country name must be less than 100 characters"),
  howTheyHeard: z.string().trim().min(1, "Please tell us how you heard about us").max(200, "Response must be less than 200 characters"),
  organization: z.string().trim().max(100, "Organization name must be less than 100 characters").optional(),
  whatTheyDo: z.string().trim().min(1, "Please tell us what you do").max(200, "Response must be less than 200 characters"),
});

export type UpdateProfileRequest = z.infer<typeof updateProfileSchema>;

// Password change schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters").max(100, "Password must be less than 100 characters"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type ChangePasswordRequest = z.infer<typeof changePasswordSchema>;

// Usage tracking table for daily limits
export const dailyUsage = pgTable(
  "daily_usage",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").references(() => users.id), // null for guest users
    sessionId: varchar("session_id"), // for tracking guest usage by session
    ipAddress: varchar("ip_address"), // fallback for guest usage tracking
    date: varchar("date").notNull(), // YYYY-MM-DD format
    translationCount: integer("translation_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    userIdIndex: index("usage_user_id_idx").on(table.userId),
    sessionIdIndex: index("usage_session_id_idx").on(table.sessionId),
    ipAddressIndex: index("usage_ip_address_idx").on(table.ipAddress),
  }),
);

export const insertDailyUsageSchema = createInsertSchema(dailyUsage).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDailyUsage = z.infer<typeof insertDailyUsageSchema>;
export type DailyUsage = typeof dailyUsage.$inferSelect;

export const translations = pgTable(
  "translations",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").references(() => users.id), // null for guest translations
    sessionId: varchar("session_id"), // for tracking guest translations by session
    originalText: text("original_text").notNull(),
    translatedText: text("translated_text").notNull(),
    originalLanguage: varchar("original_language", { length: 10 }).notNull(),
    targetLanguage: varchar("target_language", { length: 10 }).notNull(),
    originalAudioUrl: text("original_audio_url"), // To store the original audio
    translatedAudioUrl: text("translated_audio_url"),
    transcriptionDuration: real("transcription_duration"),
    translationDuration: real("translation_duration"),
    ttsDuration: real("tts_duration"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIndex: index("translations_user_id_idx").on(table.userId),
    sessionIdIndex: index("translations_session_id_idx").on(table.sessionId),
  }),
);

export const insertTranslationSchema = createInsertSchema(translations).omit({
  id: true,
  createdAt: true,
});

export type InsertTranslation = z.infer<typeof insertTranslationSchema>;
export type Translation = typeof translations.$inferSelect;

// Settings schemas
export const settingsSchema = z.object({
  model: z.enum(['gemini-2.5-flash', 'gemini-2.5-pro']).default('gemini-2.5-flash'),
  voice: z.enum(getDisplayVoiceNames() as [string, ...string[]]).default('Serene'),
  autoplay: z.boolean().default(true),
  autoDetectLanguage: z.boolean().default(true),
  superFastMode: z.boolean().default(true),
});

export type Settings = z.infer<typeof settingsSchema>;

// Supported language codes
export const supportedLanguages = [
  "en", "es", "fr", "de", "zh", "ja", "ko", "ar", "hi", "pt", "ru", "it", "rw", "sw", "am", "yo", "ha", "ig", "auto"
] as const;

export const languageEnum = z.enum(supportedLanguages);

// API schemas
export const translateRequestSchema = z.object({
  audioData: z.string(), // base64 encoded audio
  sourceLanguage: languageEnum,
  targetLanguage: languageEnum.exclude(["auto"]),
  settings: settingsSchema.optional(),
  selectedLanguages: z.object({
    source: languageEnum.exclude(["auto"]),
    target: languageEnum.exclude(["auto"]),
  }).optional(),
});

export type TranslateRequest = z.infer<typeof translateRequestSchema>;

export const translateResponseSchema = z.object({
  id: z.string(),
  originalText: z.string(),
  translatedText: z.string(),
  originalLanguage: z.string(),
  targetLanguage: z.string(),
  originalAudioUrl: z.string().optional(),
  translatedAudioUrl: z.string().optional(),
  ttsAvailable: z.boolean().default(true),
  ttsError: z.string().optional(),
});

export type TranslateResponse = z.infer<typeof translateResponseSchema>;

// Usage limit response schema
export const usageLimitResponseSchema = z.object({
  canTranslate: z.boolean(),
  remainingTranslations: z.number(),
  isAuthenticated: z.boolean(),
  limitMessage: z.string().optional(),
});

export type UsageLimitResponse = z.infer<typeof usageLimitResponseSchema>;

// Feedback table for user reviews and ratings
export const feedback = pgTable("feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id), // null for guest feedback
  starRating: integer("star_rating").notNull(), // 1-5 stars
  feedbackMessage: text("feedback_message"), // optional message
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
}).extend({
  starRating: z.number().int().min(1, "Rating must be at least 1 star").max(5, "Rating cannot exceed 5 stars"),
  feedbackMessage: z.string().max(1000, "Feedback message must be less than 1000 characters").optional(),
});

export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;

// Feedback API schemas
export const submitFeedbackRequestSchema = z.object({
  starRating: z.number().int().min(1, "Rating must be at least 1 star").max(5, "Rating cannot exceed 5 stars"),
  feedbackMessage: z.string().max(1000, "Feedback message must be less than 1000 characters").optional(),
});

export type SubmitFeedbackRequest = z.infer<typeof submitFeedbackRequestSchema>;

export const feedbackResponseSchema = z.object({
  id: z.string(),
  starRating: z.number(),
  feedbackMessage: z.string().nullable(),
  createdAt: z.string(),
  user: z.object({
    firstName: z.string(),
    lastName: z.string(),
  }).nullable(),
});

export type FeedbackResponse = z.infer<typeof feedbackResponseSchema>;
