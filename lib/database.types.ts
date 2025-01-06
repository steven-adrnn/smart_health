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
            latitude: number | null  // Gunakan number untuk koordinat
            longitude: number | null
            street: string | null     // Tambahkan field baru
            city: string | null
            province: string | null
            postal_code: string | null
            created_at: string
        }
        Insert: {
            id?: string
            user_id: string
            address: string
            latitude?: number | null
            longitude?: number | null
            street?: string | null
            city?: string | null
            province?: string | null
            postal_code?: string | null
            created_at?: string
        }
        Update: {
            id?: string
            user_id?: string
            address?: string
            latitude?: number | null
            longitude?: number | null
            street?: string | null
            city?: string | null
            province?: string | null
            postal_code?: string | null
            created_at?: string
        }
      }
      recipes: {
        Row: {
          id: string;
          user_id: string;  // Siapa yang menyimpan resep
          name: string;
          description: string;
          ingredients: string[];  // Array bahan
          instructions: string[];
          difficulty: 'easy' | 'medium' | 'hard';
          original_products: string[];  // ID produk yang membuat resep
          created_at: string;
        }
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description: string;
          ingredients: string[];
          instructions: string[];
          difficulty?: 'easy' | 'medium' | 'hard';
          original_products?: string[];
          created_at?: string;
        }
        Update: {
          id?: string;
          user_id: string;
          name: string;
          description: string;
          ingredients: string[];
          instructions: string[];
          difficulty?: 'easy' | 'medium' | 'hard';
          original_products?: string[];
          created_at?: string;
        }
      }

      forum_posts: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          category: string
          likes_count: number
          created_at: string
          user: {
            name: string
            avatar?: string
          }
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          category: string
          likes_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          category?: string
          likes_count?: number
        }
      }
      
      forum_comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          created_at: string
          user: {
            name: string
            avatar?: string
          }
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
        }
      }
      
      forum_likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
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