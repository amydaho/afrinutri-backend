import { Injectable } from '@nestjs/common';
import { google } from '@ai-sdk/google';
import { generateText, streamText } from 'ai';

@Injectable()
export class AiService {
  private model: string;

  constructor() {
    this.model = process.env.AI_MODEL || 'gemini-1.5-flash';
  }

  async generateCompletion(prompt: string, systemPrompt?: string) {
    const { text } = await generateText({
      model: google(this.model),
      messages: [
        ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
        { role: 'user' as const, content: prompt },
      ],
    });

    return text;
  }

  async streamCompletion(prompt: string, systemPrompt?: string) {
    const result = await streamText({
      model: google(this.model),
      messages: [
        ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
        { role: 'user' as const, content: prompt },
      ],
    });

    return result.toTextStreamResponse();
  }

  async analyzeNutrition(imageBase64: string) {
    const systemPrompt = `You are a nutrition expert specializing in African cuisine. Analyze food images and return ONLY a valid JSON object with the following structure:
{
  "dishName": "name of the dish",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "fiber": number,
  "ingredients": ["ingredient1", "ingredient2", ...],
  "mainIngredients": ["main1", "main2", ...],
  "estimatedWeight": number,
  "confidence": number (0-100)
}

CRITICAL RULES:
- ONLY list ingredients that you can CLEARLY SEE in the image
- DO NOT guess or assume hidden ingredients
- DO NOT add typical ingredients if you cannot see them
- If you cannot identify an ingredient with certainty, DO NOT include it
- mainIngredients: ONLY the 2-4 most visible and prominent ingredients you can actually see
- ingredients: ONLY ingredients that are clearly visible in the image
- All nutritional values are per 100g
- estimatedWeight: Estimate the total weight of the portion in grams (e.g., 150, 250, 300)
  * Use visual cues like plate size, portion size, and food density
  * Common African dish portions: 200-400g
  * If uncertain, estimate conservatively
- confidence: Your confidence level (0-100) in the analysis
- Be conservative - it's better to list fewer ingredients than to hallucinate
- Return ONLY the JSON object, no additional text`;

    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      messages: [
        {
          role: 'user' as const,
          content: [
            { type: 'text', text: systemPrompt + '\n\nAnalyze this African dish and provide detailed nutritional information in JSON format.' },
            { type: 'image', image: imageBase64 },
          ],
        },
      ],
    });

    // Parse JSON response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No JSON found in response');
    } catch (error) {
      console.error('Failed to parse AI response:', text);
      throw new Error('Failed to parse nutrition analysis');
    }
  }
}
