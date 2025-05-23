// app/shop/page.tsx
'use client'

import { useEffect, useState, useMemo, Suspense } from 'react';
import Fuse from 'fuse.js';
import { ProductList } from '@/components/ProductList';
import { toast } from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { Database } from '@/lib/database.types';

// Definisi tipe produk yang lebih spesifik
type Product = Database['public']['Tables']['products']['Row'];


// Tipe untuk suggestion
interface Suggestion {
    type: 'product' | 'category';
    value: string;
}

function ShopPageContent() {
    const searchParams = useSearchParams();
    const categoryFromQuery = searchParams ? searchParams.get('category') : null;

    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchCategory, setSearchCategory] = useState<string>('all');
    const [error, setError] = useState<string | null>(null);

    // Kategori yang tersedia
    const CATEGORIES = [
        'all', 'fruits', 'vegetables', 'meat', 'dairy'
    ];

    // Konfigurasi Fuse.js untuk pencarian fuzzy
    const fuse = useMemo(() => {
        return new Fuse(products, {
            keys: [
                'name', 
                'description', 
                'category', 
                'farm'
            ],
            includeScore: true,
            threshold: 0.2,
            minMatchCharLength: 2
        });
    }, [products]);

    // Fungsi fetch produk
    const fetchProducts = async () => {
        try {
            setLoading(true);
            
            // Gunakan axios untuk fetch dari API endpoint
            const response = await axios.get('/api/products', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('user_session')}`
                }
            });

            const data = response.data;

            // Filter produk berdasarkan kategori dari query
            let filteredData = data || [];
            if (categoryFromQuery && categoryFromQuery !== 'all') {
                filteredData = filteredData.filter(
                    (product: Product) => product.category.toLowerCase() === categoryFromQuery.toLowerCase()
                );
            }

            setProducts(data);
            setFilteredProducts(filteredData);
            setLoading(false);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error 
                ? err.message 
                : 'Gagal memuat produk';
            
            console.error('Error fetching products:', err);
            toast.error(errorMessage);
            setError(errorMessage);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [categoryFromQuery]); 

    const handleSearch = (term: string) => {
        setSearchTerm(term);

        // Pencarian dengan Fuse.js
        let results: Product[] = products;

        // Filter berdasarkan kategori jika tidak 'all'
        if (searchCategory !== 'all') {
            results = results.filter(p => p.category === searchCategory);
        }

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
        const categorySuggestions = new Set<string>();

        // Suggestion dari nama produk
        products
            .filter(p => 
                p.name.toLowerCase().includes(term.toLowerCase()) && 
                p.name.toLowerCase() !== term.toLowerCase()
            )
            .slice(0, 3)
            .forEach(p => productSuggestions.add(p.name));

        // Suggestion dari kategori
        CATEGORIES
            .filter(cat => 
                cat.toLowerCase().includes(term.toLowerCase()) && 
                cat.toLowerCase() !== term.toLowerCase()
            )
            .slice(0, 2)
            .forEach(cat => categorySuggestions.add(cat));

        // Kombinasi suggestions
        const combinedSuggestions: Suggestion[] = [
            ...Array.from(productSuggestions).map(value => ({ 
                type: 'product' as const, 
                value 
            })),
            ...Array.from(categorySuggestions).map(value => ({ 
                type: 'category' as const, 
                value 
            }))
        ];

        setSuggestions(combinedSuggestions);
    };

    const handleSuggestionClick = (suggestion: Suggestion) => {
        if (suggestion.type === 'category') {
            setSearchCategory(suggestion.value);
            handleSearch(suggestion.value);
        } else {
            setSearchTerm(suggestion.value);
            handleSearch(suggestion.value);
        }
        setSuggestions([]);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>Memuat produk...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen text-red-500">
                <p>{error}</p>
            </div>
        );
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
                <p> Tidak ada produk yang ditemukan.</p>
            )}
        </div>
    );
}

export default function ShopPage() {
    return (
        <Suspense fallback={<div>Memuat...</div>}>
            <ShopPageContent />
        </Suspense>
    );
}