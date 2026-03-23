interface ColumnaTabla<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
}

interface TablaProps<T> {
  columnas:ColumnaTabla<T>[];
  datos: T[];
  onEditar?: (row: T) => void;
  onEliminar?: (row: T) => void;
}

export default function Tabla<T extends { id: number }>({
  columnas,
  datos,
  onEditar,
  onEliminar,
}: TablaProps<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {columnas.map((col, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
            {(onEditar || onEliminar) && (
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {datos.length === 0 ? (
            <tr>
              <td
                colSpan={columnas.length + 1}
                className="px-4 py-8 text-center text-gray-400"
              >
                No hay registros
              </td>
            </tr>
          ) : (
            datos.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                {columnas.map((col, i) => (
                  <td key={i} className="px-4 py-3 text-gray-700">
                    {typeof col.accessor === 'function'
                      ? col.accessor(row)
                      : String(row[col.accessor] ?? '')}
                  </td>
                ))}
                {(onEditar || onEliminar) && (
                  <td className="px-4 py-3 text-right space-x-3">
                    {onEditar && (
                      <button
                        onClick={() => onEditar(row)}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Editar
                      </button>
                    )}
                    {onEliminar && (
                      <button
                        onClick={() => onEliminar(row)}
                        className="text-red-500 hover:underline text-xs"
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}