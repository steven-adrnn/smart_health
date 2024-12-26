import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Recipe {
    id: number;
    name: string;
    ingredients: string[];
    instructions: string[];
}

const RecommendedRecipes = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);

    useEffect(() => {
        const fetchRecipes = async () => {
            const { data } = await supabase
                .from('recipes')
                .select('*');

            if (data) setRecipes(data as Recipe[]);
        };

        fetchRecipes();
    }, []);

    return (
        <div>
            <h1>Recommended Recipes</h1>
            {recipes.map(recipe => (
                <div key={recipe.id}>
                    <h2>{recipe.name}</h2>
                    <h3>Ingredients:</h3>
                    <ul>
                        {recipe.ingredients.map((ingredient, index) => (
                            <li key={index}>{ingredient}</li>
                        ))}
                    </ul>
                    <h3>Instructions:</h3>
                    <ol>
                        {recipe.instructions.map((instruction, index) => (
                            <li key={index}>{instruction}</li>
                        ))}
                    </ol>
                </div>
            ))}
        </div>
    );
};

export default RecommendedRecipes;