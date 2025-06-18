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
import Settings from "./pages/Settings";
import Menu from "./pages/Menu";
import Admin from "./pages/Admin";
import AdminEdit from "./pages/AdminEdit";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import UserMessages from "./pages/UserMessages";
import ThemeBuilder from "@/pages/ThemeBuilder";

// Components
import Navigation from "./components/Navigation";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import { RefreshCcw } from "lucide-react";

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
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <RefreshCcw className="h-8 w-8 animate-spin text-black" />
          <p className="mt-4 text-lg text-black">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={userRole === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return <Home />;
};

// Wrapper component to conditionally render Navigation
const AppContent = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const isMenuPage = location.pathname.startsWith('/menu/');

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      {!isMenuPage && <Navigation />}
      <div className={`flex-grow ${!isMenuPage ? 'pt-16' : ''}`}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/menu/:restaurantId" element={<Menu />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route 
            path="/contact-us" 
            element={isAuthenticated ? <Navigate to="/messages" replace /> : <ContactUs />} 
          />
          
          {/* Restaurant owner routes */}
          <Route element={<ProtectedRoute requiredRole="owner" />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/menu-builder" element={<MenuBuilder />} />
            <Route path="/qr-code" element={<QRCodePage />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/messages" element={<UserMessages />} />
          </Route>
          
          {/* Admin routes */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/edit/:restaurantId" element={<AdminEdit />} />
            <Route path="/admin/messages" element={<Messages />} />
          </Route>
          
          {/* Theme builder route */}
          <Route path="/theme-builder/:restaurantId" element={<ThemeBuilder />} />
          
          {/* 404 Page - This should be the last route */}
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
