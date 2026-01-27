# 🛠️ Comandos Útiles - Wits & Wagers Vegas

## 📦 Instalación y Setup

```bash
# Instalar dependencias
npm install

# Crear archivo de configuración
cp .env.example .env

# Editar configuración
nano .env  # o usar tu editor preferido
```

## 🚀 Desarrollo

```bash
# Iniciar todo (recomendado)
npm run dev

# Solo backend
npm run dev:server

# Solo frontend  
npm run dev:client

# Con script interactivo
./start.sh        # Linux/Mac
start.bat         # Windows
```

## 🏗️ Build y Preview

```bash
# Construir para producción
npm run build

# Ver build localmente
npm run preview
```

## 🧪 Testing Manual

### Test Básico

```bash
# Terminal 1: Iniciar servidor
npm run dev

# Navegador 1: Abrir como host
open http://localhost:5173

# Navegador 2+: Abrir como jugadores (usar incógnito)
# Chrome: Cmd+Shift+N (Mac) / Ctrl+Shift+N (Windows)
# Firefox: Cmd+Shift+P (Mac) / Ctrl+Shift+P (Windows)
```

### Test con Múltiples Dispositivos

```bash
# 1. Obtén tu IP local
ip addr show | grep "inet " | grep -v 127.0.0.1  # Linux
ifconfig | grep "inet " | grep -v 127.0.0.1      # Mac
ipconfig                                          # Windows

# 2. En vite.config.js, cambia:
server: {
  host: '0.0.0.0',
  port: 5173
}

# 3. Accede desde móviles: http://TU_IP:5173
```

## 🗄️ MongoDB

### Local

```bash
# Iniciar MongoDB (Linux/Mac)
sudo systemctl start mongod

# Verificar estado
sudo systemctl status mongod

# Conectar con mongo shell
mongosh

# Ver bases de datos
show dbs

# Usar base de datos del juego
use wits-and-wagers

# Ver colecciones
show collections

# Ver salas activas
db.rooms.find().pretty()

# Limpiar salas viejas
db.rooms.deleteMany({})
```

### Atlas (Cloud)

```bash
# Conectar con mongo shell
mongosh "mongodb+srv://cluster0.xxxxx.mongodb.net/wits-and-wagers" --username <usuario>

# Verificar conexión desde Node
node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('✓ Conectado')).catch(e => console.error('✗ Error:', e))"
```

## 🔍 Debugging

### Ver logs del servidor

```bash
# Modo verbose con nodemon
DEBUG=* npm run dev:server

# Solo logs de Socket.io
DEBUG=socket.io* npm run dev:server
```

### Verificar puertos

```bash
# Ver qué está usando el puerto 3000
lsof -i :3000        # Linux/Mac
netstat -ano | findstr :3000  # Windows

# Matar proceso en puerto
kill -9 $(lsof -t -i:3000)    # Linux/Mac
# Windows: usar Task Manager
```

### Browser Console

```javascript
// En la consola del navegador (F12)

// Ver estado de la aplicación
console.log(window.state);

// Ver socket
console.log(window.state.socket);

// Simular evento
window.state.socket.emit('test-event', { data: 'test' });

// Ver todos los listeners
console.log(window.state.socket.listeners());
```

## 📊 Monitoreo

### Backend Health Check

```bash
# Verificar que el servidor responda
curl http://localhost:3000/api/health

# Con formato JSON bonito
curl http://localhost:3000/api/health | json_pp
```

### Verificar API

```bash
# Crear sala (requiere jq para pretty print)
curl -X POST http://localhost:3000/api/rooms/create \
  -H "Content-Type: application/json" \
  -d '{"hostId":"test123","hostSocketId":"socket123"}' | jq

# Validar código de sala
curl -X POST http://localhost:3000/api/rooms/validate \
  -H "Content-Type: application/json" \
  -d '{"code":"ABC123"}' | jq

# Obtener info de sala
curl http://localhost:3000/api/rooms/ABC123 | jq
```

## 🧹 Limpieza

