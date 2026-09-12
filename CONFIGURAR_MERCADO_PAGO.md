# Conectar Mercado Pago en Netlify

La aplicación usa una variable privada en Netlify:

- `MP_ACCESS_TOKEN`: credencial de producción de Mercado Pago.

## Configuración

1. Revoca la credencial que anteriormente estuvo publicada en GitHub y crea una nueva en Mercado Pago.
2. En Netlify abre **Site configuration > Environment variables**.
3. Agrega `MP_ACCESS_TOKEN` únicamente en Netlify. Nunca lo escribas en archivos del repositorio.
4. Vuelve a desplegar el sitio para que las funciones reciban las variables.
5. Haz una venta pequeña de prueba desde **Cobrar con Terminal (Point)**.

La aplicación detecta automáticamente la primera terminal Point activa asociada a la cuenta. Las funciones activas están en `netlify/functions/`, como indica `netlify.toml`.
