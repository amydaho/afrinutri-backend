import { Injectable } from '@nestjs/common';
import axios from 'axios';

interface DishRecipe {
  dishName: string;
  ingredients: string[];
  mainIngredients: string[];
  estimatedNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  source: string;
}

@Injectable()
export class AfricanDishesService {
  private readonly OPEN_FOOD_FACTS_API = 'https://world.openfoodfacts.org/api/v2';
  
  // Base de données locale des plats africains typiques
  private readonly AFRICAN_DISHES_DB: Record<string, DishRecipe> = {
    'attieke': {
      dishName: 'Attieké',
      ingredients: ['attieké (semoule de manioc)', 'poisson', 'tomate', 'oignon', 'piment'],
      mainIngredients: ['attieké', 'poisson'],
      estimatedNutrition: { calories: 180, protein: 25, carbs: 35, fat: 8, fiber: 3 },
      source: 'African Dishes Database',
    },
    'jollof rice': {
      dishName: 'Jollof Rice',
      ingredients: ['riz', 'tomate', 'oignon', 'poivron', 'huile', 'épices', 'poulet ou poisson'],
      mainIngredients: ['riz', 'tomate', 'poulet'],
      estimatedNutrition: { calories: 200, protein: 15, carbs: 45, fat: 10, fiber: 2 },
      source: 'African Dishes Database',
    },
    'fufu': {
      dishName: 'Fufu',
      ingredients: ['igname pilée', 'manioc', 'eau', 'sauce (gombo, arachide, ou feuilles)'],
      mainIngredients: ['igname', 'manioc'],
      estimatedNutrition: { calories: 150, protein: 2, carbs: 38, fat: 1, fiber: 3 },
      source: 'African Dishes Database',
    },
    'mafe': {
      dishName: 'Mafé',
      ingredients: ['viande (boeuf/poulet)', 'pâte d\'arachide', 'tomate', 'oignon', 'carotte', 'chou', 'patate douce'],
      mainIngredients: ['viande', 'pâte d\'arachide', 'légumes'],
      estimatedNutrition: { calories: 250, protein: 20, carbs: 25, fat: 18, fiber: 4 },
      source: 'African Dishes Database',
    },
    'thieboudienne': {
      dishName: 'Thiéboudienne',
      ingredients: ['riz', 'poisson', 'tomate', 'oignon', 'carotte', 'chou', 'aubergine', 'manioc', 'patate douce'],
      mainIngredients: ['riz', 'poisson', 'légumes'],
      estimatedNutrition: { calories: 220, protein: 22, carbs: 40, fat: 8, fiber: 5 },
      source: 'African Dishes Database',
    },
    'ndole': {
      dishName: 'Ndolé',
      ingredients: ['feuilles de ndolé', 'arachide', 'viande ou poisson', 'crevettes', 'oignon', 'ail', 'huile'],
      mainIngredients: ['feuilles de ndolé', 'arachide', 'viande'],
      estimatedNutrition: { calories: 280, protein: 25, carbs: 15, fat: 22, fiber: 6 },
      source: 'African Dishes Database',
    },
    'alloco': {
      dishName: 'Alloco',
      ingredients: ['banane plantain', 'huile de friture', 'oignon', 'piment', 'tomate'],
      mainIngredients: ['banane plantain'],
      estimatedNutrition: { calories: 200, protein: 2, carbs: 35, fat: 12, fiber: 3 },
      source: 'African Dishes Database',
    },
    'kedjenou': {
      dishName: 'Kedjenou',
      ingredients: ['poulet', 'oignon', 'tomate', 'aubergine', 'piment', 'gingembre', 'ail'],
      mainIngredients: ['poulet', 'légumes'],
      estimatedNutrition: { calories: 180, protein: 28, carbs: 12, fat: 10, fiber: 3 },
      source: 'African Dishes Database',
    },
    'poulet dg': {
      dishName: 'Poulet DG',
      ingredients: ['poulet', 'banane plantain', 'carotte', 'haricots verts', 'oignon', 'poivron', 'tomate'],
      mainIngredients: ['poulet', 'banane plantain', 'légumes'],
      estimatedNutrition: { calories: 220, protein: 25, carbs: 30, fat: 12, fiber: 4 },
      source: 'African Dishes Database',
    },
    'garri': {
      dishName: 'Garri',
      ingredients: ['semoule de manioc', 'eau', 'sucre ou lait (optionnel)', 'arachides'],
      mainIngredients: ['semoule de manioc'],
      estimatedNutrition: { calories: 160, protein: 2, carbs: 40, fat: 1, fiber: 2 },
      source: 'African Dishes Database',
    },
  };

