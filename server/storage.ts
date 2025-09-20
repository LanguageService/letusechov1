import { type Translation, type InsertTranslation, type User, type UpsertUser, type DailyUsage, type InsertDailyUsage, type Feedback, type InsertFeedback, type UpdateProfileRequest, translations, users, dailyUsage, feedback } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // Translation operations
  getTranslation(id: string): Promise<Translation | undefined>;
  getTranslations(): Promise<Translation[]>;
  getTranslationsByUser(userId: string): Promise<Translation[]>;
  getTranslationsBySession(sessionId: string): Promise<Translation[]>;
  createTranslation(translation: InsertTranslation): Promise<Translation>;
  deleteTranslation(id: string): Promise<boolean>;
  clearTranslationsByUser(userId: string): Promise<void>;
  clearTranslationsBySession(sessionId: string): Promise<void>;
  
  // User operations - custom authentication
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(userId: string, updates: UpdateProfileRequest): Promise<User>;
  changeUserPassword(userId: string, hashedPassword: string): Promise<void>;
  
  // Usage tracking operations
  getDailyUsage(userId: string | null, sessionId: string | null, ipAddress: string | null, date: string): Promise<DailyUsage | undefined>;
  incrementDailyUsage(userId: string | null, sessionId: string | null, ipAddress: string | null, date: string): Promise<DailyUsage>;
  
  // Feedback operations
  getFeedback(): Promise<Feedback[]>;
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
}

export class MemStorage implements IStorage {
  private translations: Map<string, Translation>;
  private users: Map<string, User>;
  private dailyUsage: Map<string, DailyUsage>;
  private feedback: Map<string, Feedback>;

  constructor() {
    this.translations = new Map();
    this.users = new Map();
    this.dailyUsage = new Map();
    this.feedback = new Map();
  }

  async getTranslation(id: string): Promise<Translation | undefined> {
    return this.translations.get(id);
  }

