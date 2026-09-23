const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const rootDir = __dirname;
const dataDir = path.join(rootDir, 'data');
const messagesFile = path.join(dataDir, 'messages.json');

fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(messagesFile)) {
  fs.writeFileSync(messagesFile, '[]', 'utf8');
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(rootDir, {
  index: 'index.html',
  extensions: ['html']
}));

app.get('/api/messages', (req, res) => {
  try {
    const mensajes = JSON.parse(fs.readFileSync(messagesFile, 'utf8'));
    res.json(mensajes);
  } catch (error) {
    res.status(500).json({ message: 'No se pudieron leer los mensajes.' });
  }
});

app.post('/api/contact', (req, res) => {
  try {
    const { nombre, correo, telefono, servicio, mensaje } = req.body || {};

    if (!nombre || !correo || !telefono || !mensaje) {
      return res.status(400).json({ success: false, message: 'Faltan campos obligatorios.' });
    }

    const mensajes = JSON.parse(fs.readFileSync(messagesFile, 'utf8'));
    const nuevoMensaje = {
      id: Date.now() + Math.random().toString(16).slice(2),
      fecha: new Date().toLocaleString('es-MX'),
      nombre: String(nombre).trim(),
      correo: String(correo).trim(),
      telefono: String(telefono).trim(),
      servicio: servicio ? String(servicio).trim() : 'No especificado',
      mensaje: String(mensaje).trim()
    };

    mensajes.unshift(nuevoMensaje);
    fs.writeFileSync(messagesFile, JSON.stringify(mensajes, null, 2), 'utf8');

    return res.status(200).json({ success: true, message: 'Mensaje enviado exitosamente.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error al guardar el mensaje.' });
  }
});

app.delete('/api/messages', (req, res) => {
  try {
    fs.writeFileSync(messagesFile, '[]', 'utf8');
    res.json({ success: true, message: 'Mensajes eliminados.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'No se pudieron borrar los mensajes.' });
  }
});

app.get('/mensajes.html', (req, res) => {
  res.sendFile(path.join(rootDir, 'mensajes.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(rootDir, 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
