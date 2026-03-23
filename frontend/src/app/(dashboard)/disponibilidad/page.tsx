'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Profesor, PeriodoEscolar, BloqueHorario } from '@/lib/types';

interface Disponibilidad {
  id: number;
  profesorId: number;
  bloqueId: number;
  periodoId: number;
  disponible: boolean;
  bloque: BloqueHorario;
}

const diasOrden = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

export default function DisponibilidadPage() {
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [periodos, setPeriodos] = useState<PeriodoEscolar[]>([]);
  const [bloques, setBloques] = useState<BloqueHorario[]>([]);
  const [disponibilidad, setDisponibilidad] = useState<Disponibilidad[]>([]);
  const [profesorId, setProfesorId] = useState<number>(0);
  const [periodoId, setPeriodoId] = useState<number>(0);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => { cargarDatos(); }, []);

  useEffect(() => {
    if (profesorId && periodoId) cargarDisponibilidad();
  }, [profesorId, periodoId]);

  async function cargarDatos() {
    try {
      const [{ data: p }, { data: per }, { data: b }] = await Promise.all([
        api.get('/profesores'),
        api.get('/periodos-escolares'),
        api.get('/bloques-horario'),
      ]);
      setProfesores(p);
      setPeriodos(per);
      setBloques(b);
      if (p.length > 0) setProfesorId(p[0].id);
      if (per.length > 0) setPeriodoId(per[0].id);
    } finally {
      setCargando(false);
    }
  }

  async function cargarDisponibilidad() {
    const { data } = await api.get(
      `/disponibilidad/profesor/${profesorId}/periodo/${periodoId}`,
    );
    setDisponibilidad(data);
  }

  function estaDisponible(bloqueId: number) {
    return disponibilidad.some((d) => d.bloqueId === bloqueId && d.disponible);
  }

  async function toggleBloque(bloqueId: number) {
    const existente = disponibilidad.find((d) => d.bloqueId === bloqueId);
    setGuardando(true);
    try {
      if (existente) {
        await api.patch(`/disponibilidad/${existente.id}`, {
          disponible: !existente.disponible,
        });
      } else {
        await api.post('/disponibilidad', { profesorId, bloqueId, periodoId });
      }
      await cargarDisponibilidad();
    } finally {
      setGuardando(false);
    }
  }

  const bloquesPorDia = diasOrden.map((dia) => ({
    dia,
    bloques: bloques.filter((b) => b.diaSemana === dia).sort((a, b) =>
      a.horaInicio.localeCompare(b.horaInicio),
    ),
  }));

  if (cargando) return <p className="text-gray-400 text-sm">Cargando...</p>;

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Disponibilidad</h2>

      <div className="flex gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Profesor</label>
          <select
            value={profesorId}
            onChange={(e) => setProfesorId(parseInt(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {profesores.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Periodo</label>
          <select
            value={periodoId}
            onChange={(e) => setPeriodoId(parseInt(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {periodos.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {bloques.length === 0 ? (
        <p className="text-gray-400 text-sm">No hay bloques horarios registrados.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {bloquesPorDia.map(({ dia, bloques: bloquesDelDia }) => (
            <div key={dia}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">{dia}</h3>
              <div className="space-y-1">
                {bloquesDelDia.map((bloque) => {
                  const activo = estaDisponible(bloque.id);
                  return (
                    <button
                      key={bloque.id}
                      onClick={() => toggleBloque(bloque.id)}
                      disabled={guardando}
                      className={`w-full text-xs px-2 py-1.5 rounded-lg border transition-colors text-left ${
                        activo
                          ? 'bg-green-100 border-green-300 text-green-800'
                          : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {bloque.horaInicio} - {bloque.horaFin}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4">
        Haz clic en un bloque para marcarlo como disponible o no disponible.
      </p>
    </div>
  );
}