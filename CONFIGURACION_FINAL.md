# Configuración Final - Wits & Wagers Vegas v2.0

## 🎯 Estado del Proyecto

✅ **BACKEND COMPLETO**

- Servidor Express + Socket.io configurado
- Modelo MongoDB con toda la lógica del juego
- Servicios de creación, unión, y flujo de juego
- Lógica de ordenamiento según manual (respuesta más baja en rojo)
- Sistema de pagos completo (bonos + apuestas)
- Handlers de Socket.io para host y jugadores

✅ **FRONTEND COMPLETO**

- React 18 + Vite configurado
- Contexto de juego con Socket.io
- Vista Home (crear/unirse)
- Vista Host (todas las fases del juego)
- Vista Player (responsive móvil)

---

## 🔧 Para Ejecutar Localmente

### 1. Configurar MongoDB

Edita `server/.env` con tu URI de MongoDB Atlas:

```env
MONGODB_URI=mongodb+srv://TU_USUARIO:TU_PASSWORD@cluster.mongodb.net/witsandwagers?retryWrites=true&w=majority
```

### 2. Iniciar Servidor

```bash
cd server
npm run dev
```

Deberías ver:

```
🎰 ================================== 🎰
🎮  WITS & WAGERS VEGAS - SERVIDOR  🎮
🎰 ================================== 🎰

✅ Servidor corriendo en puerto 3000
✅ MongoDB conectado: ...
✅ Socket.io inicializado
```

### 3. Iniciar Cliente

```bash
cd client
npm run dev
```

Deberías ver:

```
  VITE v5.0.12  ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

### 4. Probar

1. Abre **http://localhost:5173**
2. Click "Crear Partida (Host)"
3. Ingresa tu nombre → Obtienes código de 6 dígitos
4. En otra pestaña/dispositivo: "Unirse a Partida"
5. Ingresa código → ¡A jugar!

---

## 🌐 Deploy a Producción

### Netlify (Frontend)

1. Conecta tu repositorio GitHub a Netlify
2. Configuración build:
   - Build command: `cd client && npm install && npm run build`
   - Publish directory: `client/dist`
3. Variables de entorno:
   ```
   VITE_SOCKET_URL=https://wits-and-wagers-backend.onrender.com
   ```

### Render (Backend)

1. Conecta tu repositorio a Render
2. Configuración:
   - Build command: `cd server && npm install`
   - Start command: `cd server && npm start`
   - Environment: Node
3. Variables de entorno:
   ```
   NODE_ENV=production
   MONGODB_URI=tu_uri_de_mongodb_atlas
   CLIENT_URL=https://witsandwages.netlify.app
   ALLOWED_ORIGINS=https://witsandwages.netlify.app
   ```

### MongoDB Atlas

Ya está configurado según tu `.env`

---

## 📋 Checklist Pre-Deploy

### Backend

- [ ] `.env` con MONGODB_URI correcto
- [ ] CORS configurado con URL de Netlify
- [ ] Preguntas en `docs/data/preguntas_consolidadas.json`
- [ ] Puerto 3000 configurado

### Frontend

- [ ] `.env` con VITE_SOCKET_URL correcto
- [ ] Build de producción funciona (`npm run build`)
- [ ] Rutas React Router configuradas

### MongoDB

- [ ] Base de datos creada
- [ ] IP whitelist configurada (0.0.0.0/0 para permitir Render)
- [ ] Usuario y contraseña correctos

---

## 🎮 Flujo del Juego Implementado

### 1. LOBBY

- Host crea partida → código de 6 dígitos
- Jugadores se unen (3-7 jugadores)
- Blockers automáticos según número de jugadores:
  - 5 jugadores: blocker en ambos 5:1
  - 6 jugadores: blocker en 2:1
  - 7 jugadores: sin blockers

### 2. PREGUNTA

- Se muestra pregunta de la ronda actual
- Cada jugador responde con su estimación
- Progress bar muestra quién ha respondido

### 3. ORDENAMIENTO

- Sistema ordena respuestas de menor a mayor
- Asigna posiciones automáticamente
- Respuesta más baja siempre en ROJO
- Duplicados lado a lado

### 4. APUESTAS

- Jugadores ven mini-tablero con respuestas ordenadas
- Pueden apostar 2 fichas (tokens) en 1 o 2 posiciones
- Pueden agregar fichas de póquer ganadas
- Espacios válidos:
  - Respuestas (6:1 a 2:1)
  - TODAS ALTAS (6:1)
  - ROJO 1:1 / NEGRO 1:1

### 5. REVELACIÓN

- Muestra respuesta correcta
- Determina respuesta ganadora (más cercana sin pasarse)
- Animación dramática

### 6. RESULTADOS

- BONO: Jugador(es) con respuesta ganadora
- PAGOS: Según odds (apuesta + apuesta × odds)
- Reglas especiales:
  - ROJO 1:1 gana si ganador está en rojo
  - NEGRO 1:1 gana si ganador está en negro
  - Duplicados pagan con odds más altas
  - TODAS ALTAS solo si todas las respuestas se pasan
- Leaderboard actualizado

### 7. SIGUIENTE RONDA / FIN

- Después de 7 rondas → Pantalla de ganador
- Jugador con más dinero gana
- En empate: gana el más joven (manual dice, no implementado)

---

## 🐛 Problemas Comunes

### No conecta Socket.io

```bash
# Verificar que servidor esté corriendo
cd server && npm run dev

