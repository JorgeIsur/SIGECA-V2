/*
  Warnings:

  - You are about to drop the `Profesor` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TipoSalon" AS ENUM ('AULA', 'LABORATORIO', 'SALA_COMPUTO', 'AUDITORIO', 'TALLER');

-- CreateEnum
CREATE TYPE "DiaSemana" AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO');

-- CreateEnum
CREATE TYPE "EstadoAsignacion" AS ENUM ('PROPUESTA', 'CONFIRMADA', 'CANCELADA');

-- DropTable
DROP TABLE "Profesor";

-- CreateTable
CREATE TABLE "periodos_escolares" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "periodos_escolares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profesores" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profesores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materias" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "horasSemanales" INTEGER NOT NULL,
    "creditos" INTEGER NOT NULL,
    "carrera" TEXT NOT NULL,
    "semestre" INTEGER NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materias_profesores" (
    "id" SERIAL NOT NULL,
    "profesorId" INTEGER NOT NULL,
    "materiaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "materias_profesores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "semestre" INTEGER NOT NULL,
    "carrera" TEXT NOT NULL,
    "cupo" INTEGER NOT NULL DEFAULT 30,
    "periodoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grupos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materias_grupos" (
    "id" SERIAL NOT NULL,
    "materiaId" INTEGER NOT NULL,
    "grupoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "materias_grupos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salones" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "edificio" TEXT,
    "capacidad" INTEGER NOT NULL,
    "tipo" "TipoSalon" NOT NULL DEFAULT 'AULA',
    "disponible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bloques_horarios" (
    "id" SERIAL NOT NULL,
    "diaSemana" "DiaSemana" NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "duracionMin" INTEGER NOT NULL DEFAULT 60,

    CONSTRAINT "bloques_horarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disponibilidades_profesores" (
    "id" SERIAL NOT NULL,
    "profesorId" INTEGER NOT NULL,
    "bloqueId" INTEGER NOT NULL,
    "periodoId" INTEGER NOT NULL,
    "disponible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "disponibilidades_profesores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asignaciones" (
    "id" SERIAL NOT NULL,
    "profesorId" INTEGER NOT NULL,
    "materiaId" INTEGER NOT NULL,
    "grupoId" INTEGER NOT NULL,
    "salonId" INTEGER NOT NULL,
    "bloqueId" INTEGER NOT NULL,
    "periodoId" INTEGER NOT NULL,
    "estado" "EstadoAsignacion" NOT NULL DEFAULT 'PROPUESTA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asignaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profesores_email_key" ON "profesores"("email");

-- CreateIndex
CREATE UNIQUE INDEX "materias_clave_key" ON "materias"("clave");

-- CreateIndex
CREATE UNIQUE INDEX "materias_profesores_profesorId_materiaId_key" ON "materias_profesores"("profesorId", "materiaId");

-- CreateIndex
CREATE UNIQUE INDEX "grupos_nombre_periodoId_key" ON "grupos"("nombre", "periodoId");

-- CreateIndex
CREATE UNIQUE INDEX "materias_grupos_materiaId_grupoId_key" ON "materias_grupos"("materiaId", "grupoId");

-- CreateIndex
CREATE UNIQUE INDEX "salones_nombre_edificio_key" ON "salones"("nombre", "edificio");

-- CreateIndex
CREATE UNIQUE INDEX "bloques_horarios_diaSemana_horaInicio_key" ON "bloques_horarios"("diaSemana", "horaInicio");

-- CreateIndex
CREATE UNIQUE INDEX "disponibilidades_profesores_profesorId_bloqueId_periodoId_key" ON "disponibilidades_profesores"("profesorId", "bloqueId", "periodoId");

-- CreateIndex
CREATE UNIQUE INDEX "asignaciones_profesorId_bloqueId_periodoId_key" ON "asignaciones"("profesorId", "bloqueId", "periodoId");

-- CreateIndex
CREATE UNIQUE INDEX "asignaciones_salonId_bloqueId_periodoId_key" ON "asignaciones"("salonId", "bloqueId", "periodoId");

-- CreateIndex
CREATE UNIQUE INDEX "asignaciones_grupoId_bloqueId_periodoId_key" ON "asignaciones"("grupoId", "bloqueId", "periodoId");

-- AddForeignKey
ALTER TABLE "materias_profesores" ADD CONSTRAINT "materias_profesores_profesorId_fkey" FOREIGN KEY ("profesorId") REFERENCES "profesores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materias_profesores" ADD CONSTRAINT "materias_profesores_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "materias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupos" ADD CONSTRAINT "grupos_periodoId_fkey" FOREIGN KEY ("periodoId") REFERENCES "periodos_escolares"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materias_grupos" ADD CONSTRAINT "materias_grupos_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "materias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materias_grupos" ADD CONSTRAINT "materias_grupos_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "grupos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disponibilidades_profesores" ADD CONSTRAINT "disponibilidades_profesores_profesorId_fkey" FOREIGN KEY ("profesorId") REFERENCES "profesores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disponibilidades_profesores" ADD CONSTRAINT "disponibilidades_profesores_bloqueId_fkey" FOREIGN KEY ("bloqueId") REFERENCES "bloques_horarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disponibilidades_profesores" ADD CONSTRAINT "disponibilidades_profesores_periodoId_fkey" FOREIGN KEY ("periodoId") REFERENCES "periodos_escolares"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones" ADD CONSTRAINT "asignaciones_profesorId_fkey" FOREIGN KEY ("profesorId") REFERENCES "profesores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones" ADD CONSTRAINT "asignaciones_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "materias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones" ADD CONSTRAINT "asignaciones_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "grupos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones" ADD CONSTRAINT "asignaciones_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "salones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones" ADD CONSTRAINT "asignaciones_bloqueId_fkey" FOREIGN KEY ("bloqueId") REFERENCES "bloques_horarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones" ADD CONSTRAINT "asignaciones_periodoId_fkey" FOREIGN KEY ("periodoId") REFERENCES "periodos_escolares"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
