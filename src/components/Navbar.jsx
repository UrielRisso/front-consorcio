import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user, isSuperAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const rolBadge = isSuperAdmin ? 'SuperAdministrador' : (user?.Roles?.[0]?.RolNombre || 'Usuario');

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm mb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2 font-black text-xl text-blue-600">
              <img 
              src="/icono.png" 
              alt="Logo de la empresa" 
              className="h-10 w-auto" 
            />
            </Link>

            <div className="hidden sm:flex space-x-2">
              {isSuperAdmin && (
                <Link
                  to="/edificios"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    location.pathname === '/edificios'
                      ? 'bg-brand-100/30 text-brand-900'
                      : 'text-brand-900 hover:text-brand-900 hover:bg-brand-100/30'
                  }`}
                >
                  Edificios
                </Link>
              )}

              <Link
                to="/unidades"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  location.pathname === '/unidades' || location.pathname.startsWith('/unidades/')
                    ? 'bg-brand-100/30 text-brand-900'
                      : 'text-brand-900 hover:text-brand-900 hover:bg-brand-100/30'
                }`}
              >
                Unidades
              </Link>

              <Link
                to="/cobros"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  location.pathname === '/cobros'
                    ? 'bg-brand-100/30 text-brand-900'
                      : 'text-brand-900 hover:text-brand-900 hover:bg-brand-100/30'
                }`}
              >
                Cobros
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex flex-col text-right">
              <span className="text-sm font-bold text-gray-800 leading-tight">
                {user?.NombreCompleto || user?.Email || 'Usuario'}
              </span>
              <span className="text-xs text-brand-500 font-semibold">
                {rolBadge}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-1.5 border border-gray-200 text-xs font-medium rounded-lg text-red-600 bg-red-50 hover:bg-red-100 hover:border-red-300 transition"
              title="Cerrar sesión"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
