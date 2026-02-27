import { Module } from '@nestjs/common';
import { NutritionController } from './nutrition.controller';
import { NutritionService } from './nutrition.service';
import { NutritionLookupService } from './nutrition-lookup.service';
import { AfricanDishesService } from './african-dishes.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [NutritionController],
  providers: [NutritionService, NutritionLookupService, AfricanDishesService],
  exports: [NutritionService],
})
export class NutritionModule {}
