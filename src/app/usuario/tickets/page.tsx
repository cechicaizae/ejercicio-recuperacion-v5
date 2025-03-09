'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Ticket {
  id: number;
  descripcion: string;
  fechaCreacion: string;
  fechaCierre: string | null;
  prioridad: string;
  estado: string;
  empleado: {
    nombre: string;
    usuario: string;
  } | null;
}

export default function PageUsuarioTickets() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session?.user.id) {
      cargarTickets();
    }
  }, [session]);

  async function cargarTickets() {
    try {
      const res = await fetch(`/api/tickets?userId=${session?.user.id}`);
      if (!res.ok) throw new Error('Error al cargar tickets');
      const data = await res.json();
      setTickets(data);
    } catch (error) {
      setError('Error al cargar tickets');
      console.error(error);
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mis Tickets</h1>
        <Link
          href="/usuario/tickets/nuevo"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Crear Nuevo Ticket
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Creación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asignado a</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{ticket.descripcion}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(ticket.fechaCreacion).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${ticket.prioridad === 'Baja' ? 'bg-green-100 text-green-800' :
                        ticket.prioridad === 'Media' ? 'bg-yellow-100 text-yellow-800' :
                        ticket.prioridad === 'Alta' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'}`}>
                      {ticket.prioridad}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${ticket.estado === 'Pendiente' ? 'bg-gray-100 text-gray-800' :
                        ticket.estado === 'En Proceso' ? 'bg-blue-100 text-blue-800' :
                        ticket.estado === 'Resuelto' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'}`}>
                      {ticket.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ticket.empleado ? ticket.empleado.nombre : 'No asignado'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 