'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user.role === 'Administrador') {
      router.push('/admin/tickets');
    } else if (session?.user.role === 'Empleado') {
      router.push('/empleado/tickets');
    } else if (session?.user.role === 'Usuario') {
      router.push('/usuario/tickets');
    } else {
      router.push('/login');
    }
  }, [session]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Sistema de Gestión de Incidentes</h1>
        <p className="text-gray-600">Redirigiendo...</p>
      </div>
    </div>
  );
}
