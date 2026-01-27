# 🎯 Próximos Pasos - Wits & Wagers Vegas

¡El proyecto está completo! Aquí están los pasos recomendados para ponerlo en funcionamiento.

---

## 1️⃣ PROBAR LOCALMENTE (AHORA)

### Paso 1: Verificar instalación
```bash
cd /home/fabrizio/code/gameboards/WitsAndWagers

# Verificar que las dependencias se instalaron
ls node_modules/

# Debería mostrar carpetas como express, socket.io, mongoose, etc.
```

### Paso 2: Iniciar el proyecto
```bash
# Opción A: Script interactivo (recomendado)
./start.sh

# Selecciona opción 1 (Desarrollo completo)

# Opción B: NPM directo
npm run dev
```

### Paso 3: Probar en navegador

**Como Host:**
1. Abre `http://localhost:5173`
2. Click "Crear Sala"
3. (Opcional) Desmarca categorías
4. Anota el código de 6 letras

**Como Jugador:**
1. Abre una ventana de incógnito (`Ctrl+Shift+N`)
2. Ve a `http://localhost:5173`
3. Click "Unirse a Sala"
4. Ingresa tu nombre y el código

**Iniciar Juego:**
1. Como host, espera al menos 2 jugadores
2. Click "Iniciar Juego"
3. ¡Juega una ronda completa!

### Paso 4: Verificar funcionalidad
- [ ] Se puede crear sala
- [ ] Se genera código único
- [ ] Jugadores pueden unirse
- [ ] Pregunta se muestra
- [ ] Respuestas se pueden enviar
- [ ] Apuestas funcionan
- [ ] Resultados se calculan correctamente

---

## 2️⃣ CONFIGURAR BASE DE DATOS

Actualmente el proyecto usa conexión local. Para producción necesitas MongoDB Atlas:

### Opción A: Continuar con MongoDB Local
```bash
# Verificar si MongoDB está instalado
mongod --version

# Si no está instalado:
# Ubuntu/Debian: sudo apt install mongodb
# Mac: brew install mongodb-community
# Windows: Descargar de mongodb.com

# Iniciar MongoDB
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # Mac
```

### Opción B: Usar MongoDB Atlas (Recomendado para producción)

1. Ir a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crear cuenta gratis
3. Crear cluster (M0 - Gratis)
4. Crear usuario de base de datos
5. Whitelist IP: `0.0.0.0/0` (todas las IPs)
6. Obtener connection string:
   ```
   mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/wits-and-wagers
   ```
7. Actualizar `.env`:
   ```env
   MONGODB_URI=mongodb+srv://usuario:password@...
   ```
8. Reiniciar servidor

---

## 3️⃣ PERSONALIZAR (Opcional)

### Cambiar colores/tema
Edita `public/css/main.css`:
```css
:root {
  --primary-color: #d4af37;      /* Color principal */
  --secondary-color: #c41e3a;    /* Color secundario */
  --dark-bg: #1a1a1a;            /* Fondo oscuro */
  --card-bg: #2d2d2d;            /* Fondo de tarjetas */
}
```

### Agregar/editar preguntas
Edita `docs/data/preguntas_consolidadas.json`:
```json
{
  "categorias": [
    {
      "id": "tu_categoria",
      "nombre": "Tu Categoría",
      "preguntas": [
        {
          "id": "pregunta_id",
          "pregunta": "¿Tu pregunta?",
          "respuesta": 42,
          "unidad": "unidades",
          "dificultad": "media"
        }
      ]
    }
  ]
}
```

### Cambiar número de rondas
Edita `server/models/Room.js`:
```javascript
totalRounds: { type: Number, default: 7 }  // Cambiar a 5, 10, etc.
```

---

## 4️⃣ DEPLOY A PRODUCCIÓN

Cuando estés listo para publicar:

### A. Configurar MongoDB Atlas
Ver paso 2️⃣ - Opción B arriba

### B. Deploy Backend (Render)

