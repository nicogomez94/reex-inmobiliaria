# REEX Inmobiliaria

Sitio web y panel de administración para REEX Inmobiliaria, Villa Urquiza.

## Stack

- React + Vite
- Node.js + Express
- Prisma + PostgreSQL
- Autenticación JWT
- CRUD de propiedades, galería y carga de imágenes

## Desarrollo local

```bash
npm ci
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Copiá las variables de ejemplo de `client/.env.example` y
`server/.env.example` a sus respectivos archivos `.env`.

## Producción

El archivo `render.yaml` define:

- Un único Web Service que compila el frontend y sirve la API.
- Una base PostgreSQL independiente.
- Migraciones Prisma durante cada build.
- Health check en `/api/health`.

El destinatario del formulario se configura en Render con
`VITE_CONTACT_TO`.

## Datos públicos

- REEX Inmobiliaria
- Capdevila 2934 · Villa Urquiza
- Tel. 4747-2267
- WhatsApp 11 6496-1600
- reex.urquiza@gmail.com
