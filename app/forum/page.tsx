//forum.tsx
'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { Database } from '@/lib/database.types';

type ForumPost = Database['public']['Tables']['forum_posts']['Row'];
type ForumComment = Database['public']['Tables']['forum_comments']['Row'];

const CATEGORIES = [
  'Resep', 
  'Kesehatan', 
  'Nutrisi', 
  'Gaya Hidup Sehat', 
  'Diskusi Umum'
];

export default function ForumPage() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: CATEGORIES[0]
  });
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [newComment, setNewComment] = useState('');


  useEffect(() => {
    fetchPosts();
    
    // Real-time subscription untuk posts
    const channel = supabase
      .channel('forum-posts-changes')
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'forum_posts' },
        () => fetchPosts()
      )
      .subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('forum_posts')
      .select('*, user:users(name)')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Gagal memuat posts');
    } else {
      setPosts(data || []);
    }
  };

  const createPost = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      toast.error('Anda harus login');
      return;
    }

    const { error } = await supabase
      .from('forum_posts')
      .insert({
        user_id: session.user.id,
        ...newPost
      });

    if (error) {
      toast.error('Gagal membuat post');
    } else {
      setNewPost({ title: '', content: '', category: CATEGORIES[0] });
      toast.success('Post berhasil dibuat');
    }
  };

  const fetchComments = async (postId: string) => {
    const { data, error } = await supabase
      .from('forum_comments')
      .select('*, user:users(name)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      toast.error('Gagal memuat komentar');
    } else {
      setComments(data || []);
    }
  };

  const addComment = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user || !selectedPost) {
      toast.error('Anda harus login');
      return;
    }

    const { error } = await supabase
      .from('forum_comments')
      .insert({
        user_id: session.user.id,
        post_id: selectedPost.id,
        content: newComment
      });

    if (error) {
      toast.error('Gagal menambah komentar');
    } else {
      setNewComment('');
      fetchComments(selectedPost.id);
    }
  };

  const likePost = async (postId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      toast.error('Anda harus login');
      return;
    }
  
    try {
        // Cek apakah user sudah pernah like post ini
        const { data: existingLike, error: checkError } = await supabase
            .from('forum_likes')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('post_id', postId)
            .single();
  
        // Hitung jumlah likes
        const { count: likesCount} = await supabase
            .from('forum_likes')
            .select('*', { count: 'exact' })
            .eq('post_id', postId);

        if (checkError && checkError.code !== 'PGRST116') {
            throw checkError;
        }
    
        // Jika sudah pernah like, maka unlike
        if (existingLike) {
            const { error: unlikeError } = await supabase
                .from('forum_likes')
                .delete()
                .eq('user_id', session.user.id)
                .eq('post_id', postId);
            
            const { error: updatePostError } = await supabase
                .from('forum_posts')
                .update({ likes_count: Math.max(0, (likesCount || 1) - 1) })
                .eq('id', postId);
    
            if (unlikeError) throw unlikeError || updatePostError;
            
            toast.success('Post unliked');
        } else {
            // Like: Tambah like dan naikkan likes_count
            const { error: likeError } = await supabase
                .from('forum_likes')
                .insert({
                    user_id: session.user.id,
                    post_id: postId
                });

            const { error: updatePostError } = await supabase
                .from('forum_posts')
                .update({ likes_count: (likesCount || 0) + 1 })
                .eq('id', postId);

            if (likeError || updatePostError) throw likeError || updatePostError;
            
            toast.success('Post liked');
        }

        fetchPosts();
    } catch (error) {
        console.error('Error liking/unliking post:', error);
        toast.error('Gagal memproses like');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Forum Diskusi Smart Health</h1>

      {/* Buat Post Baru */}
      <div className="mb-6 p-4 border rounded">
        <Input 
          placeholder="Judul Post"
          value={newPost.title}
          onChange={(e) => setNewPost({...newPost, title: e.target.value})}
          className="mb-2"
        />
        <Select 
          value={newPost.category}
          onValueChange={(value) => setNewPost({...newPost, category: value})}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih Kategori" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Textarea 
          placeholder="Isi Post"
          value={newPost.content}
          onChange={(e) => setNewPost({...newPost, content: e.target.value})}
          className="mt-2 mb-2"
        />
        <Button onClick={createPost}>Posting</Button>
      </div>

      {/* Daftar Post */}
      <div>
        {posts.map(post => (
          <div 
            key={post.id} 
            className="border p-4 mb-4 rounded"
            onClick={() => {
               setSelectedPost(post);
               fetchComments(post.id);
            }}
          >
            <h2 className="text-xl font-semibold">{post.title}</h2>
            <p className="text-gray-600">{post.content}</p>
            <p className="text-sm text-gray-500">Kategori: {post.category}</p>
            <p className="text-sm text-gray-500">Dibuat oleh: {post.user.name}</p>
            <Button onClick={() => likePost(post.id)}>Like</Button>
            <p>{post.likes_count} Likes</p>
          </div>
        ))}
      </div>

      {/* Komentar */}
      {selectedPost && (
        <div className="mt-6 p-4 border rounded">
          <h3 className="text-lg font-bold">Komentar</h3>
          <Textarea 
            placeholder="Tulis komentar..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="mt-2 mb-2"
          />
          <Button onClick={addComment}>Kirim Komentar</Button>
          <div className="mt-4">
            {comments.map(comment => (
              <div key={comment.id} className="border p-2 mb-2 rounded">
                <p className="font-semibold">{comment.user.name}</p>
                <p>{comment.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}