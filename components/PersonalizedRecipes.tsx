// components/PersonalizedRecipes.tsx
'use client'

import { useState, useEffect } from 'react';
import { getPersonalizedRecipes } from '@/lib/recipeRecommendation';
import { Database } from '@/lib/database.types';

type Product = Database['public']['Tables']['products']['Row'];
type Recipe = Database['public']['Tables']['recipes']['Row'];

export function PersonalizedRecipeRecommendation() {
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const [recommendedRecipes, setRecommendedRecipes] = useState<Recipe[]>([]);

    useEffect(() => {
        // Ambil produk dari keranjang atau terakhir dibeli
        const cartProducts = JSON.parse(
            localStorage.getItem('cart') || '[]'
        );
        setSelectedProducts(cartProducts);
    }, []);

    useEffect(() => {
        if (selectedProducts.length > 0) {
            const fetchRecommendations = async () => {
                const recipes = await getPersonalizedRecipes(selectedProducts);
                setRecommendedRecipes(recipes);
            };
            fetchRecommendations();
        }
    }, [selectedProducts]);

    return (
        <div>
            <h2>Resep Rekomendasi Untukmu</h2>
            {recommendedRecipes.length > 0 ? (
                recommendedRecipes.map(recipe => (
                    <div key={recipe.id}>
                        <h3>{recipe.name}</h3>
                        <p>{recipe.description}</p>
                        <ul>
                            {recipe.instructions.map((step, index) => (
                                <li key={index}>{step}</li>
                            ))}
                        </ul>
                    </div>
                ))
            ) : (
                <p>Tidak ada resep yang direkomendasikan.</p>
            )}
        </div>
    );
}