import { Translation, TranslateResponse } from "@shared/schema";

const STORAGE_KEY = 'speak-africa-translations';

export class LocalTranslationStorage {
  private getStoredTranslations(): Translation[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error reading translations from localStorage:', error);
      return [];
    }
  }

  private saveTranslations(translations: Translation[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(translations));
    } catch (error) {
      console.error('Error saving translations to localStorage:', error);
    }
  }

  getTranslations(): Translation[] {
    return this.getStoredTranslations()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getTranslation(id: string): Translation | undefined {
    return this.getStoredTranslations().find(t => t.id === id);
  }

  addTranslation(translateResponse: TranslateResponse): Translation {
    const translation: Translation = {
      id: translateResponse.id,
      userId: null, // localStorage translations don't track userId
      sessionId: null, // localStorage translations don't track sessionId
      originalText: translateResponse.originalText,
      translatedText: translateResponse.translatedText,
      originalLanguage: translateResponse.originalLanguage,
      targetLanguage: translateResponse.targetLanguage,
      originalAudioUrl: translateResponse.originalAudioUrl || null,
      translatedAudioUrl: translateResponse.translatedAudioUrl || null,
      createdAt: new Date(),
    };

    const existing = this.getStoredTranslations();
    const updated = [translation, ...existing];
    this.saveTranslations(updated);
    
    return translation;
  }

  deleteTranslation(id: string): boolean {
    const existing = this.getStoredTranslations();
    const filtered = existing.filter(t => t.id !== id);
    
    if (filtered.length === existing.length) {
      return false; // Translation not found
    }
    
    this.saveTranslations(filtered);
    return true;
  }

  clearAllTranslations(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  // Clear all translations from both database and localStorage
  async clearAllTranslationsEverywhere(): Promise<void> {
    try {
      // Call the API to clear database translations
      const response = await fetch('/api/translations', {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear database translations');
      }
      
      const result = await response.json();
      
      // Clear localStorage if API indicates we should
      if (result.clearLocalStorage) {
        this.clearAllTranslations();
      }
      
      // Refresh translation history display if available
      if ((window as any).refreshTranslationHistory) {
        (window as any).refreshTranslationHistory();
      }
      
    } catch (error) {
      console.error('Error clearing all translations:', error);
      // Still clear localStorage even if API call fails
      this.clearAllTranslations();
      
      // Refresh translation history display
      if ((window as any).refreshTranslationHistory) {
        (window as any).refreshTranslationHistory();
      }
    }
  }
}

export const localTranslationStorage = new LocalTranslationStorage();
