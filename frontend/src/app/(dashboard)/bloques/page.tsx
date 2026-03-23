'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { BloqueHorario } from '@/lib/types';
import Tabla from '@/components/ui/Tabla';
import Modal from '@/components/ui/Modal';

const diasSemana = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
const formInicial = { diaSemana: 'LUNES', horaInicio: '07:00', horaFin: '08:00', duracionMin: 60 };

export default function BloquesPage() {
  const [bloques, setBloques] = useState<BloqueHorario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [bloqueEditando, setBloqueEditando] = useState<BloqueHorario | null>(null);
  const [form, setForm] = useState(formInicial);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => { cargarBloques(); }, []);

  async function cargarBloques() {
    try {
      const { data } = await api.get('/bloques-horario');
      setBloques(data);
    } finally {
      setCargando(false);
    }
  }

  function abrirCrear() {
    setBloqueEditando(null);
    setForm(formInicial);
    setError('');
    setModalAbierto(true);
  }

  function abrirEditar(bloque: BloqueHorario) {
    setBloqueEditando(bloque);
    setForm({
      diaSemana: bloque.diaSemana,
      horaInicio: bloque.horaInicio,
      horaFin: bloque.horaFin,
      duracionMin: bloque.duracionMin,
    });
    setError('');
    setModalAbierto(true);
  }

  async function handleGuardar() {
    setError('');
    setGuardando(true);
    try {
      if (bloqueEditando) {
        await api.patch(`/bloques-horario/${bloqueEditando.id}`, form);
      } else {
        await api.post('/bloques-horario', form);
      }
      await cargarBloques();
      setModalAbierto(false);
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Ocurrió un error');
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(bloque: BloqueHorario) {
    if (!confirm(`¿Eliminar el bloque ${bloque.diaSemana} ${bloque.horaInicio}?`)) return;
    await api.delete(`/bloques-horario/${bloque.id}`);
    await cargarBloques();
  }

  const columnas = [
    { header: 'Día', accessor: 'diaSemana' as keyof BloqueHorario },
    { header: 'Inicio', accessor: 'horaInicio' as keyof BloqueHorario },
    { header: 'Fin', accessor: 'horaFin' as keyof BloqueHorario },
    { header: 'Duración', accessor: (b: BloqueHorario) => `${b.duracionMin} min` },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Bloques horarios</h2>
        <button onClick={abrirCrear} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          Agregar bloque
        </button>
      </div>

      {cargando ? <p className="text-gray-400 text-sm">Cargando...</p> : (
        <Tabla columnas={columnas} datos={bloques} onEditar={abrirEditar} onEliminar={handleEliminar} />
      )}

      {modalAbierto && (
        <Modal titulo={bloqueEditando ? 'Editar bloque' : 'Agregar bloque'} onCerrar={() => setModalAbierto(false)}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Día</label>
              <select value={form.diaSemana} onChange={(e) => setForm({ ...form, diaSemana: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {diasSemana.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora inicio</label>
              <input type="time" value={form.horaInicio} onChange={(e) => setForm({ ...form, horaInicio: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora fin</label>
              <input type="time" value={form.horaFin} onChange={(e) => setForm({ ...form, horaFin: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duración (minutos)</label>
              <input type="number" value={form.duracionMin} onChange={(e) => setForm({ ...form, duracionMin: parseInt(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setModalAbierto(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancelar</button>
              <button onClick={handleGuardar} disabled={guardando}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}