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
          id: string
          email: string
          password: string
          name: string
          point: number
          created_at: string
        }
        Insert: {
          id: string
          email: string
          password: string
          name?: string
          point?: number
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          password?: string
          name?: string
          point?: number
          created_at?: string
        }
      }
      products: {
        Row: {
            id: string;
            name: string;
            price: number;
            image: string | null;
            category: string;
            description: string | null;
            farm: string;
            rating: number;
            quantity: number;
            created_at: string
        }
        Insert: {
            id?: string;
            name: string;
            price: number;
            image?: string | null;
            category: string;
            description: string | null;
            farm: string;
            rating: number;
            quantity: number;
            created_at?: string
        }
        Update: {
            id: string;
            name: string;
            price: number;
            image: string | null;
            category: string;
            description: string | null;
            farm: string;
            rating: number;
            quantity: number;
            created_at?: string
        }
      }
      categories: {
        Row: {
            id: string;
            name: string;
            image: string;
        }
        Insert: {
            id?: string;
            name?: string;
            image?: string;
        }
        Update: {
            id?: string;
            name?: string;
            image?: string;
        }
      }
      cart: {
        Row: {
          id: string
          user_id: string
          product_id: string
          quantity: number
          created_at: string
          product: Database['public']['Tables']['products']['Row'];
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          quantity?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          quantity?: number
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          product_id: string
          rating: string
          comment: string | null
          created_at: string
          user?: {
            name: string
          }
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          address: string
          latitude: string | null
          longitude: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          address: string
          latitude: string | null
          longitude: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          address?: string
          latitude: string | null
          longitude: string | null
          created_at?: string
        }
      }
      recipes: {
        Row: {
          id: string;
          name: string;
          description: string;
          ingredients: string[]; // Array of product IDs
          instructions: string[];
          difficulty: 'easy' | 'medium' | 'hard';
          preparation_time: number; // in minutes
          cooking_time: number; // in minutes
        }
        Insert: {
          id?: string;
          name: string;
          description: string;
          ingredients: string[];
          instructions: string[];
          difficulty?: 'easy' | 'medium' | 'hard';
          preparation_time?: number;
          cooking_time?: number;
        }
        Update: {
          id?: string;
          name?: string;
          description?: string;
          ingredients?: string[];
          instructions?: string[];
          difficulty?: 'easy' | 'medium' | 'hard';
          preparation_time?: number;
          cooking_time?: number;
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