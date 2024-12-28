import Link from 'next/link';
import Image from 'next/image';

interface CategoryCardProps {
    name: string;
    image: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ name, image }) => {
    // Fungsi untuk mendapatkan URL gambar yang benar
    const getImageUrl = (imagePath: string) => {
        // Pastikan menggunakan URL lengkap atau path yang benar
        if (imagePath.startsWith('http') || imagePath.startsWith('https')) {
            return imagePath;
        }
        
        // Jika menggunakan Supabase
        // return `https://enyvqjbqavjdzxmktahy.supabase.co/storage/v1/object/public/bucket1/${imagePath}`;
        
        // Atau untuk gambar lokal
        return `/image/${imagePath}`;
    };

    return (
        <Link href={`/category/${name.toLowerCase()}`} className="block">
            <div className="flex flex-col items-center justify-center border rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow h-full">
                <div className="w-full aspect-video mb-2 relative">
                    <Image 
                        src={getImageUrl(image)} 
                        alt={name}
                        fill
                        className="object-cover rounded-md"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        onError={(e) => {
                            console.error('Image load error', image);
                            // Fallback ke placeholder
                            e.currentTarget.src = '/placeholder.png';
                        }}
                    />
                </div>
                <h3 className="text-lg font-semibold text-center mt-2">{name}</h3>
            </div>
        </Link>
    );
};

export default CategoryCard;