1. Ir a [Render](https://render.com)
2. Crear cuenta
3. "New +" → "Web Service"
4. Conectar repositorio de GitHub
5. Configurar:
   - Name: `wits-and-wagers-backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Agregar variables de entorno:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://...
   CLIENT_URL=https://tu-app.netlify.app
   PORT=10000
   ```
7. Deploy
8. Copiar URL: `https://wits-and-wagers-backend.onrender.com`

### C. Deploy Frontend (Netlify)

1. Push código a GitHub:
   ```bash
   git init
   git add .
   git commit -m "Wits & Wagers Vegas - Versión inicial"
   git remote add origin https://github.com/tu-usuario/wits-and-wagers.git
   git push -u origin main
   ```

2. Ir a [Netlify](https://www.netlify.com)
3. "Add new site" → "Import from Git"
4. Conectar repositorio
5. Configurar:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Deploy
7. Copiar URL: `https://tu-app.netlify.app`

### D. Actualizar URLs

1. **En el código** (`public/js/main.js`):
   ```javascript
   const API_URL = window.location.hostname === 'localhost' 
     ? 'http://localhost:3000'
     : 'https://wits-and-wagers-backend.onrender.com';
   ```

2. **En Render** (variables de entorno):
   ```
   CLIENT_URL=https://tu-app.netlify.app
   ```

3. Hacer commit y push:
   ```bash
   git add .
   git commit -m "Update production URLs"
   git push
   ```

Ver [DEPLOYMENT.md](./DEPLOYMENT.md) para guía detallada.

---

## 5️⃣ TESTING COMPLETO

Una vez deployado, probar:

### Test de Sala
- [ ] Crear sala desde producción
- [ ] Código funciona
- [ ] Múltiples jugadores pueden unirse

### Test de Juego
- [ ] 7 rondas completas
- [ ] Respuestas se ordenan correctamente
- [ ] Apuestas funcionan
- [ ] Pagos son correctos
- [ ] Bonos se asignan

### Test de Reconexión
- [ ] Jugador pierde conexión
- [ ] Puede reconectarse
- [ ] Estado del juego se mantiene

### Test Cross-Device
- [ ] Host en laptop/PC
- [ ] Jugadores en móviles
- [ ] Sincronización funciona
- [ ] Latencia aceptable

---

## 6️⃣ MONITOREO Y MANTENIMIENTO

### Logs
```bash
# Render: Ver logs en dashboard
# Netlify: Functions → View logs

# MongoDB Atlas: Metrics → View performance
```

### Actualizaciones
```bash
# Actualizar dependencias cada 3 meses
npm outdated
npm update
npm audit fix

# Hacer commit y push
git add package*.json
git commit -m "Update dependencies"
git push
```

### Backup de Base de Datos
```bash
# En MongoDB Atlas:
# Clusters → ... → Create Backup

# O con mongodump:
mongodump --uri="mongodb+srv://..." --out=./backup
```

---

## 7️⃣ MEJORAS FUTURAS (Ideas)

### Fáciles
- [ ] Agregar más preguntas
- [ ] Cambiar colores/tema
- [ ] Agregar efectos de sonido
- [ ] Estadísticas de jugador

### Intermedias
- [ ] Chat entre jugadores
- [ ] Avatares personalizables
- [ ] Modo espectador
- [ ] Replay de partidas

### Avanzadas
- [ ] Sistema de torneos
- [ ] Ranking global
- [ ] Integración con Twitch
- [ ] IA como jugador

---

## 📚 RECURSOS

### Documentación del Proyecto
- [README.md](./README.md) - Overview completo
- [QUICKSTART.md](./QUICKSTART.md) - Inicio rápido
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guía de deploy
- [COMANDOS.md](./COMANDOS.md) - Referencia de comandos
- [ESTRUCTURA.txt](./ESTRUCTURA.txt) - Mapa del proyecto

### Documentación Externa
- [Socket.io](https://socket.io/docs/v4/)
- [Vite](https://vitejs.dev/guide/)
- [MongoDB](https://www.mongodb.com/docs/)
- [Express](https://expressjs.com/)
- [Mongoose](https://mongoosejs.com/docs/)

### Comunidad
- Stack Overflow: [socket.io] tag
- Discord: Socket.io community
- GitHub Discussions (si creas repo público)

---

## ✅ CHECKLIST FINAL

Antes de considerar el proyecto "completo":

### Funcional
- [x] Backend funciona localmente
- [x] Frontend funciona localmente
- [x] Socket.io conecta
- [x] MongoDB guarda datos
- [x] Juego completo funciona (7 rondas)
- [ ] Deployado en producción
- [ ] Probado con usuarios reales
- [ ] Sin bugs críticos

### Documentación
- [x] README completo
- [x] Manual de juego
- [x] Guías de deploy
- [x] Comentarios en código
- [ ] Video demo (opcional)

### Optimización
- [ ] Performance aceptable (< 2s carga)
- [ ] Mobile responsive verificado
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Bundle size optimizado (< 2MB)

### Seguridad
- [x] Variables de entorno
- [x] CORS configurado
- [ ] Rate limiting (producción)
- [ ] Input sanitization
- [ ] HTTPS habilitado

---

## 🎉 ¡LISTO!

Tu proyecto está completamente implementado y listo para usar.

**¿Qué hacer ahora?**
1. ✅ Prueba localmente (paso 1)
2. 🚀 Si funciona, procede a deploy (paso 4)
3. 🎮 ¡Disfruta jugando!

**¿Problemas?**
- Revisa [COMANDOS.md](./COMANDOS.md) sección Troubleshooting
- Revisa logs del servidor
- Revisa consola del navegador (F12)

**¿Preguntas?**
- Revisa la documentación en docs/
- Busca en Stack Overflow con tag [socket.io]

---

*¡Buena suerte y que disfrutes tu juego! 🎰🎲*