  async searchAfricanDish(dishName: string): Promise<DishRecipe | null> {
    const normalized = dishName.toLowerCase().trim();
    
    // Step 1: Check local database first
    for (const [key, recipe] of Object.entries(this.AFRICAN_DISHES_DB)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        console.log(`Found African dish in local DB: ${recipe.dishName}`);
        return recipe;
      }
    }

    // Step 2: Try Open Food Facts for the dish
    try {
      const response = await axios.get(`${this.OPEN_FOOD_FACTS_API}/search`, {
        params: {
          search_terms: dishName,
          search_simple: 1,
          action: 'process',
          json: 1,
          page_size: 3,
          fields: 'product_name,ingredients_text,nutriments',
        },
      });

      if (response.data.products && response.data.products.length > 0) {
        const product = response.data.products[0];
        
        // Extract ingredients from text
        const ingredientsText = product.ingredients_text || '';
        const ingredients = ingredientsText
          .split(/[,;]/)
          .map((i: string) => i.trim())
          .filter((i: string) => i.length > 0)
          .slice(0, 10); // Limit to 10 ingredients

        if (ingredients.length > 0) {
          return {
            dishName: product.product_name || dishName,
            ingredients,
            mainIngredients: ingredients.slice(0, 3),
            estimatedNutrition: {
              calories: product.nutriments['energy-kcal_100g'] || 200,
              protein: product.nutriments.proteins_100g || 15,
              carbs: product.nutriments.carbohydrates_100g || 30,
              fat: product.nutriments.fat_100g || 10,
              fiber: product.nutriments.fiber_100g || 3,
            },
            source: 'Open Food Facts',
          };
        }
      }
    } catch (error) {
      console.error(`Error searching African dish ${dishName}:`, error.message);
    }

    return null;
  }

  async enrichWithTypicalIngredients(
    dishName: string,
    visibleIngredients: string[],
    aiEstimate: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
    },
  ): Promise<{
    enriched: boolean;
    ingredients: string[];
    mainIngredients: string[];
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    source: string;
  }> {
    // Search for the dish online
    const dishRecipe = await this.searchAfricanDish(dishName);

    if (dishRecipe) {
      // Combine visible ingredients with typical ingredients
      const combinedIngredients = [
        ...new Set([...visibleIngredients, ...dishRecipe.ingredients]),
      ];

      return {
        enriched: true,
        ingredients: combinedIngredients,
        mainIngredients: dishRecipe.mainIngredients,
        calories: dishRecipe.estimatedNutrition.calories,
        protein: dishRecipe.estimatedNutrition.protein,
        carbs: dishRecipe.estimatedNutrition.carbs,
        fat: dishRecipe.estimatedNutrition.fat,
        fiber: dishRecipe.estimatedNutrition.fiber,
        source: `${dishRecipe.source} (typical recipe)`,
      };
    }

    // Fallback to AI estimate if no recipe found
    return {
      enriched: false,
      ingredients: visibleIngredients,
      mainIngredients: visibleIngredients.slice(0, 3),
      ...aiEstimate,
      source: 'AI Estimate',
    };
  }
}
