import { Injectable } from '@nestjs/common';
import { openai } from '@ai-sdk/openai';
import { generateText, streamText } from 'ai';

@Injectable()
export class AiService {
  private model: string;

  constructor() {
    this.model = process.env.AI_MODEL || 'gpt-4-turbo-preview';
  }

  async generateCompletion(prompt: string, systemPrompt?: string) {
    const { text } = await generateText({
      model: openai(this.model),
      messages: [
        ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
        { role: 'user' as const, content: prompt },
      ],
    });

    return text;
  }

  async streamCompletion(prompt: string, systemPrompt?: string) {
    const result = await streamText({
      model: openai(this.model),
      messages: [
        ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
        { role: 'user' as const, content: prompt },
      ],
    });

    return result.toTextStreamResponse();
  }

  async analyzeNutrition(imageBase64: string) {
    const { text } = await generateText({
      model: openai('gpt-4-vision-preview'),
      messages: [
        {
          role: 'system' as const,
          content: 'You are a nutrition expert. Analyze food images and provide detailed nutritional information.',
        },
        {
          role: 'user' as const,
          content: [
            { type: 'text', text: 'Analyze this food image and provide nutritional information including calories, protein, carbs, and fats.' },
            { type: 'image', image: imageBase64 },
          ],
        },
      ],
    });

    return text;
  }
}
