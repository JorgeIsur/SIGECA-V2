'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Salon } from '@/lib/types';
import Tabla from '@/components/ui/Tabla';
import Modal from '@/components/ui/Modal';

const tiposSalon = ['AULA', 'LABORATORIO', 'SALA_COMPUTO', 'AUDITORIO', 'TALLER'];
const formInicial = { nombre: '', edificio: '', capacidad: 30, tipo: 'AULA' };

export default function SalonesPage() {
  const [salones, setSalones] = useState<Salon[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [salonEditando, setSalonEditando] = useState<Salon | null>(null);
  const [form, setForm] = useState(formInicial);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => { cargarSalones(); }, []);

  async function cargarSalones() {
    try {
      const { data } = await api.get('/salones');
      setSalones(data);
    } finally {
      setCargando(false);
    }
  }

  function abrirCrear() {
    setSalonEditando(null);
    setForm(formInicial);
    setError('');
    setModalAbierto(true);
  }

  function abrirEditar(salon: Salon) {
    setSalonEditando(salon);
    setForm({
      nombre: salon.nombre,
      edificio: salon.edificio ?? '',
      capacidad: salon.capacidad,
      tipo: salon.tipo,
    });
    setError('');
    setModalAbierto(true);
  }

  async function handleGuardar() {
    setError('');
    setGuardando(true);
    try {
      if (salonEditando) {
        await api.patch(`/salones/${salonEditando.id}`, form);
      } else {
        await api.post('/salones', form);
      }
      await cargarSalones();
      setModalAbierto(false);
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Ocurrió un error');
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(salon: Salon) {
    if (!confirm(`¿Desactivar el salón ${salon.nombre}?`)) return;
    await api.delete(`/salones/${salon.id}`);
    await cargarSalones();
  }

  const columnas = [
    { header: 'Nombre', accessor: 'nombre' as keyof Salon },
    { header: 'Edificio', accessor: (s: Salon) => s.edificio ?? '—' },
    { header: 'Capacidad', accessor: 'capacidad' as keyof Salon },
    { header: 'Tipo', accessor: 'tipo' as keyof Salon },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Salones</h2>
        <button onClick={abrirCrear} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          Agregar salón
        </button>
      </div>

      {cargando ? <p className="text-gray-400 text-sm">Cargando...</p> : (
        <Tabla columnas={columnas} datos={salones} onEditar={abrirEditar} onEliminar={handleEliminar} />
      )}

      {modalAbierto && (
        <Modal titulo={salonEditando ? 'Editar salón' : 'Agregar salón'} onCerrar={() => setModalAbierto(false)}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Edificio</label>
              <input type="text" value={form.edificio} onChange={(e) => setForm({ ...form, edificio: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad</label>
              <input type="number" value={form.capacidad} onChange={(e) => setForm({ ...form, capacidad: parseInt(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {tiposSalon.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
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