// app/profile/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Database } from '@/lib/database.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Trash2, Printer, Share2 } from 'lucide-react';
import Addresses from '@/components/Addresses';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';


type User = Database['public']['Tables']['users']['Row'];
// type Address = Database['public']['Tables']['addresses']['Row'];
type Recipe = Database['public']['Tables']['recipes']['Row'];

export default function ProfilePage() {
    const [user, setUser ] = useState<User | null>(null);
    // const [addresses, setAddresses] = useState<Address[]>([]);
    const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
    const router = useRouter();
    const [activeSection, setActiveSection] = useState<'dashboard' | 'recipes' | 'addresses'>('dashboard');
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [recipeFilterDifficulty, setRecipeFilterDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);


    // Dashboard Mini Statistik
    const [stats, setStats] = useState({
        totalRecipes: 0,
        totalPosts: 0,
        totalPoints: 0,
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
                    // setAddresses(addressData || []);
                    setSavedRecipes(recipes || []);
                    
                    setStats({
                        totalRecipes: recipes?.length || 0,
                        totalPosts: postCount || 0,
                        totalPoints: userData.point,
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
        
    // Fungsi untuk membuka detail resep
    const openRecipeDetails = (recipe: Recipe) => {
        setSelectedRecipe(recipe);
    };
    
    // Fungsi untuk menghapus resep
    const handleDeleteRecipe = async () => {
        if (!confirmDelete) return;

        try {
            const { error } = await supabase
                .from('recipes')
                .delete()
                .eq('id', confirmDelete);

            if (error) throw error;

            // Update local state
            setSavedRecipes(prevRecipes => 
                prevRecipes.filter(recipe => recipe.id !== confirmDelete)
            );

            toast.success('Resep berhasil dihapus');
            setConfirmDelete(null);
            setSelectedRecipe(null);
        } catch (error) {
            console.error('Error deleting recipe:', error);
            toast.error('Gagal menghapus resep');
        }
    };

    // Fungsi berbagi resep
    const shareRecipe = (recipe: Recipe) => {
        // Buat teks untuk dibagikan
        const shareText = `Resep: ${recipe.name}\n\nDeskripsi: ${recipe.description}\n\nBahan:\n${
            recipe.ingredients.map((ing, idx) => `${idx + 1}. ${ing}`).join('\n')
        }\n\nInstruksi:\n${
            recipe.instructions.map((inst, idx) => `${idx + 1}. ${inst}`).join('\n')
        }`;

        // Salin ke clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            toast.success('Resep berhasil disalin');
        }).catch(err => {
            console.error('Gagal menyalin resep:', err);
            toast.error('Gagal menyalin resep');
        });
    };

    // Fungsi cetak resep
    const printRecipe = (recipe: Recipe) => {
        // Buat jendela cetak baru
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error('Gagal membuka jendela cetak');
            return;
        }

        printWindow.document.write(`
            <html>
                <head>
                    <title>Resep ${recipe.name}</title>
                    <style>
                        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                        h1 { color: #2ecc71; }
                        h2 { color: #34495e; }
                        ul, ol { margin-bottom: 20px; }
                    </style>
                </head>
                <body>
                    <h1>${recipe.name}</h1>
                    <p><em>${recipe.description}</em></p>
                    <h2>Bahan:</h2>
                    <ul>
                        ${recipe.ingredients.map(ing => `<li>${ing}</li>`).join('')}
                    </ul>
                    <h2>Instruksi:</h2>
                    <ol>
                        ${recipe.instructions.map(inst => `<li>${inst}</li>`).join('')}
                    </ol>
                    <p><strong>Tingkat Kesulitan:</strong> ${recipe.difficulty}</p>
                    <p><em>Dibuat dengan Smart Health</em></p>
                </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.print();
    };


    // Render recipe details dialog
    const RecipeDetailsDialog = () => {
        if (!selectedRecipe) return null;

        return (
            <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{selectedRecipe.name}</DialogTitle>
                        <DialogDescription>{selectedRecipe.description}</DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Bahan:</h3>
                            <ul className="list-disc pl-4">
                                {selectedRecipe.ingredients.map((ingredient, idx) => (
                                    <li key={idx}>{ingredient}</li>
                                ))}
                            </ul>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Instruksi Memasak:</h3>
                            <ol className="list-decimal pl-4">
                                {selectedRecipe.instructions.map((instruction, index) => (
                                    <li key={index}>{instruction}</li>
                                ))}
                            </ol>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Detail Tambahan:</h3>
                            <p><strong>Tingkat Kesulitan:</strong> {selectedRecipe.difficulty}</p>
                        </div>
                    </div>

                    <DialogFooter className="flex justify-between">
                        <div className="flex space-x-2">
                            <Button 
                                variant="outline" 
                                onClick={() => shareRecipe(selectedRecipe)}
                            >
                                <Share2 className="mr-2 h-4 w-4" /> Bagikan
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={() => printRecipe(selectedRecipe)}
                            >
                                <Printer className="mr-2 h-4 w-4" /> Cetak
                            </Button>
                        </div>
                        <Button 
                            variant="destructive" 
                            onClick={() => setConfirmDelete(selectedRecipe.id)}
                        >
                             <Trash2 className="mr-2 h-4 w-4" /> Hapus Resep
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    // Konfirmasi penghapusan resep
    const ConfirmDeleteDialog = () => {
        return (
            <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Penghapusan</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus resep ini?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDelete(null)}>Batal</Button>
                        <Button variant="destructive" onClick={handleDeleteRecipe}>Hapus</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };
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
                                <Card 
                                    key={recipe.id} 
                                    onClick={() => openRecipeDetails(recipe)}
                                    className="cursor-pointer hover:shadow-lg transition-shadow"
                                >
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

                {/* Recipe Details Dialog */}
                <RecipeDetailsDialog />

                {/* Confirm Delete Dialog */}
                <ConfirmDeleteDialog />

                {activeSection === 'addresses' && (
                    <motion.div
                        key="addresses"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* <h2 className="text-xl font-bold">Alamat Tersimpan</h2> */}
                        <Addresses 
                            allowAddNew={true} 
                        />
                        {/* <ul className="space-y-2">
                            {addresses.map(address => (
                                <li key={address.id} className="border p-2 rounded">
                                    {address.address}
                                </li>
                            ))}
                        </ul> */}
                        
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}