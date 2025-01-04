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
  const MODEL_NAME = process.env.NEXT_PUBLIC_HUGGING_FACE_MODEL_NAME;
  const API_URL = `https://api-inference.huggingface.co/models/${MODEL_NAME}`;

  try {
    const response = await axios.post(
      API_URL,
      { 
        inputs: createUltraSpecificPrompt(cartItems),
        parameters: {
          max_new_tokens: 300,
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

    const recipes = extractAndParseRecipes(generatedText, cartItems);

    return recipes;

  } catch (error) {
    console.error('Comprehensive Error Logging:', error);
    return [];
  }
}

function createUltraSpecificPrompt(cartItems: Product[]): string {
  const ingredientNames = cartItems.map(item => item.name).join(', ');
  return `GENERATE EXACT JSON RECIPE:
{
  "name": "Indonesian Recipe with ${ingredientNames}",
  "description": "Authentic Indonesian dish",
  "ingredients": ["${ingredientNames}", "Salt", "Oil"],
  "instructions": [
    "Prepare ingredients",
    "Cook carefully",
    "Season to taste"
  ],
  "difficulty": "medium"
}

STRICT RULES:
- ONLY RETURN VALID JSON
- USE INGREDIENTS: ${ingredientNames}
- NO EXTRA TEXT
- COMPLETE JSON STRUCTURE
- FOCUS ON INDONESIAN CUISINE`;
}

function extractAndParseRecipes(
  text: string, 
  cartItems: Product[]
): GeneratedRecipe[] {
  try {
    // Aggressive cleaning and extraction
    const cleanedText = text
      .replace(/```/g, '')
      .replace(/json/g, '')
      .trim();

    console.log('Hyper Cleaned Text:', cleanedText);

    // Multiple extraction strategies
    const jsonExtractionPatterns = [
      // Regex patterns to capture JSON-like structures
      /{[^}]*"name"[^}]*"ingredients"[^}]*"instructions"[^}]*}/,
      /\{.*?"name".*?"ingredients".*?"instructions".*?\}/,
      /{[^}]+}/
    ];

    for (const pattern of jsonExtractionPatterns) {
      const matches = cleanedText.match(pattern);
      
      if (matches) {
        console.log('Potential JSON Match:', matches[0]);
        
        try {
          const recipeData = JSON.parse(matches[0]);
          
          // Validate and transform recipe
          const recipe: GeneratedRecipe = {
            name: recipeData.name || `Resep ${cartItems[0]?.name || 'Spesial'}`,
            description: recipeData.description || 'Resep masakan Indonesia',
            ingredients: Array.isArray(recipeData.ingredients) && recipeData.ingredients.length > 0
              ? recipeData.ingredients
              : cartItems.map(item => item.name).concat(['Garam', 'Minyak']),
            instructions: Array.isArray(recipeData.instructions) && recipeData.instructions.length > 0
              ? recipeData.instructions
              : [
                  'Cuci bahan dengan bersih',
                  'Potong bahan sesuai kebutuhan',
                  'Panaskan minyak di wajan',
                  'Masak dengan api sedang',
                  'Tambahkan bumbu secukupnya'
                ],
            difficulty: ['easy', 'medium', 'hard'].includes(recipeData.difficulty)
              ? recipeData.difficulty
              : 'medium'
          };

          return [recipe];
        } catch (parseError) {
          console.error('JSON Parsing Error:', parseError);
          continue;
        }
      }
    }

    console.error('No valid JSON structure found');
    return [];

  } catch (error) {
    console.error('Comprehensive Extraction Error:', error);
    return [];
  }
}