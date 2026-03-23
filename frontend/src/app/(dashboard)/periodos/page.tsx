'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { PeriodoEscolar } from '@/lib/types';
import Tabla from '@/components/ui/Tabla';
import Modal from '@/components/ui/Modal';

const formInicial = { nombre: '', fechaInicio: '', fechaFin: '' };

export default function PeriodosPage() {
  const [periodos, setPeriodos] = useState<PeriodoEscolar[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [periodoEditando, setPeriodoEditando] = useState<PeriodoEscolar | null>(null);
  const [form, setForm] = useState(formInicial);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => { cargarPeriodos(); }, []);

  async function cargarPeriodos() {
    try {
      const { data } = await api.get('/periodos-escolares');
      setPeriodos(data);
    } finally {
      setCargando(false);
    }
  }

  function abrirCrear() {
    setPeriodoEditando(null);
    setForm(formInicial);
    setError('');
    setModalAbierto(true);
  }

  function abrirEditar(periodo: PeriodoEscolar) {
    setPeriodoEditando(periodo);
    setForm({
      nombre: periodo.nombre,
      fechaInicio: periodo.fechaInicio.split('T')[0],
      fechaFin: periodo.fechaFin.split('T')[0],
    });
    setError('');
    setModalAbierto(true);
  }

  async function handleGuardar() {
    setError('');
    setGuardando(true);
    try {
      if (periodoEditando) {
        await api.patch(`/periodos-escolares/${periodoEditando.id}`, form);
      } else {
        await api.post('/periodos-escolares', form);
      }
      await cargarPeriodos();
      setModalAbierto(false);
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Ocurrió un error');
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(periodo: PeriodoEscolar) {
    if (!confirm(`¿Eliminar el periodo ${periodo.nombre}?`)) return;
    await api.delete(`/periodos-escolares/${periodo.id}`);
    await cargarPeriodos();
  }

  async function handleActivar(periodo: PeriodoEscolar) {
    if (!confirm(`¿Activar el periodo ${periodo.nombre}? Se desactivarán los demás.`)) return;
    await api.patch(`/periodos-escolares/${periodo.id}`, { activo: true });
    await cargarPeriodos();
  }

  const columnas = [
    { header: 'Nombre', accessor: 'nombre' as keyof PeriodoEscolar },
    { header: 'Inicio', accessor: (p: PeriodoEscolar) => p.fechaInicio.split('T')[0] },
    { header: 'Fin', accessor: (p: PeriodoEscolar) => p.fechaFin.split('T')[0] },
    {
      header: 'Estado',
      accessor: (p: PeriodoEscolar) =>
        p.activo ? (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Activo</span>
        ) : (
          <button onClick={() => handleActivar(p)} className="text-xs text-blue-600 hover:underline">
            Activar
          </button>
        ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Periodos escolares</h2>
        <button onClick={abrirCrear} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          Agregar periodo
        </button>
      </div>

      {cargando ? <p className="text-gray-400 text-sm">Cargando...</p> : (
        <Tabla columnas={columnas} datos={periodos} onEditar={abrirEditar} onEliminar={handleEliminar} />
      )}

      {modalAbierto && (
        <Modal titulo={periodoEditando ? 'Editar periodo' : 'Agregar periodo'} onCerrar={() => setModalAbierto(false)}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej: Enero-Junio 2025"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
              <input type="date" value={form.fechaInicio} onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
              <input type="date" value={form.fechaFin} onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
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