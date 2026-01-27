# 🚀 Inicio Rápido - Wits & Wagers Vegas

## Instalación

```bash
# Clonar o navegar al directorio del proyecto
cd WitsAndWagers

# Instalar dependencias
npm install

# Crear archivo .env (ya existe uno de ejemplo)
# Editar .env si necesitas cambiar la configuración
```

## Desarrollo Local

### Opción 1: Modo Desarrollo Completo

```bash
# Iniciar backend y frontend simultáneamente
npm run dev
```

Esto iniciará:
- Backend en `http://localhost:3000`
- Frontend en `http://localhost:5173`

### Opción 2: Separado

```bash
# Terminal 1: Iniciar backend
npm run dev:server

# Terminal 2: Iniciar frontend
npm run dev:client
```

## Probar la Aplicación

### Como Host:
1. Abrir navegador en `http://localhost:5173`
2. Click en "Crear Sala"
3. (Opcional) Desmarcar categorías que no quieras
4. Click "Crear Sala"
5. Anotar el código de 6 letras que aparece

### Como Jugador:
1. Abrir en otro navegador/dispositivo: `http://localhost:5173`
2. Click en "Unirse a Sala"
3. Ingresar nombre
4. Ingresar código de sala
5. Click "Unirse"

### Iniciar el Juego:
1. Como host, esperar a que se unan al menos 2 jugadores
2. Click "Iniciar Juego"
3. ¡Jugar!

## Estructura del Proyecto

```
WitsAndWagers/
├── server/                 # Backend Node.js
│   ├── index.js           # Servidor principal
│   ├── models/            # Modelos de MongoDB
│   │   └── Room.js
│   ├── routes/            # Rutas API REST
│   │   └── rooms.js
│   ├── socket/            # Handlers de Socket.io
│   │   └── handler.js
│   └── utils/             # Utilidades
│       └── helpers.js
│
├── public/                # Frontend estático
│   ├── css/
│   │   └── main.css       # Estilos principales
│   ├── js/
│   │   ├── main.js        # App principal
│   │   ├── host.js        # Pantalla del host
│   │   └── player.js      # Pantalla del jugador
│   └── manual.html        # Manual de juego
│
├── docs/                  # Documentación y datos
│   ├── data/
│   │   └── preguntas_consolidadas.json  # 542 preguntas
│   └── Manual vegas.md    # Manual original
│
├── index.html             # Punto de entrada
├── tablero.html           # Tablero del juego
├── package.json           # Dependencias
├── vite.config.js         # Configuración de Vite
└── .env                   # Variables de entorno
```

## Comandos Disponibles

```bash
# Desarrollo
npm run dev              # Backend + Frontend
npm run dev:server       # Solo backend
npm run dev:client       # Solo frontend

# Producción
npm run build            # Construir para producción
npm start                # Iniciar servidor de producción
npm run preview          # Preview de la build
```

## Variables de Entorno (.env)

```env
PORT=3000                                    # Puerto del backend
MONGODB_URI=mongodb://localhost:27017/...   # MongoDB URI
NODE_ENV=development                         # Entorno
CLIENT_URL=http://localhost:5173             # URL del frontend
```

## Troubleshooting

### Puerto ya en uso
```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9
lsof -ti:5173 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### MongoDB no conecta
- Verifica que MongoDB esté instalado e iniciado
- O usa MongoDB Atlas (ver DEPLOYMENT.md)
- Actualiza MONGODB_URI en .env

### Socket.io no conecta
- Verifica que CORS esté correctamente configurado
- Verifica que CLIENT_URL en .env sea correcta
- Revisa la consola del navegador (F12) para errores

### Frontend no carga
```bash
# Limpiar cache de Vite
rm -rf node_modules/.vite
npm run dev:client
```

## Siguientes Pasos

1. **Probar localmente**: Sigue los pasos de arriba
2. **Personalizar**: Modifica estilos en `public/css/main.css`
3. **Deploy**: Sigue la guía en `DEPLOYMENT.md`

## Características Implementadas

✅ Sistema de salas con código único  
✅ Multijugador en tiempo real (Socket.io)  
✅ 542 preguntas con categorías configurables  
✅ Sistema de respuestas y apuestas  
✅ Cálculo automático de pagos  
✅ Tablero visual con las reglas de Vegas  
✅ Interfaz responsive (móvil y desktop)  
✅ Manejo de desconexiones  
✅ Bonos por ronda  
✅ Rankings al final del juego  

## Recursos

- [Manual de Juego](http://localhost:5173/manual.html)
- [Guía de Deployment](./DEPLOYMENT.md)
- [Socket.io Docs](https://socket.io/docs/v4/)
- [Vite Docs](https://vitejs.dev/)
- [MongoDB Docs](https://www.mongodb.com/docs/)

## Soporte

Si encuentras algún problema:
1. Revisa la consola del navegador (F12)
2. Revisa los logs del servidor backend
3. Verifica las configuraciones en .env
4. Consulta la sección Troubleshooting arriba

¡Disfruta el juego! 🎰🎉
