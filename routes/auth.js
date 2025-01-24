const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database/db'); 
const router = express.Router();



// Ruta para iniciar sesión
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Por favor, ingrese el usuario y la contraseña' });
    }

    try {
        const [results] = await db.query('SELECT * FROM Usuarios WHERE username = ?', [username]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const user = results[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.json({ message: 'Login exitoso', token });
    } catch (err) {
        console.error('Error al procesar la solicitud:', err);
        return res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

module.exports = router;
