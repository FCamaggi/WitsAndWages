# Wits & Wagers Vegas - Guía de Deployment

## 📋 Pre-requisitos

1. Cuenta en MongoDB Atlas (gratuita)
2. Cuenta en Render (gratuita)
3. Cuenta en Netlify (gratuita)
4. Cuenta de GitHub

## 🗄️ 1. Configurar MongoDB Atlas

1. Ir a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crear un nuevo cluster (tier gratuito M0)
3. Crear un usuario de base de datos:
   - Username: `witsandwagers`
   - Password: (generar una segura)
4. Whitelist IP: Agregar `0.0.0.0/0` (todas las IPs)
5. Obtener la connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/wits-and-wagers?retryWrites=true&w=majority
   ```

## 🚀 2. Deploy del Backend (Render)

1. Ir a [Render](https://render.com)
2. Crear nuevo **Web Service**
3. Conectar repositorio de GitHub
4. Configuración:
   - **Name**: `wits-and-wagers-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

5. Agregar variables de entorno:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://...
   CLIENT_URL=https://tu-app.netlify.app
   PORT=10000
   ```

6. Deploy automático
7. Copiar la URL del servicio: `https://wits-and-wagers-backend.onrender.com`

## 🌐 3. Deploy del Frontend (Netlify)

### Opción A: Deploy desde Git

1. Ir a [Netlify](https://www.netlify.com)
2. **New site from Git**
3. Conectar repositorio
4. Configuración:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Deploy

### Opción B: Deploy manual

```bash
# Construir el proyecto
npm run build

# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

### 4. Configurar URLs

1. En Netlify, copiar la URL del sitio: `https://tu-app.netlify.app`

2. Actualizar `public/js/main.js`:
   ```javascript
   const API_URL = window.location.hostname === 'localhost' 
     ? 'http://localhost:3000'
     : 'https://wits-and-wagers-backend.onrender.com';
   ```

3. Actualizar variable en Render:
   ```
   CLIENT_URL=https://tu-app.netlify.app
   ```

4. Hacer commit y push para re-deploy

## ✅ 5. Verificar Deployment

1. Abrir la app en Netlify URL
2. Verificar que se puede crear una sala
3. Abrir en otro dispositivo y unirse con el código
4. Probar una ronda completa

## 🔧 Troubleshooting

### Backend no conecta

- Verificar que MONGODB_URI esté correctamente configurada
- Revisar logs en Render Dashboard
- Verificar que el cluster de MongoDB esté activo

### Socket.io no conecta

- Verificar CORS en `server/index.js`
- Asegurarse de que CLIENT_URL sea correcta
- En Render, verificar que WebSockets estén habilitados

### Frontend no carga

- Verificar que la build se completó exitosamente
- Revisar que `dist/` contenga los archivos
- Verificar redirects en `netlify.toml`

## 📱 Uso de la Aplicación

### Como Host:

1. Ir a la URL del sitio
2. Click en "Crear Sala"
3. Seleccionar categorías (opcional)
4. Compartir el código de 6 letras
5. Proyectar la pantalla en TV
6. Esperar jugadores
7. Click "Iniciar Juego"

### Como Jugador:

1. Abrir en móvil: misma URL
2. Click en "Unirse a Sala"
3. Ingresar nombre
4. Ingresar código de sala
5. Jugar desde el móvil

## 🔒 Variables de Entorno

### Backend (Render)
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/wits-and-wagers
CLIENT_URL=https://tu-app.netlify.app
PORT=10000
```

### Frontend (Netlify)
No requiere variables de entorno si se usa detección automática en `main.js`

## 🆘 Soporte

- MongoDB Atlas: https://www.mongodb.com/docs/atlas/
- Render: https://render.com/docs
- Netlify: https://docs.netlify.com
- Socket.io: https://socket.io/docs/v4/

## 📊 Monitoreo

- **Backend logs**: Render Dashboard > Logs
- **Database**: MongoDB Atlas > Metrics
- **Frontend**: Netlify > Functions log (si aplica)
- **Errores**: Browser Console (F12)
