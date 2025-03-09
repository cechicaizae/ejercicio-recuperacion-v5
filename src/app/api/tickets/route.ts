import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET /api/tickets - Obtener tickets según el rol
export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const employeeId = searchParams.get('employeeId');

    let tickets;

    if (userId) {
      // Tickets creados por un usuario específico
      tickets = await prisma.ticket.findMany({
        where: { idUsuario: parseInt(userId) },
        include: {
          creador: {
            select: { nombre: true, usuario: true }
          },
          empleado: {
            select: { nombre: true, usuario: true }
          }
        },
        orderBy: { fechaCreacion: 'desc' }
      });
    } else if (employeeId) {
      // Tickets asignados a un empleado específico
      tickets = await prisma.ticket.findMany({
        where: { idEmpleado: parseInt(employeeId) },
        include: {
          creador: {
            select: { nombre: true, usuario: true }
          },
          empleado: {
            select: { nombre: true, usuario: true }
          }
        },
        orderBy: { fechaCreacion: 'desc' }
      });
    } else {
      // Todos los tickets (para administradores)
      tickets = await prisma.ticket.findMany({
        include: {
          creador: {
            select: { nombre: true, usuario: true }
          },
          empleado: {
            select: { nombre: true, usuario: true }
          }
        },
        orderBy: { fechaCreacion: 'desc' }
      });
    }

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error al obtener tickets:', error);
    return NextResponse.json(
      { error: 'Error al obtener tickets' },
      { status: 500 }
    );
  }
}

// POST /api/tickets - Crear un nuevo ticket
export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { titulo, descripcion, prioridad, idUsuario } = body;

    console.log('Datos recibidos en el servidor:', { titulo, descripcion, prioridad, idUsuario });

    // Validar campos requeridos
    if (!descripcion?.trim()) {
      return NextResponse.json({ error: 'La descripción es requerida' }, { status: 400 });
    }
    if (!prioridad) {
      return NextResponse.json({ error: 'La prioridad es requerida' }, { status: 400 });
    }
    if (!idUsuario) {
      return NextResponse.json({ error: 'El ID de usuario es requerido' }, { status: 400 });
    }

    // Validar que la prioridad sea uno de los valores permitidos
    const prioridadesValidas = ['Baja', 'Media', 'Alta', 'Crítica'];
    const prioridadValue = prioridad.charAt(0).toUpperCase() + prioridad.slice(1).toLowerCase();
    
    if (!prioridadesValidas.includes(prioridadValue)) {
      return NextResponse.json(
        { error: `Prioridad no válida. Debe ser una de: ${prioridadesValidas.join(', ')}` },
        { status: 400 }
      );
    }

    try {
      const nuevoTicket = await prisma.ticket.create({
        data: {
          descripcion: descripcion.trim(),
          prioridad: prioridadValue,
          idUsuario: Number(idUsuario),
          estado: 'Pendiente',
          fechaCreacion: new Date()
        },
        include: {
          creador: {
            select: { nombre: true, usuario: true }
          }
        }
      });

      console.log('Ticket creado exitosamente:', nuevoTicket);
      return NextResponse.json(nuevoTicket, { status: 201 });
    } catch (dbError) {
      console.error('Error de base de datos:', dbError);
      return NextResponse.json(
        { error: 'Error al guardar el ticket en la base de datos' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error general:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH /api/tickets - Actualizar un ticket
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { id, idEmpleado, estado } = body;

    // Validar que el estado sea uno de los valores permitidos
    const estadosValidos = ['Pendiente', 'En_Proceso', 'Resuelto', 'Rechazado'];
    if (estado && !estadosValidos.includes(estado)) {
      return NextResponse.json(
        { error: `Estado no válido. Debe ser uno de: ${estadosValidos.join(', ')}` },
        { status: 400 }
      );
    }

    // Crear el objeto de actualización con los campos necesarios
    const updateData = {
      ...(idEmpleado !== undefined && { idEmpleado }),
      ...(estado && { estado }),
      ...(estado === 'Resuelto' || estado === 'Rechazado' ? { fechaCierre: new Date() } : {})
    };

    const ticketActualizado = await prisma.ticket.update({
      where: { id },
      data: updateData,
      include: {
        creador: {
          select: { nombre: true, usuario: true }
        },
        empleado: {
          select: { nombre: true, usuario: true }
        }
      }
    });

    return NextResponse.json(ticketActualizado);
  } catch (error) {
    console.error('Error al actualizar ticket:', error);
    return NextResponse.json(
      { error: 'Error al actualizar ticket' },
      { status: 500 }
    );
  }
} 