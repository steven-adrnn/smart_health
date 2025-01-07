// pages/api/recipes.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { generateRecipesWithAI } from '@/lib/recipeGeneration';
import { Database } from '@/lib/database.types';
import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase Service Role untuk validasi
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  // Middleware CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://fit-kitchen-frontend-tst.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Hanya izinkan POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Validasi API Key
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.RECIPE_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Ekstrak bahan dari request body
    const { ingredients } = req.body;

    // Validasi input
    if (!ingredients || !Array.isArray(ingredients)) {
      return res.status(400).json({ 
        error: 'Invalid input. Provide an array of ingredients.' 
      });
    }

    // Generate resep menggunakan fungsi existing
    const recipes = await generateRecipesWithAI(
      ingredients.map(ing => ({
        id: '',
        name: ing,
        price: 0,
        image: null,
        category: '',
        description: null,
        farm: '',
        rating: 0,
        quantity: 0,
        created_at: new Date().toISOString()
      }))
    );

    // Simpan resep ke database (opsional)
    if (recipes.length > 0) {
      const insertPromises = recipes.map(recipe => 
        supabase.from('recipes').insert({
          user_id: 'system', // Atau gunakan ID khusus untuk resep eksternal
          name: recipe.name,
          description: recipe.description,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          difficulty: recipe.difficulty,
          original_products: [] // Kosongkan karena dari API eksternal
        })
      );

      await Promise.all(insertPromises);
    }

    // Kembalikan resep
    return res.status(200).json({
      success: true,
      recipes: recipes,
      metadata: {
        generatedAt: new Date().toISOString(),
        totalRecipes: recipes.length
      }
    });

  } catch (error) {
    console.error('Recipe Generation Error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate recipes', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}