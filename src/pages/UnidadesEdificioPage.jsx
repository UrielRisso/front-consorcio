import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function periodoActual() {
  const hoy = new Date();
  const y = hoy.getFullYear();
  const m = String(hoy.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function vencimientoPorDefecto() {
  const hoy = new Date();
  const mesNext = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 15);
  return mesNext.toISOString().split("T")[0];
}

function formatoMoneda(n) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(n ?? 0);
}

function formatoFecha(isoStr) {
  if (!isoStr) return "-";
  return new Date(isoStr).toLocaleDateString("es-AR");
}

function Modal({ titulo, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{titulo}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-4 flex-1">{children}</div>
      </div>
    </div>
  );
}

function ModalGenerarAlquileres({ edificioId, usuarioId, onClose, onSuccess }) {
  const [periodo, setPeriodo] = useState(periodoActual());
  const [fechaVencimiento, setFechaVencimiento] = useState(vencimientoPorDefecto());
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerarExpensas = async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/edificios/${edificioId}/generar-expensas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          periodo,
          fechaVencimiento: new Date(fechaVencimiento).toISOString(),
          usuarioCargaId: usuarioId ?? null,
        }),
      });
      const data = await res.json();
      if (res.ok) { setResultado(data); onSuccess?.(); }
      else if (res.status === 409) { setError(data.mensaje ?? "Ya existen alquileres para ese periodo."); }
      else { setError(data.mensaje ?? "Error al generar alquileres."); }
    } catch { setError("Error de conexion con el servidor."); }
    finally { setCargando(false); }
  };

  const handleGenerarAlquileres = async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/edificios/${edificioId}/generar-alquileres`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          periodo,
          fechaVencimiento: new Date(fechaVencimiento).toISOString(),
          usuarioCargaId: usuarioId ?? null,
        }),
      });
      const data = await res.json();
      if (res.ok) { setResultado(data); onSuccess?.(); }
      else if (res.status === 409) { setError(data.mensaje ?? "Ya existen alquileres para ese periodo."); }
      else { setError(data.mensaje ?? "Error al generar alquileres."); }
    } catch { setError("Error de conexion con el servidor."); }
    finally { setCargando(false); }
  };

  return (
    <Modal titulo="Generar Cuotas de Alquiler" onClose={onClose}>
      {resultado ? (
        <div className="space-y-4">
          <div className="flex items-center justify-center h-14 w-14 mx-auto bg-green-100 rounded-full">
            <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-center font-semibold text-gray-900">{resultado.mensaje}</p>
          <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-gray-500">Alquileres/Expensas generados:</span><span className="font-bold text-green-700">{resultado.generados}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Ya existian:</span><span className="font-medium text-gray-700">{resultado.omitidos ?? 0}</span></div>
          </div>
          <button onClick={onClose} className="w-full mt-2 px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-brand-100 transition">Cerrar</button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Se generara una cuota de alquiler para cada unidad con monto definido o cuotas de expensas para cada unidad en base al coeficiente. No se duplicaran cuotas del mismo periodo.</p>
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Periodo</label>
            <input type="month" value={periodo} onChange={(e) => setPeriodo(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Vencimiento</label>
            <input type="date" value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
            <p className="text-xs text-gray-400 mt-1">Por defecto: dia 15 del mes siguiente.</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition">Cancelar</button>
            <button onClick={handleGenerarAlquileres} disabled={cargando || !periodo || !fechaVencimiento}
              className="flex-1 px-4 py-2.5 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-100 transition disabled:opacity-50">
              {cargando ? "Generando..." : "Generar Alquileres"}
            </button>
            <button onClick={handleGenerarExpensas} disabled={cargando || !periodo || !fechaVencimiento}
              className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-brand-100 transition disabled:opacity-50">
              {cargando ? "Generando..." : "Generar Expensas"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function ModalAgregarGasto({ edificioId, usuarioId, unidades, onClose, onSuccess }) {
  const [concepto, setConcepto] = useState("");
  const [monto, setMonto] = useState("");
  const [periodo, setPeriodo] = useState(periodoActual());
  const [fechaVencimiento, setFechaVencimiento] = useState(vencimientoPorDefecto());
  const [esExtraordinaria, setEsExtraordinaria] = useState(false);
  const [unidadId, setUnidadId] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const handleArchivoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) { setArchivo(null); return; }
    if (file.type !== "application/pdf") {
      setError("Solo se permiten archivos PDF como comprobante.");
      e.target.value = "";
      return;
    }
    setError(null);
    setArchivo(file);
  };

  const handleGuardar = async () => {
    if (!concepto.trim() || !monto || Number(monto) <= 0) {
      setError("Completa el concepto y un monto válido.");
      return;
    }
    if (esExtraordinaria && !unidadId) {
      setError("Selecciona la unidad a la que se imputa el gasto extraordinario.");
      return;
    }
    setCargando(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("concepto", concepto.trim());
      formData.append("monto", String(Number(monto)));
      formData.append("periodo", periodo);
      formData.append("fechaVencimiento", new Date(fechaVencimiento).toISOString());
      formData.append("esExtraordinaria", String(esExtraordinaria));
      if (usuarioId != null) formData.append("usuarioCargaId", String(usuarioId));
      if (esExtraordinaria && unidadId) formData.append("unidadId", String(unidadId));
      if (archivo) formData.append("archivo", archivo);

      const res = await fetch(`/api/edificios/${edificioId}/gastos-comunes`, {
        method: "POST",
        body: formData,
        // NO ponemos Content-Type — el browser lo setea automático con boundary
      });
      const data = await res.json();
      if (res.ok) { onSuccess?.(); onClose(); }
      else { setError(data.mensaje ?? "Error al guardar el gasto."); }
    } catch { setError("Error de conexión con el servidor."); }
    finally { setCargando(false); }
  };

  return (
    <Modal titulo="Agregar Gasto" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          Los gastos ordinarios se acumulan y se distribuyen por coeficiente al generar expensas.
          Los extraordinarios se imputan directamente a la unidad indicada.
        </p>
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}

        {/* Concepto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Concepto *</label>
          <input type="text" value={concepto} onChange={(e) => setConcepto(e.target.value)}
            placeholder="Ej: Limpieza, Mantenimiento ascensor, Gas espacios comunes..."
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
        </div>

        {/* Monto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 text-sm">$</span>
            <input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} min="0" step="0.01"
              className="w-full border border-gray-300 rounded-xl pl-7 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {/* Periodo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Periodo</label>
          <input type="month" value={periodo} onChange={(e) => setPeriodo(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
        </div>

        {/* Fecha vencimiento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Vencimiento</label>
          <input type="date" value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
          <p className="text-xs text-gray-400 mt-1">Por defecto: día 15 del mes siguiente.</p>
        </div>

        {/* Checkbox extraordinaria */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={esExtraordinaria} onChange={(e) => { setEsExtraordinaria(e.target.checked); setUnidadId(""); }}
            className="w-4 h-4 text-blue-600 rounded" />
          <span className="text-sm text-gray-700">Es un gasto extraordinario</span>
        </label>

        {/* Selector de unidad (solo si es extraordinaria) */}
        {esExtraordinaria && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
            <p className="text-xs text-amber-700 font-medium">
              Los gastos extraordinarios se imputan directamente a una unidad (monto completo, sin prorrateo).
            </p>
            <label className="block text-sm font-medium text-gray-700">Unidad a imputar *</label>
            <select
              value={unidadId}
              onChange={(e) => setUnidadId(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">— Seleccionar unidad —</option>
              {(unidades ?? []).map((u) => (
                <option key={u.id} value={u.id}>
                  {u.piso}° {u.nombre}
                  {u.propietarios?.length > 0
                    ? ` — ${u.propietarios[0].dueño.apellido}, ${u.propietarios[0].dueño.nombre}`
                    : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Adjuntar PDF */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comprobante / Factura (PDF opcional)
          </label>
          <div className="flex items-center gap-3">
            <label className="flex-1 cursor-pointer">
              <div className={`border-2 border-dashed rounded-xl px-4 py-3 text-sm text-center transition ${
                archivo ? "border-green-400 bg-green-50 text-green-700" : "border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500"
              }`}>
                {archivo ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {archivo.name}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Seleccionar PDF
                  </span>
                )}
              </div>
              <input type="file" accept=".pdf,application/pdf" onChange={handleArchivoChange} className="hidden" />
            </label>
            {archivo && (
              <button onClick={() => setArchivo(null)} className="text-gray-400 hover:text-red-500 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition">Cancelar</button>
          <button onClick={handleGuardar} disabled={cargando}
            className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-brand-100 transition disabled:opacity-50">
            {cargando ? "Guardando..." : "Guardar Gasto"}
          </button>
        </div>
      </div>
    </Modal>
  );
}


export function UnidadesEdificioPage() {
  // Extraemos el id de la URL (ruta: /edificios/:id/unidades)
  const { id: edificioId } = useParams();

  // Obtenemos el usuario logueado para registrar quién hace la carga
  const { user } = useAuth();
  const usuarioId = user?.id || user?.UsuarioId;
  
      console.log("usuario", usuarioId)
      
      console.log("usuario", user)
  const [unidades, setUnidades] = useState([]);
  const [edificio, setEdificio] = useState(null);

  // Estados para controlar la visibilidad de los modales
  const [modalAlquileresAbierto, setModalAlquileresAbierto] = useState(false);
  const [modalGastosAbierto, setModalGastosAbierto] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleExitoOperacion = useCallback(() => {
    // Aquí puedes agregar la lógica para recargar la tabla de unidades o gastos
    console.log("Operación completada con éxito. Actualizando datos...");
  }, []);
  
  useEffect(() => {
    obtenerEdificio()
    obtenerUnidades();
  }, []);

  const obtenerUnidades = async () => {
    try {
      setCargando(true);
      setError(null);

      console.log("data", `/api/unidades`)
      const res = await fetch(`/api/edificios/${edificioId}/unidades`);
      console.log("data", res)
      if (!res.ok) throw new Error("No se pudo conectar con el servidor.");
      const data = await res.json();
      setUnidades(data);
    } catch (err) {
      console.log("data", err.message)
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const obtenerEdificio = async () => {
    try {
      setCargando(true);
      setError(null);

      console.log("data", `/api/unidades`)
      const res = await fetch(`/api/edificios/${edificioId}`);

      if (!res.ok) throw new Error("No se pudo conectar con el servidor.");
      const data = await res.json();
      console.log("dataE", data)
      setEdificio(data);
    } catch (err) {
      console.log("data", err.message)
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header con título y botones de acción */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Unidades</h1>
          <p className="text-gray-500 text-sm mt-1">Administrando edificio ID: {edificioId}</p>
        </div>


        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setModalAlquileresAbierto(true)}
            className="px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-brand-100 transition shadow-sm flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Generar Alquileres/Expensas
          </button>

          <button
            onClick={() => setModalGastosAbierto(true)}
            className="px-4 py-2.5 border border-gray-300 text-gray-700 bg-white rounded-xl font-medium hover:bg-gray-50 transition shadow-sm flex items-center gap-2"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Agregar Gasto
          </button>
        </div>
        
      </div>
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {edificio?.nombre || "Edificio sin nombre"}
            </h2>
            <p className="text-sm text-gray-500 flex items-center mb-4">
              <svg className="h-4 w-4 mr-1 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {edificio?.direccion || "Dirección no especificada"}
              {edificio?.ciudad ? `, ${edificio?.ciudad}` : ""}
            </p>
          </div>
        <div className="flex flex-wrap gap-3">
          

          {/* Métricas del edificio */}
          <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-3 text-sm">
            <div>
              <span className="text-xs text-gray-500 block">Pisos</span>
              <span className="font-semibold text-gray-800">
                {edificio?.cantidadPisos ?? edificio?.pisos ?? "-"}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Unidades</span>
              <span className="font-semibold text-gray-800">
                {edificio?.cantidadUnidades ?? edificio?.unidades.length ?? "-"}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Contenedor principal para la lista/tabla de unidades (Placeholder) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[400px] flex flex-col items-center justify-center text-gray-400">
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
      </div>

      {/* Modales */}
      {modalAlquileresAbierto && (
        <ModalGenerarAlquileres
          edificioId={edificioId}
          usuarioId={usuarioId}
          onClose={() => setModalAlquileresAbierto(false)}
          onSuccess={handleExitoOperacion}
        />
      )}

      {modalGastosAbierto && (
        <ModalAgregarGasto
          edificioId={edificioId}
          usuarioId={usuarioId}
          unidades={unidades}
          onClose={() => setModalGastosAbierto(false)}
          onSuccess={handleExitoOperacion}
        />
      )}
    </div>
  );
}