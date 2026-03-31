# SIGECA v2

**Sistema de Gestión de Carga Académica**

SIGECA es un sistema web para universidades que automatiza la generación de horarios académicos, evitando traslapes y optimizando la asignación de recursos como profesores, salones y grupos.

---

## Motivación

La generación de horarios académicos es un problema clásico de optimización con restricciones múltiples (University Timetabling Problem). En muchas instituciones este proceso se hace manualmente, lo que genera errores, traslapes y un alto costo administrativo. SIGECA v2 resuelve esto con un motor de scheduling automatizado y un panel de administración completo.

---

## Estado del proyecto

> En desarrollo activo — Fase 5: Vistas por rol

| Fase | Descripción | Estado |
|------|-------------|--------|
| 1 | Autenticación y usuarios con JWT | ✅ Completa |
| 2 | CRUDs de entidades académicas | ✅ Completa |
| 3 | Panel administrativo (frontend) | ✅ Completa |
| 4 | Motor de generación de horarios | ✅ Completa |
| 5 | Vistas por rol | 🔄 En progreso |

---

## Funcionalidades

- Autenticación con JWT y tres niveles de acceso: **Administrador**, **Coordinador** y **Profesor**
- Gestión de profesores, materias, grupos, salones y periodos escolares
- Definición de disponibilidad horaria por profesor
- Asignación de materias a profesores y grupos
- Panel administrativo web con sidebar por rol
- **Generación automática de horarios sin traslapes** mediante backtracking con forward checking

---

## Motor de generación de horarios

El algoritmo implementado es **backtracking con forward checking**, un método clásico para problemas de satisfacción de restricciones (CSP).

### Flujo del algoritmo

```
1. Cargar datos del periodo
   └── grupos, materias, salones, bloques horarios, disponibilidades

2. Construir lista de pendientes
   └── una entrada por cada hora semanal de cada combinación grupo-materia

3. Para cada pendiente (backtracking recursivo):
   a. Iterar cada bloque horario disponible
   b. Iterar cada profesor habilitado para esa materia
      └── verificar que el profesor tenga disponibilidad en ese bloque
      └── verificar que el profesor no esté ocupado en ese bloque
   c. Iterar cada salón disponible
      └── verificar que el salón no esté ocupado en ese bloque
   d. Si se encontró combinación válida → registrar y avanzar al siguiente
   e. Si no hay combinación válida → retroceder (backtrack) y probar otra

4. Si se asignaron todos los pendientes → guardar en base de datos
5. Si no fue posible → reportar error con sugerencias
```
<img src="docs/scheduling_backtracking_flow.svg" width="800" height="600" alt="Alt text"/>

### Restricciones garantizadas

El sistema garantiza que ninguna asignación generada viole estas tres reglas:

- Un **profesor** no puede estar en dos clases simultáneas
- Un **salón** no puede tener dos clases simultáneas
- Un **grupo** no puede tener dos materias simultáneas

Estas restricciones están reforzadas tanto en el algoritmo como en la base de datos mediante índices únicos compuestos en la tabla `asignaciones`.

### Prerequisitos para generar un horario válido

Para que el motor pueda generar un horario, el administrador debe haber configurado previamente:

1. Un **periodo escolar** activo
2. **Bloques horarios** (franjas de tiempo por día)
3. **Profesores** con disponibilidad marcada en esos bloques
4. **Materias** con al menos un profesor habilitado
5. **Grupos** con materias asignadas
6. Al menos un **salón** disponible

---

## Stack tecnológico

**Backend**
- Node.js + TypeScript
- NestJS
- Prisma ORM v7
- PostgreSQL

**Frontend**
- Next.js 16
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

### Backend

```bash
git clone https://github.com/JorgeIsur/SIGECA-V2.git
cd SIGECA-V2/backend

npm install

cp .env.example .env
# Edita .env con tus credenciales de PostgreSQL y JWT_SECRET

npx prisma generate
npx prisma migrate deploy

npm run start:dev
# Corre en http://localhost:3001
```

### Frontend

```bash
cd SIGECA-V2/frontend

npm install

echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local

npm run dev
# Corre en http://localhost:3000
```

---

## Variables de entorno

**`backend/.env`**
```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/sigeca"
JWT_SECRET="tu_secreto_seguro"
```

**`frontend/.env.local`**
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

---

## Panel administrativo

| Ruta | Descripción | Roles |
|------|-------------|-------|
| `/login` | Inicio de sesión | Todos |
| `/dashboard` | Pantalla de bienvenida | Todos |
| `/profesores` | CRUD de profesores | ADMIN, COORDINADOR |
| `/materias` | CRUD de materias + asignar profesores | ADMIN, COORDINADOR |
| `/salones` | CRUD de salones | ADMIN, COORDINADOR |
| `/grupos` | CRUD de grupos + asignar materias | ADMIN, COORDINADOR |
| `/periodos` | CRUD de periodos escolares | ADMIN, COORDINADOR |
| `/bloques` | CRUD de bloques horarios | ADMIN |
| `/disponibilidad` | Gestión de disponibilidad por profesor | ADMIN, COORDINADOR |
| `/usuarios` | CRUD de usuarios | ADMIN |
| `/horarios` | Generación y visualización de horarios | Todos |

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

### Scheduling
| Método | Ruta | Descripción | Rol |
|--------|------|-------------|-----|
| POST | `/scheduling/generar/:periodoId` | Generar horario automático | ADMIN |
| GET | `/scheduling/horario/:periodoId` | Obtener horario generado | Todos |
| DELETE | `/scheduling/limpiar/:periodoId` | Eliminar asignaciones propuestas | ADMIN |
| GET | `/scheduling/diagnosticar/:periodoId` | Diagnóstico de datos del periodo | ADMIN |

---

## Roles y permisos

| Acción | ADMIN | COORDINADOR | PROFESOR |
|--------|-------|-------------|---------|
| Gestionar usuarios | ✅ | ❌ | ❌ |
| Crear/editar entidades | ✅ | ❌ | ❌ |
| Consultar entidades | ✅ | ✅ | ❌ |
| Gestionar disponibilidad | ✅ | ✅ | ❌ |
| Generar horarios | ✅ | ❌ | ❌ |
| Ver horarios | ✅ | ✅ | ✅ |

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
│   │   ├── scheduling/
│   │   └── app.module.ts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/login/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── dashboard/
│   │   │   │   ├── profesores/
│   │   │   │   ├── materias/
│   │   │   │   ├── salones/
│   │   │   │   ├── grupos/
│   │   │   │   ├── periodos/
│   │   │   │   ├── bloques/
│   │   │   │   ├── disponibilidad/
│   │   │   │   ├── horarios/
│   │   │   │   └── usuarios/
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── layout/Sidebar.tsx
│   │   │   └── ui/
│   │   │       ├── Tabla.tsx
│   │   │       └── Modal.tsx
│   │   ├── context/AuthContext.tsx
│   │   └── lib/
│   │       ├── axios.ts
│   │       └── types.ts
│   └── package.json
├── docs/
└── .gitignore
```

---

## Autor

Jorge Isur — [@JorgeIsur](https://github.com/JorgeIsur)

---

## Licencia

MIT
