// 'use client'

// import { useState } from 'react'
// import { BackButton } from '@/components/BackButton'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Textarea } from '@/components/ui/textarea'

// export default function ProfilePage() {
//   const [name, setName] = useState('')
//   const [email, setEmail] = useState('')
//   const [address, setAddress] = useState('')
//   const [bio, setBio] = useState('')
//   const [avatar, setAvatar] = useState('')

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
//     // Here you would typically send this data to your backend
//     console.log('Profile updated:', { name, email, address, bio, avatar })
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <BackButton />
//       <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
//       <form onSubmit={handleSubmit} className="max-w-md mx-auto">
//         <div className="mb-4">
//           <label htmlFor="avatar" className="block mb-2">Profile Picture</label>
//           <Input
//             type="file"
//             id="avatar"
//             accept="image/*"
//             onChange={(e) => setAvatar(e.target.files?.[0]?.name || '')}
//           />
//         </div>
//         <div className="mb-4">
//           <label htmlFor="name" className="block mb-2">Name</label>
//           <Input
//             type="text"
//             id="name"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             required
//           />
//         </div>
//         <div className="mb-4">
//           <label htmlFor="email" className="block mb-2">Email</label>
//           <Input
//             type="email"
//             id="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//         </div>
//         <div className="mb-4">
//           <label htmlFor="address" className="block mb-2">Delivery Address</label>
//           <Textarea
//             id="address"
//             value={address}
//             onChange={(e) => setAddress(e.target.value)}
//             required
//           />
//         </div>
//         <div className="mb-4">
//           <label htmlFor="bio" className="block mb-2">Bio</label>
//           <Textarea
//             id="bio"
//             value={bio}
//             onChange={(e) => setBio(e.target.value)}
//           />
//         </div>
//         <Button type="submit" className="w-full">Update Profile</Button>
//       </form>
//     </div>
//   )
// }



// app/profile/page.tsx
'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/database.types';

const ProfilePage = () => {
    const [user, setUser ] = useState<Database['public']['Tables']['users']['Row'] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser  = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (error) {
                    console.error('Error fetching user:', error);
                } else {
                    setUser (data);
                }
            }
            setLoading(false);
        };

        fetchUser ();
    }, []);

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <h1>Your Profile</h1>
            {user ? (
                <div>
                    <p>Email: {user.email}</p>
                    <p>Name: {user.name}</p>
                </div>
            ) : (
                <p>No user data found.</p>
            )}
        </div>
    );
};

export default ProfilePage;