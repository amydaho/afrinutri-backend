import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class NutritionService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly aiService: AiService,
  ) {}

  async createMeal(userId: string, mealData: any) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('meals')
      .insert({
        user_id: userId,
        name: mealData.name,
        date: mealData.date,
        meal_type: mealData.mealType,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async addIngredient(mealId: string, ingredientData: any) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('ingredients')
      .insert({
        meal_id: mealId,
        name: ingredientData.name,
        quantity: ingredientData.quantity,
        unit: ingredientData.unit,
        calories: ingredientData.calories,
        protein: ingredientData.protein,
        carbs: ingredientData.carbs,
        fat: ingredientData.fat,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getMealsByDate(userId: string, date: string) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('meals')
      .select(`
        *,
        ingredients (*)
      `)
      .eq('user_id', userId)
      .eq('date', date);

    if (error) throw error;
    return data;
  }

  async getNutritionSummary(userId: string, date: string) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async updateNutritionLog(userId: string, date: string) {
    const supabase = this.supabaseService.getClient();
    
    const meals = await this.getMealsByDate(userId, date);
    
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    meals.forEach((meal: any) => {
      meal.ingredients?.forEach((ingredient: any) => {
        totalCalories += ingredient.calories || 0;
        totalProtein += ingredient.protein || 0;
        totalCarbs += ingredient.carbs || 0;
        totalFat += ingredient.fat || 0;
      });
    });

    const { data, error } = await supabase
      .from('nutrition_logs')
      .upsert({
        user_id: userId,
        date,
        total_calories: totalCalories,
        total_protein: totalProtein,
        total_carbs: totalCarbs,
        total_fat: totalFat,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async analyzeFoodImage(userId: string, imageBase64: string) {
    const analysis = await this.aiService.analyzeNutrition(imageBase64);
    
    // Generate a temporary scan ID (UUID)
    const scanId = `scan_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Return analysis without saving to Supabase
    // TODO: Add Supabase persistence when food_scans table is created
    return { analysis, scanId };
  }
}
