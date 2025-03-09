CREATE DATABASE IF NOT EXISTS sistema_incidentes;
USE sistema_incidentes;

CREATE TABLE IF NOT EXISTS Usuarios (
    idUsuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    clave VARCHAR(255) NOT NULL,
    rol ENUM('Administrador', 'Empleado', 'Usuario') NOT NULL
);

CREATE TABLE IF NOT EXISTS Tickets (
    idTicket INT AUTO_INCREMENT PRIMARY KEY,
    idUsuario INT NOT NULL,
    idEmpleado INT,
    descripcion TEXT NOT NULL,
    fechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fechaCierre DATETIME,
    prioridad ENUM('Baja', 'Media', 'Alta', 'Critica') DEFAULT 'Media',
    estado ENUM('Pendiente', 'En Proceso', 'Resuelto', 'Rechazado') DEFAULT 'Pendiente',
    FOREIGN KEY (idUsuario) REFERENCES Usuarios(idUsuario),
    FOREIGN KEY (idEmpleado) REFERENCES Usuarios(idUsuario)
); 