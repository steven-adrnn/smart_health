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
    // Periksa apakah SEMUA bahan resep ada di cart
    return recipe.ingredients.every((ingredientId: string) => 
        cartProductIds.includes(ingredientId)
      );
  });

  return recommendedRecipes;
}