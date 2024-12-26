import { Database } from '@/lib/database.types';

interface CategoriesProps {
    categories?: Database['public']['Tables']['categories']['Row'][];
}

const Categories: React.FC<CategoriesProps> = ({ categories }) => {
    return (
        <div>
            <h2>Categories</h2>
            {categories?.map(category => (
                <div key={category.id}>
                    <p>{category.name}</p>
                </div>
            ))}
        </div>
    );
};

export default Categories;

