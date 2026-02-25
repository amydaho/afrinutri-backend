import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { SupabaseService } from '../supabase/supabase.service';

interface OpenFoodFactsProduct {
  product_name: string;
  nutriments: {
    'energy-kcal_100g'?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    fiber_100g?: number;
  };
}

interface NutritionData {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  source: string;
}

@Injectable()
export class NutritionLookupService {
  private readonly OPEN_FOOD_FACTS_API = 'https://world.openfoodfacts.org/api/v2';

  constructor(private readonly supabaseService: SupabaseService) {}
  
  async searchByBarcode(barcode: string): Promise<NutritionData | null> {
    try {
      // Search by barcode - most accurate method
      const response = await axios.get(`${this.OPEN_FOOD_FACTS_API}/product/${barcode}.json`);

      if (response.data.status === 1 && response.data.product) {
        const product: OpenFoodFactsProduct = response.data.product;
        
        const nutritionData = {
          name: product.product_name || barcode,
          calories: product.nutriments['energy-kcal_100g'] || 0,
          protein: product.nutriments.proteins_100g || 0,
          carbs: product.nutriments.carbohydrates_100g || 0,
          fat: product.nutriments.fat_100g || 0,
          fiber: product.nutriments.fiber_100g || 0,
          source: 'Open Food Facts (Barcode)',
        };

        // Save to cache
        await this.saveToCache(nutritionData);

        return nutritionData;
      }

      return null;
    } catch (error) {
      console.error(`Error searching barcode ${barcode}:`, error.message);
      return null;
    }
  }

  async searchIngredient(ingredientName: string, brand?: string): Promise<NutritionData | null> {
    const normalized = ingredientName.toLowerCase().trim();
    
    try {
      // Step 1: Check Supabase cache first
      const cachedData = await this.searchCache(normalized);
      if (cachedData) {
        return cachedData;
      }

      // Step 2: Search Open Food Facts with brand if available
      const searchTerms = brand ? `${brand} ${ingredientName}` : ingredientName;
      
      const response = await axios.get(`${this.OPEN_FOOD_FACTS_API}/search`, {
        params: {
          search_terms: searchTerms,
          search_simple: 1,
          action: 'process',
          json: 1,
          page_size: 1,
          fields: 'product_name,nutriments',
        },
      });

      if (response.data.products && response.data.products.length > 0) {
        const product: OpenFoodFactsProduct = response.data.products[0];
        
        const nutritionData = {
          name: product.product_name || ingredientName,
          calories: product.nutriments['energy-kcal_100g'] || 0,
          protein: product.nutriments.proteins_100g || 0,
          carbs: product.nutriments.carbohydrates_100g || 0,
          fat: product.nutriments.fat_100g || 0,
          fiber: product.nutriments.fiber_100g || 0,
          source: 'Open Food Facts',
        };

        // Step 3: Save to cache for future use
        await this.saveToCache(nutritionData);

        return nutritionData;
      }

      return null;
    } catch (error) {
      console.error(`Error searching ingredient ${ingredientName}:`, error.message);
      return null;
    }
  }

  private async searchCache(normalizedName: string): Promise<NutritionData | null> {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('nutrition_cache')
      .select('*')
      .eq('food_name_normalized', normalizedName)
      .single();

    if (error || !data) return null;

    // Increment usage counter
    await supabase.rpc('increment_nutrition_cache_usage', { cache_id: data.id });

    return {
      name: data.food_name,
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
      fiber: data.fiber,
      source: `${data.data_source} (cached)`,
    };
  }

  private async saveToCache(nutritionData: NutritionData): Promise<void> {
    const supabase = this.supabaseService.getClient();
    
    await supabase
      .from('nutrition_cache')
      .upsert({
        food_name: nutritionData.name,
        food_name_normalized: nutritionData.name.toLowerCase().trim(),
        calories: nutritionData.calories,
        protein: nutritionData.protein,
        carbs: nutritionData.carbs,
        fat: nutritionData.fat,
        fiber: nutritionData.fiber,
        data_source: nutritionData.source,
        verified: false,
        times_used: 1,
      });
  }

  async enrichNutritionData(
    dishName: string,
    ingredients: string[],
    aiEstimate: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
    },
    brand?: string,
  ): Promise<{
    enriched: boolean;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sources: string[];
  }> {
    // Try to find nutrition data for the dish itself first (with brand if available)
    const dishData = await this.searchIngredient(dishName, brand);
    
    if (dishData) {
      return {
        enriched: true,
        calories: dishData.calories,
        protein: dishData.protein,
        carbs: dishData.carbs,
        fat: dishData.fat,
        fiber: dishData.fiber,
        sources: [dishData.source],
      };
    }

    // If dish not found, try to enrich based on ingredients
    const ingredientData = await Promise.all(
      ingredients.slice(0, 5).map(ing => this.searchIngredient(ing))
    );

    const validData = ingredientData.filter(d => d !== null);

    if (validData.length > 0) {
      // Average the nutrition data from found ingredients
      const avg = validData.reduce(
        (acc, data) => ({
          calories: acc.calories + data.calories,
          protein: acc.protein + data.protein,
          carbs: acc.carbs + data.carbs,
          fat: acc.fat + data.fat,
          fiber: acc.fiber + data.fiber,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
      );

      const count = validData.length;

      return {
        enriched: true,
        calories: Math.round(avg.calories / count),
        protein: Math.round(avg.protein / count),
        carbs: Math.round(avg.carbs / count),
        fat: Math.round(avg.fat / count),
        fiber: Math.round(avg.fiber / count),
        sources: validData.map(d => d.source),
      };
    }

    // Fallback to AI estimate
    return {
      enriched: false,
      ...aiEstimate,
      sources: ['AI Estimate'],
    };
  }
}
