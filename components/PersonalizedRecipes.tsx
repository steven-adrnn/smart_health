'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Recipe {
  id: number
  name: string
  description: string
}

export function PersonalizedRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([])

  useEffect(() => {
    // In a real application, you would fetch this data from your backend
    // based on the user's purchase history
    const fetchedRecipes = [
      { id: 1, name: 'Salad Buah Segar', description: 'Salad buah segar dengan campuran apel, pisang, dan jeruk.' },
      { id: 2, name: 'Smoothie Sayuran Hijau', description: 'Smoothie sehat dengan campuran bayam, apel, dan pisang.' },
      { id: 3, name: 'Tumis Sayur Campur', description: 'Tumis sayuran segar dengan wortel, brokoli, dan jamur.' },
    ]
    setRecipes(fetchedRecipes)
  }, [])

  return (
    <section className="py-12 px-4 bg-gray-100">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Recipes for You</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <Card key={recipe.id}>
              <CardHeader>
                <CardTitle>{recipe.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{recipe.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

