# Preguntas Wits & Wagers

## 📁 Dónde Encontrar Qué

```
docs/data/
└── preguntas_consolidadas.json    # Archivo maestro con todas las preguntas (542)
```

## 📋 Estructura Estándar de las Preguntas

```json
{
  "metadata": {
    "version": "3.1-internacional-optimizado",
    "total_preguntas": 542,
    "idioma": "español"
  },
  "categorias": [
    {
      "id": "categoria_id",
      "nombre": "Nombre de la Categoría",
      "descripcion": "Descripción de la categoría",
      "preguntas": [
        {
          "id": "pregunta_id",
          "pregunta": "Texto de la pregunta?",
          "respuesta": 42,
          "unidad": "metros",
          "dificultad": "media",
          "fuente": "Fuente de información",
          "trivia": "Dato curioso opcional"
        }
      ]
    }
  ]
}
```

### Campos

| Campo        | Tipo          | Descripción                          |
| ------------ | ------------- | ------------------------------------ |
| `id`         | string        | Identificador único                  |
| `pregunta`   | string        | Texto de la pregunta                 |
| `respuesta`  | number/string | Respuesta numérica o texto           |
| `unidad`     | string        | Unidad de medida (km, años, %, etc.) |
| `dificultad` | string        | "baja", "media" o "alta"             |
| `fuente`     | string        | Fuente de verificación               |
| `trivia`     | string/null   | Dato adicional opcional              |
