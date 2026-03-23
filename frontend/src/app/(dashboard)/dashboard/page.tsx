'use client';

import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { usuario } = useAuth();

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900">
        Bienvenido, {usuario?.nombre}
      </h2>
      <p className="text-gray-500 mt-1 text-sm">
        Estás conectado como <span className="font-medium">{usuario?.rol}</span>
      </p>
    </div>
  );
}