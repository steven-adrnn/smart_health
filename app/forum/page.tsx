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
  likes_count: number;
  comments_count: number;
};

type Comment = Database['public']['Tables']['forum_comments']['Row'];

export default function ForumPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [sortOrder, setSortOrder] = useState<'newest' | 'popular'>('newest');
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

        const { data: postsData, error } = await supabase
            .from('forum_posts')
            .select(`
                *,
                likes_count: forum_likes(count),
                comments_count: forum_comments(count)
            `)
            .order(sortOrder === 'newest' ? 'created_at' : 'likes_count', { ascending: false });

        if (error) {
            toast.error('Gagal memuat postingan');
            console.error(error);
        } else {
            setPosts(postsData || []);
        }
        setLoading(false);
    };

    const handleCreatePost = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
            toast.error('Anda harus login');
            return;
        }

        const { error } = await supabase
            .from('forum_posts')
            .insert({
                user_id: session.user.id,
                title: newPost.title,
                content: newPost.content,
                category: newPost.category,
                likes_count: 0
            });

        if (error) {
            toast.error('Gagal membuat postingan');
        } else {
            toast.success('Postingan berhasil dibuat');
            setNewPost({ title: '', content: '', category: 'general' });
            fetchPosts();
        }
    };

    const handleLikePost = async (postId: string) => {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
            toast.error('Anda harus login');
            return;
        }

        const { error } = await supabase
            .from('forum_likes')
            .insert({
                post_id: postId,
                user_id: session.user.id
            });

        if (error) {
            toast.error('Gagal memberikan like');
        } else {
            fetchPosts();
        }
    };

    const fetchComments = async (postId: string) => {
        const { data: commentsData, error } = await supabase
            .from('forum_comments')
            .select('*')
            .eq('post_id', postId);

        if (error) {
            toast.error('Gagal memuat komentar');
        } else {
            setComments(commentsData || []);
        }
    };

    const handleAddComment = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user || !selectedPost) {
            toast.error('Anda harus login');
            return;
        }

        const { error } = await supabase
            .from('forum_comments')
            .insert({
                post_id: selectedPost.id,
                user_id: session.user.id,
                content: newComment
            });

        if (error) {
            toast.error('Gagal menambahkan komentar');
        } else {
            toast.success('Komentar berhasil ditambahkan');
            setNewComment('');
            fetchComments(selectedPost.id);
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
                                <p>{comment.content}</p>
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