import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, LayoutDashboard, Menu as MenuIcon, QrCode, Settings, LogOut, User, LogIn, UserPlus } from 'lucide-react';
import MobileDrawer from './MobileDrawer';
import { useEffect, useState } from 'react';
import logo from '../assets/navicon.png';

const Navigation = () => {
  const { isAuthenticated, isAdmin, isOwner, logout } = useAuth();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;
  const isMenuPage = location.pathname.includes('/menu/');

  useEffect(() => {
    // Hide navigation immediately if it's a menu page
    if (isMenuPage) {
      setIsVisible(false);
      setIsDrawerOpen(false);
      return;
    }

    // For non-menu pages, show navigation immediately
    setIsVisible(true);

    // Close drawer when location changes
    setIsDrawerOpen(false);

    // Cleanup function to hide navigation when component unmounts
    return () => {
      setIsVisible(false);
    };
  }, [location.pathname, isMenuPage]);

  // Don't render anything if it's a menu page
  if (isMenuPage) {
    return null;
  }

  const logoDestination = isAuthenticated ? (isAdmin ? '/admin' : '/dashboard') : '/';

  return (
    <nav className={`fixed w-full bg-white text-black shadow-md z-50 transition-transform duration-200 ease-out ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to={logoDestination} className="flex-shrink-0 flex items-center">
              <img src={logo} alt="Menuor" className="h-6 w-auto" />
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
                  <LogIn className="h-5 w-5" />
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
                  <UserPlus className="h-5 w-5" />
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
                <Link
                  to="/profile"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    location.pathname === '/profile' 
                      ? 'bg-gray-50 text-primary' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-700'
                  }`}
                >
                  <User className="h-5 w-5" />
                  Profile
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
                onClick={logout}
                className="logout-btn flex items-center gap-2"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </Button>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <MobileDrawer 
              isOpen={isDrawerOpen}
              onOpenChange={setIsDrawerOpen}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
