import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { EdificiosPage } from './pages/EdificiosPage';
import { UnidadesPage } from './pages/UnidadesPage';
import { DetalleUnidadPage } from './pages/DetalleUnidadPage';
import { UnidadesEdificioPage } from './pages/UnidadesEdificioPage';
import {EstadoCuentaPage} from './pages/EstadoCuentaPage'
import { CobrosPage } from './pages/CobrosPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';

// Layout principal para páginas autenticadas con la barra de navegación
function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
        <Outlet />
      </main>
    </div>
  );
}

// Redirección inicial según estado de autenticación y rol
function HomeRedirect() {
  const { isAuthenticated, isSuperAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={isSuperAdmin ? "/edificios" : "/unidades"} replace />;
}

// Envoltorio para la ruta pública de login (si ya está logueado, redirige a su panel)
function PublicLoginRoute() {
  const { isAuthenticated, isSuperAdmin } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={isSuperAdmin ? "/edificios" : "/unidades"} replace />;
  }

  return <LoginPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta pública de Login: primera en ser revisada al iniciar */}
          <Route path="/login" element={<PublicLoginRoute />} />

          {/* Redirección de la raíz '/' según autenticación */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Rutas protegidas que requieren sesión activa */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              {/* Ruta exclusiva para SuperAdministrador */}
              <Route
                path="/edificios"
                element={
                  <ProtectedRoute requireSuperAdmin={true}>
                    <EdificiosPage />
                  </ProtectedRoute>
                }
              />

              {/* Rutas de Unidades */}
              <Route path="/unidades" element={<UnidadesPage />} />
              <Route path="/unidades/:id" element={<DetalleUnidadPage />} />
              <Route path="/edificios/:id" element={<UnidadesEdificioPage />} />
              <Route path="/estadoCuenta/:id" element={<EstadoCuentaPage />} />
              <Route path="/cobros" element={<CobrosPage />} />


            </Route>
          </Route>

          {/* Cualquier ruta desconocida vuelve a la raíz */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}