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
    const systemPrompt = `You are a nutrition expert specializing in AFRICAN CUISINE, particularly West African dishes. Analyze food images and return ONLY a valid JSON object with the following structure:
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

CRITICAL RULES - APPLY INTELLIGENTLY BASED ON IMAGE TYPE:

1. IDENTIFY THE IMAGE TYPE FIRST:
   - Is it a PACKAGED PRODUCT (wrapper, box, label visible)?
   - Is it a PREPARED DISH (food on plate, bowl, or served)?
   - Is it BOTH (packaged product with visible contents)?

2. FOR PACKAGED PRODUCTS (snacks, biscuits, drinks, etc.):
   - READ all visible text on packaging (product name, labels, ingredients list)
   - EXTRACT ingredients from packaging text
   - INFER main ingredients from product name (e.g., "Coco Choco" → coconut, chocolate)
   - Look for nutritional tables on packaging
   - If contents are visible through packaging, describe what you see
   - Combine packaging info + visual contents for complete analysis

3. FOR PREPARED AFRICAN DISHES:
   - RECOGNIZE SPECIFIC AFRICAN INGREDIENTS:
     * Attieké (cassava couscous) - NOT regular couscous - granular, white/cream colored
     * Fufu (pounded yam/cassava) - smooth, dough-like texture
     * Garri (cassava flakes) - granular, can be white or yellow
     * Plantain - larger than banana, can be fried (yellow/brown) or boiled
     * Jollof rice - orange/red colored rice
     * Thiéboudienne - Senegalese fish and rice dish
     * Mafé - peanut sauce stew
     * Ndolé - bitter leaf stew
   - ONLY list ingredients you can CLEARLY SEE
   - DO NOT confuse with similar non-African dishes
   - If you see granular white/cream grains with fish → likely ATTIEKÉ, not couscous

4. UNIVERSAL RULES (apply to all):
   - Be CONSERVATIVE - better to list fewer ingredients than hallucinate
   - DO NOT guess hidden ingredients
   - mainIngredients: 2-4 most prominent ingredients (visible OR from packaging)
   - ingredients: All identifiable ingredients (visible OR readable on packaging)
   - Combine visual analysis + text reading for best results
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
