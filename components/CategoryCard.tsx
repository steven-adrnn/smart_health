import Link from 'next/link';
import Image from 'next/image';

interface CategoryCardProps {
    name: string;
    image: string; // Nama file gambar kategori
}

const CategoryCard: React.FC<CategoryCardProps> = ({ name, image }) => {
    return (
        <Link href={`/category/${name.toLowerCase()}`}>
            <div className="flex flex-col items-center justify-center border rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow">
                <Image 
                    src={`/${image}`} // Menggunakan path relatif ke folder public
                    alt={name}
                    width={200} // Sesuaikan ukuran sesuai kebutuhan
                    height={150} // Sesuaikan ukuran sesuai kebutuhan
                    className="w-full h-32 object-cover rounded-md mb-2"
                />
                <h3 className="text-lg font-semibold">{name}</h3>
            </div>
        </Link>
    );
};

export default CategoryCard;