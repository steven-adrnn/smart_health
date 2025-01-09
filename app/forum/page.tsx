'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AnimatePresence } from 'framer-motion';
import { Database } from '@/lib/database.types';
import { toast } from 'react-hot-toast';
import { ThumbsUp, MessageCircle } from 'lucide-react';

type Post = Database['public']['Tables']['forum_posts']['Row'] & {
  likes_count?: number;
  comments_count?: number;
};

type Comment = Database['public']['Tables']['forum_comments']['Row'] & {
  user?: { name: string };
};

export default function ForumPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [sortOrder, setSortOrder] = useState<'newest' | 'popular'>();
    const [loading, setLoading] = useState(true);
    const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general' });
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        fetchPosts();
    }, [sortOrder]);

    const fetchPosts = async () => {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
            toast.error('Anda harus login');
            return;
        }

        try {
            let query = supabase
                .from('forum_posts')
                .select(`
                    *,
                    likes_count:forum_likes(count),
                    comments_count:forum_comments(count)
                `);

            // Implementasi Sorting Dinamis
            if (sortOrder === 'newest') {
                query = query.order('created_at', { ascending: false });
            } else if (sortOrder === 'popular') {
                query = query
                    .order('likes_count', { ascending: false })
                    .order('comments_count', { ascending: false });
            }

            const { data: postsData, error: postsError } = await query;

            if (postsError) throw postsError;

            // Manual sorting untuk kasus kompleks
            const sortedPosts = postsData?.sort((a, b) => {
                if (sortOrder === 'newest') {
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                } else if (sortOrder === 'popular') {
                    // Bobot untuk likes dan comments
                    const aPopularity = (a.likes_count?.count || 0) * 2 + (a.comments_count?.count || 0);
                    const bPopularity = (b.likes_count?.count || 0) * 2 + (b.comments_count?.count || 0);
                    return bPopularity - aPopularity;
                }
                return 0;
            }) || [];

            setPosts(sortedPosts);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching posts:', error);
            toast.error('Gagal memuat postingan');
            setLoading(false);
        }
    };

    const handleCreatePost = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
            toast.error('Anda harus login');
            return;
        }

        // Validasi input
        if (!newPost.title.trim() || !newPost.content.trim()) {
            toast.error('Judul dan konten tidak boleh kosong');
            return;
        }

        try {
            const { error } = await supabase
                .from('forum_posts')
                .insert({
                    user_id: session.user.id,
                    title: newPost.title,
                    content: newPost.content,
                    category: newPost.category
                });

            if (error) throw error;

            toast.success('Postingan berhasil dibuat');
            setNewPost({ title: '', content: '', category: 'general' });
            fetchPosts();
        } catch (error) {
            console.error('Error creating post:', error);
            toast.error('Gagal membuat postingan');
        }
    };

    const handleLikePost = async (postId: string) => {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
            toast.error('Anda harus login');
            return;
        }

        try {
            // Cek apakah user sudah pernah like
            const { data: existingLike, error: existingLikeError } = await supabase
                .from('forum_likes')
                .select('*')
                .eq('post_id', postId)
                .eq('user_id', session.user.id)
                .single();

            if (existingLikeError && existingLikeError.code !== 'PGRST116') {
                throw existingLikeError;
            }

            if (existingLike) {
                // Jika sudah pernah like, hapus like
                const { error: unlikeError } = await supabase
                    .from('forum_likes')
                    .delete()
                    .eq('post_id', postId)
                    .eq('user_id', session.user.id);

                if (unlikeError) throw unlikeError;
            } else {
                // Jika belum pernah like, tambahkan like
                const { error: likeError } = await supabase
                    .from('forum_likes')
                    .insert({
                        post_id: postId,
                        user_id: session.user.id
                    });

                if (likeError) throw likeError;
            }

            // Refresh posts setelah like/unlike
            fetchPosts();
        } catch (error) {
            console.error('Error liking post:', error);
            toast.error('Gagal memproses like');
        }
    };

    const fetchComments = async (postId: string) => {
        try {
            const { data: commentsData, error } = await supabase
                .from('forum_comments')
                .select('*, user:users(name)')
                .eq('post_id', postId);

            if (error) throw error;

            setComments(commentsData || []);
        } catch (error) {
            console.error('Error fetching comments:', error);
            toast.error('Gagal memuat komentar');
        }
    };

    const handleAddComment = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user || !selectedPost) {
            toast.error('Anda harus login');
            return;
        }

        // Validasi komentar
        if (!newComment.trim()) {
            toast.error('Komentar tidak boleh kosong');
            return;
        }

        try {
            const { error } = await supabase
                .from('forum_comments')
                .insert({
                    post_id: selectedPost.id,
                    user_id: session.user.id,
                    content: newComment
                });

            if (error) throw error;

            toast.success('Komentar berhasil ditambahkan');
            setNewComment('');
            fetchComments(selectedPost.id);
        } catch (error) {
            console.error('Error adding comment:', error);
            toast.error('Gagal menambahkan komentar');
        }
    };

    if (loading) {
        return <div>Memuat...</div>;
    }

    return (
        <div className="container mx-auto p-4 space-y-6">
            <h1 className="text-3xl font-bold">Forum Diskusi</h1>
            
            {/* Tombol Sorting dan Posting */}
            <div className="flex justify-between items-center mb-4">
                <div className="space-x-4">
                    <Button onClick={() => setSortOrder('newest')}>Terbaru</Button>
                    <Button onClick={() => setSortOrder('popular')}>Terpopuler</Button>
                </div>
                
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>Buat Postingan</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Buat Postingan Baru</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <Input 
                                placeholder="Judul" 
                                value={newPost.title}
                                onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                            />
                            <Textarea 
                                placeholder="Isi postingan" 
                                value={newPost.content}
                                onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                            />
                            <Button onClick={handleCreatePost}>Posting</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Daftar Postingan */}
            <AnimatePresence>
                {posts.map(post => (
                    <Card key={post.id} className="mb-4">
                        <CardHeader>
                            <CardTitle>{post.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{post.content}</p>
                            <div className="flex justify-between items-center mt-4">
                                <div className="flex items-center space-x-4">
                                    <Button 
                                        variant="ghost" 
                                        onClick={() => handleLikePost(post.id)}
                                    > <ThumbsUp className="mr-2" /> {post.likes_count} Like
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        onClick={() => {
                                            setSelectedPost(post);
                                            fetchComments(post.id);
                                        }}
                                    >
                                        <MessageCircle className="mr-2" /> {post.comments_count} Komentar
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </AnimatePresence>

            {/* Komentar */}
            {selectedPost && (
                <div className="mt-6">
                    <h2 className="text-xl font-semibold">Komentar untuk {selectedPost.title}</h2>
                    <div className="space-y-4">
                        {comments.map(comment => (
                            <div key={comment.id} className="border p-2 rounded">
                                <p>{comment.user?.name}: {comment.content}</p>
                            </div>
                        ))}
                    </div>
                    <Textarea 
                        placeholder="Tulis komentar..." 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <Button onClick={handleAddComment}>Kirim Komentar</Button>
                </div>
            )}
        </div>
    );
}