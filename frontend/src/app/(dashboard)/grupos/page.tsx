'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Grupo, PeriodoEscolar, Materia } from '@/lib/types';
import Tabla from '@/components/ui/Tabla';
import Modal from '@/components/ui/Modal';

const formInicial = { nombre: '', semestre: 1, carrera: '', cupo: 30, periodoId: 0 };

export default function GruposPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [periodos, setPeriodos] = useState<PeriodoEscolar[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [grupoEditando, setGrupoEditando] = useState<Grupo | null>(null);
  const [form, setForm] = useState(formInicial);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const [materias, setMaterias] = useState<Materia[]>([]);
  const [modalMaterias, setModalMaterias] = useState(false);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<Grupo | null>(null);
  const [materiasAsignadas, setMateriasAsignadas] = useState<number[]>([]);

  useEffect(() => { cargarDatos(); }, []);

  async function cargarDatos() {
    try {
      const [{ data: g }, { data: p }, { data: m }] = await Promise.all([
        api.get('/grupos'),
        api.get('/periodos-escolares'),
        api.get('/materias'),
      ]);
      setGrupos(g);
      setPeriodos(p);
      setMaterias(m);
      if (p.length > 0) {
        formInicial.periodoId = p[0].id;
      }
    } finally {
      setCargando(false);
    }
  }

  function abrirCrear() {
    setGrupoEditando(null);
    setForm({ ...formInicial, periodoId: periodos[0]?.id ?? 0 });
    setError('');
    setModalAbierto(true);
  }

  function abrirEditar(grupo: Grupo) {
    setGrupoEditando(grupo);
    setForm({
      nombre: grupo.nombre,
      semestre: grupo.semestre,
      carrera: grupo.carrera,
      cupo: grupo.cupo,
      periodoId: grupo.periodoId,
    });
    setError('');
    setModalAbierto(true);
  }

  async function handleGuardar() {
    setError('');
    setGuardando(true);
    try {
      if (grupoEditando) {
        await api.patch(`/grupos/${grupoEditando.id}`, form);
      } else {
        await api.post('/grupos', form);
      }
      await cargarDatos();
      setModalAbierto(false);
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Ocurrió un error');
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(grupo: Grupo) {
    if (!confirm(`¿Eliminar el grupo ${grupo.nombre}?`)) return;
    await api.delete(`/grupos/${grupo.id}`);
    await cargarDatos();
  }

  const columnas = [
    { header: 'Nombre', accessor: 'nombre' as keyof Grupo },
    { header: 'Carrera', accessor: 'carrera' as keyof Grupo },
    { header: 'Semestre', accessor: 'semestre' as keyof Grupo },
    { header: 'Cupo', accessor: 'cupo' as keyof Grupo },
    { header: 'Periodo', accessor: (g: Grupo) => g.periodo?.nombre ?? '—' },
    {
      header: 'Materias',
      accessor: (g: Grupo) => (
        <button
          onClick={() => abrirMaterias(g)}
          className="text-xs text-purple-600 hover:underline"
        >
          Gestionar
        </button>
      ),
    },
  ];

  async function abrirMaterias(grupo: Grupo) {
    setGrupoSeleccionado(grupo);
    const { data } = await api.get(`/grupos/${grupo.id}`);
    const ids = data.materias.map((mg: any) => mg.materiaId);
    setMateriasAsignadas(ids);
    setModalMaterias(true);
  }

  async function toggleMateria(materiaId: number) {
    if (!grupoSeleccionado) return;
    const asignada = materiasAsignadas.includes(materiaId);
    if (asignada) {
      await api.delete(`/grupos/${grupoSeleccionado.id}/materias/${materiaId}`);
      setMateriasAsignadas(materiasAsignadas.filter((id) => id !== materiaId));
    } else {
      await api.post(`/grupos/${grupoSeleccionado.id}/materias/${materiaId}`);
      setMateriasAsignadas([...materiasAsignadas, materiaId]);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Grupos</h2>
        <button
          onClick={abrirCrear}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Agregar grupo
        </button>
      </div>

      {cargando ? <p className="text-gray-400 text-sm">Cargando...</p> : (
        <Tabla columnas={columnas} datos={grupos} onEditar={abrirEditar} onEliminar={handleEliminar} />
      )}

      {modalAbierto && (
        <Modal
          titulo={grupoEditando ? 'Editar grupo' : 'Agregar grupo'}
          onCerrar={() => setModalAbierto(false)}
        >
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input type="text" value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej: ISC-3A"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Carrera</label>
              <input type="text" value={form.carrera}
                onChange={(e) => setForm({ ...form, carrera: e.target.value })}
                placeholder="Ej: ISC"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semestre</label>
              <input type="number" value={form.semestre} min={1} max={12}
                onChange={(e) => setForm({ ...form, semestre: parseInt(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cupo</label>
              <input type="number" value={form.cupo} min={1}
                onChange={(e) => setForm({ ...form, cupo: parseInt(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Periodo escolar</label>
              <select value={form.periodoId}
                onChange={(e) => setForm({ ...form, periodoId: parseInt(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {periodos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setModalAbierto(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
                Cancelar
              </button>
              <button onClick={handleGuardar} disabled={guardando}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </Modal>
      )}
      {modalMaterias && grupoSeleccionado && (
        <Modal
          titulo={`Materias — ${grupoSeleccionado.nombre}`}
          onCerrar={() => setModalMaterias(false)}
        >
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {materias.length === 0 ? (
              <p className="text-sm text-gray-400">No hay materias registradas.</p>
            ) : (
              materias.map((materia) => {
                const asignada = materiasAsignadas.includes(materia.id);
                return (
                  <button
                    key={materia.id}
                    onClick={() => toggleMateria(materia.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-colors ${
                      asignada
                        ? 'bg-purple-50 border-purple-200 text-purple-800'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {asignada ? '✓ ' : ''}{materia.clave} — {materia.nombre}
                  </button>
                );
              })
            )}
          </div>
          <div className="pt-3 flex justify-end">
            <button
              onClick={() => setModalMaterias(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Cerrar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}