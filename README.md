# Co-Working Platform (Trabajo de Fin de Grado) 

<p align="center">
  <img src="/vue-project/frontend/public/logos/logo_vertical_blanco.svg" alt="Logo" width="300"/>
</p>

## 📖 Descripción

**Co-Working Platform** es una aplicación web desarrollada como Trabajo de Fin de Grado, orientada a la gestión de reservas en espacios de coworking.  
La plataforma permite a los usuarios reservar salas y materiales de manera sencilla y a los administradores gestionar recursos, estadísticas y disponibilidad en tiempo real.  

## 🚀 Instalación y ejecución

 ### Instalar dependencias
 Para instalar las dependencias del Frontend y Backend, lanza:
 ```bash
 cd frontend
 npm i
 ```
 ```bash
 cd backend
 npm i
 ```

### Despliegue local
 De nuevo, en cada carpeta, lanza:
```bash
 npm run dev
```
Crea un archivo .env con las siguientes variables:
```bash
  PORT=3000
  MONGO_URI=conexion_mongodb
  SECRET=clave_jwt
  RESET_PASSWORD_KEY=otra_clave_jwt
  EMAIL_VERIFY_KEY=clave_verificacion
  GOOGLE_APP_EMAIL=email@gmail.com
  GOOGLE_APP_PW=password_app
  CLIENT_URL=http://localhost:5173
```


### Build
El proyecto quedará accesible en:
 Frontend → http://localhost:5173
 Backend → http://localhost:3000
