export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: number
          email: string
          password: string
          name: string | null
          created_at: string
        }
        Insert: {
          id?: number
          email: string
          password: string
          name?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          email?: string
          password?: string
          name?: string | null
          created_at?: string
        }
      }
      products: {
        Row: {
            id: number;
            name: string;
            price: number;
            image: string | null;
            category: string;
            description: string | null;
            farm: string;
            rating: number;
        }
        Insert: {
            id?: number;
            name: string;
            price: number;
            image?: string | null;
            category: string;
            description: string | null;
            farm: string;
            rating: number;
        }
        Update: {
            id: number;
            name: string;
            price: number;
            image: string | null;
            category: string;
            description: string | null;
            farm: string;
            rating: number;
        }
      }
      categories: {
        Row: {
            id: number;
            name: string;
            image: string | null;
        }
        Insert: {
            id?: number;
            name?: string;
            image?: string | null;
        }
        Update: {
            id?: number;
            name?: string;
            image?: string | null;
        }
      }
      cart: {
        Row: {
          id: number
          user_id: number
          product_id: number
          quantity: number
          created_at: string
        }
        Insert: {
          id?: number
          user_id: number
          product_id: number
          quantity?: number
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: number
          product_id?: number
          quantity?: number
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: number
          user_id: number
          product_id: number
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: number
          product_id: number
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: number
          product_id?: number
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
      addresses: {
        Row: {
          id: number
          user_id: number
          address: string
          created_at: string
        }
        Insert: {
          id?: number
          user_id: number
          address: string
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: number
          address?: string
          created_at?: string
        }
      }
      points: {
        Row: {
          id: number
          user_id: number
          points: number
          created_at: string
        }
        Insert: {
          id?: number
          user_id: number
          points?: number
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: number
          points?: number
          created_at?: string
        }
      }
      recipes: {
        Row: {
          id: number
          name: string
          ingredients: string[]
          instructions: string[]
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          ingredients: string[]
          instructions: string[]
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          ingredients?: string[]
          instructions?: string[]
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}