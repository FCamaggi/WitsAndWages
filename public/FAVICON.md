# Favicons para Wits & Wagers Vegas

## Archivos Creados

- `favicon.svg` - Favicon principal en SVG (mejor calidad, moderno)
- `favicon-16.svg` - Versión simplificada 16x16
- `favicon-32.svg` - Versión intermedia 32x32

## Cómo Generar PNGs (Opcional)

Si quieres versiones PNG para mejor compatibilidad con navegadores antiguos:

### Opción 1: Usar el script (requiere ImageMagick)

```bash
# Instalar ImageMagick si no lo tienes
# Ubuntu/Debian:
sudo apt install imagemagick

# Mac:
brew install imagemagick

# Ejecutar script
./generate-favicons.sh
```

### Opción 2: Convertir online

1. Ir a https://convertio.co/es/svg-png/ o https://cloudconvert.com/svg-to-png
2. Subir `public/favicon.svg`
3. Convertir a:
   - 16x16 → guardar como `public/favicon-16x16.png`
   - 32x32 → guardar como `public/favicon-32x32.png`
   - 180x180 → guardar como `public/apple-touch-icon.png`

### Opción 3: Usar navegador

Los navegadores modernos soportan SVG perfectamente, así que los PNG son opcionales.

## Diseño del Favicon

El favicon muestra:

- 🎰 Ficha de póquer dorada (estilo Vegas)
- 💰 Símbolo $ en el centro
- ✨ Detalles decorativos tipo casino
- 🎨 Gradientes dorados (#d4af37)

## Uso en el HTML

Ya está configurado en `index.html`:

```html
<!-- Favicons -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
```

El navegador elegirá automáticamente el formato correcto según su soporte.

## Preview

Puedes ver el favicon en:

- La pestaña del navegador
- Los bookmarks/favoritos
- Los accesos directos en el escritorio (PWA)
- La pantalla de inicio en iOS/Android

¡Listo! El icono de tu aplicación ahora es profesional y reconocible. 🎰💰
