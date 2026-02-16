import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate')
  async generate(@Body() body: { prompt: string; systemPrompt?: string }) {
    const result = await this.aiService.generateCompletion(body.prompt, body.systemPrompt);
    return { result };
  }

  @Post('analyze-nutrition')
  async analyzeNutrition(@Body() body: { image: string }) {
    const result = await this.aiService.analyzeNutrition(body.image);
    return { result };
  }
}
