'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Usuario {
  idUsuario: number;
  nombre: string;
  usuario: string;
  rol: 'Administrador' | 'Empleado' | 'Usuario';
  clave?: string;
}

export default function PageAdminUsuarios() {
  const { data: session } = useSession();
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: '',
    usuario: '',
    clave: '',
    rol: 'Usuario'
  });
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState<Usuario>({
    idUsuario: 0,
    nombre: '',
    usuario: '',
    rol: 'Usuario',
    clave: ''
  });
  const [modoEdicion, setModoEdicion] = useState(false);

  useEffect(() => {
    if (session?.user.role !== 'Administrador') {
      router.push('/');
      return;
    }

    cargarUsuarios();
  }, [session]);

  async function cargarUsuarios() {
    try {
      const res = await fetch('/api/usuarios');
      if (!res.ok) {
        throw new Error('Error al cargar usuarios');
      }
      const data = await res.json();
      console.log('Datos recibidos de la API:', data);

      const usuariosMapeados = data.map((usuario: any) => {
        console.log('Usuario individual:', usuario);
        return {
          idUsuario: usuario.idUsuario || usuario.id,
          nombre: usuario.nombre,
          usuario: usuario.usuario,
          rol: usuario.rol
        };
      });

      console.log('Usuarios mapeados:', usuariosMapeados);
      setUsuarios(usuariosMapeados);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar usuarios');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (!usuarioActual.nombre.trim()) {
        setError('El nombre es requerido');
        return;
      }
      if (!usuarioActual.usuario.trim()) {
        setError('El nombre de usuario es requerido');
        return;
      }
      if (!modoEdicion && !usuarioActual.clave) {
        setError('La contraseña es requerida');
        return;
      }

      const method = modoEdicion ? 'PATCH' : 'POST';
      const url = modoEdicion ? `/api/usuarios/${usuarioActual.idUsuario}` : '/api/usuarios';
      
      // Solo incluir la clave si se proporciona una nueva
      const datos = {
        nombre: usuarioActual.nombre,
        usuario: usuarioActual.usuario,
        rol: usuarioActual.rol,
        ...(usuarioActual.clave ? { clave: usuarioActual.clave } : {})
      };

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(datos),
      });

      if (!res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await res.json();
          throw new Error(errorData.message || `Error al ${modoEdicion ? 'actualizar' : 'crear'} usuario`);
        } else {
          throw new Error(`Error del servidor: ${res.status} ${res.statusText}`);
        }
      }

      setError('');
      setUsuarioActual({
        idUsuario: 0,
        nombre: '',
        usuario: '',
        rol: 'Usuario',
        clave: ''
      });
      setMostrarFormulario(false);
      setModoEdicion(false);
      await cargarUsuarios();
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : `Error al ${modoEdicion ? 'actualizar' : 'crear'} usuario`);
    }
  }

  async function eliminarUsuario(idUsuario: number) {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      return;
    }
    
    try {
      const res = await fetch(`/api/usuarios/${idUsuario}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error('Error al eliminar el usuario');
      }

      await cargarUsuarios();
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Error al eliminar el usuario');
    }
  }

  function editarUsuario(usuario: Usuario) {
    setUsuarioActual({
      idUsuario: usuario.idUsuario,
      nombre: usuario.nombre,
      usuario: usuario.usuario,
      rol: usuario.rol,
      clave: '' // No enviamos la clave actual por seguridad
    });
    setModoEdicion(true);
    setMostrarFormulario(true);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
              <p className="mt-2 text-sm text-gray-600">Administra los usuarios del sistema y sus roles</p>
            </div>
            <button
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {mostrarFormulario ? (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancelar
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Nuevo Usuario
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {mostrarFormulario && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 transition-all duration-300 transform">
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      value={usuarioActual.nombre}
                      onChange={(e) => {
                        setError('');
                        setUsuarioActual({ ...usuarioActual, nombre: e.target.value });
                      }}
                      className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm shadow-sm placeholder-gray-400
                        focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
                        hover:border-gray-400 transition-colors duration-200"
                      placeholder="Ej: Juan Pérez"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nombre de usuario
                    </label>
                    <input
                      type="text"
                      value={usuarioActual.usuario}
                      onChange={(e) => {
                        setError('');
                        setUsuarioActual({ ...usuarioActual, usuario: e.target.value });
                      }}
                      className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm shadow-sm placeholder-gray-400
                        focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
                        hover:border-gray-400 transition-colors duration-200"
                      placeholder="Ej: jperez"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      value={usuarioActual.clave}
                      onChange={(e) => {
                        setError('');
                        setUsuarioActual({ ...usuarioActual, clave: e.target.value });
                      }}
                      className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm shadow-sm placeholder-gray-400
                        focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
                        hover:border-gray-400 transition-colors duration-200"
                      placeholder={modoEdicion ? "Dejar en blanco para mantener la contraseña actual" : "••••••••"}
                      required={!modoEdicion}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Rol del usuario
                    </label>
                    <select
                      value={usuarioActual.rol}
                      onChange={(e) => {
                        setError('');
                        setUsuarioActual({ ...usuarioActual, rol: e.target.value as 'Administrador' | 'Empleado' | 'Usuario' });
                      }}
                      className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm shadow-sm
                        focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
                        hover:border-gray-400 transition-colors duration-200"
                      required
                    >
                      <option value="Usuario">Usuario</option>
                      <option value="Empleado">Empleado</option>
                      <option value="Administrador">Administrador</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-end space-x-3">
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600
                      rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2
                      focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                  >
                    {modoEdicion ? 'Guardar Cambios' : 'Crear Usuario'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="transition-all duration-300">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Lista de Usuarios</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rol
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {usuarios.map((usuario) => (
                      <tr key={usuario.idUsuario.toString()}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {usuario.idUsuario}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {usuario.nombre}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {usuario.usuario}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${usuario.rol === 'Administrador' ? 'bg-purple-100 text-purple-800' : 
                              usuario.rol === 'Empleado' ? 'bg-blue-100 text-blue-800' : 
                              'bg-gray-100 text-gray-800'}`}>
                            {usuario.rol}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}