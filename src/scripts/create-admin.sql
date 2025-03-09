USE sistema_incidentes;

-- Eliminar usuario admin si existe
DELETE FROM Usuarios WHERE usuario = 'admin';

-- Insertar usuario administrador (contraseña: admin123)
INSERT INTO Usuarios (nombre, usuario, clave, rol)
VALUES (
    'Administrador', 
    'admin',
    '$2b$10$tRYVXVfEW.qj.FO4uJPqKurf5wznjHrHAuacYCEAq9ZY6y60UrtNi',
    'Administrador'
); 