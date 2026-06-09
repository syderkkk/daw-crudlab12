# Biblioteca

Sistema de gestión de biblioteca construido con Next.js 16, Prisma 7 y Supabase (PostgreSQL).

## Requisitos previos

- Node.js 18+
- Una cuenta en [Supabase](https://supabase.com)

## Instalación

### 1. Clonar el repositorio e instalar dependencias

```bash
git clone https://github.com/syderkkk/daw-crudlab12.git
cd daw-crudlab12
npm install
```

### 2. Configurar las variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@aws-<n>-<region>.pooler.supabase.com:5432/postgres"
```

Obtén esta URL desde el panel de Supabase:
**Settings → Database → Connect → ORM → Session Pooler**

> Usa el Session Pooler (puerto 5432), no la conexión directa. Funciona en redes IPv4 e IPv6.

### 3. Ejecutar las migraciones

```bash
npx prisma migrate deploy
```

### 4. Generar el cliente de Prisma

```bash
npx prisma generate
```

> Esto también se ejecuta automáticamente al hacer `npm install` gracias al script `postinstall`.

### 5. (Opcional) Poblar la base de datos con datos de ejemplo

```bash
npx prisma db seed
```

Inserta 5 autores de literatura hispanoamericana y 15 libros de ejemplo.

### 6. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Compila para producción |
| `npm run start` | Inicia el servidor de producción |
| `npm run lint` | Ejecuta ESLint |
| `npx prisma migrate dev` | Crea y aplica una nueva migración |
| `npx prisma migrate deploy` | Aplica migraciones pendientes (producción) |
| `npx prisma generate` | Regenera el cliente de Prisma |
| `npx prisma db seed` | Pobla la base de datos con datos de ejemplo |
| `npx prisma studio` | Abre Prisma Studio (interfaz visual de la BD) |

## Estructura del proyecto

```
app/
  api/            Rutas REST (autores, libros)
  authors/[id]/   Página de detalle del autor
  books/          Página de catálogo de libros
  components/     Componentes compartidos (Nav, StatCard, iconos)
  generated/      Cliente de Prisma autogenerado (en .gitignore)
  layout.tsx      Layout raíz
  page.tsx        Panel principal
lib/
  prisma.ts       Singleton de Prisma
  api-utils.ts    Utilidades compartidas para la API
prisma/
  schema.prisma   Esquema de la BD (Author, Book)
  migrations/     Historial de migraciones SQL
  seed.mts        Script de datos de ejemplo
```

## Endpoints de la API

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/authors` | Listar todos los autores |
| POST | `/api/authors` | Crear un autor |
| GET | `/api/authors/:id` | Obtener autor con sus libros |
| PUT | `/api/authors/:id` | Actualizar autor |
| DELETE | `/api/authors/:id` | Eliminar autor (elimina sus libros en cascada) |
| GET | `/api/authors/:id/books` | Listar libros de un autor |
| GET | `/api/authors/:id/stats` | Estadísticas del autor |
| GET | `/api/books` | Listar libros (filtrable por género) |
| POST | `/api/books` | Crear un libro |
| GET | `/api/books/:id` | Obtener libro por ID |
| PUT | `/api/books/:id` | Actualizar libro |
| DELETE | `/api/books/:id` | Eliminar libro |
| GET | `/api/books/search` | Búsqueda con paginación y filtros |

## Despliegue

Despliega en [Vercel](https://vercel.com): el archivo `vercel.json` ya está configurado.

Añade `DATABASE_URL` como variable de entorno en la configuración del proyecto en Vercel.
