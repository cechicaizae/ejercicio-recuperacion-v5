'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Navigation() {
  const { data: session } = useSession();

  if (!session) return null;

  const role = session.user.role;

  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-white hover:text-gray-300 transition duration-300">
          Sistema de Incidentes - Estrategia
        </Link>

        <div className="flex items-center space-x-8">
          {role === 'Administrador' && (
            <>
            <Link href="/admin/tickets" className="text-lg font-medium hover:text-gray-300 transition duration-300">
                Tickets
              </Link>
              <Link href="/admin/usuarios" className="text-lg font-medium hover:text-gray-300 transition duration-300">
                Usuarios
              </Link>
            </>
          )}

          {role === 'Usuario' && (
            <>
              <Link href="/usuario/tickets" className="text-lg font-medium hover:text-gray-300 transition duration-300">
                Mis Tickets
              </Link>
              <Link href="/usuario/tickets/nuevo" className="text-lg font-medium hover:text-gray-300 transition duration-300">
                Crear Ticket
              </Link>
            </>
          )}

          {role === 'Empleado' && (
            <Link href="/empleado/tickets" className="text-lg font-medium hover:text-gray-300 transition duration-300">
              Tickets Asignados
            </Link>
          )}

          <div className="flex items-center space-x-6">
            <span className="text-gray-300 text-lg font-medium">
              Bienvenido, {session.user.name} ({role})
            </span>
            <button
              onClick={() => signOut()}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition duration-300"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}