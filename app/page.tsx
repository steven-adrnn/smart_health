'use client'

import { Hero } from '@/components/Hero';
import { Footer } from '@/components/Footer';
import CategoryCard from '@/components/CategoryCard';
import { supabase } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';
import { Database } from '@/lib/database.types';
import { ChatbotWidget } from '../components/ChatWidget';


// Definisikan tipe kategori dari database
type Category = Database['public']['Tables']['categories']['Row'];

export default function HomePage () {
    // Gunakan tipe Category[] untuk state
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            const { data, error } = await supabase
                .from('categories')
                .select('*');

            // Tambahkan pengecekan error
            if (error) {
                console.error('Error fetching categories:', error);
                return;
            }

            setCategories(data);
        };

        fetchCategories();
    }, []);

    return (
        <div>
            <Hero />
            <div className="container mx-auto p-4">
                <h2 className="text-2xl font-bold mb-4">Kategori Produk</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {categories?.map((category) => (
                        <CategoryCard key={category.id} category={category} />
                    ))}
                </div>
            </div>

            <ChatbotWidget/>
            <Footer />
        </div>
    );
};

