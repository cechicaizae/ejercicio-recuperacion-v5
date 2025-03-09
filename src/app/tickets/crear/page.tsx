'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function CrearTicketPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [error, setError] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(true);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    
    if (!session?.user?.id) {
      setError('Debe iniciar sesión para crear un ticket');
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);
    
    // Obtener y validar los datos del formulario
    const descripcion = formData.get('descripcion')?.toString().trim();
    const prioridad = formData.get('prioridad')?.toString();

    // Log para depuración
    console.log('Valores del formulario:', {
      descripcion,
      prioridad,
      formDataEntries: Object.fromEntries(formData.entries())
    });

    // Validaciones explícitas
    if (!descripcion) {
      setError('La descripción es requerida');
      return;
    }
    if (!prioridad) {
      setError('La prioridad es requerida');
      return;
    }

    const ticketData = {
      descripcion,
      prioridad,
      idUsuario: Number(session.user.id)
    };

    console.log('Datos del ticket a enviar:', ticketData);

    try {
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticketData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear ticket');
      }

      const data = await response.json();
      console.log('Ticket creado exitosamente:', data);
      form.reset();
      setIsFormVisible(false);
      router.push('/usuario/tickets');
      router.refresh();
    } catch (err) {
      console.error('Error completo:', err);
      setError(err instanceof Error ? err.message : 'Error al crear el ticket');
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Crear Nuevo Ticket</h1>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setIsFormVisible(!isFormVisible)}
          >
            {isFormVisible ? 'Cancelar' : 'Crear Ticket'}
          </button>
        </div>

        {error && (
          <div className="error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        <div className={`form-container ${isFormVisible ? 'expanded' : ''}`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                Descripción del Problema
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Describa el problema en detalle"
                required
                minLength={10}
                maxLength={500}
                defaultValue=""
              />
            </div>

            <div className="form-group">
              <label htmlFor="prioridad" className="block text-sm font-medium text-gray-700">
                Prioridad
              </label>
              <select
                id="prioridad"
                name="prioridad"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                defaultValue=""
              >
                <option value="">Seleccione una prioridad</option>
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
                <option value="Crítica">Crítica</option>
              </select>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setIsFormVisible(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                Crear Ticket
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 