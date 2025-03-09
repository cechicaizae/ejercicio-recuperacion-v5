'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Ticket {
  id: number;
  descripcion: string;
  fechaCreacion: string;
  fechaCierre: string | null;
  prioridad: string;
  estado: string;
  creador: {
    nombre: string;
    usuario: string;
  };
}

export default function PageEmpleadoTickets() {
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
      const res = await fetch(`/api/tickets?employeeId=${session?.user.id}`);
      if (!res.ok) throw new Error('Error al cargar tickets');
      const data = await res.json();
      setTickets(data);
    } catch (error) {
      setError('Error al cargar tickets');
      console.error(error);
    }
  }

  async function actualizarEstado(ticketId: number, nuevoEstado: string) {
    try {
      const res = await fetch('/api/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: ticketId,
          estado: nuevoEstado,
          fechaCierre: nuevoEstado === 'Resuelto' ? new Date().toISOString() : null
        }),
      });

      if (!res.ok) throw new Error('Error al actualizar ticket');

      const ticketActualizado = await res.json();
      setTickets(tickets.map(ticket => 
        ticket.id === ticketId ? ticketActualizado : ticket
      ));
    } catch (error) {
      setError('Error al actualizar ticket');
      console.error(error);
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Tickets Asignados</h1>

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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creado por</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Creación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{ticket.descripcion}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.creador.nombre}</td>
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
                    <select
                      value={ticket.estado}
                      onChange={(e) => actualizarEstado(ticket.id, e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="En Proceso">En Proceso</option>
                      <option value="Resuelto">Resuelto</option>
                      <option value="Rechazado">Rechazado</option>
                    </select>
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