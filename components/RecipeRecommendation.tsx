// components/RecipeRecommendation.tsx
'use client'

import { useState, useEffect } from 'react';
import { getRecipeRecommendations } from '@/lib/recipeRecommendation';
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
type Recipe = Database['public']['Tables']['recipes']['Row'];

interface RecipeRecommendationsProps {
  cartItems: Product[];
}

export function RecipeRecommendations({ cartItems }: RecipeRecommendationsProps) {
  const [recommendedRecipes, setRecommendedRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (cartItems.length > 0) {
        const recipes = await getRecipeRecommendations(cartItems);
        setRecommendedRecipes(recipes);
      }
    };

    fetchRecommendations();
  }, [cartItems]);

  if (recommendedRecipes.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Resep Rekomendasi</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendedRecipes.map(recipe => (
          <RecipeCard 
            key={recipe.id} 
            recipe={recipe} 
            cartItems={cartItems} 
          />
        ))}
      </div>
    </div>
  );
}

// Komponen terpisah untuk setiap kartu resep
function RecipeCard({ 
  recipe, 
  cartItems 
}: { 
  recipe: Database['public']['Tables']['recipes']['Row'], 
  cartItems: Product[] 
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>{recipe.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <span>Persiapan: {recipe.preparation_time} menit</span>
              <span className="capitalize">
                Tingkat Kesulitan: {recipe.difficulty}
              </span>
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
              {recipe.ingredients.map((ingredientId: string) => {
                const ingredient = cartItems.find(item => item.id === ingredientId);
                return ingredient ? (
                  <li key={ingredientId}>{ingredient.name}</li>
                ) : null;
              })}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Instruksi Memasak:</h3>
            <ol className="list-decimal pl-4">
              {recipe.instructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ol>
          </div>
          
          <div className="flex justify-between">
            <span>Waktu Persiapan: {recipe.preparation_time} menit</span>
            <span>Waktu Memasak: {recipe.cooking_time} menit</span>
          </div>
          
          <div>
            <span className="font-semibold">Tingkat Kesulitan:</span>{' '}
            <span className="capitalize">{recipe.difficulty}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}