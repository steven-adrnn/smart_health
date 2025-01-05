// lib/recipeGeneration.ts
import axios from 'axios';
import { Database } from './database.types';

interface GeneratedRecipe {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

type Product = Database['public']['Tables']['products']['Row'];

export async function generateRecipesWithAI(
  cartItems: Product[]
): Promise<GeneratedRecipe[]> {
  const HUGGING_FACE_API_KEY = process.env.NEXT_PUBLIC_HUGGING_FACE_API_KEY;
  const MODEL_NAME = process.env.NEXT_PUBLIC_HUGGING_FACE_MODEL_NAME; // Atau ganti dengan model yang lebih canggih
  const API_URL = `https://api-inference.huggingface.co/models/${MODEL_NAME}`;

  try {
    const response = await axios.post(
      API_URL,
      { 
        inputs: createDetailedPrompt(cartItems),
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.9,
          top_k: 50,
          return_full_text: false
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // Perpanjang timeout
      }
    );

    const generatedText = response.data[0]?.generated_text || '';
    console.log('Generated Text:', generatedText);

    // Parse resep dengan metode yang lebih robust
    const recipes = parseRecipesFromText(generatedText);

    return recipes;

  } catch (error) {
    console.error('Comprehensive Error in Recipe Generation:', error);
    return [];
  }
}

function createDetailedPrompt(cartItems: Product[]): string {
  const ingredientNames = cartItems.map(item => item.name).join(', ');
  return `Harap buat resep makanan Indonesia menggunakan bahan: ${ingredientNames}. 
  Format resep dalam JSON dengan struktur:
  {
    "name": "Nama Resep",
    "description": "Deskripsi singkat resep",
    "ingredients": ["Bahan 1", "Bahan 2"],
    "instructions": ["Langkah 1", "Langkah 2"],
    "difficulty": "easy/medium/hard"
  }

  Contoh:
  {
    "name": "Nasi Goreng Spesial",
    "description": "Nasi goreng dengan bahan segar",
    "ingredients": ["Nasi", "Ayam", "Wortel", "Bawang"],
    "instructions": [
      "Panaskan minyak",
      "Tumis bawang",
      "Masukkan ayam",
      "Tambahkan nasi"
    ],
    "difficulty": "medium"
  }
  `;
}

function parseRecipesFromText(text: string): GeneratedRecipe[] {
  const jsonMatches = text.match(/\{[^}]+\}/g);
  
  if (!jsonMatches) {
    return [];
  }

  const recipes: GeneratedRecipe[] = [];

  for (const jsonStr of jsonMatches) {
    try {
      const recipe = JSON.parse(jsonStr);
      
      // Validasi struktur
      if (
        recipe.name && 
        recipe.description && 
        Array.isArray(recipe.ingredients) && 
        Array.isArray(recipe.instructions)
      ) {
        recipes.push({
          name: recipe.name,
          description: recipe.description,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          difficulty: ['easy', 'medium', 'hard'].includes(recipe.difficulty) 
            ? recipe.difficulty 
            : 'medium'
        });
      }
    } catch (error) {
      console.error('JSON Parsing Error:', error);
    }
  }

  return recipes;
}
