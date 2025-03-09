'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function PageUsuarioNuevoTicket() {
  const { data: session } = useSession();
  const router = useRouter();
  const [error, setError] = useState('');
  const [ticket, setTicket] = useState({
    descripcion: '',
    prioridad: 'Media'
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (!session?.user.id) {
        throw new Error('No autorizado');
      }

      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idUsuario: parseInt(session.user.id),
          ...ticket
        }),
      });

      if (!res.ok) throw new Error('Error al crear ticket');

      router.push('/usuario/tickets');
    } catch (error) {
      setError('Error al crear ticket');
      console.error(error);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Crear Nuevo Ticket</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              value={ticket.descripcion}
              onChange={(e) => setTicket({ ...ticket, descripcion: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Prioridad</label>
            <select
              value={ticket.prioridad}
              onChange={(e) => setTicket({ ...ticket, prioridad: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
              <option value="Crítica">Crítica</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Crear Ticket
          </button>
        </form>
      </div>
    </div>
  );
} 