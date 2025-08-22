require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const verifyToken = require('./middleware/verify_tokens');

// Conectar a la base de datos
const connectDB = require('./database/db');
connectDB();

// Rutas
const authRoutes = require('./routes/authRoutes');
const usersRoutes = require('./routes/usersRoutes');
const spacesRoutes = require('./routes/spacesRoutes');
const materialsRoutes = require('./routes/materialsRoutes');
const reservationsRoutes = require('./routes/reservationsRoutes');
const paypalRoutes = require('./routes/paypalRoutes');
const statsRoutes = require('./routes/statsRoutes');

const SPACES_DIR = path.resolve(process.cwd(), 'uploads/spaces');
const MATERIALS_DIR = path.resolve(process.cwd(), 'uploads/materials');

const app = express();

// Middlewares globales
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
// Configurar 'uploads' como carpeta estática para servir imágenes
app.use(
  '/uploads/spaces',
  express.static(SPACES_DIR, {
    index: false,
    redirect: false,
    dotfiles: 'ignore',
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'public, max-age=604800');
    },
  })
);

app.use(
  '/uploads/materials',
  express.static(MATERIALS_DIR, {
    index: false,
    redirect: false,
    dotfiles: 'ignore',
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'public, max-age=604800');
    },
  })
);

// Rutas base
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/spaces', spacesRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/paypal', paypalRoutes);
app.use('/api/stats', statsRoutes);

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    message: 'API Initialized!',
  });
});

app.use((err, req, res, next) => {
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'Imagen demasiado grande' });
  }
  if (err && err.message === 'Tipo de archivo no soportado') {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
