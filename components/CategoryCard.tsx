import Link from 'next/link';
import Image from 'next/image';

interface CategoryCardProps {
    name: string;
    image: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ name, image }) => {
    return (
        <Link href={`/category/${name.toLowerCase()}`} className="block">
            <div className="flex flex-col items-center justify-center border rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow h-full">
                <div className="w-full aspect-video mb-2 relative"> {/* Gunakan aspect-video untuk rasio 16:9 */}
                    <Image 
                        src={'/${image}'} 
                        alt={name}
                        fill // Gunakan fill untuk memenuhi container
                        className="object-cover rounded-md"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>
                <h3 className="text-lg font-semibold text-center mt-2">{name}</h3>
            </div>
        </Link>
    );
};

export default CategoryCard;