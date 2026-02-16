import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { NutritionService } from './nutrition.service';

@Controller('nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Post('meals')
  async createMeal(@Body() body: { userId: string; mealData: any }) {
    return this.nutritionService.createMeal(body.userId, body.mealData);
  }

  @Post('meals/:mealId/ingredients')
  async addIngredient(
    @Param('mealId') mealId: string,
    @Body() ingredientData: any,
  ) {
    return this.nutritionService.addIngredient(mealId, ingredientData);
  }

  @Get('meals')
  async getMealsByDate(
    @Query('userId') userId: string,
    @Query('date') date: string,
  ) {
    return this.nutritionService.getMealsByDate(userId, date);
  }

  @Get('summary')
  async getNutritionSummary(
    @Query('userId') userId: string,
    @Query('date') date: string,
  ) {
    return this.nutritionService.getNutritionSummary(userId, date);
  }

  @Put('summary')
  async updateNutritionLog(@Body() body: { userId: string; date: string }) {
    return this.nutritionService.updateNutritionLog(body.userId, body.date);
  }

  @Post('analyze-food')
  async analyzeFoodImage(@Body() body: { userId: string; image: string }) {
    return this.nutritionService.analyzeFoodImage(body.userId, body.image);
  }
}
