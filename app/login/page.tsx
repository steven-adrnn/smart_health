// 'use client'

// import { useState } from 'react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import Link from 'next/link'
// import { BackButton } from '@/components/BackButton'

// export default function LoginPage() {
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
//     // Handle login logic here
//     console.log('Login attempt with:', email, password)
//   }

//   const handleGoogleLogin = () => {
//     // Handle Google login logic here
//     console.log('Google login attempted')
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="bg-white p-8 rounded-lg shadow-md w-96">
//         <BackButton />
//         <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
//         <form onSubmit={handleSubmit} className="space-y-4">
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
//           <Button type="submit" className="w-full">Login</Button>
//         </form>
//         <div className="mt-4">
//           <Button onClick={handleGoogleLogin} className="w-full bg-red-500 hover:bg-red-600">
//             Login with Google
//           </Button>
//         </div>
//         <p className="mt-4 text-center text-sm">
//           Dont have an account? <Link href="/register" className="text-green-500 hover:text-green-600">Register</Link>
//         </p>
//       </div>
//     </div>
//   )
// }


// app/login/page.tsx
'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            router.push('/profile');
        } catch (error) {
            console.error('Login error:', error);
            alert('Error logging in');
        }
    };

    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={handleLogin}>
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
                <button type="submit">Login</button>
            </form>
        </div>
    );
}