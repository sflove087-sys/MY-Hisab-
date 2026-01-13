
import { Transaction } from '../types';

// The GoogleGenAI type is not available at the top level anymore.
// We use 'any' to avoid a static dependency that could crash WebViews.
type GoogleGenAI = any;

class GeminiService {
  private ai: GoogleGenAI | null = null;
  private apiKey: string | undefined;
  
  constructor() {
    try {
      // Safely read the API key without importing any external libraries.
      this.apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : undefined;
      
      if (!this.apiKey) {
        console.warn("API_KEY environment variable not found. GeminiService will be disabled.");
      }
    } catch (error) {
      console.warn("An error occurred reading API_KEY. The service will be disabled.", error);
      this.apiKey = undefined;
    }
  }

  /**
   * Initializes the AI service by dynamically importing and instantiating the GoogleGenAI client.
   * This is done on-demand to prevent startup crashes.
   */
  private async initializeAi() {
    // If already initialized or no API key, do nothing.
    if (this.ai || !this.apiKey) {
      return;
    }
    
    try {
      // Dynamically import the library using its full URL.
      const { GoogleGenAI } = await import('https://esm.sh/@google/genai@1.35.0');
      this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    } catch (error) {
       console.error("Failed to dynamically import or initialize GoogleGenAI:", error);
       this.ai = null; // Ensure it's null on failure.
    }
  }

  async getFinancialAdvice(transactions: Transaction[], language: 'en' | 'bn'): Promise<string> {
    // Ensure the AI client is initialized before use.
    await this.initializeAi();

    if (!this.ai) {
      return language === 'bn' ? "AI পরিষেবা উপলব্ধ নেই। API কী সেট করা নেই অথবা লাইব্রেরি লোড হতে ব্যর্থ হয়েছে।" : "AI service is unavailable. API key is not set or the library failed to load.";
    }

    const transactionSummary = transactions.map(t => 
      `${t.date}: ${t.type} of ${t.amount} BDT from ${t.fromName} to ${t.toName}`
    ).join('\n');

    const langInstruction = language === 'bn' 
        ? "Please provide the advice in Bengali (Bangla)." 
        : "Please provide the advice in English.";

    const prompt = `
      Based on the following transaction history, act as a friendly financial advisor and provide some simple, actionable financial advice. 
      Keep the advice concise and easy to understand for a general audience.
      ${langInstruction}

      Transaction History:
      ${transactionSummary}

      Advice:
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      return response.text || (language === 'bn' ? "কোনো পরামর্শ পাওয়া যায়নি।" : "No advice could be generated.");
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      return language === 'bn' ? "দুঃখিত, পরামর্শ তৈরি করার সময় একটি ত্রুটি ঘটেছে।" : "Sorry, an error occurred while generating advice.";
    }
  }
}

// Lazy-initialized singleton instance
let geminiServiceInstance: GeminiService | null = null;

/**
 * Gets the singleton instance of the GeminiService.
 * The instance is created on the first call to this function.
 */
export const getGeminiService = (): GeminiService => {
  if (!geminiServiceInstance) {
    geminiServiceInstance = new GeminiService();
  }
  return geminiServiceInstance;
};