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

  // Validasi API Key
  if (!HUGGING_FACE_API_KEY) {
    console.error('Hugging Face API Key tidak tersedia');
    return [];
  }

  // Buat prompt yang komprehensif dalam bahasa Indonesia
  const ingredientNames = cartItems.map(item => item.name).join(', ');
  const prompt = `Buatlah minimal 3 resep masakan Indonesia yang menggunakan bahan-bahan berikut: ${ingredientNames}. 
  Untuk setiap resep, sertakan:
  - Nama Resep
  - Deskripsi Singkat
  - Daftar Bahan (dengan jumlah/takaran)
  - Langkah-Langkah Memasak
  - Tingkat Kesulitan (mudah/sedang/sulit)

  Format dalam JSON:
  [
    {
      "name": "Nama Resep",
      "description": "Deskripsi Resep",
      "ingredients": ["Bahan 1", "Bahan 2"],
      "instructions": ["Langkah 1", "Langkah 2"],
      "difficulty": "easy/medium/hard"
    },
    ...
  ]`;

  try {
    const response = await axios.post(
      API_URL,
      { 
        inputs: prompt,
        parameters: {
          max_new_tokens: 1000,
          temperature: 0.7,
          return_full_text: false
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Ekstrak dan parsing resep
    const generatedText = response.data[0].generated_text;
    
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
    // Coba parsing JSON
    const recipes = JSON.parse(text);
    
    // Validasi struktur
    if (Array.isArray(recipes)) {
      return recipes.map(recipe => ({
        name: recipe.name || 'Resep Tanpa Judul',
        description: recipe.description || 'Deskripsi tidak tersedia',
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || [],
        difficulty: ['easy', 'medium', 'hard'].includes(recipe.difficulty) 
          ? recipe.difficulty 
          : 'medium'
      }));
    }

    return [];
  } catch (error) {
    // Fallback parsing manual jika JSON parsing gagal
    console.warn('Parsing JSON gagal, menggunakan parsing manual');
    return [];
  }
}