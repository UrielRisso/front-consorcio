import { useState, useEffect } from 'react';

export function CobrosPage() {
  const [cobros, setCobros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroExtraordinaria, setFiltroExtraordinaria] = useState('');
  const [filtroUnidad, setFiltroUnidad] = useState('');

  useEffect(() => {
    obtenerCobros();
  }, []);

  const obtenerCobros = async () => {
    try {
      setCargando(true);
      setError(null);
      const res = await fetch('/api/cobros');
      if (!res.ok) throw new Error("No se pudo conectar con el servidor.");
      const data = await res.json();
      setCobros(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-600">Cargando expensas y alquileres...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-red-50 border border-red-200 rounded-xl text-center">
        <h2 className="text-red-700 font-bold mb-2">Error de Conexión</h2>
        <p className="text-sm text-red-600 mb-4">{error}</p>
        <button 
          onClick={obtenerCobros}
          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Filtrado de la lista
  const cobrosFiltrados = cobros.filter(c => {
    // Filtro por estado
    if (filtroEstado && c.estadoPago !== filtroEstado) {
      return false;
    }
    // Filtro por extraordinaria
    if (filtroExtraordinaria !== '') {
      const isExtra = filtroExtraordinaria === 'true';
      if (c.esExtraordinaria !== isExtra) {
        return false;
      }
    }
    // Filtro por unidad
    if (filtroUnidad && !c.unidad.toLowerCase().includes(filtroUnidad.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Obtener opciones únicas de estados de pago
  const estadosUnicos = [...new Set(cobros.map(c => c.estadoPago))];

  return (
    <div>
      <header className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Expensas y Alquileres</h1>
        <p className="text-gray-500">Consulta todos los cobros, filtra por estado, tipo y unidad.</p>
      </header>

      {/* Panel de Filtros */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado de Pago</label>
          <select 
            value={filtroEstado} 
            onChange={e => setFiltroEstado(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="">Todos</option>
            {estadosUnicos.map(estado => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Gasto</label>
          <select 
            value={filtroExtraordinaria} 
            onChange={e => setFiltroExtraordinaria(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="">Todos</option>
            <option value="false">Ordinaria / Alquiler</option>
            <option value="true">Extraordinaria (Sólo Expensas)</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
          <input 
            type="text" 
            placeholder="Buscar por unidad..."
            value={filtroUnidad}
            onChange={e => setFiltroUnidad(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
        
        <div className="flex items-end">
          <button 
            onClick={() => {
              setFiltroEstado('');
              setFiltroExtraordinaria('');
              setFiltroUnidad('');
            }}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Tabla de Resultados */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Periodo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concepto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimiento</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cobrosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No se encontraron resultados con los filtros actuales.
                  </td>
                </tr>
              ) : (
                cobrosFiltrados.map(c => (
                  <tr key={`${c.tipoCobro}-${c.id}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        c.tipoCobro === 'Expensa' 
                          ? (c.esExtraordinaria ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800')
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {c.tipoCobro} {c.esExtraordinaria && '(Ext)'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {c.unidad}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {c.periodo}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm max-w-xs truncate">
                      {c.concepto}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
                      {new Date(c.fechaVencimiento).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-gray-900">
                      ${c.monto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        c.estadoPago.toLowerCase().includes('pagado') ? 'bg-green-100 text-green-800' :  
                        c.estadoPago.toLowerCase().includes('disponible') ? 'bg-violet-100 text-violet-800' :  
                        c.estadoPago.toLowerCase().includes('pendiente') ? 'bg-yellow-100 text-yellow-800' :  
                        c.estadoPago.toLowerCase().includes('común') ? 'bg-blue-100 text-blue-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {c.estadoPago}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
