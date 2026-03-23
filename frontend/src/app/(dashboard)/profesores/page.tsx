'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Profesor } from '@/lib/types';
import Tabla from '@/components/ui/Tabla';
import Modal from '@/components/ui/Modal';

export default function ProfesoresPage() {
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [profesorEditando, setProfesorEditando] = useState<Profesor | null>(null);
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '' });
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarProfesores();
  }, []);

  async function cargarProfesores() {
    try {
      const { data } = await api.get('/profesores');
      setProfesores(data);
    } finally {
      setCargando(false);
    }
  }

  function abrirCrear() {
    setProfesorEditando(null);
    setForm({ nombre: '', email: '', telefono: '' });
    setError('');
    setModalAbierto(true);
  }

  function abrirEditar(profesor: Profesor) {
    setProfesorEditando(profesor);
    setForm({
      nombre: profesor.nombre,
      email: profesor.email,
      telefono: profesor.telefono ?? '',
    });
    setError('');
    setModalAbierto(true);
  }

  async function handleGuardar() {
    setError('');
    setGuardando(true);

    try {
      if (profesorEditando) {
        await api.patch(`/profesores/${profesorEditando.id}`, form);
      } else {
        await api.post('/profesores', form);
      }
      await cargarProfesores();
      setModalAbierto(false);
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Ocurrió un error');
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(profesor: Profesor) {
    if (!confirm(`¿Desactivar a ${profesor.nombre}?`)) return;
    await api.delete(`/profesores/${profesor.id}`);
    await cargarProfesores();
  }

  const columnas = [
    { header: 'Nombre', accessor: 'nombre' as keyof Profesor },
    { header: 'Email', accessor: 'email' as keyof Profesor },
    { header: 'Teléfono', accessor: (p: Profesor) => p.telefono ?? '—' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Profesores</h2>
        <button
          onClick={abrirCrear}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Agregar profesor
        </button>
      </div>

      {cargando ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : (
        <Tabla
          columnas={columnas}
          datos={profesores}
          onEditar={abrirEditar}
          onEliminar={handleEliminar}
        />
      )}

      {modalAbierto && (
        <Modal
          titulo={profesorEditando ? 'Editar profesor' : 'Agregar profesor'}
          onCerrar={() => setModalAbierto(false)}
        >
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="text"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setModalAbierto(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                disabled={guardando}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}