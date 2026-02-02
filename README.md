# Wits & Wagers Vegas - v2.0

🎰 Juego de trivia y apuestas en tiempo real - **VERSIÓN COMPLETAMENTE REESCRITA**

## ⚡ Quick Start

### Desarrollo Local

**Terminal 1 - Servidor:**

```bash
cd server
npm install
npm run dev
```

**Terminal 2 - Cliente:**

```bash
cd client
npm install
npm run dev
```

Cliente: http://localhost:5173  
Servidor: http://localhost:3000

---

## ❌ Proyecto Anterior (28 de Enero de 2026)

### Lo que salió mal:

1. Edité archivos equivocados durante horas
2. El tablero del host quedó inutilizable
3. Las respuestas nunca aparecieron
4. Pérdida de tiempo completa

### ✅ Lo que se rescató:

**`RESCATE_TABLERO_JUGADOR.jsx`** - El ÚNICO código que funcionaba:

- Tablero de apuestas del jugador (mobile)
- Fichas de póquer visuales con animaciones
- Grid responsive perfecto
- Lógica de apuestas completa

**NO TOCAR ESE CÓDIGO**

---

## 🚀 Nueva Implementación (v2.0)

### Stack Tecnológico:

- **Frontend**: React 18 + Vite + Socket.io-client
- **Backend**: Node.js + Express + Socket.io + MongoDB
- **Deploy**: Netlify + Render + MongoDB Atlas

### Estructura:

```
WitsAndWagers/
├── .env                              # Variables de entorno (backend URLs)
├── .gitignore                        # Git ignore
├── RESCATE_TABLERO_JUGADOR.jsx       # ⭐ Código del tablero que funciona
├── docs/                             # Documentación del proyecto
│   ├── Manual.md
│   ├── Manual vegas.md
│   └── data/
│       └── preguntas_consolidadas.json
└── public/                           # Solo favicons
    ├── FAVICON.md
    ├── apple-touch-icon.png
    ├── favicon-16.svg
    ├── favicon-16x16.png
    ├── favicon-32.svg
    ├── favicon-32x32.png
    ├── favicon-preview.html
    └── favicon.svg
```

## 🔄 Para empezar de nuevo

1. **Leer `docs/Manual vegas.md`** - Entender las reglas del juego
2. **Revisar `RESCATE_TABLERO_JUGADOR.jsx`** - Ver el código que SÍ funciona
3. **Empezar con una arquitectura clara** - Decidir stack (React, Vite, Express, Socket.io)
4. **Implementar paso a paso**:
   - Backend con Socket.io
   - Frontend host
   - Frontend jugadores (reusar código del rescate)
   - Probar CADA función antes de continuar

## 😔 Lecciones aprendidas

- **Siempre verificar qué archivo se está usando** antes de editarlo
- **Probar cambios inmediatamente** en el navegador
- **No asumir** - Verificar la configuración de Vite/build tools
- **Hacer commits frecuentes** para poder revertir errores
- **Si algo no funciona después de 2-3 intentos**, detener y replantear

---

**Nota para el próximo desarrollador**: Por favor, no cometas mis errores. Este proyecto fue un desastre porque no seguí las prácticas básicas de desarrollo. El único código confiable está en `RESCATE_TABLERO_JUGADOR.jsx`.
