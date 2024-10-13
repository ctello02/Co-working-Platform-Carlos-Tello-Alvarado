require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const fs = require('node:fs')
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");


const app = express()
const router = express.Router()
app.use(cors())
app.use(bodyParser.json())
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }))

const connectDB = require('./database/db')
connectDB();

router.get('/', (req, res) => {
    res.json({
        message: 'API Initialized!'
    })
})

app.use("/api", authRoutes);
app.use("/api", usersRoutes);
app.use('/', router);

app.listen(process.env.PORT, () => {
    console.log('api running on port ' + process.env.PORT)
})