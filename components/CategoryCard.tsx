'use client'

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Database } from '@/lib/database.types';

interface CategoryCardProps {
    category: Database['public']['Tables']['categories']['Row'];
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
    const [imageSrc, setImageSrc] = useState(() => {
        if (category.image && category.image.trim() !== '') {
        const fullUrl = `https://enyvqjbqavjdzxmktahy.supabase.co/storage/v1/object/public/bucket1/${encodeURIComponent(category.image.trim())}`;
        console.log('Full Image URL:', fullUrl);
        return fullUrl;
    }
        return '/placeholder.png';
    });

    const handleImageError = () => {
        console.error('Image load error:', category.image);
        setImageSrc('/placeholder.png');
    };

    return (
        <Link href={`/category/${category.id}`} className="block">
            <div className="flex flex-col items-center justify-center border rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow h-full">
                <div className="w-full aspect-video mb-2 relative">
                    <Image 
                        src={imageSrc}
                        alt={category.name || 'Category Image'}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover rounded-md"
                        onError={handleImageError}
                        priority={false}
                    />
                </div>
                <h3 className="text-lg font-semibold text-center mt-2">{category.name}</h3>
            </div>
        </Link>
    );
};

export default CategoryCard;