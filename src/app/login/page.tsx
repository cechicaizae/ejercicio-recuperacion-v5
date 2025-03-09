'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await signIn('credentials', {
        username: formData.get('username'),
        password: formData.get('password'),
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
        return;
      }

      router.push('/');
      router.refresh();
    } catch (error) {
      console.error(error);
      setError('Error al iniciar sesión');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-primary-dark">Iniciar Sesión</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-2">
              Usuario
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="w-full"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full"
              required
            />
          </div>
          <br></br>
          <button
  type="submit"
  className="w-full btn-primary py-2 px-4 rounded text-center"
>
  Iniciar Sesión
</button>
        </form>
      </div>
    </div>
  );
} 