// lib/recipeGeneration.ts
import axios from 'axios';
import { Database } from './database.types';

type Product = Database['public']['Tables']['products']['Row'];

interface GeneratedRecipe {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export async function generateRecipesWithAI(
  cartItems: Product[]
): Promise<GeneratedRecipe[]> {
  const HUGGING_FACE_API_KEY = process.env.NEXT_PUBLIC_HUGGING_FACE_API_KEY;
  const MODEL_NAME = process.env.NEXT_PUBLIC_HUGGING_FACE_MODEL_NAME;
  const API_URL = `https://api-inference.huggingface.co/models/${MODEL_NAME}`;
  console.log('API Key Status:', HUGGING_FACE_API_KEY ? 'Tersedia' : 'Tidak Tersedia');

  if (!HUGGING_FACE_API_KEY) {
    console.error('Hugging Face API Key tidak tersedia');
    return [];
  }

  function createPrompt(cartItems: Product[]): string {
    const ingredientNames = cartItems.map(item => item.name).join(', ');
    return `Hasilkan resep masakan Indonesia dalam format JSON VALID menggunakan bahan: ${ingredientNames}. 
    Format HARUS seperti ini:
    [
      {
        "name": "Nama Resep",
        "description": "Deskripsi singkat resep",
        "ingredients": ["Bahan 1", "Bahan 2"],
        "instructions": ["Langkah 1", "Langkah 2"],
        "difficulty": "easy/medium/hard"
      }
    ]
  
    Contoh Bahan: ${ingredientNames}
    Hasilkan resep yang VALID dan HANYA dalam format JSON!`;
  }

  try {
    const response = await axios.post(
      API_URL,
      { 
        inputs: createPrompt(cartItems),
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          return_full_text: false,
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );
    console.log('Full API Response:', response.data);

    // Ekstrak dan parsing resep
    const generatedText = response.data[0].generated_text;
    console.log('Raw Generated Text:', generatedText);
    
    // Parsing JSON dari teks yang di-generate
    const recipes = parseRecipes(generatedText);

    return recipes;

  } catch (error) {
    console.error('Kesalahan Generasi Resep:', error);
    return [];
  }
}

function parseRecipes(text: string): GeneratedRecipe[] {
  try {
    // Gunakan regex tanpa flag 's' untuk kompatibilitas
    const cleanText = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()
      .replace(/\n/g, ' ')
      .replace(/\r/g, ' ');

    console.log('Cleaned Text:', cleanText);

    // Ubah pencarian regex
    const jsonMatches = cleanText.match(/\[.*?\]/);
    
    if (!jsonMatches) {
      console.error('No JSON-like structure found');
      return [];
    }

    const potentialJson = jsonMatches[0];
    console.log('Potential JSON:', potentialJson);

    // Tipe yang lebih spesifik untuk error
    let recipes: GeneratedRecipe[];
    try {
      recipes = JSON.parse(potentialJson);
    } catch (error: unknown) {
      // Tangani error parsing dengan tipe yang jelas
      if (error instanceof Error) {
        console.error('JSON Parsing Error:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
      } else {
        console.error('Unknown parsing error:', error);
      }
      return [];
    }
    
    return (Array.isArray(recipes) ? recipes : [recipes])
      .map((recipe: GeneratedRecipe) => ({
        name: recipe.name || `Resep Rahasia`,
        description: recipe.description || 'Resep tanpa deskripsi',
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || [],
        difficulty: ['easy', 'medium', 'hard'].includes(recipe.difficulty) 
          ? recipe.difficulty 
          : 'medium'
      }))
      .filter((recipe: GeneratedRecipe) => recipe.name && recipe.ingredients.length > 0);

  } catch (error: unknown) {
    // Tangani error dengan tipe yang jelas
    if (error instanceof Error) {
      console.error('Parsing Error Details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
    } else {
      console.error('Unknown error during parsing:', error);
    }
    return [];
  }
}

