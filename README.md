# SIGECA v2

**Sistema de Gestión de Carga Académica**

SIGECA es un sistema web para universidades que automatiza la generación de horarios académicos, evitando traslapes y optimizando la asignación de recursos como profesores, salones y grupos.

---

## Motivación

La generación de horarios académicos es un problema clásico de optimización con restricciones múltiples (University Timetabling Problem). En muchas instituciones este proceso se hace manualmente, lo que genera errores, traslapes y un alto costo administrativo. SIGECA v2 busca resolver esto con un motor de scheduling automatizado y un panel de administración completo.

---

## Estado del proyecto

> En desarrollo activo — Fase 2: CRUDs del backend

| Fase | Descripción | Estado |
|------|-------------|--------|
| 1 | Autenticación y usuarios con JWT | ✅ Completa |
| 2 | CRUDs de entidades académicas | 🔄 En progreso |
| 3 | Panel administrativo (frontend) | ⏳ Pendiente |
| 4 | Motor de generación de horarios | ⏳ Pendiente |
| 5 | Vistas por rol | ⏳ Pendiente |

---

## Funcionalidades

- Autenticación con JWT y tres niveles de acceso: **Administrador**, **Coordinador** y **Profesor**
- Gestión de profesores, materias, grupos, salones y periodos escolares
- Definición de disponibilidad horaria por profesor
- Generación automática de horarios sin traslapes
- Panel administrativo web

---

## Stack tecnológico

**Backend**
- Node.js + TypeScript
- NestJS
- Prisma ORM v7
- PostgreSQL

**Frontend** *(en desarrollo)*
- Next.js
- React
- Tailwind CSS

---

## Modelo de datos

El sistema gestiona las siguientes entidades:

- `PeriodoEscolar` — ciclo escolar activo
- `Profesor` — docentes con disponibilidad definida
- `Materia` — asignaturas con horas semanales y créditos
- `Grupo` — conjunto de alumnos por carrera y semestre
- `Salon` — aulas con capacidad y tipo
- `BloqueHorario` — franjas de tiempo por día de la semana
- `DisponibilidadProfesor` — bloques disponibles por profesor por periodo
- `Asignacion` — resultado del scheduling: profesor + materia + grupo + salón + bloque
- `Usuario` — cuentas del sistema con roles

---

## Requisitos previos

- Node.js >= 20 (recomendado via nvm)
- PostgreSQL >= 14
- npm >= 10

---

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/JorgeIsur/SIGECA-V2.git
cd SIGECA-V2/backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de PostgreSQL y JWT_SECRET

# Generar el cliente de Prisma
npx prisma generate

# Correr migraciones
npx prisma migrate deploy

# Iniciar en modo desarrollo
npm run start:dev
```

---

## Variables de entorno

Crea un archivo `.env` en `backend/` con las siguientes variables:

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/sigeca"
JWT_SECRET="tu_secreto_seguro"
```

---

## API — Endpoints disponibles

### Autenticación
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/auth/register` | Registrar usuario | No |
| POST | `/auth/login` | Iniciar sesión | No |

### Usuarios
| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| GET | `/usuarios` | Listar usuarios | ADMIN |
| GET | `/usuarios/:id` | Obtener usuario | ADMIN |
| POST | `/usuarios` | Crear usuario | ADMIN |
| PATCH | `/usuarios/:id` | Actualizar usuario | ADMIN |
| DELETE | `/usuarios/:id` | Desactivar usuario | ADMIN |

---

## Estructura del proyecto

```
SIGECA-V2/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── auth/
│   │   ├── prisma/
│   │   ├── usuarios/
│   │   └── app.module.ts
│   └── package.json
├── frontend/          # En desarrollo
├── docs/              # En desarrollo
└── .gitignore
```

---

## Autor

Jorge Isur — [@JorgeIsur](https://github.com/JorgeIsur)

---

## Licencia

MIT
