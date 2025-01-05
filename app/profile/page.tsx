'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Database } from '@/lib/database.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

type User = Database['public']['Tables']['users']['Row'];
type Address = Database['public']['Tables']['addresses']['Row'];
type Recipe = Database['public']['Tables']['recipes']['Row'];

export default function ProfilePage() {
    const [user, setUser ] = useState<User | null>(null);
    const [points, setPoints] = useState(0);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [newAddress, setNewAddress] = useState('');
    const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session?.user) {
                // Fetch user details and points
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('*, point') // Ambil kolom point
                    .eq('id', session.user.id)
                    .single();

                if (userError) {
                    console.error('Error fetching user:', userError);
                }

                // Fetch user addresses
                const { data: addressData, error: addressFetchError } = await supabase
                    .from('addresses')
                    .select('*')
                    .eq('user_id', session.user.id);

                if (addressFetchError) {
                    console.error('Error fetching addresses:', addressFetchError);
                }

                if (userData) {
                    setUser (userData);
                    setPoints(userData.point); // Set poin dari userData
                }
                if (addressData) setAddresses(addressData);
            }
        };

        const fetchSavedRecipes = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session?.user) return;
      
            const { data: recipes, error } = await supabase
              .from('recipes')
              .select('*')
              .eq('user_id', session.user.id)
              .order('created_at', { ascending: false });
      
            if (error) {
              console.error('Error fetching saved recipes:', error);
              return;
            }
      
            setSavedRecipes(recipes);
          };
      
        fetchSavedRecipes();

        fetchUserData();
    }, []);

    const handleAddAddress = async () => {
        if (!newAddress.trim()) {
            toast.error('Alamat tidak boleh kosong');
            return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session?.user) {
                toast.error('Anda harus login');
                return;
            }

            const { data, error } = await supabase
                .from('addresses')
                .insert({
                    user_id: session.user.id,
                    address: newAddress.trim()
                })
                .select();

            if (error) {
                console.error('Error adding address:', error);
                toast.error('Gagal menambahkan alamat');
                return;
            }

            // Update local state
            if (data) {
                setAddresses([...addresses, data[0]]);
                setNewAddress('');
                toast.success('Alamat berhasil ditambahkan');
            }
        } catch (error) {
            console.error('Unexpected error:', error);
            toast.error('Terjadi kesalahan');
        }
    };

    const handleDeleteAddress = async (addressId: string) => {
        try {
            const { error } = await supabase
                .from('addresses')
                .delete()
                .eq('id', addressId);

            if (error) {
                console.error('Error deleting address:', error);
                toast.error('Gagal menghapus alamat');
                return;
            }

            // Update local state
            setAddresses(addresses.filter(addr => addr.id !== addressId));
            toast.success('Alamat berhasil dihapus');
        } catch (error) {
            console.error('Unexpected error:', error);
            toast.error('Terjadi kesalahan');
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('user_session');
        router.push('/login');
        toast.success('Logout berhasil');
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2 px-4">Profil Pengguna</h1>
            <div className="profile-info">
                <h2>Nama: {user.name}</h2>
                <h3>Email: {user.email}</h3>
                <h3>Poin Anda: {points}</h3>
            </div>

            <div className="address-section">
                <h2>Alamat Anda</h2>
                <ul>
                    {addresses.map(address => (
                        <li key={address.id} className="address-item">
                            {address.address}
                            <Button onClick={() => handleDeleteAddress(address.id)}>Hapus</Button>
                        </li>
                    ))}
                </ul>
                <Textarea
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Tambahkan alamat baru"
                />
                <Button onClick={handleAddAddress}>Tambah Alamat</Button>
            </div>

            <section className="saved-recipes">
                <h2>Resep Tersimpan</h2>
                {savedRecipes.length === 0 ? (
                <p>Anda belum menyimpan resep apapun</p>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedRecipes.map(recipe => (
                        <SavedRecipeCard 
                            key={recipe.id} 
                            recipe={recipe} 
                            onDelete={() => {
                                // Implementasi fungsi hapus resep
                                setSavedRecipes(prev => 
                                    prev.filter(r => r.id !== recipe.id)
                            );
                            }} 
                        />
                    ))}
                </div>
                )}
            </section>

            <Button onClick={handleLogout}>Logout</Button>
        </div>
    );
}

// Komponen baru untuk menampilkan resep tersimpan dengan dialog
function SavedRecipeCard({ 
    recipe, 
    onDelete 
  }: { 
    recipe: Recipe, 
    onDelete?: () => void 
  }) {
    const handleDeleteRecipe = async () => {
      try {
        const { error } = await supabase
          .from('recipes')
          .delete()
          .eq('id', recipe.id);
  
        if (error) {
          toast.error('Gagal menghapus resep');
          return;
        }
  
        toast.success('Resep berhasil dihapus');
        onDelete?.();
      } catch (error) {
        console.error('Error deleting recipe:', error);
        toast.error('Terjadi kesalahan');
      }
    };
  
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{recipe.name}</CardTitle>
              <CardDescription>{recipe.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between">
                <span>Tingkat Kesulitan: {recipe.difficulty}</span>
              </div>
            </CardContent>
          </Card>
        </DialogTrigger>
        
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{recipe.name}</DialogTitle>
            <DialogDescription>{recipe.description}</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Bahan:</h3>
              <ul className="list-disc pl-4">
                {recipe.ingredients.map((ingredient, idx) => (
                  <li key={idx}>{ingredient}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Instruksi Memasak:</h3>
              <ol className="list-decimal pl-4">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ol>
            </div>
  
            <div className="flex justify-between">
              <div>
                <strong>Tingkat Kesulitan:</strong> {recipe.difficulty}
              </div>
            </div>
          </div>
  
          <DialogFooter>
            <Button 
              variant="destructive" 
              onClick={handleDeleteRecipe}
            >
              Hapus Resep
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }