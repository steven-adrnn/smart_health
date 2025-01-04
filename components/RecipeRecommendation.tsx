'use client'

import { useState, useEffect } from 'react';
import { generateRecipesWithAI } from '@/lib/recipeGeneration';
import { Database } from '@/lib/database.types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogTrigger 
} from './ui/dialog';

type Product = Database['public']['Tables']['products']['Row'];

// Define interface for Recipe
interface Recipe {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

interface RecipeRecommendationsProps {
  cartItems: Product[];
}

export function RecipeRecommendations({ cartItems }: RecipeRecommendationsProps) {
  const [recommendedRecipes, setRecommendedRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchRecipes = async () => {
      if (cartItems.length > 0) {
        try {
          setIsLoading(true);
          const recipes = await generateRecipesWithAI(cartItems);
          
          if (recipes.length === 0) {
            setError('Tidak dapat menghasilkan resep');
          }
          
          setRecommendedRecipes(recipes);
        } catch (err) {
          console.error('Kesalahan generasi resep:', err);
          setError(err instanceof Error ? err.message : 'Kesalahan tidak dikenal');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchRecipes();
  }, [cartItems]);

  if (isLoading) {
    return <div>Menghasilkan resep...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (recommendedRecipes.length === 0) {
    return <div>Tidak ada resep yang dapat dihasilkan</div>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Resep AI Rekomendasi</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendedRecipes.map((recipe, index) => (
          <RecipeCard key={index} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}

function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>{recipe.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{recipe.description}</p>
            <div className="flex justify-between mt-2">
              <span>Tingkat Kesulitan: {recipe.difficulty}</span>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{recipe.name}</DialogTitle>
          <DialogDescription>{recipe.description}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Bahan:</h3>
            <ul className="list-disc pl-4">
              {recipe.ingredients.map((ingredient: string, idx: number) => (
                <li key={idx}>{ingredient}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Instruksi Memasak:</h3>
            <ol className="list-decimal pl-4">
              {recipe.instructions.map((instruction: string, index: number) => (
                <li key={index}>{instruction}</li>
              ))}
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}