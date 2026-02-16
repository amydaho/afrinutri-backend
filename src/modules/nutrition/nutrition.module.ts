import { Module } from '@nestjs/common';
import { NutritionController } from './nutrition.controller';
import { NutritionService } from './nutrition.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [NutritionController],
  providers: [NutritionService],
  exports: [NutritionService],
})
export class NutritionModule {}
