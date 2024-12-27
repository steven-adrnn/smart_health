import { Database } from '@/lib/database.types';
import Link from 'next/link';
import { Button } from './ui/button';

interface ProductCardProps {
    product: Database['public']['Tables']['products']['Row'];
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    return (
        <div className="border rounded-lg p-4 shadow-md">
            <Link href={`/product/${product.id}`}>
                <h3 className="text-lg font-semibold">{product.name}</h3>
                {product.image && (
                    <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-48 object-cover rounded-md mb-2"
                    />
                )}
                <p className="text-gray-600">{product.description}</p>
                <p className="font-bold text-green-600">Rp {product.price.toLocaleString()}</p>
            </Link>
            <Button className="w-full mt-2">Tambah ke Keranjang</Button>
        </div>
    );
};

export default ProductCard;