  async getTranslations(): Promise<Translation[]> {
    return Array.from(this.translations.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getTranslationsByUser(userId: string): Promise<Translation[]> {
    return Array.from(this.translations.values())
      .filter(t => t.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getTranslationsBySession(sessionId: string): Promise<Translation[]> {
    return Array.from(this.translations.values())
      .filter(t => (t as any).sessionId === sessionId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createTranslation(insertTranslation: InsertTranslation): Promise<Translation> {
    const id = randomUUID();
    const translation: Translation = { 
      id,
      userId: insertTranslation.userId || null,
      sessionId: (insertTranslation as any).sessionId || null,
      originalText: insertTranslation.originalText,
      translatedText: insertTranslation.translatedText,
      originalLanguage: insertTranslation.originalLanguage,
      targetLanguage: insertTranslation.targetLanguage,
      originalAudioUrl: insertTranslation.originalAudioUrl || null,
      translatedAudioUrl: insertTranslation.translatedAudioUrl || null,
      createdAt: new Date()
    };
    this.translations.set(id, translation);
    return translation;
  }

  async deleteTranslation(id: string): Promise<boolean> {
    return this.translations.delete(id);
  }

  async clearTranslationsByUser(userId: string): Promise<void> {
    const translationsToDelete = Array.from(this.translations.entries())
      .filter(([_, translation]) => translation.userId === userId)
      .map(([id, _]) => id);
    
    translationsToDelete.forEach(id => this.translations.delete(id));
  }

  async clearTranslationsBySession(sessionId: string): Promise<void> {
    const translationsToDelete = Array.from(this.translations.entries())
      .filter(([_, translation]) => (translation as any).sessionId === sessionId)
      .map(([id, _]) => id);
    
    translationsToDelete.forEach(id => this.translations.delete(id));
  }

  // User operations - custom authentication
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const users = Array.from(this.users.values());
    return users.find(user => user.email === email);
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      email: userData.email!,
      firstName: userData.firstName!,
      lastName: userData.lastName!,
      password: userData.password!,
      country: userData.country!,
      currentCountryOfResident: userData.currentCountryOfResident!,
      howTheyHeard: userData.howTheyHeard!,
      organization: userData.organization || null,
      whatTheyDo: userData.whatTheyDo!,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id!);
    const user: User = {
      id: userData.id!,
      email: userData.email!,
      firstName: userData.firstName!,
      lastName: userData.lastName!,
      password: userData.password || existingUser?.password || "",
      country: userData.country || existingUser?.country || "",
      currentCountryOfResident: userData.currentCountryOfResident || existingUser?.currentCountryOfResident || "",
      howTheyHeard: userData.howTheyHeard || existingUser?.howTheyHeard || "",
      organization: userData.organization || existingUser?.organization || null,
      whatTheyDo: userData.whatTheyDo || existingUser?.whatTheyDo || "",
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUserProfile(userId: string, updates: UpdateProfileRequest): Promise<User> {
    const existingUser = this.users.get(userId);
    if (!existingUser) {
      throw new Error("User not found");
    }

    const updatedUser: User = {
      ...existingUser,
      ...updates,
      updatedAt: new Date(),
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async changeUserPassword(userId: string, hashedPassword: string): Promise<void> {
    const existingUser = this.users.get(userId);
    if (!existingUser) {
      throw new Error("User not found");
    }

    const updatedUser: User = {
      ...existingUser,
      password: hashedPassword,
      updatedAt: new Date(),
    };
    this.users.set(userId, updatedUser);
  }

  // Usage tracking operations
  async getDailyUsage(userId: string | null, sessionId: string | null, ipAddress: string | null, date: string): Promise<DailyUsage | undefined> {
    // Create a key for tracking usage
    const key = userId || sessionId || ipAddress || 'anonymous';
    const usageKey = `${key}-${date}`;
    return this.dailyUsage.get(usageKey);
  }

  async incrementDailyUsage(userId: string | null, sessionId: string | null, ipAddress: string | null, date: string): Promise<DailyUsage> {
    const key = userId || sessionId || ipAddress || 'anonymous';
    const usageKey = `${key}-${date}`;
    
    const existing = this.dailyUsage.get(usageKey);
    const usage: DailyUsage = {
      id: existing?.id || randomUUID(),
      userId,
      sessionId,
      ipAddress,
      date,
      translationCount: (existing?.translationCount || 0) + 1,
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    
    this.dailyUsage.set(usageKey, usage);
    return usage;
  }

  // Feedback operations
  async getFeedback(): Promise<Feedback[]> {
    return Array.from(this.feedback.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const id = randomUUID();
    const feedbackItem: Feedback = {
      id,
      userId: insertFeedback.userId || null,
      starRating: insertFeedback.starRating,
      feedbackMessage: insertFeedback.feedbackMessage || null,
      createdAt: new Date()
    };
    this.feedback.set(id, feedbackItem);
    return feedbackItem;
  }
}

export class DatabaseStorage implements IStorage {
  // Translation operations
  async getTranslation(id: string): Promise<Translation | undefined> {
    const [translation] = await db.select().from(translations).where(eq(translations.id, id));
    return translation;
  }

  async getTranslations(): Promise<Translation[]> {
    return await db.select().from(translations).orderBy(desc(translations.createdAt));
  }

  async getTranslationsByUser(userId: string): Promise<Translation[]> {
    return await db.select().from(translations)
      .where(eq(translations.userId, userId))
      .orderBy(desc(translations.createdAt));
  }

  async getTranslationsBySession(sessionId: string): Promise<Translation[]> {
    return await db.select().from(translations)
      .where(eq(translations.sessionId, sessionId))
      .orderBy(desc(translations.createdAt));
  }

  async createTranslation(insertTranslation: InsertTranslation): Promise<Translation> {
    const [translation] = await db
      .insert(translations)
      .values(insertTranslation)
      .returning();
    return translation;
  }

  async deleteTranslation(id: string): Promise<boolean> {
    const result = await db.delete(translations).where(eq(translations.id, id));
    return (result.rowCount || 0) > 0;
  }

  async clearTranslationsByUser(userId: string): Promise<void> {
    await db.delete(translations).where(eq(translations.userId, userId));
  }

  async clearTranslationsBySession(sessionId: string): Promise<void> {
    await db.delete(translations).where(eq(translations.sessionId, sessionId));
  }

  // User operations - custom authentication
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfile(userId: string, updates: UpdateProfileRequest): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    return user;
  }

  async changeUserPassword(userId: string, hashedPassword: string): Promise<void> {
    const result = await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
    
    if (result.rowCount === 0) {
      throw new Error("User not found");
    }
  }

  // Usage tracking operations
  async getDailyUsage(userId: string | null, sessionId: string | null, ipAddress: string | null, date: string): Promise<DailyUsage | undefined> {
    // Build where conditions based on available identifiers
    let whereCondition;
    
    if (userId) {
      whereCondition = and(eq(dailyUsage.userId, userId), eq(dailyUsage.date, date));
    } else if (sessionId) {
      whereCondition = and(eq(dailyUsage.sessionId, sessionId), eq(dailyUsage.date, date));
    } else if (ipAddress) {
      whereCondition = and(eq(dailyUsage.ipAddress, ipAddress), eq(dailyUsage.date, date));
    } else {
      return undefined;
    }
    
    const [usage] = await db.select().from(dailyUsage).where(whereCondition);
    return usage;
  }

  async incrementDailyUsage(userId: string | null, sessionId: string | null, ipAddress: string | null, date: string): Promise<DailyUsage> {
    const existing = await this.getDailyUsage(userId, sessionId, ipAddress, date);
    
    if (existing) {
      // Update existing record
      const [updated] = await db
        .update(dailyUsage)
        .set({
          translationCount: existing.translationCount + 1,
          updatedAt: new Date(),
        })
        .where(eq(dailyUsage.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new record
      const [created] = await db
        .insert(dailyUsage)
        .values({
          userId,
          sessionId,
          ipAddress,
          date,
          translationCount: 1,
        })
        .returning();
      return created;
    }
  }

  // Feedback operations
  async getFeedback(): Promise<Feedback[]> {
    return await db.select().from(feedback).orderBy(desc(feedback.createdAt));
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const [feedbackItem] = await db
      .insert(feedback)
      .values(insertFeedback)
      .returning();
    return feedbackItem;
  }
}

export const storage = new DatabaseStorage();
