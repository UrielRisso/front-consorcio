import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { PersonaCard } from '../components/PersonaCard';
import { ModalAsignarPersona } from '../components/ModalAsignarPersona';
import { API_URL } from '../config';

export function DetalleUnidadPage() {
  const { id, tipo } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [unidad, setUnidad] = useState(location.state?.unidad || null);
  const [cargando, setCargando] = useState(!unidad);
  const [modalTipo, setModalTipo] = useState(null);

  const obtenerDetalle = async () => {
    try {
      setCargando(true);
      const res = await fetch(`/api/unidades`);
      if (!res.ok) throw new Error("Error al consultar unidades");
      const data = await res.json();
      console.log("data", data)
      const encontrada = data.find((u) => u.id === parseInt(id));
      setUnidad(encontrada);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!unidad) {
      obtenerDetalle();
    }
  }, [id]);

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-600">Cargando detalle...</p>
      </div>
    );
  }

  if (!unidad) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600 mb-4">No se encontró la unidad.</p>
        {tipo == 0 ? <button onClick={() => navigate('/unidades')} className="text-primary underline">Volver al listado</button> : <button onClick={() => navigate('/edificios/' + tipo)} className="text-primary underline">Volver al listado</button>}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 ">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 text-sm font-semibold text-primary hover:text-brand-100"
          >
            &larr; Volver al listado
          </button>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/estadoCuenta/' + unidad.id)}
              className="px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-brand-100 transition shadow-sm flex items-center gap-2"
            >
              Estado de cuenta
            </button>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">
          {unidad.piso + "°" + unidad.nombre || `Unidad #${unidad.id}`}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h3 className="font-bold text-gray-700">Información de cobro:</h3>
            {unidad.alquiler && unidad.alquiler !== 0 ? (
              <p><strong className="text-gray-600">Alquiler:</strong> {unidad.alquiler} $</p>
            ) : null}

            <p><strong className="text-gray-600">Estado:</strong> {unidad.estado?.nombre || ""}</p>
            <p><strong className="text-gray-600">Superficie:</strong> {unidad.superficie} m²</p>
            <p><strong className="text-gray-600">Coeficiente:</strong> {unidad.coef}%</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h3 className="font-bold text-gray-700">Información Adicional</h3>
            <p><strong className="text-gray-600">ID:</strong> {unidad.id}</p>
            <p><strong className="text-gray-600">Balcón:</strong> {unidad.balcon ? "Sí" : "No"}</p>
            <p><strong className="text-gray-600">Ambientes:</strong> {unidad.tipo?.nombre || ""}</p>
          </div>
        </div>
      </div>

      <br />
      <SeccionConBoton
        titulo="Propietario Activo"
        onAgregar={() => setModalTipo('propietario')}
        lista={unidad.propietarios}
        renderItem={(p) => (
          <PersonaCard key={p.id} persona={p.dueño} fecha={p.fechaDesde} activo={p.activo} />
        )}
      />

      <br />
      <SeccionConBoton
        titulo="Responsable de Pago Activo"
        onAgregar={() => setModalTipo('responsable')}
        lista={unidad.responsablesPago}
        renderItem={(r) => (
          <PersonaCard key={r.id} persona={r.responsable} fecha={r.fechaDesde} activo={r.activo} />
        )}
      />

      <br />
      <SeccionConBoton
        titulo="Inquilinos"
        onAgregar={() => setModalTipo('inquilino')}
        lista={unidad.inquilino || unidad.inquilinos}
        renderItem={(i) => (
          <PersonaCard key={i.id} persona={i.habitante} fecha={i.fechaDesde} activo={i.activo} />
        )}
      />

      {modalTipo && (
        <ModalAsignarPersona
          unidadId={unidad.id}
          tipo={modalTipo}
          onClose={() => setModalTipo(null)}
          onSuccess={() => {
            setModalTipo(null);
            obtenerDetalle();
          }}
        />
      )}
    </div>
  );
}

function SeccionConBoton({ titulo, onAgregar, lista, renderItem }) {
  return (
    <div className="border-t pt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">{titulo}</h3>
        <button
          onClick={onAgregar}
          className="bg-primary text-white text-xs px-3 py-1.5 rounded-lg hover:bg-brand-100 font-medium"
        >
          + Asignar / Agregar
        </button>
      </div>
      {lista && lista.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{lista.map(renderItem)}</div>
      ) : (
        <p className="text-sm text-gray-400 italic">Sin registros asignados.</p>
      )}
    </div>
  );
}