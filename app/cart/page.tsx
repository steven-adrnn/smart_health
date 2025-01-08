'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Database } from '@/lib/database.types';
import { MapPin } from 'lucide-react';
import Addresses from '@/components/Addresses';


import { RecipeRecommendations } from '@/components/RecipeRecommendation';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Trash2, Plus, Minus } from 'lucide-react';

type CartItem = Database['public']['Tables']['products']['Row'] & { quantity: number };

type Address = Database['public']['Tables']['addresses']['Row'];


export default function CartPage() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [total, setTotal] = useState(0);
    // const [addressList, setAddressesList] = useState<Address[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [points, setPoints] = useState(0);
    const [pointsToUse, setPointsToUse] = useState(0);
    const router = useRouter();

    // Animasi Variants
    const cartItemVariants = {
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 50 }
    };

    // Efek untuk memuat data awal
    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cart') || '[]') as CartItem[];
        setCartItems(storedCart);
        calculateTotal(storedCart);
        fetchUserData();
    }, []);

    // Fetch user data (addresses, points)
    const fetchUserData = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            // Fetch Addresses
            // const { data: addressData } = await supabase
            //     .from('addresses')
            //     .select('*')
            //     .eq('user_id', session.user.id);
            // setAddressesList(addressData || []);

            // Fetch Points
            const { data: userData } = await supabase
                .from('users')
                .select('point')
                .eq('id', session.user.id)
                .single();
            setPoints(userData?.point || 0);
        }
    };

    // Kalkulasi Total
    const calculateTotal = (items: CartItem[]) => {
        const totalAmount = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        setTotal(totalAmount);
    };

    // Increment Quantity
    const incrementQuantity = (itemId: string) => {
        const updatedCart = cartItems.map(item => 
            item.id === itemId 
                ? { ...item, quantity: item.quantity + 1 } 
                : item
        );
        updateCart(updatedCart);
    };

    // Decrement Quantity
    const decrementQuantity = (itemId: string) => {
        const updatedCart = cartItems.map(item => 
            item.id === itemId && item.quantity > 1
                ? { ...item, quantity: item.quantity - 1 }
                : item
        ).filter(item => item.quantity > 0);
        updateCart(updatedCart);
    };

    // Update Cart
    const updateCart = (updatedCart: CartItem[]) => {
        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        calculateTotal(updatedCart);
    };

    // Remove Item Modal Component
    const RemoveItemConfirmationModal = ({ item, onConfirm }: { 
        item: CartItem, 
        onConfirm: () => void 
    }) => {
        return (
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="destructive" size="icon">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Hapus Produk</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus {item.name} dari keranjang?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={onConfirm} variant="destructive">
                            Ya, Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    // Get Image URL
    const getPublicImageUrl = (path: string) => {
        const cleanPath = path.replace(/\s+/g, '%20');
        return `https://enyvqjbqavjdzxmktahy.supabase.co/storage/v1/object/public/bucket1/${cleanPath}`;
    };

    // Handler untuk memilih alamat
    const handleAddressSelect = (address: Address) => {
        setSelectedAddress(address);
    };

    // Checkout Handler
    const handleCheckout = async () => {
        if (!selectedAddress) {
            toast.error('Silakan pilih alamat pengiriman');
            return;
        }

        if (pointsToUse > points) {
            toast.error('Jumlah poin yang digunakan melebihi poin yang Anda miliki');
            return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
                toast.error('Anda harus login terlebih dahulu');
                router.push('/login');
                return;
            }

            // Hitung total setelah menggunakan poin
            const totalAfterPoints = total - pointsToUse;
            
            // Pastikan total tidak negatif
            if (totalAfterPoints < 0) {
                toast.error('Jumlah poin yang digunakan melebihi total biaya');
                setTotal(totalAfterPoints);
                return;
            }
            const pointsEarned = Math.floor(total / 1000); // Asumsi 1 poin = 1000 rupiah

            // Update produk di database (kurangi stok)
            const updateProductPromises = cartItems.map(async (item) => {
                const { data: productData, error: fetchError } = await supabase
                    .from('products')
                    .select('quantity')
                    .eq('id', item.id)
                    .single();

                if (fetchError) {
                    console.error(`Error fetching product ${item.id}:`, fetchError);
                    return null;
                }

                const newQuantity = productData.quantity - item.quantity;
                
                if (newQuantity < 0) {
                    toast.error(`Stok ${item.name} tidak mencukupi`);
                    throw new Error(`Stok ${item.name} tidak mencukupi`);
                }

                const { error: updateError } = await supabase
                    .from('products')
                    .update({ quantity: newQuantity })
                    .eq('id', item.id);

                if (updateError) {
                    console.error(`Error updating product ${item.id}:`, updateError);
                    throw updateError;
                }

                return true;
            });

            // Tunggu semua update produk selesai
            await Promise.all(updateProductPromises);

            // Update poin pengguna
            const newPointTotal = points - pointsToUse + pointsEarned;
            const { error: updatePointsError } = await supabase
                .from('users')
                .update({ point: newPointTotal })
                .eq('id', session.user.id);

            if (updatePointsError) {
                console.error('Error updating points:', updatePointsError);
                toast.error('Gagal mengurangi poin');
                return;
            }

            // Simpan setiap item ke tabel cart
            const cartInsertPromises = cartItems.map(item => 
                supabase
                    .from('cart')
                    .insert({
                        user_id: session.user.id,
                        address_id: selectedAddress,
                        product_id: item.id,
                        quantity: item.quantity
                    })
            );

            const results = await Promise.all(cartInsertPromises);
            const hasError = results.some(result => result.error);

            if (hasError) {
                toast.error('Gagal menyimpan item ke keranjang');
                return;
            }

            // Kosongkan keranjang setelah checkout
            setCartItems([]);
            localStorage.removeItem('cart');
            toast.success('Checkout berhasil! Anda mendapatkan ${pointsEarned} poin.');

            // Redirect ke halaman konfirmasi atau beranda
            router.push('/');
        } catch (error) {
            console.error('Unexpected error during checkout:', error);
            toast.error('Terjadi kesalahan saat checkout');
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto p-4 space-y-6"
        >
            {/* Judul */}
            <motion.h1 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-3xl font-bold text-primary"
            >
                Keranjang Belanja
            </motion.h1>

            {/* Daftar Produk */}
            <AnimatePresence>
                {cartItems.map(item => (
                    <motion.div 
                        key={item.id}
                        variants={cartItemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="flex items-center space-x-4 p-4 border rounded-lg"
                    >
                        {/* Gambar Produk */}
                        <Image 
                            src={item.image ? getPublicImageUrl(item.image) : '/placeholder.png'}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="rounded-lg"
                        />

                        {/* Detail Produk */}
                        <div className="flex-grow">
                            <h2 className="font-bold">{item.name}</h2>
                            <p>Rp {item.price.toLocaleString()}</p>
                        </div>

                        {/* Kontrol Kuantitas */}
                        <div className="flex items-center space-x-2">
                            <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={() => decrementQuantity(item.id)}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <span>{item.quantity}</span>
                            <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={() => incrementQuantity(item.id)}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>

                            {/* Modal Hapus */}
                             <RemoveItemConfirmationModal 
                                item={item} 
                                onConfirm={() => {
                                    const updatedCart = cartItems.filter(cartItem => cartItem.id !== item.id);
                                    updateCart(updatedCart);
                                }} 
                            />
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Total dan Poin */}
            <div className="flex justify-between items-center p-4 border-t">
                <h2 className="text-xl font-bold">Total: Rp {total.toLocaleString()}</h2>
                <div>
                    <p>Poin Anda: {points}</p>
                    <input 
                        type="number" 
                        value={pointsToUse} 
                        onChange={(e) => setPointsToUse(Number(e.target.value))} 
                        placeholder="Gunakan Poin" 
                        className="border rounded p-1"
                    />
                </div>
            </div>

            {/* Rekomendasi Resep */}
            {cartItems.length > 0 && (
                <RecipeRecommendations cartItems={cartItems} />
            )}

            {/* Pemilihan Alamat */}
            <div className="mt-6">
                <h2 className="text-xl font-bold mb-4">Pilih Alamat Pengiriman</h2>
                <Addresses 
                    onSelectAddress={handleAddressSelect} 
                    allowAddNew={true} 
                />
                
                {/* Tampilkan alamat yang dipilih */}
                {selectedAddress && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 bg-green-50 rounded-lg flex items-center"
                    >
                        <MapPin className="mr-2 text-primary" />
                        <div>
                            <p className="font-semibold">{selectedAddress.address}</p>
                            {selectedAddress.address && (
                                <p className="text-sm text-gray-600">{selectedAddress.address}</p>
                            )}
                            <p className="text-sm text-gray-600">
                                {selectedAddress.address}
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Tombol Checkout */}
            <Button 
                onClick={handleCheckout} 
                className="w-full mt-4" 
            >
                {selectedAddress ? 'Checkout' : 'Pilih Alamat Terlebih Dahulu'}
            </Button>
        </motion.div>
    );
}

