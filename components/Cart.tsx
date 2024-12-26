import { Database } from '@/lib/database.types';

interface CartProps {
    items: Database['public']['Tables']['cart']['Row'][];
}

const Cart: React.FC<CartProps> = ({ items }) => {
    return (
        <div>
            <h2>Your Cart</h2>
            {items.length === 0 ? (
                <p>No items in cart.</p>
            ) : (
                items.map(item => (
                    <div key={item.id}>
                        <p>Product ID: {item.product_id}</p>
                        <p>Quantity: {item.quantity}</p>
                    </div>
                ))
            )}
        </div>
    );
};

export default Cart;