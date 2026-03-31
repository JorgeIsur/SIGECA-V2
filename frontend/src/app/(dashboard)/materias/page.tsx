'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Materia, Profesor } from '@/lib/types';
import Tabla from '@/components/ui/Tabla';
import Modal from '@/components/ui/Modal';

const formInicial = {
  nombre: '',
  clave: '',
  horasSemanales: 0,
  creditos: 0,
  carrera: '',
  semestre: 1,
};

export default function MateriasPage() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [materiaEditando, setMateriaEditando] = useState<Materia | null>(null);
  const [form, setForm] = useState(formInicial);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [modalProfesores, setModalProfesores] = useState(false);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState<Materia | null>(null);
  const [profesoresAsignados, setProfesoresAsignados] = useState<number[]>([]);

  useEffect(() => { cargarMaterias(); }, []);

  async function cargarMaterias() {
    try {
      const [{ data: m }, { data: p }] = await Promise.all([
        api.get('/materias'),
        api.get('/profesores'),
      ]);
      setMaterias(m);
      setProfesores(p);
    } finally {
      setCargando(false);
    }
  }

  function abrirCrear() {
    setMateriaEditando(null);
    setForm(formInicial);
    setError('');
    setModalAbierto(true);
  }

  function abrirEditar(materia: Materia) {
    setMateriaEditando(materia);
    setForm({
      nombre: materia.nombre,
      clave: materia.clave,
      horasSemanales: materia.horasSemanales,
      creditos: materia.creditos,
      carrera: materia.carrera,
      semestre: materia.semestre,
    });
    setError('');
    setModalAbierto(true);
  }

  async function handleGuardar() {
    setError('');
    setGuardando(true);
    try {
      if (materiaEditando) {
        await api.patch(`/materias/${materiaEditando.id}`, form);
      } else {
        await api.post('/materias', form);
      }
      await cargarMaterias();
      setModalAbierto(false);
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Ocurrió un error');
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(materia: Materia) {
    if (!confirm(`¿Desactivar la materia ${materia.nombre}?`)) return;
    await api.delete(`/materias/${materia.id}`);
    await cargarMaterias();
  }

  const columnas = [
    { header: 'Clave', accessor: 'clave' as keyof Materia },
    { header: 'Nombre', accessor: 'nombre' as keyof Materia },
    { header: 'Carrera', accessor: 'carrera' as keyof Materia },
    { header: 'Semestre', accessor: 'semestre' as keyof Materia },
    { header: 'Horas', accessor: 'horasSemanales' as keyof Materia },
    { header: 'Créditos', accessor: 'creditos' as keyof Materia },
    {
      header: 'Profesores',
      accessor: (m: Materia) => (
        <button
          onClick={() => abrirProfesores(m)}
          className="text-xs text-purple-600 hover:underline"
        >
          Gestionar
        </button>
      ),
    },
  ];

  async function abrirProfesores(materia: Materia) {
    setMateriaSeleccionada(materia);
    const { data } = await api.get(`/materias/${materia.id}`);
    const ids = data.profesores.map((mp: any) => mp.profesorId);
    setProfesoresAsignados(ids);
    setModalProfesores(true);
  }

  async function toggleProfesor(profesorId: number) {
    if (!materiaSeleccionada) return;
    const asignado = profesoresAsignados.includes(profesorId);
    if (asignado) {
      await api.delete(`/materias/${materiaSeleccionada.id}/profesores/${profesorId}`);
      setProfesoresAsignados(profesoresAsignados.filter((id) => id !== profesorId));
    } else {
      await api.post(`/materias/${materiaSeleccionada.id}/profesores/${profesorId}`);
      setProfesoresAsignados([...profesoresAsignados, profesorId]);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Materias</h2>
        <button
          onClick={abrirCrear}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Agregar materia
        </button>
      </div>

      {cargando ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : (
        <Tabla columnas={columnas} datos={materias} onEditar={abrirEditar} onEliminar={handleEliminar} />
      )}

      {modalAbierto && (
        <Modal
          titulo={materiaEditando ? 'Editar materia' : 'Agregar materia'}
          onCerrar={() => setModalAbierto(false)}
        >
          <div className="space-y-3">
            {[
              { label: 'Nombre', key: 'nombre', type: 'text' },
              { label: 'Clave', key: 'clave', type: 'text' },
              { label: 'Carrera', key: 'carrera', type: 'text' },
              { label: 'Semestre', key: 'semestre', type: 'number' },
              { label: 'Horas semanales', key: 'horasSemanales', type: 'number' },
              { label: 'Créditos', key: 'creditos', type: 'number' },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={(e) =>
                    setForm({
                        ...form,
                        [key]: type === 'number' ? (e.target.value === '' ? 0 : parseInt(e.target.value)) : e.target.value,
                    })
                    }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setModalAbierto(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
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
      {modalProfesores && materiaSeleccionada && (
        <Modal
          titulo={`Profesores — ${materiaSeleccionada.nombre}`}
          onCerrar={() => setModalProfesores(false)}
        >
          <div className="space-y-2">
            {profesores.length === 0 ? (
              <p className="text-sm text-gray-400">No hay profesores registrados.</p>
            ) : (
              profesores.map((profesor) => {
                const asignado = profesoresAsignados.includes(profesor.id);
                return (
                  <button
                    key={profesor.id}
                    onClick={() => toggleProfesor(profesor.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-colors ${
                      asignado
                        ? 'bg-purple-50 border-purple-200 text-purple-800'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {asignado ? '✓ ' : ''}{profesor.nombre}
                  </button>
                );
              })
            )}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setModalProfesores(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Cerrar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}