# SIGECA v2

**Sistema de Gestión de Carga Académica**

SIGECA es un sistema web para universidades que automatiza la generación de horarios académicos, evitando traslapes y optimizando la asignación de recursos como profesores, salones y grupos.

---

## Motivación

La generación de horarios académicos es un problema clásico de optimización con restricciones múltiples (University Timetabling Problem). En muchas instituciones este proceso se hace manualmente, lo que genera errores, traslapes y un alto costo administrativo. SIGECA v2 busca resolver esto con un motor de scheduling automatizado y un panel de administración completo.

---

## Estado del proyecto

> En desarrollo activo — Fase 3: Panel administrativo (frontend)

| Fase | Descripción | Estado |
|------|-------------|--------|
| 1 | Autenticación y usuarios con JWT | ✅ Completa |
| 2 | CRUDs de entidades académicas | ✅ Completa |
| 3 | Panel administrativo (frontend) | 🔄 En progreso |
| 4 | Motor de generación de horarios | ⏳ Pendiente |
| 5 | Vistas por rol | ⏳ Pendiente |

---

## Funcionalidades

- Autenticación con JWT y tres niveles de acceso: **Administrador**, **Coordinador** y **Profesor**
- Gestión de profesores, materias, grupos, salones y periodos escolares
- Definición de disponibilidad horaria por profesor (individual y masiva)
- Asignación de materias a profesores y grupos
- Generación automática de horarios sin traslapes *(próximamente)*
- Panel administrativo web *(en desarrollo)*

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

| Entidad | Descripción |
|---------|-------------|
| `PeriodoEscolar` | Ciclo escolar activo |
| `Profesor` | Docentes con disponibilidad definida |
| `Materia` | Asignaturas con horas semanales y créditos |
| `Grupo` | Conjunto de alumnos por carrera y semestre |
| `Salon` | Aulas con capacidad y tipo |
| `BloqueHorario` | Franjas de tiempo por día de la semana |
| `DisponibilidadProfesor` | Bloques disponibles por profesor por periodo |
| `Asignacion` | Resultado del scheduling: profesor + materia + grupo + salón + bloque |
| `Usuario` | Cuentas del sistema con roles |

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

## API — Endpoints

Todos los endpoints excepto `/auth/*` requieren el header:
```
Authorization: Bearer <token>
```

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

### Profesores
| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| GET | `/profesores` | Listar profesores activos | ADMIN, COORDINADOR |
| GET | `/profesores/:id` | Obtener profesor con materias | ADMIN, COORDINADOR |
| POST | `/profesores` | Crear profesor | ADMIN |
| PATCH | `/profesores/:id` | Actualizar profesor | ADMIN |
| DELETE | `/profesores/:id` | Desactivar profesor | ADMIN |

### Materias
| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| GET | `/materias` | Listar materias activas | ADMIN, COORDINADOR |
| GET | `/materias/:id` | Obtener materia con profesores | ADMIN, COORDINADOR |
| POST | `/materias` | Crear materia | ADMIN |
| PATCH | `/materias/:id` | Actualizar materia | ADMIN |
| DELETE | `/materias/:id` | Desactivar materia | ADMIN |
| POST | `/materias/:id/profesores/:profesorId` | Asignar profesor a materia | ADMIN |
| DELETE | `/materias/:id/profesores/:profesorId` | Desasignar profesor de materia | ADMIN |

### Salones
| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| GET | `/salones` | Listar salones disponibles | ADMIN, COORDINADOR |
| GET | `/salones/:id` | Obtener salón | ADMIN, COORDINADOR |
| POST | `/salones` | Crear salón | ADMIN |
| PATCH | `/salones/:id` | Actualizar salón | ADMIN |
| DELETE | `/salones/:id` | Desactivar salón | ADMIN |

### Bloques horarios
| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| GET | `/bloques-horario` | Listar bloques | ADMIN, COORDINADOR |
| GET | `/bloques-horario/:id` | Obtener bloque | ADMIN, COORDINADOR |
| POST | `/bloques-horario` | Crear bloque | ADMIN |
| PATCH | `/bloques-horario/:id` | Actualizar bloque | ADMIN |
| DELETE | `/bloques-horario/:id` | Eliminar bloque | ADMIN |

### Periodos escolares
| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| GET | `/periodos-escolares` | Listar periodos | ADMIN, COORDINADOR |
| GET | `/periodos-escolares/activo` | Obtener periodo activo | ADMIN, COORDINADOR |
| GET | `/periodos-escolares/:id` | Obtener periodo con grupos | ADMIN, COORDINADOR |
| POST | `/periodos-escolares` | Crear periodo | ADMIN |
| PATCH | `/periodos-escolares/:id` | Actualizar periodo | ADMIN |
| DELETE | `/periodos-escolares/:id` | Eliminar periodo | ADMIN |

### Grupos
| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| GET | `/grupos` | Listar grupos (filtrable por `?periodoId=`) | ADMIN, COORDINADOR |
| GET | `/grupos/:id` | Obtener grupo con materias | ADMIN, COORDINADOR |
| POST | `/grupos` | Crear grupo | ADMIN |
| PATCH | `/grupos/:id` | Actualizar grupo | ADMIN |
| DELETE | `/grupos/:id` | Eliminar grupo | ADMIN |
| POST | `/grupos/:id/materias/:materiaId` | Asignar materia a grupo | ADMIN |
| DELETE | `/grupos/:id/materias/:materiaId` | Desasignar materia de grupo | ADMIN |

### Disponibilidad
| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| GET | `/disponibilidad/profesor/:profesorId/periodo/:periodoId` | Ver disponibilidad de un profesor | ADMIN, COORDINADOR |
| GET | `/disponibilidad/:id` | Obtener registro | ADMIN, COORDINADOR |
| POST | `/disponibilidad` | Registrar disponibilidad individual | ADMIN |
| POST | `/disponibilidad/masivo` | Registrar múltiples bloques a la vez | ADMIN |
| PATCH | `/disponibilidad/:id` | Actualizar disponibilidad | ADMIN |
| DELETE | `/disponibilidad/:id` | Eliminar disponibilidad | ADMIN |

---

## Roles y permisos

| Acción | ADMIN | COORDINADOR | PROFESOR |
|--------|-------|-------------|---------|
| Gestionar usuarios | ✅ | ❌ | ❌ |
| Crear/editar entidades | ✅ | ❌ | ❌ |
| Consultar entidades | ✅ | ✅ | ❌ |
| Ver propio horario | ✅ | ✅ | ✅ |

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
│   │   ├── profesores/
│   │   ├── materias/
│   │   ├── salones/
│   │   ├── bloques-horario/
│   │   ├── periodos-escolares/
│   │   ├── grupos/
│   │   ├── disponibilidad/
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
