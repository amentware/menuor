import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/AuthContext";
import { useEffect } from "react";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MenuBuilder from "./pages/MenuBuilder";
import QRCodePage from "./pages/QRCode";
import EditProfile from "./pages/EditProfile";
import Profile from "./pages/Profile";
import Menu from "./pages/Menu";
import Admin from "./pages/Admin";
import AdminEdit from "./pages/AdminEdit";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";

// Components
import Navigation from "./components/Navigation";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

// Root redirect component
const RootRedirect = () => {
  const { isAuthenticated, userRole, loading } = useAuth();
  const location = useLocation();

  // Don't redirect if we're already going somewhere else (prevents redirect loops)
  if (location.state?.from) {
    return <Home />;
  }

  if (loading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to={userRole === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return <Home />;
};

// Wrapper component to conditionally render Navigation
const AppContent = () => {
  const location = useLocation();
  const { loading } = useAuth();
  const isMenuPage = location.pathname.startsWith('/menu/');

  useEffect(() => {
    // Remove the root loader once the auth state is determined
    if (!loading) {
      const rootLoader = document.getElementById('root-loader');
      if (rootLoader) {
        rootLoader.classList.add('fade-out');
        setTimeout(() => {
          rootLoader.remove();
        }, 300);
      }
    }
  }, [loading]);

  if (loading) {
    return null; // Let the root loader handle the initial loading state
  }

  return (
    <div className="min-h-screen flex flex-col">
      {!isMenuPage && <Navigation />}
      <div className={`flex-grow ${!isMenuPage ? 'pt-16' : ''}`}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/menu/:restaurantId" element={<Menu />} />
          
          {/* Restaurant owner routes */}
          <Route element={<ProtectedRoute requiredRole="owner" />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/menu-builder" element={<MenuBuilder />} />
            <Route path="/qr-code" element={<QRCodePage />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          
          {/* Admin routes */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/edit/:restaurantId" element={<AdminEdit />} />
          </Route>
          
          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
