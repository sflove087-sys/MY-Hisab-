
import { GoogleGenAI } from "@google/genai";
import { Transaction } from '../types';

class GeminiService {
  private ai: GoogleGenAI | null = null;
  
  constructor() {
    const apiKey = process.env.API_KEY;
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    } else {
      console.warn("API_KEY environment variable not set. GeminiService will be disabled.");
    }
  }

  async getFinancialAdvice(transactions: Transaction[], language: 'en' | 'bn'): Promise<string> {
    if (!this.ai) {
      return language === 'bn' ? "AI পরিষেবা উপলব্ধ নেই কারণ API কী সেট করা নেই।" : "AI service is unavailable because the API key is not set.";
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

export const geminiService = new GeminiService();
