# Script para generar favicons PNG desde el SVG
# Requiere ImageMagick instalado: sudo apt install imagemagick

convert -background none public/favicon.svg -resize 16x16 public/favicon-16x16.png
convert -background none public/favicon.svg -resize 32x32 public/favicon-32x32.png
convert -background none public/favicon.svg -resize 180x180 public/apple-touch-icon.png

echo "✅ Favicons generados exitosamente!"
