// lib/recipeGeneration.ts
import axios from 'axios';
import { Database } from './database.types';

// Definisi tipe yang ketat
interface RawRecipe {
  name?: string;
  description?: string;
  ingredients?: string[];
  instructions?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
}

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
  const MODEL_NAME = 'gpt2';
  const API_URL = `https://api-inference.huggingface.co/models/${MODEL_NAME}`;

  try {
    const response = await axios.post(
      API_URL,
      { 
        inputs: createDetailedPrompt(cartItems),
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          return_full_text: false
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

    const generatedText = response.data[0]?.generated_text || '';
    console.log('Raw Generated Text:', generatedText);

    const recipes = parseRecipes(generatedText, cartItems);

    return recipes ;

  } catch (error) {
    console.error('Comprehensive Error Logging:', {
      errorName: error instanceof Error ? error.name : 'Unknown Error',
      errorMessage: error instanceof Error ? error.message : 'No error message',
      errorStack: error instanceof Error ? error.stack : 'No stack trace'
    });

    return [];
  }
}

function createDetailedPrompt(cartItems: Product[]): string {
  const ingredientNames = cartItems.map(item => item.name).join(', ');
  return `Hasilkan SATU resep masakan Indonesia menggunakan bahan: ${ingredientNames}. 
  Format WAJIB dalam JSON VALID seperti contoh:
  {
    "name": "Nama Resep Spesifik",
    "description": "Deskripsi singkat resep yang menggugah selera",
    "ingredients": ["Bahan 1 dari daftar", "Bahan 2 dari daftar", "Bumbu tambahan"],
    "instructions": [
      "Langkah persiapan bahan",
      "Proses memasak detail",
      "Tips memasak yang berguna"
    ],
    "difficulty": "easy/medium/hard"
  }

  PENTING:
  - Gunakan bahan dari: ${ingredientNames}
  - Buat resep Indonesia asli
  - Detail instruksi
  - Pilih kesulitan sesuai kompleksitas
  - HANYA kembalikan JSON VALID
  - Tidak boleh ada teks di luar JSON`;
}

function parseRecipes(
  text: string, 
  cartItems: Product[]
): GeneratedRecipe[] {
  try {
    // Preprocessing teks
    const cleanText = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()
      .replace(/\n/g, ' ')
      .replace(/\r/g, ' ')
      .replace(/\s+/g, ' ');

    console.log('Cleaned Text:', cleanText);

    // Ekstrasi JSON menggunakan regex yang lebih robust
    const jsonMatch = cleanText.match(/\{[^}]*"name"[^}]*\}/);
    
    if (!jsonMatch) {
      console.error('No valid JSON structure found');
      return [];
    }

    const potentialJson = jsonMatch[0];
    console.log('Potential JSON:', potentialJson);

    // Parse JSON dengan penanganan error
    let recipeData: RawRecipe;
    try {
      recipeData = JSON.parse(potentialJson);
    } catch (parseError) {
      console.error('JSON Parsing Error:', parseError);
      return [];
    }

    // Validasi dan transformasi resep
    const recipe: GeneratedRecipe = {
      name: recipeData.name || `Resep ${cartItems[0]?.name || 'Spesial'}`,
      description: recipeData.description || 'Resep masakan Indonesia',
      ingredients: recipeData.ingredients?.length 
        ? recipeData.ingredients 
        : cartItems.map(item => item.name).concat(['Garam', 'Minyak']),
      instructions: recipeData.instructions?.length 
        ? recipeData.instructions 
        : [
            'Cuci bahan dengan bersih',
            'Potong bahan sesuai kebutuhan',
            'Panaskan minyak di wajan',
            'Masak dengan api sedang',
            'Tambahkan bumbu secukupnya'
          ],
      difficulty: ['easy', 'medium', 'hard'].includes(recipeData.difficulty as string)
        ? recipeData.difficulty as GeneratedRecipe['difficulty']
        : 'medium'
    };

    return [recipe];

  } catch (error) {
    console.error('Comprehensive Parsing Error:', error);
    return [];
  }
}