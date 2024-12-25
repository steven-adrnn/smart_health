'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { formatPrice } from '@/lib/products'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { BackButton } from '@/components/BackButton'

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
}

interface Recipe {
  id: number
  name: string
  ingredients: string[]
  instructions: string[]
}

const recipes: Recipe[] = [
  {
    id: 1,
    name: "Salad Buah Segar",
    ingredients: ["2 buah apel", "2 buah pisang", "1 buah jeruk", "100g anggur", "50g kacang mete", "2 sdm madu"],
    instructions: [
      "Cuci semua buah dengan bersih",
      "Potong apel dan pisang menjadi kubus kecil",
      "Kupas dan potong jeruk menjadi segmen-segmen kecil",
      "Campurkan semua buah dalam mangkuk besar",
      "Tambahkan kacang mete",
      "Tuangkan madu di atasnya",
      "Aduk perlahan hingga semua bahan tercampur rata",
      "Dinginkan di kulkas selama 30 menit sebelum disajikan"
    ]
  },
  // Add more detailed recipes here...
]

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { id: 1, name: 'Apel Malang Segar', price: 25000, quantity: 2 },
    { id: 4, name: 'Wortel Organik', price: 15000, quantity: 1 },
  ])
  // const [points, setPoints] = useState(100) // Assume user has 100 points
  const [points] = useState(100) // Assume user has 100 points

  const updateQuantity = (id: number, newQuantity: number) => {
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: Math.max(0, newQuantity) } : item
    ).filter(item => item.quantity > 0))
  }

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const earnedPoints = Math.floor(total / 10000) // Earn 1 point for every 10,000 IDR spent

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton />
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-gray-600">{formatPrice(item.price)} each</p>
                </div>
                <div className="flex items-center">
                  <Button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1">-</Button>
                  <span className="mx-2">{item.quantity}</span>
                  <Button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1">+</Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <p className="text-xl font-bold">Total: {formatPrice(total)}</p>
            <p className="text-sm text-gray-600">You will earn {earnedPoints} points with this purchase</p>
            <p className="text-sm text-gray-600">Your current points: {points}</p>
          </div>
          <div className="mt-6 flex justify-between">
            <Dialog>
              <DialogTrigger asChild>
                <Button>View Recipe Suggestions</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Recipe Suggestions</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  {recipes.map(recipe => (
                    <div key={recipe.id} className="mb-6">
                      <h3 className="font-semibold text-lg mb-2">{recipe.name}</h3>
                      <h4 className="font-medium mb-1">Ingredients:</h4>
                      <ul className="list-disc pl-5 mb-2">
                        {recipe.ingredients.map((ingredient, index) => (
                          <li key={index}>{ingredient}</li>
                        ))}
                      </ul>
                      <h4 className="font-medium mb-1">Instructions:</h4>
                      <ol className="list-decimal pl-5">
                        {recipe.instructions.map((instruction, index) => (
                          <li key={index}>{instruction}</li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            <Link href="/payment">
              <Button>Proceed to Checkout</Button>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

