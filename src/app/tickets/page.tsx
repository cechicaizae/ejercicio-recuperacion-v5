'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Ticket } from '@/types/Ticket';
import { formatDate } from '@/utils/dateUtils';

export default function TicketsPage() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/tickets');
      if (!response.ok) throw new Error('Error al cargar tickets');
      const data = await response.json();
      setTickets(data);
    } catch (err) {
      setError('Error al cargar los tickets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTicket = async (ticketId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/tickets`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: ticketId,
          estado: newStatus,
          idEmpleado: session?.user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar ticket');
      }

      await fetchTickets();
    } catch (err) {
      console.error(err);
      setError('Error al actualizar el ticket');
    }
  };

  if (loading) return <div className="text-center p-4">Cargando...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  const getEstadoDisplayName = (estado: string) => {
    const estadosMap: { [key: string]: string } = {
      'PENDIENTE': 'Pendiente',
      'EN_PROCESO': 'En Proceso',
      'RESUELTO': 'Resuelto',
      'RECHAZADO': 'Rechazado'
    };
    return estadosMap[estado] || estado;
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-primary-dark">Tickets</h1>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">ID</th>
              <th className="text-left">Título</th>
              <th className="text-left">Descripción</th>
              <th className="text-left">Estado</th>
              <th className="text-left">Prioridad</th>
              <th className="text-left">Fecha Creación</th>
              <th className="text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>{ticket.id}</td>
                <td>{ticket.titulo}</td>
                <td>{ticket.descripcion}</td>
                <td>
                  <span className={`ticket-state-${ticket.estado.toLowerCase()}`}>
                    {getEstadoDisplayName(ticket.estado)}
                  </span>
                </td>
                <td>
                  <span className={`ticket-priority-${ticket.prioridad.toLowerCase()}`}>
                    {ticket.prioridad}
                  </span>
                </td>
                <td>{formatDate(ticket.fechaCreacion)}</td>
                <td>
                  {ticket.estado !== 'RESUELTO' && ticket.estado !== 'RECHAZADO' && (
                    <div className="space-x-2">
                      <button
                        onClick={() => handleUpdateTicket(ticket.id, 'EN_PROCESO')}
                        className="btn-secondary"
                        disabled={ticket.estado === 'EN_PROCESO'}
                      >
                        En Proceso
                      </button>
                      <button
                        onClick={() => handleUpdateTicket(ticket.id, 'RESUELTO')}
                        className="btn-success"
                      >
                        Resolver
                      </button>
                      <button
                        onClick={() => handleUpdateTicket(ticket.id, 'RECHAZADO')}
                        className="btn-danger"
                      >
                        Rechazar
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 