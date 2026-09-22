export function PersonaCard({ persona, fecha, activo }) {
  if (!persona) return null;

  return (
    <div className="p-3 bg-gray-50 border rounded-lg flex justify-between items-center">
      <div>
        <p className="font-bold text-gray-800">{persona.nombre} {persona.apellido}</p>
        <p className="text-xs text-gray-500">
          DNI: {persona.dni ? (persona.dni !== 0 ? persona.dni : "No especifica") : "No especifica"} | Tel: {persona.telefono || 'No especifica'}
        </p>
        <p className="text-xs text-gray-400 mt-1">Desde: {new Date(fecha).toLocaleDateString()}</p>
      </div>
      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${activo ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
        {activo ? 'Activo' : 'Histórico'}
      </span>
    </div>
  );
}