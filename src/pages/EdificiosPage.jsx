import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function EdificiosPage() {
  const { user, isSuperAdmin, edificiosAdministrados, token, obtenerEdificios } = useAuth();
  const [actualizando, setActualizando] = useState(false);
  const [filtro, setFiltro] = useState("");
  const navigate = useNavigate();

  const handleRefrescar = async () => {
    try {
      setActualizando(true);
      await obtenerEdificios(token);
    } finally {
      setActualizando(false);
    }
  };

  const edificiosFiltrados = (edificiosAdministrados || []).filter((e) => {
    const texto = `${e.nombre || ""} ${e.direccion || ""} ${e.ciudad || ""}`.toLowerCase();
    return texto.includes(filtro.toLowerCase());
  });

  const rolLabel = isSuperAdmin ? "SuperAdministrador" : "Administrador";
  const tituloLabel = isSuperAdmin ? "Edificios Registrados" : "Mis Edificios";
  const subtituloLabel = isSuperAdmin
    ? `Vista exclusiva para el SuperAdministrador. Total de edificios: ${edificiosAdministrados?.length || 0}`
    : `Edificios que administrás. Total: ${edificiosAdministrados?.length || 0}`;

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-gray-200 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {tituloLabel}
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-100/30 text-brand-900">
              {rolLabel}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">{subtituloLabel}</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefrescar}
            disabled={actualizando}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-50"
          >
            <svg
              className={`-ml-1 mr-2 h-4 w-4 text-gray-500 ${actualizando ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {actualizando ? "Actualizando..." : "Recargar Edificios"}
          </button>
        </div>
      </div>

      {/* Barra de Búsqueda */}
      <div className="max-w-md">
        <div className="relative rounded-xl shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Buscar por nombre, dirección o ciudad..."
            className="block w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Grid de Edificios */}
      {edificiosFiltrados.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-3 flex items-center justify-center bg-gray-100 rounded-full">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900">No se encontraron edificios</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filtro ? "No hay resultados que coincidan con la búsqueda." : "No hay edificios asignados a tu cuenta."}
          </p>
          {filtro && (
            <button
              onClick={() => setFiltro("")}
              className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Limpiar filtro
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {edificiosFiltrados.map((edificio) => (
            <div
              key={edificio.id || edificio.nombre}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition transform hover:-translate-y-1 p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 bg-brand-100/30 text-brand-900 rounded-xl flex items-center justify-center font-bold text-lg mb-3">
                    {edificio.nombre ? edificio.nombre.charAt(0).toUpperCase() : "E"}
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
                    ID #{edificio.id ?? "-"}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {edificio.nombre || "Edificio sin nombre"}
                </h2>
                <p className="text-sm text-gray-500 flex items-center mb-4">
                  <svg className="h-4 w-4 mr-1 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {edificio.direccion || "Dirección no especificada"}
                  {edificio.ciudad ? `, ${edificio.ciudad}` : ""}
                </p>

                {/* Métricas del edificio */}
                <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-3 text-sm">
                  <div>
                    <span className="text-xs text-gray-500 block">Pisos</span>
                    <span className="font-semibold text-gray-800">
                      {edificio.cantidadPisos ?? edificio.pisos ?? "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Unidades</span>
                    <span className="font-semibold text-gray-800">
                      {edificio.cantidadUnidades ?? edificio.unidades ?? "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => navigate(`/edificios/${edificio.id}`, { state: { edificio } })}
                  className="text-sm font-semibold text-primary hover:text-brand-100 flex items-center"
                >
                  Ver Unidades
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
