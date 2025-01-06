import Link from 'next/link';
import Image from 'next/image';
import { Database } from '@/lib/database.types';


interface CategoryCardProps {
    category: Database['public']['Tables']['categories']['Row'];
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
    const getPublicImageUrl = (path: string) => {
        const cleanPath = path.replace(/\s+/g, '%20');
        return `https://enyvqjbqavjdzxmktahy.supabase.co/storage/v1/object/public/bucket1/${cleanPath}`;
    };

    return (
        <Link href={`/category/${category.name.toLowerCase()}`} className="block">
            <div className="flex flex-col items-center justify-center border rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow h-full">
                <div className="w-full aspect-video mb-2 relative"> {/* Gunakan aspect-video untuk rasio 16:9 */}
                    <Image 
                        src={category.image 
                                ? getPublicImageUrl(category.image) 
                                : '/placeholder.png'
                            }
                        alt={category.name}
                        fill // Gunakan fill untuk memenuhi container
                        className="object-cover rounded-md"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>
                <h3 className="text-lg font-semibold text-center mt-2">{category.name}</h3>
            </div>
        </Link>
    );
};

export default CategoryCard;