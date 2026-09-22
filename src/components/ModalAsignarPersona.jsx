import { useState, useEffect } from 'react';
import { API_URL } from '../config';

export function ModalAsignarPersona({ unidadId, tipo, onClose, onSuccess }) {
  const [personas, setPersonas] = useState([]);
  const [personaSeleccionada, setPersonaSeleccionada] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    obtenerPersonas()
  }, []);

const obtenerPersonas = async () => {
    try {
      
      
      const res = await fetch(`/api/personas`);
      console.log("data",res)
      if (!res.ok) throw new Error("No se pudo conectar con el servidor.");
      const data = await res.json();
      console.log("data",data)
      setPersonas(data);
    } catch (err) {
      console.log("data",err.message)
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!personaSeleccionada) return;

    setGuardando(true);
    const endpoint = `/api/unidades/${unidadId}/${tipo}`;
    console.log(endpoint)
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: parseInt(personaSeleccionada) }),
      });

      if (res.ok) {
        onSuccess();
      } else {
        alert("Error al guardar la asignación");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };
 console.log(personas)
  const personasFiltradas = personas.filter((p) =>
    `${p.dni} ${p.nombre} ${p.apellido}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-4 capitalize">Asignar {tipo}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Filtrar Persona</label>
            <input 
              type="text"
              placeholder="Escribe DNI, Nombre o Apellido..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full border p-2 rounded-lg text-sm mb-2"
            />

            <label className="block text-xs font-semibold text-gray-600 mb-1">Seleccionar Persona</label>
            <select 
              value={personaSeleccionada}
              onChange={(e) => setPersonaSeleccionada(e.target.value)}
              className="w-full border p-2 rounded-lg text-sm bg-white"
              required
            >
              <option value="">-- Selecciona una persona --</option>
              {personasFiltradas.map((p) => (
                <option key={p.id} value={p.id}>
                  DNI: {p.dni} - {p.apellido}, {p.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={guardando}
              className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-brand-100 disabled:opacity-50"
            >
              {guardando ? 'Guardando...' : 'Asignar como Activo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}