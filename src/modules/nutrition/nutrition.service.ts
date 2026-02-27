import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AiService } from '../ai/ai.service';
import { NutritionLookupService } from './nutrition-lookup.service';
import { AfricanDishesService } from './african-dishes.service';

@Injectable()
export class NutritionService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly aiService: AiService,
    private readonly nutritionLookupService: NutritionLookupService,
    private readonly africanDishesService: AfricanDishesService,
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
    // Step 1: Get AI analysis
    const aiAnalysis = await this.aiService.analyzeNutrition(imageBase64);
    
    // Step 2: For packaged products, try barcode lookup first
    let enrichedData;
    
    if (aiAnalysis.barcode) {
      console.log(`Searching by barcode: ${aiAnalysis.barcode}`);
      const barcodeData = await this.nutritionLookupService.searchByBarcode(aiAnalysis.barcode);
      
      if (barcodeData) {
        enrichedData = {
          enriched: true,
          calories: barcodeData.calories,
          protein: barcodeData.protein,
          carbs: barcodeData.carbs,
          fat: barcodeData.fat,
          fiber: barcodeData.fiber,
          sources: [barcodeData.source],
        };
      }
    }
    
    // Step 3: If no barcode or barcode search failed, check confidence level
    if (!enrichedData) {
      // For African dishes with low confidence, search for typical recipe
      if (!aiAnalysis.barcode && aiAnalysis.confidence && aiAnalysis.confidence < 60) {
        console.log(`Low confidence (${aiAnalysis.confidence}%) for ${aiAnalysis.dishName}, searching for typical African recipe...`);
        
        const africanDishData = await this.africanDishesService.enrichWithTypicalIngredients(
          aiAnalysis.dishName,
          aiAnalysis.ingredients || [],
          {
            calories: aiAnalysis.calories,
            protein: aiAnalysis.protein,
            carbs: aiAnalysis.carbs,
            fat: aiAnalysis.fat,
            fiber: aiAnalysis.fiber,
          },
        );

        enrichedData = {
          enriched: africanDishData.enriched,
          calories: africanDishData.calories,
          protein: africanDishData.protein,
          carbs: africanDishData.carbs,
          fat: africanDishData.fat,
          fiber: africanDishData.fiber,
          sources: [africanDishData.source],
        };

        // Update ingredients with typical ones
        aiAnalysis.ingredients = africanDishData.ingredients;
        aiAnalysis.mainIngredients = africanDishData.mainIngredients;
      } else {
        // Standard enrichment for high confidence or non-African dishes
        enrichedData = await this.nutritionLookupService.enrichNutritionData(
          aiAnalysis.dishName,
          aiAnalysis.ingredients,
          {
            calories: aiAnalysis.calories,
            protein: aiAnalysis.protein,
            carbs: aiAnalysis.carbs,
            fat: aiAnalysis.fat,
            fiber: aiAnalysis.fiber,
          },
          aiAnalysis.productBrand, // Pass brand for better search
        );
      }
    }

    // Step 4: Combine AI analysis with enriched data
    const analysis = {
      ...aiAnalysis,
      calories: enrichedData.calories,
      protein: enrichedData.protein,
      carbs: enrichedData.carbs,
      fat: enrichedData.fat,
      fiber: enrichedData.fiber,
      enriched: enrichedData.enriched,
      dataSources: enrichedData.sources,
    };

    // Step 4: Save to Supabase
    const supabase = this.supabaseService.getClient();
    
    const { data: scanData, error } = await supabase
      .from('food_scans')
      .insert({
        user_id: userId,
        image_url: imageBase64.substring(0, 100), // Store preview only
        analysis_result: analysis,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving to Supabase:', error);
      // Return analysis even if save fails
      return { 
        analysis, 
        scanId: `temp_${Date.now()}`,
        saved: false,
      };
    }

    return { 
      analysis, 
      scanId: scanData.id,
      saved: true,
    };
  }

  async getSavedScan(scanId: string) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('food_scans')
      .select('*')
      .eq('id', scanId)
      .single();

    if (error) throw error;
    return data;
  }

  async searchSimilarDish(dishName: string) {
    const supabase = this.supabaseService.getClient();
    
    // Search for similar dishes in past scans
    const { data, error } = await supabase
      .from('food_scans')
      .select('analysis_result')
      .ilike('analysis_result->>dishName', `%${dishName}%`)
      .limit(5);

    if (error) {
      console.error('Error searching similar dishes:', error);
      return [];
    }

    return data.map(d => d.analysis_result);
  }
}
