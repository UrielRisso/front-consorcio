import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, EDIFICIOS_PLANTILLA } from '../context/AuthContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState(null);
  const [cargandoLocal, setCargandoLocal] = useState(false);
  const [mostrarDemo, setMostrarDemo] = useState(false);

  const { login, cargando: authCargando, setUser, setToken, setEdificios } = useAuth();
  const navigate = useNavigate();

  const cargando = cargandoLocal || authCargando;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Por favor complete su correo electrónico y contraseña.');
      return;
    }

    try {
      setCargandoLocal(true);
      const resultado = await login(email, password);

      if (resultado.isSuperAdmin) {
        // Si es SuperAdministrador, redirige a la vista de edificios
        navigate('/edificios');
      } else {
        // Si es otro rol, redirige a las unidades
        navigate('/unidades');
      }
    } catch (err) {
      setError(err.message || 'Error al conectar con el servidor.');
    } finally {
      setCargandoLocal(false);
    }
  };

  // Función para probar la funcionalidad con datos de prueba si el backend no está disponible
  // const simularLogin = (esSuperAdmin) => {
  //   setError(null);
  //   const mockUser = {
  //     UsuarioId: esSuperAdmin ? 1 : 2,
  //     Email: esSuperAdmin ? 'superadmin@consorcio.com' : 'vecino@consorcio.com',
  //     NombreCompleto: esSuperAdmin ? 'Carlos Super Administrador' : 'María Consorcista',
  //     Roles: [
  //       { RolNombre: esSuperAdmin ? 'SuperAdministrador' : 'Propietario' }
  //     ]
  //   };

  //   const mockToken = 'mock_jwt_token_' + Date.now();

  //   localStorage.setItem('auth_user', JSON.stringify(mockUser));
  //   localStorage.setItem('auth_token', mockToken);

  //   // Si es SuperAdmin, guardamos la plantilla de edificios
  //   if (esSuperAdmin) {
  //     localStorage.setItem('auth_edificios', JSON.stringify(EDIFICIOS_PLANTILLA));
  //     if (setEdificios) setEdificios(EDIFICIOS_PLANTILLA);
  //   } else {
  //     localStorage.removeItem('auth_edificios');
  //     if (setEdificios) setEdificios([]);
  //   }

  //   // Actualizamos el estado del contexto recargando la página o navegando
  //   window.location.href = esSuperAdmin ? '/edificios' : '/unidades';
  // };

  return (
    <div className="min-h-screen flex items-center justify-center -my-6 -mx-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-brand-900 via-primary to-brand-900">
      <div className="max-w-md w-full space-y-8 bg-white/95 backdrop-blur-sm p-8 sm:p-10 rounded-2xl shadow-2xl border border-slate-200">
        
        {/* Cabecera / Logo */}
        <div className="text-center">
          <div className="mx-auto text-white rounded-2xl flex items-center justify-center mb-4">
            <img 
              src="/Logo.png" 
              alt="Logo de la empresa" 
              className="h-25 w-auto" 
            />
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Ingresá con tus credenciales para acceder a la plataforma
          </p>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-start space-x-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="font-medium">Error al iniciar sesión</p>
              <p className="text-xs text-red-600 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@consorcio.com"
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="password"
                name="password"
                type={mostrarPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {mostrarPassword ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full mt-2 py-3 px-4 bg-primary hover:bg-brand-100 active:bg-brand-800 text-white font-semibold rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cargando ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Iniciando sesión...
              </>
            ) : (
              'Ingresar al Sistema'
            )}
          </button>
        </form>

        {/* Información sobre el endpoint y rol */}
        {/* <div className="pt-4 border-t border-slate-200 text-xs text-slate-500 space-y-1">
          <p className="flex items-center text-slate-600">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
            Envía POST a <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700 ml-1">api/auth/login</code>
          </p>
          <p className="text-slate-500">
            Si el rol contiene <span className="font-semibold text-slate-700">SuperAdministrador</span>, cargará automáticamente todos los edificios.
          </p>
        </div> */}

        {/* Herramienta de pruebas / Demo (útil si el backend aún no está encendido) */}
        {/* <div className="border border-dashed border-slate-300 rounded-xl p-3 bg-slate-50">
          <button
            type="button"
            onClick={() => setMostrarDemo(!mostrarDemo)}
            className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            <span>Herramientas de prueba rápida (Demo)</span>
            <span>{mostrarDemo ? '▲' : '▼'}</span>
          </button>

          {mostrarDemo && (
            <div className="mt-3 space-y-2 text-xs">
              <p className="text-slate-500">
                Podes simular la respuesta del backend para probar el flujo sin necesidad de tener la API encendida:
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => simularLogin(true)}
                  className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition text-center"
                >
                  Probar como SuperAdministrador
                </button>
                <button
                  type="button"
                  onClick={() => simularLogin(false)}
                  className="flex-1 py-2 px-3 bg-slate-700 hover:bg-slate-800 text-white font-medium rounded-lg shadow-sm transition text-center"
                >
                  Probar como Usuario regular
                </button>
              </div>
            </div>
          )}
        </div> */}

      </div>
    </div>
  );
}
