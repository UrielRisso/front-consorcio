import { createContext, useContext, useState } from 'react';

// Plantilla de edificios de respaldo por si el endpoint aún no está listo en el backend
export const EDIFICIOS_PLANTILLA = [
  {
    id: 1,
    nombre: "Torre Bellini",
    direccion: "Esmeralda 1042",
    ciudad: "Buenos Aires",
    cantidadPisos: 15,
    cantidadUnidades: 45
  },
  {
    id: 2,
    nombre: "Edificio Libertador",
    direccion: "Av. del Libertador 4800",
    ciudad: "Buenos Aires",
    cantidadPisos: 10,
    cantidadUnidades: 30
  },
  {
    id: 3,
    nombre: "Consorcio Belgrano R",
    direccion: "Juramento 2450",
    ciudad: "Buenos Aires",
    cantidadPisos: 8,
    cantidadUnidades: 24
  }
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('auth_token') || null;
  });

  const [edificios, setEdificios] = useState(() => {
    try {
      const stored = localStorage.getItem('auth_edificios');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [cargando, setCargando] = useState(false);

  // Helper para verificar si tiene el rol de SuperAdministrador
  const tieneRolSuperAdmin = (roles) => {
    if (!roles || !Array.isArray(roles)) return false;
    return roles.some((rol) => {
      if (typeof rol === 'string') {
        return rol.toLowerCase() === 'superadministrador';
      }
      const nombreRol = rol?.RolNombre || rol?.rolNombre || rol?.nombre || rol?.rol_nombre;
      return typeof nombreRol === 'string' && nombreRol.toLowerCase() === 'superadministrador';
    });
  };

  // Helper para obtener los edificio_id que el usuario administra como AdministradorEdificio
  const obtenerEdificioIdsAdministrados = (roles) => {
    if (!roles || !Array.isArray(roles)) return [];
    return roles
      .filter((rol) => {
        const nombreRol = rol?.RolNombre || rol?.rolNombre || rol?.nombre || rol?.rol_nombre;
        return typeof nombreRol === 'string' && nombreRol.toLowerCase() === 'administradoredificio';
      })
      .map((rol) => rol?.EdificioId ?? rol?.edificioId ?? rol?.edificio_id)
      .filter((id) => id != null);
  };

  const isSuperAdmin = tieneRolSuperAdmin(user?.Roles || user?.roles);

  // Edificios que el usuario puede ver (todos si SuperAdmin, filtrados si AdministradorEdificio)
  const edificiosAdministrados = (() => {
    const roles = user?.Roles || user?.roles || [];
    if (tieneRolSuperAdmin(roles)) return edificios;
    const idsAdmin = obtenerEdificioIdsAdministrados(roles);
    if (idsAdmin.length === 0) return [];
    return edificios.filter((e) => idsAdmin.includes(e.id));
  })();

  // Consulta de todos los objetos edificio
  const obtenerEdificios = async (authToken) => {
    try {
      const res = await fetch('/api/edificios', {
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        }
      });

      if (res.ok) {
        const data = await res.json();
        const lista = Array.isArray(data) ? data : (data.edificios || data.data || []);
        setEdificios(lista);
        localStorage.setItem('auth_edificios', JSON.stringify(lista));
        return lista;
      } else {
        console.warn("No se pudo obtener edificios de /api/edificios (status: " + res.status + "). Usando plantilla de edificios.");
        setEdificios(EDIFICIOS_PLANTILLA);
        localStorage.setItem('auth_edificios', JSON.stringify(EDIFICIOS_PLANTILLA));
        return EDIFICIOS_PLANTILLA;
      }
    } catch (err) {
      console.warn("Fallo la llamada a /api/edificios:", err.message, ". Cargando plantilla de edificios.");
      setEdificios(EDIFICIOS_PLANTILLA);
      localStorage.setItem('auth_edificios', JSON.stringify(EDIFICIOS_PLANTILLA));
      return EDIFICIOS_PLANTILLA;
    }
  };

  // Función de inicio de sesión
  const login = async (email, password) => {
    setCargando(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        let errorMsg = 'Error al iniciar sesión. Verifique sus credenciales.';
        try {
          const errData = await res.json();
          if (errData?.message) errorMsg = errData.message;
          else if (errData?.error) errorMsg = errData.error;
        } catch {
          // Si la respuesta no es JSON
        }
        throw new Error(errorMsg);
      }

      // Estructura esperada: { usuario_id, email, nombre_completo, roles, token }
      const data = await res.json();

      const usuarioNormalizado = {
        UsuarioId: data.UsuarioId ?? data.usuarioId ?? data.usuario_id ?? data.id,
        Email: data.Email ?? data.email ?? email,
        NombreCompleto: data.NombreCompleto ?? data.nombreCompleto ?? data.nombre_completo ?? 'Usuario',
        Roles: data.Roles ?? data.roles ?? []
      };

      const authToken = data.token ?? data.Token;

      setUser(usuarioNormalizado);
      setToken(authToken);

      localStorage.setItem('auth_user', JSON.stringify(usuarioNormalizado));
      if (authToken) {
        localStorage.setItem('auth_token', authToken);
      }

      // Si es SuperAdmin o AdministradorEdificio, traer todos los edificios
      let edificiosCargados = [];
      const esSuperAdmin = tieneRolSuperAdmin(usuarioNormalizado.Roles);
      const idsAdmin = obtenerEdificioIdsAdministrados(usuarioNormalizado.Roles);
      const esAdmin = idsAdmin.length > 0;

      if (esSuperAdmin || esAdmin) {
        edificiosCargados = await obtenerEdificios(authToken);
      } else {
        setEdificios([]);
        localStorage.removeItem('auth_edificios');
      }

      return {
        success: true,
        user: usuarioNormalizado,
        token: authToken,
        isSuperAdmin: esSuperAdmin,
        edificios: edificiosCargados
      };
    } finally {
      setCargando(false);
    }
  };

  // Cierre de sesión
  const logout = () => {
    setUser(null);
    setToken(null);
    setEdificios([]);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_edificios');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        edificios,
        edificiosAdministrados,
        cargando,
        isAuthenticated: !!user,
        isSuperAdmin,
        login,
        logout,
        obtenerEdificios,
        setEdificios,
        obtenerEdificioIdsAdministrados
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