```bash
# Limpiar node_modules
rm -rf node_modules package-lock.json
npm install

# Limpiar cache de Vite
rm -rf node_modules/.vite
rm -rf dist

# Limpiar todo y empezar de cero
rm -rf node_modules package-lock.json dist node_modules/.vite
npm install
```

## 🔧 Mantenimiento

### Actualizar dependencias

```bash
# Ver dependencias desactualizadas
npm outdated

# Actualizar todas (cuidado con breaking changes)
npm update

# Actualizar una específica
npm install express@latest

# Auditoría de seguridad
npm audit

# Arreglar vulnerabilidades automáticamente
npm audit fix
```

### Verificar problemas

```bash
# Verificar sintaxis de package.json
npm run --dry-run

# Listar scripts disponibles
npm run

# Ver configuración de npm
npm config list
```

## 📦 Deploy

### Netlify CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Inicializar sitio
netlify init

# Deploy preview
netlify deploy

# Deploy a producción
netlify deploy --prod

# Ver logs
netlify logs
```

### Git

```bash
# Añadir todos los archivos
git add .

# Commit
git commit -m "feat: implementación completa de Wits & Wagers Vegas"

# Push a main (trigger deploy automático en Netlify)
git push origin main

# Ver estado
git status

# Ver historial
git log --oneline
```

## 🐳 Docker (Opcional)

```bash
# Crear Dockerfile para backend
cat > Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "server/index.js"]
EOF

# Build imagen
docker build -t wits-and-wagers .

# Correr container
docker run -p 3000:3000 --env-file .env wits-and-wagers

# Con docker-compose
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - CLIENT_URL=${CLIENT_URL}
    restart: unless-stopped
EOF

docker-compose up -d
```

## 🎯 Performance

### Analizar bundle size

```bash
# Build con análisis
npm run build -- --mode production

# Instalar bundle analyzer
npm install -D rollup-plugin-visualizer

# Ver reporte
open dist/stats.html
```

### Medir tiempo de carga

```bash
# Con curl
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:5173

# Crear curl-format.txt:
cat > curl-format.txt << 'EOF'
time_namelookup:  %{time_namelookup}s
time_connect:     %{time_connect}s
time_appconnect:  %{time_appconnect}s
time_pretransfer: %{time_pretransfer}s
time_starttransfer: %{time_starttransfer}s
time_total:       %{time_total}s
EOF
```

## 🆘 Troubleshooting Rápido

```bash
# Error: EADDRINUSE (puerto ocupado)
kill -9 $(lsof -t -i:3000)
kill -9 $(lsof -t -i:5173)

# Error: Cannot find module
rm -rf node_modules package-lock.json && npm install

# Error: MongoDB connection
# → Verificar que MongoDB esté corriendo
# → Verificar MONGODB_URI en .env

# Error: CORS
# → Verificar CLIENT_URL en .env
# → Verificar configuración en server/index.js

# Vite no hot-reload
# → Ctrl+C y reiniciar npm run dev:client
# → Limpiar cache: rm -rf node_modules/.vite

# Socket.io no conecta
# → Verificar que el backend esté corriendo
# → Revisar consola del navegador (F12)
# → Verificar que las URLs coincidan
```

## 📚 Recursos Útiles

```bash
# Documentación oficial
open https://socket.io/docs/v4/
open https://vitejs.dev/guide/
open https://mongoosejs.com/docs/

# Postman collection para API
# → Importar y probar endpoints

# Visualizar WebSocket traffic
# → Usar Chrome DevTools > Network > WS
```

## 🎓 Scripts Personalizados

Agregar a `package.json`:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "nodemon server/index.js",
    "dev:client": "vite",
    "build": "vite build",
    "start": "node server/index.js",
    "preview": "vite preview",
    "clean": "rm -rf node_modules dist .vite",
    "fresh": "npm run clean && npm install",
    "test": "echo \"No tests yet\" && exit 0",
    "lint": "eslint .",
    "format": "prettier --write ."
  }
}
```

---

**💡 Tip**: Guarda este archivo como referencia rápida. Contiene todos los comandos que necesitarás durante el desarrollo.
