const express = require('express');
const router = express.Router();
const db = require('../database/db');
const bcrypt = require('bcryptjs');

// Ruta para registrar un nuevo usuario
router.post('/usuarios/register', async (req, res) => {
    const { username, password, rol } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `INSERT INTO Usuarios (username, password, rol) VALUES (?, ?, ?)`;
        const [result] = await db.query(query, [username, hashedPassword, rol || 'user']);

        res.status(201).json({ message: 'Usuario registrado exitosamente.', id: result.insertId });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'El nombre de usuario ya está en uso.' });
        }
        console.error('Error al registrar usuario:', err);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// Ruta para insertar datos
router.post('/datos', (req, res) => {
    const {
        fecha_ingreso, propietario, rol, predio, comuna, sps, core, expediente, cero_filas,
        profesional_revisor, revision, carta_devolucion, fecha2, reingreso, sps_etapa2,
        core_etapa2, id_certificado, fecha_certificado, juridica, rechazo, fecha_rechazo,
        estado, correo, telefonos, rut_profesional,
    } = req.body;

    const query = `
    INSERT INTO Datos (
        fecha_ingreso, propietario, rol, predio, comuna, sps, core, expediente, cero_filas,
        profesional_revisor, revision, carta_devolucion, fecha2, reingreso, sps_etapa2, core_etapa2,
        id_certificado, fecha_certificado, juridica, rechazo, fecha_rechazo, estado, correo, telefonos,
        rut_profesional
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;


    const fields = [
        fecha_ingreso || null, propietario || null, rol || null, predio || null, comuna || null,
        sps || null, core || null, expediente || null, cero_filas || null, profesional_revisor || null,
        revision || null, carta_devolucion || null, fecha2 || null, reingreso || null, sps_etapa2 || null,
        core_etapa2 || null, id_certificado || null, fecha_certificado || null, juridica || null,
        rechazo || null, fecha_rechazo || null, estado || null, correo || null, telefonos || null,
        rut_profesional || null,
    ];

    db.query(query, fields, (err, result) => {
        if (err) {
            console.error('Error al insertar en la base de datos:', err);
            return res.status(500).json({ message: 'Error al insertar en la base de datos' });
        }
        res.status(201).json({ message: 'Registro agregado exitosamente', id: result.insertId });
    });
});

// Ruta para obtener datos por ID
router.get('/datos/:id', async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ message: 'ID inválido' });
    }

    try {
        const [results] = await db.query('SELECT * FROM Datos WHERE id = ?', [id]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'Registro no encontrado' });
        }

        const data = results[0];

        // Convertir fechas al formato `YYYY-MM-DD`
        const formatDate = (date) => (date ? new Date(date).toISOString().split('T')[0] : null);

        data.fecha_ingreso = formatDate(data.fecha_ingreso);
        data.fecha2 = formatDate(data.fecha2);
        data.reingreso = formatDate(data.reingreso);
        data.fecha_certificado = formatDate(data.fecha_certificado);
        data.fecha_rechazo = formatDate(data.fecha_rechazo);

        res.json(data);
    } catch (err) {
        console.error('Error al consultar la base de datos:', err);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// Ruta para actualizar datos por ID
router.put('/datos/:id', async (req, res) => {
    const { id } = req.params;
    const {
        fecha_ingreso, propietario, rol, predio, comuna, sps, core, expediente, cero_filas,
        profesional_revisor, revision, carta_devolucion, fecha2, reingreso, sps_etapa2,
        core_etapa2, id_certificado, fecha_certificado, juridica, rechazo, fecha_rechazo,
        estado, correo, telefonos, rut_profesional,
    } = req.body;

    // Validación del ID
    if (!id || isNaN(id)) {
        return res.status(400).json({ message: 'ID inválido. Debe ser un número.' });
    }

    const query = `
        UPDATE Datos
        SET fecha_ingreso = ?, propietario = ?, rol = ?, predio = ?, comuna = ?, sps = ?, core = ?, expediente = ?, cero_filas = ?,
            profesional_revisor = ?, revision = ?, carta_devolucion = ?, fecha2 = ?, reingreso = ?, sps_etapa2 = ?, core_etapa2 = ?,
            id_certificado = ?, fecha_certificado = ?, juridica = ?, rechazo = ?, fecha_rechazo = ?, estado = ?, correo = ?, telefonos = ?,
            rut_profesional = ?
        WHERE id = ?
    `;

    const fields = [
        fecha_ingreso || null, propietario || null, rol || null, predio || null, comuna || null,
        sps || null, core || null, expediente || null, cero_filas || null, profesional_revisor || null,
        revision || null, carta_devolucion || null, fecha2 || null, reingreso || null, sps_etapa2 || null,
        core_etapa2 || null, id_certificado || null, fecha_certificado || null, juridica || null,
        rechazo || null, fecha_rechazo || null, estado || null, correo || null, telefonos || null,
        rut_profesional || null, id,
    ];

    try {
        const [result] = await db.query(query, fields);

        // Validar si el registro se encontró para actualizar
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Registro no encontrado para actualizar.' });
        }

        res.status(200).json({ message: 'Registro actualizado exitosamente.' });
    } catch (err) {
        console.error('Error al actualizar en la base de datos:', err);
        res.status(500).json({ message: 'Error al actualizar en la base de datos.' });
    }
});

module.exports = router;