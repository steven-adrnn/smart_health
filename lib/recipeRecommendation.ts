// lib/recipeRecommendation.ts
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/database.types';

type Product = Database['public']['Tables']['products']['Row'];

interface Ingredient {
    product_id: string;
    quantity: number;
}

export async function getPersonalizedRecipes(selectedProducts: Product[]) {
    // Ekstrak kategori dan ID produk
    const productCategories = Array.from(new Set(selectedProducts.map(p => p.category)));
    const productIds = selectedProducts.map(p => p.id);

    // Query resep berdasarkan kategori
    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('*')
        .or(
            productCategories.map(category => `category.cs.{${category}}`).join(',')
        );

    if (error) {
        console.error('Recipe Recommendation Error:', error);
        return [];
    }

    // Scoring Algorithm
    const scoredRecipes = recipes.map(recipe => {
        let matchScore = 0;

        // Scoring berdasarkan kesesuaian kategori
        productCategories.forEach(category => {
            if (recipe.category?.includes(category)) {
                matchScore += 10; // Tambah skor untuk kategori yang cocok
            }
        });

        // Scoring berdasarkan ingredient match
        const recipeIngredients: Ingredient[] = JSON.parse(recipe.ingredients as string);
        recipeIngredients.forEach((ingredient: Ingredient) => {
            if (productIds.includes(ingredient.product_id)) {
                matchScore += 20; // Tambah skor untuk bahan yang cocok
            }
        });

        return { 
            ...recipe, 
            matchScore 
        };
    });

    // Urutkan berdasarkan match score tertinggi
    return scoredRecipes
        .filter(r => r.matchScore > 0) // Hanya ambil resep dengan skor lebih dari 0
        .sort((a, b) => b.matchScore - a.matchScore) // Urutkan berdasarkan skor
        .slice(0, 5); // Batasi 5 resep teratas
}