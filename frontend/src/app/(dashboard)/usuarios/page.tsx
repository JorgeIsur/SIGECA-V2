'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Usuario } from '@/lib/types';
import Tabla from '@/components/ui/Tabla';
import Modal from '@/components/ui/Modal';

const roles = ['ADMIN', 'COORDINADOR', 'PROFESOR'];
const formInicial = { nombre: '', email: '', password: '', rol: 'COORDINADOR' };

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [form, setForm] = useState(formInicial);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => { cargarUsuarios(); }, []);

  async function cargarUsuarios() {
    try {
      const { data } = await api.get('/usuarios');
      setUsuarios(data);
    } finally {
      setCargando(false);
    }
  }

  function abrirCrear() {
    setUsuarioEditando(null);
    setForm(formInicial);
    setError('');
    setModalAbierto(true);
  }

  function abrirEditar(usuario: Usuario) {
    setUsuarioEditando(usuario);
    setForm({ nombre: usuario.nombre, email: usuario.email, password: '', rol: usuario.rol });
    setError('');
    setModalAbierto(true);
  }

  async function handleGuardar() {
    setError('');
    setGuardando(true);
    try {
      if (usuarioEditando) {
        const { password, ...resto } = form;
        await api.patch(`/usuarios/${usuarioEditando.id}`, password ? form : resto);
      } else {
        await api.post('/usuarios', form);
      }
      await cargarUsuarios();
      setModalAbierto(false);
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Ocurrió un error');
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(usuario: Usuario) {
    if (!confirm(`¿Desactivar al usuario ${usuario.nombre}?`)) return;
    await api.delete(`/usuarios/${usuario.id}`);
    await cargarUsuarios();
  }

  const columnas = [
    { header: 'Nombre', accessor: 'nombre' as keyof Usuario },
    { header: 'Email', accessor: 'email' as keyof Usuario },
    { header: 'Rol', accessor: 'rol' as keyof Usuario },
    {
      header: 'Estado',
      accessor: (u: Usuario) => u.activo
        ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Activo</span>
        : <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Inactivo</span>,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Usuarios</h2>
        <button onClick={abrirCrear} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          Agregar usuario
        </button>
      </div>

      {cargando ? <p className="text-gray-400 text-sm">Cargando...</p> : (
        <Tabla columnas={columnas} datos={usuarios} onEditar={abrirEditar} onEliminar={handleEliminar} />
      )}

      {modalAbierto && (
        <Modal titulo={usuarioEditando ? 'Editar usuario' : 'Agregar usuario'} onCerrar={() => setModalAbierto(false)}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {usuarioEditando ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
              </label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {roles.map((r) => <option key={r} value={r}>{r}</option>)}
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