// app/profile/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Database } from '@/lib/database.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut } from 'lucide-react';

type User = Database['public']['Tables']['users']['Row'];
type Address = Database['public']['Tables']['addresses']['Row'];
type Recipe = Database['public']['Tables']['recipes']['Row'];

export default function ProfilePage() {
    const [user, setUser ] = useState<User | null>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [newAddress, setNewAddress] = useState('');
    const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
    const router = useRouter();
    const [activeSection, setActiveSection] = useState<'dashboard' | 'recipes' | 'addresses'>('dashboard');
    const [recipeSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [recipeFilterDifficulty, setRecipeFilterDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

    // Dashboard Mini Statistik
    const [stats, setStats] = useState({
        totalRecipes: 0,
        totalPosts: 0,
        totalPoints: 0,
        completedChallenges: 0
    });

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session?.user) {
                // Fetch user details
                const { data: userData } = await supabase
                    .from('users')
                    .select('*, point')
                    .eq('id', session.user.id)
                    .single();

                // Fetch addresses
                const { data: addressData } = await supabase
                    .from('addresses')
                    .select('*')
                    .eq('user_id', session.user.id);

                // Fetch saved recipes
                const { data: recipes } = await supabase
                    .from('recipes')
                    .select('*')
                    .eq('user_id', session.user.id);

                // Fetch forum posts and challenges
                const { count: postCount } = await supabase
                    .from('forum_posts')
                    .select('*', { count: 'exact' })
                    .eq('user_id', session.user.id);

                if (userData) {
                    setUser (userData);
                    setAddresses(addressData || []);
                    setSavedRecipes(recipes || []);
                    
                    setStats({
                        totalRecipes: recipes?.length || 0,
                        totalPosts: postCount || 0,
                        totalPoints: userData.point,
                        completedChallenges: 0 // Implement challenge tracking
                    });
                }
            }
        };

        fetchUserData();
    }, []);

    // Filtering and Sorting Recipes
    const filteredAndSortedRecipes = savedRecipes
        .filter(recipe => 
            recipeFilterDifficulty === 'all' || 
            recipe.difficulty === recipeFilterDifficulty
        )
        .sort((a, b) => 
            recipeSortOrder === 'newest'
                ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('user_session');
        router.push('/login');
        toast.success('Logout berhasil');
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { 
                staggerChildren: 0.1 
            } 
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: { type: "spring", stiffness: 300 }
        }
    };

    if (!user) return <div>Loading...</div>;

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="container mx-auto p-4 space-y-6"
        >
            {/* Header */}
            <motion.div 
                variants={itemVariants}
                className="flex justify-between items-center"
            >
                <h1 className="text-3xl font-bold text-primary">Profil Pengguna</h1>
                <Button 
                    onClick={handleLogout} 
                    variant="destructive"
                    className="flex items-center"
                >
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
            </motion.div>

            {/* Navigation */}
            <motion.div 
                variants={itemVariants}
                className="flex space-x-4 mb-6"
            >
                {['dashboard', 'recipes', 'addresses'].map(section => (
                    <Button
                        key={section}
                        variant={activeSection === section ? 'default' : 'outline'}
                        onClick={() => setActiveSection(section as 'addresses' | 'recipes' | 'dashboard')}
                        >
                        {section.charAt(0).toUpperCase() + section.slice(1)}
                    </Button>
                ))}
            </motion.div>

            <AnimatePresence mode="wait">
                {activeSection === 'dashboard' && (
                    <motion.div
                        key="dashboard"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"
                    >
                        {Object.entries(stats).map(([key, value]) => (
                            <Card key={key}>
                                <CardHeader>
                                    <CardTitle>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-3xl font-bold text-primary">{value}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </motion.div>
                )}

                {activeSection === 'recipes' && (
                    <motion.div
                        key="recipes"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="flex justify-between mb-4">
                            <div className="flex space-x-2">
                                <Button onClick={() => setRecipeFilterDifficulty('all')}>Semua</Button>
                                <Button onClick={() => setRecipeFilterDifficulty('easy')}>Mudah</Button>
                                <Button onClick={() => setRecipeFilterDifficulty('medium')}>Sedang</Button>
                                <Button onClick={() => setRecipeFilterDifficulty('hard')}>Sulit</Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredAndSortedRecipes.map(recipe => (
                                <Card key={recipe.id}>
                                    <CardHeader>
                                        <CardTitle>{recipe.name}</CardTitle>
                                        <CardDescription>{recipe.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm">Kesulitan: {recipe.difficulty}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeSection === 'addresses' && (
                    <motion.div
                        key="addresses"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <h2 className="text-xl font-bold">Alamat Tersimpan</h2>
                        <ul className="space-y-2">
                            {addresses.map(address => (
                                <li key={address.id} className="border p-2 rounded">
                                    {address.address}
                                </li>
                            ))}
                        </ul>
                        <Textarea
                            value={newAddress}
                            onChange={(e) => setNewAddress(e.target.value)}
                            placeholder="Tambahkan alamat baru"
                            className="mt-4"
                        />
                        <Button onClick={async () => {
                            const { error } = await supabase
                                .from('addresses')
                                .insert([{ user_id: user.id, address: newAddress }]);
                            if (error) {
                                toast.error('Gagal menambahkan alamat');
                            } else {
                                setAddresses([...addresses, { id: Date.now().toString(), user_id: user.id, address: newAddress, latitude: null, longitude: null, street: null, city: null, province: null, postal_code: null, created_at: new Date().toISOString() }]);
                                setNewAddress('');
                                toast.success('Alamat berhasil ditambahkan');
                            }
                        }}>
                            Tambah Alamat
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}