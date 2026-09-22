import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function formatoMoneda(monto, esIngreso = true) {
  const valor = monto == 0 ? 0 : esIngreso ? Math.abs(monto) : -Math.abs(monto);
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
}

function formatoFecha(fechaStr) {
  if (!fechaStr) return "-";
  const [fechaBase] = fechaStr.split("T");
  const [year, month, day] = fechaBase.split("-");
  return `${day}/${month}/${year}`;
}

export function EstadoCuentaPage() {
  const navigate = useNavigate();
  const { id: unidadId } = useParams();
  const { user } = useAuth();
  
  const [movimientos, setMovimientos] = useState([]);
  const [estadoCuenta, setEstadoCuenta] = useState(null);
  
  // Estado para el modal de pago
  const [pagoContext, setPagoContext] = useState({ 
    isOpen: false, 
    tipo: null, 
    id: null, 
    monto: null, 
    descripcion: '' 
  });
  const [metodoPago, setMetodoPago] = useState("Transferencia");
  const [procesandoPago, setProcesandoPago] = useState(false);

  useEffect(() => {
    obtenerEstado();
  }, []);

  const obtenerEstado = async () => {
    try {
      const res = await fetch(`/api/estadosCuenta/unidad/${unidadId}`);
      if (!res.ok) throw new Error("No se pudo conectar con el servidor.");
      const data = await res.json();
      
      const resumen = data.items.reduce(
        (acc, item) => {
          const valor = item.ingreso ? Math.abs(item.monto) : -Math.abs(item.monto);
          acc.saldo += valor;
          if (item.ingreso) {
            acc.cantIngresos += 1;
            acc.totalIngresos += Math.abs(item.monto);
          } else {
            acc.cantEgresos += 1;
            acc.totalEgresos += Math.abs(item.monto);
          }
          return acc;
        },
        { saldo: 0, cantIngresos: 0, cantEgresos: 0, totalIngresos: 0, totalEgresos: 0 }
      );
      console.log("data",data)
      setMovimientos(data.items);
      setEstadoCuenta({
        ...data, 
        cantidadIngresos: resumen.cantIngresos, 
        cantidadEgresos: resumen.cantEgresos
      });
    } catch (err) {
      console.error(err.message);
    }
  };

  const abrirModalPago = (tipo, id, monto, descripcion) => {
    setMetodoPago("Transferencia");
    setPagoContext({ isOpen: true, tipo, id, monto, descripcion });
  };

  const cerrarModalPago = () => {
    setPagoContext({ isOpen: false, tipo: null, id: null, monto: null, descripcion: '' });
  };

  const procesarPago = async () => {
    setProcesandoPago(true);
    
    const payload = {
      monto: pagoContext.monto,
      metodoPago: metodoPago,
      usuarioId: user?.id || user?.UsuarioId
    };

    if (pagoContext.tipo === 'alquiler') payload.alquilerId = pagoContext.id;
    if (pagoContext.tipo === 'expensa') payload.expensaId = pagoContext.id;

    try {
      const res = await fetch('/api/pagos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.mensaje || "Error al procesar el pago");
      }
      
      alert(metodoPago === 'QR Mercado Pago' ? "Pago confirmado y procesado con éxito" : "Pago registrado como pendiente de confirmación.");
      
      obtenerEstado(); // Recargar datos
      cerrarModalPago();
    } catch (err) {
      alert(err.message);
    } finally {
      setProcesandoPago(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-2xl mx-auto relative">
      <div>
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-sm font-semibold text-primary hover:text-brand-100"
        >
          &larr; Volver a unidad
        </button>
        <h3 className="text-lg font-bold text-gray-900">Estado de Cuenta</h3>
        <p className="text-xs text-gray-400 mt-0.5">Resumen de cuenta, pagos pendientes y detalle de transacciones</p>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-gray-50/80 rounded-2xl border border-gray-100 mt-4 mb-6">
        <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-2xs">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1">
            Saldo Total
          </span>
          <span className={`text-base font-extrabold block ${estadoCuenta?.saldoActual >= 0 ? "text-gray-900" : "text-red-600"}`}>
            {formatoMoneda(estadoCuenta?.saldoActual ?? estadoCuenta?.saldoActual, estadoCuenta?.saldoActual >= 0)}
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Ingresos
            </span>
            <span className="text-[10px] font-semibold bg-green-50 text-green-700 px-1.5 py-0.5 rounded-md">
              {estadoCuenta?.cantidadIngresos || 0} pagos
            </span>
          </div>
          <span className="text-base font-bold text-green-600 block">
            {formatoMoneda(estadoCuenta?.totalCreditos ?? estadoCuenta?.totalCreditos, true)}
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Egresos
            </span>
            <span className="text-[10px] font-semibold bg-red-50 text-red-700 px-1.5 py-0.5 rounded-md">
              {estadoCuenta?.cantidadEgresos || 0} gastos
            </span>
          </div>
          <span className="text-base font-bold text-red-600 block">
            {formatoMoneda(estadoCuenta?.totalDebitos ?? estadoCuenta?.totalDebitos, false)}
          </span>
        </div>
      </div>

      {/* Pagos Pendientes */}
      {(estadoCuenta?.alquileresPendientes?.length > 0 || estadoCuenta?.expensasPendientes?.length > 0) && (
        <div className="mb-8">
          <h4 className="text-md font-bold text-gray-900 mb-3 border-b pb-2">Pendientes de Pago</h4>
          <div className="space-y-3">
            
            {estadoCuenta.alquileresPendientes.map(alq => (
              <div key={`alq-${alq.id}`} className="flex items-center justify-between bg-red-50/50 p-3 rounded-xl border border-red-100">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Alquiler {alq.periodo}</p>
                  <p className="text-xs text-gray-500">Vence: {formatoFecha(alq.fechaVencimiento)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-red-600">{formatoMoneda(alq.montoTotal, true)}</span>
                  <button 
                    onClick={() => abrirModalPago('alquiler', alq.id, alq.montoTotal, `Alquiler ${alq.periodo}`)}
                    className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-brand-100 transition"
                  >
                    Pagar
                  </button>
                </div>
              </div>
            ))}

            {estadoCuenta.expensasPendientes.map(exp => (
              <div key={`exp-${exp.id}`} className="flex items-center justify-between bg-red-50/50 p-3 rounded-xl border border-red-100">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {exp.esExtraordinaria ? 'Exp. Extraordinaria' : 'Expensa'} - {exp.concepto} ({exp.periodo})
                  </p>
                  <p className="text-xs text-gray-500">Vence: {formatoFecha(exp.fechaVencimiento)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-red-600">{formatoMoneda(exp.monto, true)}</span>
                  <button 
                    onClick={() => abrirModalPago('expensa', exp.id, exp.monto, `Expensa - ${exp.concepto}`)}
                    className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-brand-100 transition"
                  >
                    Pagar
                  </button>
                </div>
              </div>
            ))}

          </div>
        </div>
      )}

      {/* Historial de Movimientos */}
      <div>
        <h4 className="text-md font-bold text-gray-900 mb-3 border-b pb-2">Historial de Movimientos</h4>
        <div className="divide-y divide-gray-100">
          {movimientos.map((item) => {
            const valorFinal = item.ingreso ? Math.abs(item.monto) : -Math.abs(item.monto);
            return (
              <div key={item.id} className="flex items-center justify-between py-3.5 hover:bg-gray-50/50 px-2 rounded-xl transition">
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    item.ingreso ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                  }`}>
                    {item.ingreso ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.descripcion}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatoFecha(item.fecha)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold block ${
                    item.ingreso ? "text-green-600" : "text-red-600"
                  }`}>
                    {formatoMoneda(valorFinal, item.ingreso)}
                  </span>
                </div>
              </div>
            );
          })}
          {movimientos.length === 0 && (
            <p className="text-center text-sm text-gray-500 py-6">No hay movimientos registrados.</p>
          )}
        </div>
      </div>

      {/* Modal de Pago */}
      {pagoContext.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Realizar Pago</h3>
              <p className="text-sm text-gray-500 mt-1">{pagoContext.descripcion}</p>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="text-sm text-gray-600 font-medium">Monto a pagar:</span>
                <span className="text-lg font-bold text-gray-900">{formatoMoneda(pagoContext.monto)}</span>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Método de Pago</label>
                <div className="space-y-2">
                  <label className="flex items-center p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition">
                    <input 
                      type="radio" 
                      name="metodoPago" 
                      value="Transferencia" 
                      checked={metodoPago === "Transferencia"}
                      onChange={(e) => setMetodoPago(e.target.value)}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">Transferencia Bancaria</span>
                  </label>
                  <label className="flex items-center p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition">
                    <input 
                      type="radio" 
                      name="metodoPago" 
                      value="Efectivo" 
                      checked={metodoPago === "Efectivo"}
                      onChange={(e) => setMetodoPago(e.target.value)}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">Efectivo</span>
                  </label>
                  <label className="flex items-center p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition">
                    <input 
                      type="radio" 
                      name="metodoPago" 
                      value="QR Mercado Pago" 
                      checked={metodoPago === "QR Mercado Pago"}
                      onChange={(e) => setMetodoPago(e.target.value)}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">QR Mercado Pago</span>
                  </label>
                </div>
              </div>

              {metodoPago === "QR Mercado Pago" && (
                <div className="mt-4 flex flex-col items-center justify-center p-4 border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-xl">
                  <p className="text-xs font-semibold text-blue-800 mb-2 text-center">Escanea para pagar con Mercado Pago</p>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=mercadopago://pagar/${pagoContext.id}-${pagoContext.monto}`} 
                    alt="QR Mercado Pago" 
                    className="w-32 h-32 rounded-lg"
                  />
                  <p className="text-[10px] text-gray-500 mt-2 text-center">
                    (Simulación: Haz clic en confirmar para simular el pago validado)
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 flex gap-3 bg-gray-50">
              <button 
                onClick={cerrarModalPago}
                disabled={procesandoPago}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
              >
                Cancelar
              </button>
              <button 
                onClick={procesarPago}
                disabled={procesandoPago}
                className="flex-1 py-2 px-4 bg-primary rounded-xl text-sm font-medium text-white hover:bg-brand-100 transition disabled:opacity-50"
              >
                {procesandoPago ? 'Procesando...' : 
                 (metodoPago === "QR Mercado Pago" ? 'Simular Pago Exitoso' : 'Confirmar Pago')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}