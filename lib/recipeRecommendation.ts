// lib/recipeRecommendation.ts
import { supabase } from './supabaseClient';
import { Database } from './database.types';

type Product = Database['public']['Tables']['products']['Row'];
type Recipe = Database['public']['Tables']['recipes']['Row'];

export async function getRecipeRecommendations(cartItems: Product[]): Promise<Recipe[]> {
  // Ekstrak ID produk dari cart
  const cartProductIds = cartItems.map(item => item.id);

  // Ambil semua resep
  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('*');

  if (error || !recipes) {
    console.error('Error fetching recipes:', error);
    return [];
  }

  // Filter resep yang memiliki setidaknya 50% bahan yang ada di cart
  const recommendedRecipes = recipes.filter(recipe => {
    const matchingIngredients = recipe.ingredients.filter((ingredientId: string) => 
      cartProductIds.includes(ingredientId)
    );
    
    // Minimal 50% bahan resep ada di cart
    const matchPercentage = (matchingIngredients.length / recipe.ingredients.length) * 100;
    return matchPercentage >= 50;
  });

  return recommendedRecipes;
}