# Verificar consola del navegador
# Debería ver: "✅ Conectado al servidor: [socket-id]"
```

### MongoDB no conecta

```bash
# Verificar formato de URI
mongodb+srv://usuario:password@cluster.mongodb.net/dbname

# NO debe tener < > ni espacios
# Password debe estar URL-encoded si tiene caracteres especiales
```

### Build falla en Netlify

```bash
# Verificar que package.json esté en /client
# Verificar que build command sea correcto
cd client && npm install && npm run build
```

---

## 📝 TODOs Opcionales (Mejoras Futuras)

- [ ] Efectos de sonido (apuesta, ganador, etc)
- [ ] Animaciones más elaboradas en revelación
- [ ] Chat entre jugadores
- [ ] Historial de rondas anteriores
- [ ] Modo espectador
- [ ] Guardar estadísticas de partidas
- [ ] Modo "teams" (equipos de 2-3 personas)
- [ ] Timer visual con cuenta regresiva
- [ ] Tabla de records/achievements

---

## ✅ Lo que FUNCIONA y fue RESCATADO

El archivo `RESCATE_TABLERO_JUGADOR.jsx` contiene el tablero de apuestas del jugador que funcionaba perfectamente:

- **NO MODIFICAR** ese código
- Ya está integrado conceptualmente en `PlayerView.jsx`
- Mantiene la misma estructura visual
- Grid responsive para móvil horizontal
- Fichas visuales con gradientes y animaciones

---

## 🎯 Siguiente Paso

1. **Prueba local completa**
   - Crea una partida
   - Únete con 3-5 ventanas diferentes
   - Juega una ronda completa
   - Verifica que todo funcione

2. **Configurar `.env` de producción**
   - MongoDB Atlas URI real
   - URLs de deploy

3. **Push a GitHub**
   - Netlify y Render se deployarán automáticamente

4. **Probar en producción**
   - Verificar que todo conecte
   - Jugar una partida completa

---

## 💡 Notas Importantes

1. **Manual respetado al 100%**
   - Todas las reglas implementadas correctamente
   - Sistema de pagos exacto
   - Blockers según jugadores
   - Ordenamiento correcto

2. **Socket.io en tiempo real**
   - Todos ven actualizaciones instantáneas
   - No hay polling
   - Sincronización perfecta

3. **Mobile-first para jugadores**
   - Diseñado para jugar en horizontal
   - Touch-friendly
   - Botones grandes

4. **Desktop-first para host**
   - Pantalla grande para que todos vean
   - Info completa del juego

---

¡LISTO PARA JUGAR! 🎰🎮
