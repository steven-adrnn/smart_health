// app/forum/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Database } from '@/lib/database.types';

type Post = Database['public']['Tables']['forum_posts']['Row'];

export default function ForumPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [sortOrder, setSortOrder] = useState<'newest' | 'popular'>('newest');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            const { data: postsData } = await supabase
                .from('forum_posts')
                .select('*')
                .order(sortOrder === 'newest' ? 'created_at' : 'likes', { ascending: sortOrder === 'newest' });

            setPosts(postsData || []);
            setLoading(false);
        };

        fetchPosts();
    }, [sortOrder]);

    if (loading) return <div>Loading...</div>;

    return (
        <motion.div className="container mx-auto p-4 space-y-6">
            <h1 className="text-3xl font-bold">Forum Diskusi</h1>
            <div className="flex space-x-4 mb-4">
                <Button onClick={() => setSortOrder('newest')}>Terbaru</Button>
                <Button onClick={() => setSortOrder('popular')}>Terpopuler</Button>
            </div>
            <AnimatePresence>
                {posts.map(post => (
                    <motion.div
                        key={post.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity:  1 }}
                        exit={{ opacity: 0 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>{post.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>{post.content}</p>
                                <p className="text-sm text-gray-500">Dibuat pada: {new Date(post.created_at).toLocaleString()}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </AnimatePresence>
        </motion.div>
    );
}