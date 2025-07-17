require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');

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

const app = express();

// Middlewares globales
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
// Configurar 'uploads' como carpeta estática para servir imágenes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
