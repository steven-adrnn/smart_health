// components/RecipeRecommendation.tsx
'use client'

import { useState, useEffect } from 'react';
import { getRecipeRecommendations } from '@/lib/recipeRecommendation';
import { Database } from '@/lib/database.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';

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
          <Card key={recipe.id}>
            <CardHeader>
              <CardTitle>{recipe.name}</CardTitle>
              <CardDescription>{recipe.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold">Bahan:</h3>
              <ul className="list-disc pl-4 mb-4">
                {recipe.ingredients.map((ingredientId: string) => {
                  const ingredient = cartItems.find(item => item.id === ingredientId);
                  return ingredient ? <li key={ingredientId}>{ingredient.name}</li> : null;
                })}
              </ul>
              <div className="flex justify-between">
                <span>Persiapan: {recipe.preparation_time} menit</span>
                <span>Memasak: {recipe.cooking_time} menit</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}