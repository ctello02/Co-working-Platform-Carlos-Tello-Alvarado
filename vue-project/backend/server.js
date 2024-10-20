require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// Conectar a la base de datos
const connectDB = require('./database/db');
connectDB();

// Rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/usersRoutes');

const app = express();

// Middlewares globales
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));

// Rutas base
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

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
