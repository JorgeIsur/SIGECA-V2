'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { href: '/dashboard', label: 'Inicio', roles: ['ADMIN', 'COORDINADOR', 'PROFESOR'] },
  { href: '/profesores', label: 'Profesores', roles: ['ADMIN', 'COORDINADOR'] },
  { href: '/materias', label: 'Materias', roles: ['ADMIN', 'COORDINADOR'] },
  { href: '/salones', label: 'Salones', roles: ['ADMIN', 'COORDINADOR'] },
  { href: '/grupos', label: 'Grupos', roles: ['ADMIN', 'COORDINADOR'] },
  { href: '/periodos', label: 'Periodos escolares', roles: ['ADMIN', 'COORDINADOR'] },
  { href: '/bloques', label: 'Bloques horarios', roles: ['ADMIN'] },
  { href: '/disponibilidad', label: 'Disponibilidad', roles: ['ADMIN', 'COORDINADOR'] },
  { href: '/usuarios', label: 'Usuarios', roles: ['ADMIN'] },
  { href: '/horarios', label: 'Horarios', roles: ['ADMIN', 'COORDINADOR', 'PROFESOR'] },
];

export default function Sidebar() {
  const { usuario, logout } = useAuth();
  const pathname = usePathname();

  const itemsVisibles = navItems.filter((item) =>
    item.roles.includes(usuario?.rol ?? ''),
  );

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="px-6 py-5 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-900">SIGECA v2</h1>
        <p className="text-xs text-gray-500 mt-0.5">Gestión de carga académica</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {itemsVisibles.map((item) => {
          const activo = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                activo
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-gray-200">
        <p className="text-sm font-medium text-gray-900">{usuario?.nombre}</p>
        <p className="text-xs text-gray-500">{usuario?.rol}</p>
        <button
          onClick={logout}
          className="mt-3 text-xs text-red-600 hover:underline"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
