// 'use client'

// import { useState } from 'react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import Link from 'next/link'
// import { BackButton } from '@/components/BackButton'

// export default function RegisterPage() {
//   const [name, setName] = useState('')
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
//     // Handle registration logic here
//     console.log('Registration attempt with:', name, email, password)
//   }

//   const handleGoogleRegister = () => {
//     // Handle Google registration logic here
//     console.log('Google registration attempted')
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="bg-white p-8 rounded-lg shadow-md w-96">
//         <BackButton />
//         <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
//             <Input
//               type="text"
//               id="name"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               required
//               className="mt-1 block w-full"
//             />
//           </div>
//           <div>
//             <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
//             <Input
//               type="email"
//               id="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               className="mt-1 block w-full"
//             />
//           </div>
//           <div>
//             <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
//             <Input
//               type="password"
//               id="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               className="mt-1 block w-full"
//             />
//           </div>
//           <Button type="submit" className="w-full">Register</Button>
//         </form>
//         <div className="mt-4">
//           <Button onClick={handleGoogleRegister} className="w-full bg-red-500 hover:bg-red-600">
//             Register with Google
//           </Button>
//         </div>
//         <p className="mt-4 text-center text-sm">
//           Already have an account? <Link href="/login" className="text-green-500 hover:text-green-600">Login</Link>
//         </p>
//       </div>
//     </div>
//   )
// }




// app/register/page.tsx
'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const router = useRouter();

    // app/register/page.tsx
    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      try {
          // Step 1: Registrasi Autentikasi
          const { data: authData, error: authError } = await supabase.auth.signUp({
              email,
              password,
              options: {
                  data: { name } // Ini hanya di Auth, TIDAK masuk ke tabel users
              }
          });
          
          if (authError) throw authError;

          // Step 2: Tambahkan data ke tabel users
          const { error: userError } = await supabase
              .from('users')
              .insert({
                  id: authData.user?.id, // Gunakan ID dari autentikasi
                  email,
                  name,
                  created_at: new Date().toISOString()
              });

          if (userError) throw userError;

          router.push('/login');
      } catch (error) {
          console.error('Registration error:', error);
          alert('Error registering');
      }
    };

    return (
        <div>
            <h1>Register</h1>
            <form onSubmit={handleRegister}>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    required
                />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                />
                <button type="submit">Register</button>
            </form>
        </div>
    );
};