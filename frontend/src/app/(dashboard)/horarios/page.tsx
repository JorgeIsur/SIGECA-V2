'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { PeriodoEscolar } from '@/lib/types';

interface Asignacion {
  id: number;
  profesor: { nombre: string };
  materia: { nombre: string; clave: string };
  grupo: { nombre: string; carrera: string };
  salon: { nombre: string; edificio?: string };
  bloque: {
    diaSemana: string;
    horaInicio: string;
    horaFin: string;
  };
  estado: string;
}

const diasOrden = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

export default function HorariosPage() {
  const [periodos, setPeriodos] = useState<PeriodoEscolar[]>([]);
  const [periodoId, setPeriodoId] = useState<number>(0);
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [resultado, setResultado] = useState<{
    exito: boolean;
    mensaje: string;
  } | null>(null);

  useEffect(() => {
    cargarPeriodos();
  }, []);

  useEffect(() => {
    if (periodoId) cargarHorario();
  }, [periodoId]);

  async function cargarPeriodos() {
    try {
      const { data } = await api.get('/periodos-escolares');
      setPeriodos(data);
      if (data.length > 0) setPeriodoId(data[0].id);
    } finally {
      setCargando(false);
    }
  }

  async function cargarHorario() {
    const { data } = await api.get(`/scheduling/horario/${periodoId}`);
    setAsignaciones(data);
  }

  async function handleGenerar() {
    if (!confirm('¿Generar horario automático? Se reemplazarán las asignaciones propuestas existentes.')) return;
    setGenerando(true);
    setResultado(null);
    try {
      const { data } = await api.post(`/scheduling/generar/${periodoId}`);
      setResultado({ exito: data.exito, mensaje: data.mensaje });
      if (data.exito) await cargarHorario();
    } catch (e: any) {
      setResultado({
        exito: false,
        mensaje: e.response?.data?.message ?? 'Error al generar horario',
      });
    } finally {
      setGenerando(false);
    }
  }

  async function handleLimpiar() {
    if (!confirm('¿Eliminar todas las asignaciones propuestas de este periodo?')) return;
    await api.delete(`/scheduling/limpiar/${periodoId}`);
    await cargarHorario();
    setResultado(null);
  }

  const asignacionesPorDia = diasOrden.map((dia) => ({
    dia,
    asignaciones: asignaciones
      .filter((a) => a.bloque.diaSemana === dia)
      .sort((a, b) => a.bloque.horaInicio.localeCompare(b.bloque.horaInicio)),
  }));

  if (cargando) return <p className="text-gray-400 text-sm">Cargando...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Horarios</h2>
        <div className="flex items-center gap-3">
          <select
            value={periodoId}
            onChange={(e) => setPeriodoId(parseInt(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {periodos.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
          <button
            onClick={handleLimpiar}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Limpiar
          </button>
          <button
            onClick={handleGenerar}
            disabled={generando}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {generando ? 'Generando...' : 'Generar horario'}
          </button>
        </div>
      </div>

      {resultado && (
        <div className={`mb-6 px-4 py-3 rounded-lg text-sm ${
          resultado.exito
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {resultado.mensaje}
        </div>
      )}

      {asignaciones.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">No hay horario generado para este periodo.</p>
          <p className="text-xs mt-1">Asegúrate de tener grupos, materias, profesores y disponibilidades configurados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {asignacionesPorDia.map(({ dia, asignaciones: asigDia }) => (
            asigDia.length > 0 && (
              <div key={dia}>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">{dia}</h3>
                <div className="space-y-2">
                  {asigDia.map((a) => (
                    <div
                      key={a.id}
                      className="bg-white border border-gray-200 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-blue-600">
                          {a.bloque.horaInicio} - {a.bloque.horaFin}
                        </span>
                        <span className="text-xs text-gray-400">{a.salon.nombre}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{a.materia.nombre}</p>
                      <p className="text-xs text-gray-500">{a.grupo.nombre} — {a.profesor.nombre}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}