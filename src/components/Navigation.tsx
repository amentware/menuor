import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, LayoutDashboard, Menu as MenuIcon, QrCode, Settings, LogOut, User } from 'lucide-react';
import MobileDrawer from './MobileDrawer';

const Navigation = () => {
  const { isAuthenticated, isAdmin, isOwner, logout } = useAuth();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  // Determine where logo should link to
  const logoDestination = isAuthenticated ? "/dashboard" : "/";

  return (
    <nav className="bg-white text-black shadow-md z-50 sticky top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to={logoDestination} className="flex-shrink-0 flex items-center">
              <span className="font-display text-xl font-bold text-primary">Menuor</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
            {!isAuthenticated && (
              <>
                <Link 
                  to="/" 
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    location.pathname === '/' 
                      ? 'bg-gray-50 text-primary' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-700'
                  }`}
                >
                  <Home className="h-5 w-5" />
                  Home
                </Link>
                <Link 
                  to="/login" 
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    location.pathname === '/login' 
                      ? 'bg-gray-50 text-primary' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-700'
                  }`}
                >
                  <User className="h-5 w-5" />
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    location.pathname === '/register' 
                      ? 'bg-gray-50 text-primary' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-700'
                  }`}
                >
                  <User className="h-5 w-5" />
                  Register
                </Link>
              </>
            )}
            
            {isOwner && (
              <>
                <Link 
                  to="/dashboard" 
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    location.pathname === '/dashboard' 
                      ? 'bg-gray-50 text-primary' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-700'
                  }`}
                >
                  <LayoutDashboard className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  to="/menu-builder"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    location.pathname === '/menu-builder' 
                      ? 'bg-gray-50 text-primary' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-700'
                  }`}
                >
                  <MenuIcon className="h-5 w-5" />
                  Menu Builder
                </Link>
                <Link
                  to="/qr-code"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    location.pathname === '/qr-code' 
                      ? 'bg-gray-50 text-primary' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-700'
                  }`}
                >
                  <QrCode className="h-5 w-5" />
                  QR Code
                </Link>
              </>
            )}
            
            {isAdmin && (
              <Link 
                to="/admin" 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  location.pathname === '/admin' 
                    ? 'bg-gray-50 text-primary' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                <Settings className="h-5 w-5" />
                Admin Panel
              </Link>
            )}
            
            {isAuthenticated && (
              <Button 
                //variant="outline" 
                className="group bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground flex items-center gap-2 transition-colors" 
                onClick={logout}
              >
                <LogOut className="h-4 w-4 text-primary-foreground group-hover:text-secondary-foreground" />
                Logout
              </Button>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <MobileDrawer />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
