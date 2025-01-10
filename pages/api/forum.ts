// pages/api/forum.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { z } from 'zod'; // Tambahkan zod untuk validasi input

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);

// Skema Validasi Input
const PostSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  content: z.string().min(5, "Konten minimal 5 karakter"),
  category: z.string().optional().default('general')
});

const CommentSchema = z.object({
  post_id: z.string().uuid("ID Post tidak valid"),
  content: z.string().min(1, "Komentar tidak boleh kosong")
});

const LikeSchema = z.object({
  post_id: z.string().uuid("ID Post tidak valid")
});

// Handler Utama
export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  // CORS Configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Autentikasi API Key (Opsional tambahan)
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.FORUM_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGetRequest(req, res);
      case 'POST':
        return await handlePostRequest(req, res);
      case 'PUT':
        return await handlePutRequest(req, res);
      case 'DELETE':
        return await handleDeleteRequest(req, res);
      default:
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Forum API Error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

// Handler GET
async function handleGetRequest(req: NextApiRequest, res: NextApiResponse) {
  const { type, id, category } = req.query;

  switch (type) {
    case 'posts':
      const { data: posts, error: postsError } = await supabase
        .from('forum_posts')
        .select(`
          *,
          user:users(name),
          likes_count:forum_likes(count),
          comments_count:forum_comments(count)
        `)
        .eq('category', category || 'general')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;
      return res.status(200).json(posts);

    case 'comments':
      if (!id) {
        return res.status(400).json({ error: 'Post ID diperlukan untuk mengambil komentar' });
      }
      
      const { data: comments, error: commentsError } = await supabase
        .from('forum_comments')
        .select('*, user:users(name)')
        .eq('post_id', id);

      if (commentsError) throw commentsError;
      return res.status(200).json(comments);

    default:
      return res.status(400).json({ error: 'Tipe data tidak valid' });
  }
}

// Handler POST
async function handlePostRequest(req: NextApiRequest, res: NextApiResponse) {
  const { type, user_id } = req.body;

  if (!user_id) {
    return res.status(401).json({ error: 'Autentikasi diperlukan' });
  }

  switch (type) {
    case 'post':
      const postValidation = PostSchema.safeParse(req.body);
      if (!postValidation.success) {
        return res.status(400).json({ 
          error: 'Validasi gagal', 
          details: postValidation.error.errors 
        });
      }

      const { data: newPost, error: postError } = await supabase
        .from('forum_posts')
        .insert({
          user_id,
          title: postValidation.data.title,
          content: postValidation.data.content,
          category: postValidation.data.category
        })
        .select();

      if (postError) throw postError;
      return res.status(201).json(newPost[0]);

    case 'comment':
      const commentValidation = CommentSchema.safeParse(req.body);
      if (!commentValidation.success) {
        return res.status(400).json({ 
          error: 'Validasi gagal', 
          details: commentValidation.error.errors 
        });
      }

      const { data: newComment, error: commentError } = await supabase
        .from('forum_comments')
        .insert({
          user_id,
          post_id: commentValidation.data.post_id,
          content: commentValidation.data.content
        })
        .select();

      if (commentError) throw commentError;
      return res.status(201).json(newComment[0]);

    case 'like':
      const likeValidation = LikeSchema.safeParse(req.body);
      if (!likeValidation.success) {
        return res.status(400).json({ 
          error: 'Validasi gagal', 
          details: likeValidation.error.errors 
        });
      }

      // Cek apakah sudah pernah like
      const { data: existingLike, error: likeCheckError } = await supabase
        .from('forum_likes')
        .select('*')
        .eq('post_id', likeValidation.data.post_id)
        .eq('user_id', user_id)
        .single();

      if (likeCheckError && likeCheckError.code !== 'PGRST116') {
        throw likeCheckError;
      }

      if (existingLike) {
        // Jika sudah like, maka unlike
        const { error: unlikeError } = await supabase
          .from('forum_likes')
          .delete()
          .eq('post_id', likeValidation.data.post_id)
          .eq('user_id', user_id);

        if (unlikeError) throw unlikeError;
        return res.status(200).json({ message: 'Unlike berhasil' });
      } else {
        // Like baru
        const { data: newLike, error: likeError } = await supabase
          .from('forum_likes')
          .insert({
            user_id,
            post_id: likeValidation.data.post_id
          })
          .select();

        if (likeError) throw likeError;
        return res.status(201).json(newLike[0]);
      }

    default:
      return res.status(400).json({ error: 'Tipe operasi tidak valid' });
  }
}

// Handler PUT (Update)
async function handlePutRequest(req: NextApiRequest, res: NextApiResponse) {
  const { type, id, user_id, content } = req.body;

  if (!user_id) {
    return res.status(401).json({ error: 'Autentikasi diperlukan' });
  }

  switch (type) {
    case 'post':
      const postUpdateValidation = PostSchema.partial().safeParse(req.body);
      if (!postUpdateValidation.success) {
        return res.status(400).json({ 
          error: 'Validasi gagal', 
          details: postUpdateValidation.error.errors 
        });
      }

      const { error: postUpdateError } = await supabase
        .from('forum_posts')
        .update({
          title: postUpdateValidation.data.title,
          content: postUpdateValidation.data.content,
          category: postUpdateValidation.data.category
        })
        .eq('id', id)
        .eq('user_id', user_id);

      if (postUpdateError) throw postUpdateError;
      return res.status(200).json({ message: 'Postingan berhasil diperbarui' });

    case 'comment':
      const commentUpdateValidation = CommentSchema.partial().safeParse(req.body);
      if (!commentUpdateValidation.success) {
        return res.status(400).json({ 
          error: 'Validasi gagal', 
          details: commentUpdateValidation.error.errors 
        });
      }

      const { error: commentUpdateError } = await supabase
        .from('forum_comments')
        .update({
          content: commentUpdateValidation.data.content
        })
        .eq('id', id)
        .eq('user_id', user_id);

      if (commentUpdateError) throw commentUpdateError;
      return res.status(200).json({ message: 'Komentar berhasil diperbarui' });

    default:
      return res.status(400).json({ error: 'Tipe operasi tidak valid' });
  }
}

// Handler DELETE
async function handleDeleteRequest(req: NextApiRequest, res: NextApiResponse) {
  const { type, id, user_id } = req.body;

  if (!user_id) {
    return res.status(401).json({ error: 'Autentikasi diperlukan' });
  }

  switch (type) {
    case 'post':
      const { error: postDeleteError } = await supabase
        .from('forum_posts')
        .delete()
        .eq('id', id)
        .eq('user_id', user_id);

      if (postDeleteError) throw postDeleteError;
      return res.status(200).json({ message: 'Postingan berhasil dihapus' });

    case 'comment':
      const { error: commentDeleteError } = await supabase
        .from('forum_comments')
        .delete()
        .eq('id', id)
        .eq('user_id', user_id);

      if (commentDeleteError) throw commentDeleteError;
      return res.status(200).json({ message: 'Komentar berhasil dihapus' });

    case 'like':
      const { error: likeDeleteError } = await supabase
        .from('forum_likes')
        .delete()
        .eq('post_id', id)
        .eq('user_id', user_id);

      if (likeDeleteError) throw likeDeleteError;
      return res.status(200).json({ message: 'Like berhasil dihapus' });

    default:
      return res.status(400).json({ error: 'Tipe operasi tidak valid' });
  }
}