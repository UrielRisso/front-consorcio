import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

export function UnidadesPage() {
  const [unidades, setUnidades] = useState([]);
  const [personas, setPersonas] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    obtenerUnidades();
  }, []);

  const obtenerUnidades = async () => {
    try {
      setCargando(true);
      setError(null);
      
      console.log("data",`/api/unidades`)
      const res = await fetch(`/api/unidades`);
      console.log("data",res)
      if (!res.ok) throw new Error("No se pudo conectar con el servidor.");
      const data = await res.json();
      setUnidades(data);
    } catch (err) {
      console.log("data",err.message)
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };



  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-600">Cargando unidades desde la API...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-red-50 border border-red-200 rounded-xl text-center">
        <h2 className="text-red-700 font-bold mb-2">Error de Conexión</h2>
        <p className="text-sm text-red-600 mb-4">{error}</p>
        <button 
          onClick={obtenerUnidades}
          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!unidades || unidades.length === 0) {
    return <p className="text-center text-gray-500 my-8">No se encontraron unidades registradas.</p>;
  }

  return (
    <div>
      <header className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Listado de Unidades</h1>
        <p className="text-gray-500">Selecciona una tarjeta para ver la información detallada.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {unidades.map((u) => (
          <div 
            key={u.id}
            onClick={() => navigate(`/unidades/${u.id}`, { state: { unidad: u } })}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">{u.piso + "°" + u.nombre || `Unidad #${u.id}`}</h2>
              <div className="space-y-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between">
                  <span>Propietario:</span>
                  <span className="font-semibold text-gray-900">
                    {u.propietarios && u.propietarios.length > 0 ? `${u.propietarios[0].dueño.apellido}, ${u.propietarios[0].dueño.nombre}` : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Responsable de pago:</span>
                  <span className="font-semibold text-gray-900">
                    {u.responsablesPago && u.responsablesPago.length > 0 ? `${u.responsablesPago[0].responsable.apellido}, ${u.responsablesPago[0].responsable.nombre}` : ''}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between items-center text-primary font-medium text-sm">
              <span>Ver detalle</span>
              <span>&rarr;</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}