'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { ThumbsUp, MessageCircle } from 'lucide-react';
import axios from 'axios';
import { supabase } from '@/lib/supabaseClient';

type Post = {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  user?: { name: string };
  likes_count?: number;
  comments_count?: number;
};

type Comment = {
  id: string;
  post_id: string;
  content: string;
  user?: { name: string };
};

export default function ForumPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [sortOrder, setSortOrder] = useState<'newest' | 'popular'>('newest');
    const [loading, setLoading] = useState(true);
    const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general' });
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [userId, setUserId] = useState<string | null>(null);

    // Fetch user ID
    useEffect(() => {
        const fetchUserId = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUserId(session.user.id);
            }
        };
        fetchUserId();
    }, []);

    // Fetch Posts
    const fetchPosts = async () => {
        try {
            if (!userId) return;

            const response = await axios.get('/api/forum', {
                params: { 
                    type: 'posts', 
                    category: 'general' 
                },
                headers: {
                    'X-API-Key': process.env.FORUM_API_KEY,
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate'
                }
            });

            let sortedPosts = response.data;

            if (sortOrder === 'newest') {
                sortedPosts = sortedPosts.sort((a: Post, b: Post) => 
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
            } else if (sortOrder === 'popular') {
                sortedPosts = sortedPosts.sort((a: Post, b: Post) => {
                    const aPopularity = (a.likes_count || 0) * 2 + (a.comments_count || 0);
                    const bPopularity = (b.likes_count || 0) * 2 + (b.comments_count || 0);
                    return bPopularity - aPopularity;
                });
            }

            setPosts(sortedPosts);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching posts:', error);
            toast.error('Gagal memuat postingan');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [sortOrder, userId]);

    // Create Post
    const handleCreatePost = async () => {
        if (!userId) {
            toast.error('Anda harus login');
            return;
        }

        try {
            await axios.post('/api/forum', {
                type: 'post',
                user_id: userId,
                title: newPost.title,
                content: newPost.content,
                category: newPost.category
            }, {
                headers: {
                    'X-API-Key': process.env.FORUM_API_KEY,
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate'
                }
            });

            toast.success('Postingan berhasil dibuat');
            setNewPost({ title: '', content: '', category: 'general' });
            fetchPosts();
        } catch (error) {
            console.error('Error creating post:', error);
            toast.error('Gagal membuat postingan');
        }
    };

    // Fetch Comments
    const fetchComments = async (postId: string) => {
        try {
            const response = await axios.get('/api/forum', {
                params: { 
                    type: 'comments', 
                    id: postId 
                },
                headers: {
                    'X-API-Key': process.env.FORUM_API_KEY,
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate'
                }
            });

            setComments(response.data);
        } catch (error) {
            console.error('Error fetching comments:', error);
            toast.error('Gagal memuat komentar');
        }
    };

    // Like Post
    const handleLikePost = async (postId: string) => {
        if (!userId) {
            toast.error('Anda harus login');
            return;
        }

        try {
            await axios.post('/api/forum', {
                type: 'like',
                user_id: userId,
                post_id: postId
            }, {
                headers: {
                    'X-API-Key': process.env.FORUM_API_KEY,
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate'
                }
            });

            fetchPosts();
        } catch (error) {
            console.error('Error liking post:', error);
            toast.error('Gagal memproses like');
        }
    };

    // Add Comment
    const handleAddComment = async () => {
        if (!userId || !selectedPost) {
            toast.error('Anda harus login');
            return;
        }

        try {
            await axios.post('/api/forum', {
                type: 'comment',
                user_id: userId,
                post_id: selectedPost.id,
                content: newComment
            }, {
                headers: {
                    'X-API-Key': process.env.FORUM_API_KEY,
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate'
                }
            });

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
                            <p>{post.user?.name}</p>
                            <p>{new Date(post.created_at).toLocaleDateString('id-ID')}</p>
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
