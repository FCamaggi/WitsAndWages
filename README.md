# 🎰 Wits & Wagers Vegas - Digital

Versión digital multijugador del juego Wits & Wagers Vegas con experiencia en tiempo real.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![Socket.io](https://img.shields.io/badge/socket.io-4.6.1-010101.svg)

## 📖 Descripción

Wits & Wagers Vegas es un juego de trivia y apuestas donde no necesitas saber las respuestas para ganar. ¡Apuesta a las respuestas de otros jugadores y gana dinero! Esta versión digital permite:

- **Host Display**: Pantalla principal para proyectar en TV
- **Multijugador Móvil**: Jugadores juegan desde sus dispositivos
- **Tiempo Real**: Sincronización instantánea con Socket.io
- **542 Preguntas**: Con categorías configurables
- **Variante Vegas**: Implementación completa de las reglas Vegas

## 🎮 Características

### Sistema de Salas
- Códigos únicos de 6 caracteres
- Hasta 7 jugadores por sala
- Reconexión automática

### Gameplay
- 7 rondas de preguntas y apuestas
- Sistema de bonos progresivos ($100-$700)
- Probabilidades de pago (1:1 hasta 6:1)
- Cálculo automático de ganadores
- Rankings en tiempo real

### Interfaz
- Responsive (móvil y desktop)
- Diseño estilo Vegas/Casino
- Animaciones fluidas
- Manual de juego integrado

## 🏗️ Arquitectura

```
┌─────────────┐         ┌──────────────┐         ┌────────────────┐
│   Frontend  │────────▶│   Backend    │────────▶│  MongoDB Atlas │
│  (Netlify)  │◀────────│   (Render)   │◀────────│   (Database)   │
└─────────────┘         └──────────────┘         └────────────────┘
      │                         │
      └─────Socket.io───────────┘
         (WebSocket/Polling)
```

### Stack Tecnológico

**Backend:**
- Node.js + Express
- Socket.io (WebSocket)
- MongoDB + Mongoose
- CORS habilitado

**Frontend:**
- HTML5 + CSS3 + Vanilla JS
- Vite (build tool)
- Socket.io Client
- Responsive Design

**Deploy:**
- Frontend: Netlify
- Backend: Render
- Database: MongoDB Atlas

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB (local o Atlas)

### Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd WitsAndWagers

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Iniciar en modo desarrollo
npm run dev
```

La aplicación estará disponible en:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

### Desarrollo

```bash
# Iniciar todo (backend + frontend)
npm run dev

# Solo backend
npm run dev:server

# Solo frontend
npm run dev:client

# Build para producción
npm run build

# Preview de producción
npm run preview
```

## 📱 Cómo Jugar

### Como Host:
1. Ir a la URL de la aplicación
2. Click en **"Crear Sala"**
3. (Opcional) Desmarcar categorías no deseadas
4. Compartir el código de 6 letras con los jugadores
5. Proyectar la pantalla en TV/monitor
6. Esperar jugadores (mín. 2, máx. 7)
7. Click **"Iniciar Juego"**

### Como Jugador:
1. Abrir la URL en móvil/tablet
2. Click en **"Unirse a Sala"**
3. Ingresar nombre y código de sala
4. ¡Jugar desde tu dispositivo!

### Flujo del Juego:
1. **Pregunta**: Lee y responde con tu estimación
2. **Apuestas**: Observa las respuestas ordenadas y apuesta
3. **Resultados**: Ve quién ganó y cuánto
4. Repetir por 7 rondas
5. **Ganador**: El jugador con más dinero

## 📂 Estructura del Proyecto

```
WitsAndWagers/
├── server/                     # Backend
│   ├── index.js               # Servidor Express + Socket.io
│   ├── models/
│   │   └── Room.js            # Modelo de sala (MongoDB)
│   ├── routes/
│   │   └── rooms.js           # API REST para salas
│   ├── socket/
│   │   └── handler.js         # Lógica de Socket.io
│   └── utils/
│       └── helpers.js         # Funciones auxiliares
│
├── public/                     # Frontend estático
│   ├── css/
│   │   └── main.css           # Estilos globales
│   ├── js/
│   │   ├── main.js            # App principal
│   │   ├── host.js            # Vista del host
│   │   └── player.js          # Vista del jugador
│   └── manual.html            # Manual de juego
│
├── docs/                       # Documentación
│   ├── data/
│   │   └── preguntas_consolidadas.json  # 542 preguntas
│   └── Manual vegas.md        # Reglas originales
│
├── index.html                  # Punto de entrada
├── tablero.html               # Tablero del juego
├── package.json               # Dependencias
├── vite.config.js             # Config de Vite
├── netlify.toml               # Config de Netlify
├── render.yaml                # Config de Render
├── DEPLOYMENT.md              # Guía de deployment
├── QUICKSTART.md              # Guía rápida
└── README.md                  # Este archivo
```

## 🚢 Deployment

Ver [DEPLOYMENT.md](./DEPLOYMENT.md) para instrucciones detalladas.

**Resumen:**

1. **MongoDB Atlas**: Crear cluster y obtener URI
2. **Render**: Deploy del backend (Web Service)
3. **Netlify**: Deploy del frontend (Static Site)
4. Configurar variables de entorno
5. ¡Listo!

## 🎯 API Endpoints

### REST API

```
POST   /api/rooms/create        # Crear nueva sala
GET    /api/rooms/:code         # Obtener info de sala
POST   /api/rooms/validate      # Validar código de sala
GET    /api/health              # Health check
```

### Socket.io Events

**Client → Server:**
- `host:create` - Crear sala como host
- `host:join` - Unirse como host
- `host:getCategories` - Obtener categorías
- `host:startGame` - Iniciar juego
- `host:nextRound` - Siguiente ronda
- `player:join` - Unirse como jugador
- `player:submitAnswer` - Enviar respuesta
- `player:placeBet` - Hacer apuesta

**Server → Client:**
- `room:playerJoined` - Jugador se unió
- `room:playerDisconnected` - Jugador desconectado
- `game:started` - Juego iniciado
- `round:started` - Ronda iniciada
- `round:answerReceived` - Respuesta recibida
- `round:bettingPhase` - Fase de apuestas
- `round:betPlaced` - Apuesta realizada
- `round:revealed` - Resultados revelados
- `game:ended` - Juego terminado

## 🧪 Testing

```bash
# Probar localmente
npm run dev

# En navegador 1 (Host):
# → Crear sala
# → Anotar código

# En navegador 2+ (Jugadores):
# → Unirse con código
# → Jugar una ronda completa
```

## 🔧 Configuración

### Variables de Entorno

**Backend (.env):**
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/wits-and-wagers
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

**Producción (Render):**
```env
PORT=10000
MONGODB_URI=mongodb+srv://...
NODE_ENV=production
CLIENT_URL=https://tu-app.netlify.app
```

### Configuración de Jugadores

Bloqueadores según número de jugadores:
- **5 jugadores**: Bloquear espacios 5:1 (rojo y negro)
- **6 jugadores**: Bloquear espacio 2:1 (verde)
- **7 jugadores**: Sin bloqueadores

## 📊 Base de Datos

### Colecciones

**rooms:**
- code (String, único)
- hostId (String)
- players (Array)
- status ('waiting' | 'playing' | 'finished')
- currentRound (Number)
- rounds (Array)
- excludedCategories (Array)
- gameState (Object)

Ver [Room.js](./server/models/Room.js) para schema completo.

## 🐛 Troubleshooting

Ver [QUICKSTART.md](./QUICKSTART.md) sección Troubleshooting.

**Problemas comunes:**
- Puerto ocupado → Cambiar PORT en .env
- MongoDB no conecta → Verificar MONGODB_URI
- Socket.io falla → Revisar CORS y CLIENT_URL
- Build falla → Limpiar node_modules y reinstalar

## 📄 Licencia

MIT License - Ver [LICENSE](./LICENSE) para más detalles.

## 👥 Contribución

Las contribuciones son bienvenidas. Por favor:
1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

- 📖 [Manual de Juego](/manual.html)
- 🚀 [Guía Rápida](./QUICKSTART.md)
- 🚢 [Guía de Deployment](./DEPLOYMENT.md)
- 🐛 [Issues](../../issues)

## 🎉 Créditos

- Juego original: **Wits & Wagers** por North Star Games
- Variante: **Vegas Edition**
- Implementación digital: Versión 1.0

---

**¡Diviértete jugando! 🎰🎲🃏**
