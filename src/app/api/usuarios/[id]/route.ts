import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data = await request.json();
    
    const { nombre, usuario, rol, clave } = data;
    
    let query = 'UPDATE Usuarios SET nombre = ?, usuario = ?, rol = ?';
    let values = [nombre, usuario, rol];

    // Si se proporciona una nueva contraseña, actualizarla
    if (clave) {
      query += ', clave = ?';
      values.push(clave);
    }

    query += ' WHERE idUsuario = ?';
    values.push(id);

    const [result] = await pool.query(query, values);
    
    return NextResponse.json({ message: 'Usuario actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el usuario' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    const [result] = await pool.query(
      'DELETE FROM Usuarios WHERE idUsuario = ?',
      [id]
    );
    
    return NextResponse.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el usuario' },
      { status: 500 }
    );
  }
} 