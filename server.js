require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const dataRoutes = require('./routes/data'); // Rutas de datos
const authRoutes = require('./routes/auth'); // Rutas de autenticación

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas de la API
app.use('/api', dataRoutes);
app.use('/auth', authRoutes);

// Servir los archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'build')));

// Manejar cualquier ruta no definida en la API devolviendo el frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Manejo de errores genéricos
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
