'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Usuario {
  id: number;
  nombre: string;
  usuario: string;
  rol: string;
}

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
  empleado: {
    nombre: string;
    usuario: string;
  } | null;
  idEmpleado: number | null;
}

function calcularTiempoRestanteSLA(fechaCreacion: string, prioridad: string): string {
  const tiemposLimite = {
    'Crítica': 1, // 1 hora
    'Alta': 3,    // 3 horas
    'Media': 12,  // 12 horas
    'Baja': 24    // 24 horas
  };

  const fechaInicio = new Date(fechaCreacion);
  const ahora = new Date();
  const horasTranscurridas = (ahora.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60);
  const horasLimite = tiemposLimite[prioridad as keyof typeof tiemposLimite];
  const horasRestantes = horasLimite - horasTranscurridas;

  if (horasRestantes <= 0) {
    return 'SLA vencido';
  }

  const horas = Math.floor(horasRestantes);
  const minutos = Math.floor((horasRestantes - horas) * 60);
  return `${horas}h ${minutos}m restantes`;
}

export default function PageAdminTickets() {
  const { data: session } = useSession();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [empleados, setEmpleados] = useState<Usuario[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session?.user.role !== 'Administrador') {
      router.push('/');
      return;
    }

    cargarDatos();
  }, [session]);

  async function cargarDatos() {
    try {
      const [ticketsRes, usuariosRes] = await Promise.all([
        fetch('/api/tickets'),
        fetch('/api/usuarios')
      ]);

      if (!ticketsRes.ok || !usuariosRes.ok) {
        throw new Error('Error al cargar datos');
      }

      const [ticketsData, usuariosData] = await Promise.all([
        ticketsRes.json(),
        usuariosRes.json()
      ]);

      setTickets(ticketsData);
      setEmpleados(usuariosData.filter((u: Usuario) => u.rol === 'Empleado'));
    } catch (error) {
      setError('Error al cargar datos');
      console.error(error);
    }
  }

  async function asignarEmpleado(ticketId: number, empleadoId: number | null) {
    try {
      const res = await fetch('/api/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: ticketId,
          idEmpleado: empleadoId
        }),
      });

      if (!res.ok) throw new Error('Error al asignar empleado');

      const ticketActualizado = await res.json();
      setTickets(tickets.map(ticket => 
        ticket.id === ticketId ? ticketActualizado : ticket
      ));
    } catch (error) {
      setError('Error al asignar empleado');
      console.error(error);
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Gestión de Tickets</h1>

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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Cierre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SLA</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asignado a</th>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ticket.fechaCierre ? new Date(ticket.fechaCierre).toLocaleString() : '-'}
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
                    {!ticket.fechaCierre && (ticket.prioridad === 'Crítica' || ticket.prioridad === 'Alta') && (
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${calcularTiempoRestanteSLA(ticket.fechaCreacion, ticket.prioridad) === 'SLA vencido' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'}`}>
                        {calcularTiempoRestanteSLA(ticket.fechaCreacion, ticket.prioridad)}
                        {ticket.prioridad === 'Crítica' && ' ⚠️'}
                      </span>
                    )}
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
                      value={ticket.idEmpleado || ''}
                      onChange={(e) => asignarEmpleado(ticket.id, e.target.value ? parseInt(e.target.value) : null)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Sin asignar</option>
                      {empleados.map((empleado) => (
                        <option key={empleado.id} value={empleado.id}>
                          {empleado.nombre}
                        </option>
                      ))}
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