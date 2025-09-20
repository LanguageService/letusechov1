import { GoogleGenAI } from "@google/genai";

export class TranslationService {
  private geminiClient: GoogleGenAI;

  constructor() {
    this.geminiClient = new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY || "default_key" 
    });
  }

  async translateText(text: string, sourceLanguage: string, targetLanguage: string): Promise<string> {
    try {
      // If source and target are the same, return original text
      if (sourceLanguage === targetLanguage) {
        return text;
      }

      const languageNames: Record<string, string> = {
        'en': 'English',
        'es': 'Spanish', 
        'fr': 'French',
        'de': 'German',
        'zh': 'Chinese',
        'ja': 'Japanese',
        'ko': 'Korean',
        'ar': 'Arabic',
        'hi': 'Hindi',
        'pt': 'Portuguese',
        'ru': 'Russian',
        'it': 'Italian',
        'rw': 'Kinyarwanda',
        'sw': 'Swahili',
        'am': 'Amharic',
        'yo': 'Yoruba',
        'ha': 'Hausa',
        'ig': 'Igbo',
      };

      const sourceLangName = languageNames[sourceLanguage] || sourceLanguage;
      const targetLangName = languageNames[targetLanguage] || targetLanguage;

      const prompt = `Translate the following text from ${sourceLangName} to ${targetLangName}. Only provide the translation, no additional text or explanation:

"${text}"`;

      const response = await this.geminiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const translatedText = response.text?.trim();
      
      if (!translatedText) {
        throw new Error('Empty translation response');
      }

      // Remove quotes if Gemini added them
      return translatedText.replace(/^["']|["']$/g, '');
    } catch (error) {
      console.error('Translation error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Translation service temporarily unavailable. Please try again.');
    }
  }
}

export const translationService = new TranslationService();
