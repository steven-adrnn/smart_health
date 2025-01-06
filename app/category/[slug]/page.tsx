'use client';

import { useEffect, useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { ProductList } from '@/components/ProductList';
import { Database } from '@/lib/database.types';
import { Input } from '@/components/ui/input';

// Definisi tipe produk yang lebih spesifik
type Product = Database['public']['Tables']['products']['Row'];

// Tipe untuk suggestion
interface Suggestion {
    type: 'product';
    value: string;
}

const CategoryPage = () => {
    const params = useParams();
    const slug = params?.slug as string; // Mengambil slug dari URL
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchCategory, setSearchCategory] = useState<string>('all');
    const [error, setError] = useState<string | null>(null);

    // Konfigurasi Fuse.js untuk pencarian fuzzy
    const fuse = useMemo(() => {
        return new Fuse(products, {
            keys: [
                'name', 
                'description',
            ],
            includeScore: true,
            threshold: 0.2, // Semakin rendah, semakin ketat pencocokan
            minMatchCharLength: 2
        });
    }, [products]);

    useEffect(() => {
        if (!slug) return;
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const { data: { session } } = await supabase.auth.getSession();
                
                if (!session?.user) {
                    throw new Error('Anda harus login terlebih dahulu');
                }

                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('category', slug) // Mengambil produk berdasarkan kategori
                    .gt('quantity', 0) // Hanya produk dengan stok > 0
                    .order('created_at', { ascending: false });

                if (error) {
                    throw error;
                }

                setProducts(data || []);
                setFilteredProducts(data || []);
                setLoading(false);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Gagal memuat produk';
                console.error('Error fetching products:', err);
                setError(errorMessage);
                setLoading(false);
            }
        };

        fetchProducts();
    }, [slug]);

    const handleSearch = (term: string) => {
        setSearchTerm(term);

        // Pencarian dengan Fuse.js
        let results: Product[] = products;

        // Pencarian fuzzy
        if (term.trim()) {
            const fuseResults = fuse.search(term);
            results = fuseResults
                .map(result => result.item)
                .filter(product => results.includes(product));
        }

        setFilteredProducts(results);

        // Generate suggestions
        const productSuggestions = new Set<string>();

        // Suggestion dari nama produk
        products
            .filter(p => 
                p.name.toLowerCase().includes(term.toLowerCase()) && 
                p.name.toLowerCase() !== term.toLowerCase()
            )
            .slice(0, 3)
            .forEach(p => productSuggestions.add(p.name));

        // Suggestion dari kategori

        // Kombinasi suggestions
        const combinedSuggestions: Suggestion[] = [
            ...Array.from(productSuggestions).map(value => ({ 
                type: 'product' as const, 
                value 
            })),
        ];

        setSuggestions(combinedSuggestions);
    };

    const handleSuggestionClick = (suggestion: Suggestion) => {
        setSearchTerm(suggestion.value);
        handleSearch(suggestion.value);
        setSuggestions([]);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><p>Memuat produk...</p></div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-500"><p>{error}</p></div>;
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex space-x-2 mb-4">
                <div className="relative flex-grow">
                    <Input
                        type="text"
                        placeholder="Cari produk..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full"
                    />
                    {suggestions.length > 0 && searchTerm && (
                        <div className="absolute z-10 w-full bg-white border rounded shadow-lg">
                            {suggestions.map((suggestion, index) => (
                                <div 
                                    key={index} 
                                    className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between"
                                    onClick={() => handleSuggestionClick(suggestion)}
                                >
                                    <span>{suggestion.value}</span>
                                    <span className="text-xs text-gray-500">
                                        {suggestion.type === 'product' ? 'Produk' : 'Kategori'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <h1 className="text-2xl font-bold mb-4">
                {searchTerm || searchCategory !== 'all'
                    ? `Hasil Pencarian: ${searchTerm ? `"${searchTerm}"` : ''} ${searchCategory !== 'all' ? `Kategori: ${searchCategory}` : ''}`
                    : 'Produk Tersedia'}
            </h1>

            {filteredProducts.length > 0 ? (
                <ProductList products={filteredProducts} />
            ) : (
                <p>Tidak ada produk yang cocok dengan pencarian Anda.</p>
            )}
        </div>
    );
};

export default CategoryPage;