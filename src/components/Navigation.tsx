import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, LayoutDashboard, Menu as MenuIcon, QrCode, Settings, LogOut, LogIn, UserPlus, Info, Mail, Store, MessageSquare } from 'lucide-react';
import MobileDrawer from './MobileDrawer';
import { useEffect, useState } from 'react';
import logo from '../assets/navicon.png';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

const Navigation = () => {
  const { isAuthenticated, isAdmin, isOwner, logout } = useAuth();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const unreadMessages = useUnreadMessages();
  
  const isActive = (path: string) => location.pathname === path;
  const isMenuPage = location.pathname.includes('/menu/');

  useEffect(() => {
    // Hide navigation immediately if it's a menu page
    if (isMenuPage) {
      setIsVisible(false);
      return;
    }

    // For non-menu pages, show navigation immediately
    setIsVisible(true);

    // Cleanup function to hide navigation when component unmounts
    return () => {
      setIsVisible(false);
    };
  }, [location.pathname, isMenuPage]);

  // Don't render anything if it's a menu page
  if (isMenuPage) {
    return null;
  }

  // Determine where logo should link to
  const logoDestination = isAuthenticated ? "/dashboard" : "/";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex">
            <Link to={logoDestination} className="flex items-center">
              <img src={logo} alt="MenuOR Logo" className="h-8 w-auto" />
            </Link>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex md:items-center md:space-x-4">
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
                  to="/about-us"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    location.pathname === '/about-us'
                      ? 'bg-gray-50 text-primary'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-700'
                  }`}
                >
                  <Info className="h-5 w-5" />
                  About Us
                </Link>
                <Link
                  to="/contact-us"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    location.pathname === '/contact-us'
                      ? 'bg-gray-50 text-primary'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-700'
                  }`}
                >
                  <Mail className="h-5 w-5" />
                  Contact Us
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
                  to="/settings"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    location.pathname === '/settings' 
                      ? 'bg-gray-50 text-primary' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-700'
                  }`}
                >
                  <Settings className="h-5 w-5" />
                  Settings
                </Link>
              </>
            )}
            
            {isAdmin && (
              <>
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
                <Link
                  to="/admin/messages"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg relative ${
                    location.pathname === '/admin/messages'
                      ? 'bg-gray-50 text-primary'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-700'
                  }`}
                >
                  <Mail className="h-5 w-5" />
                  Messages
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadMessages}
                    </span>
                  )}
                </Link>
              </>
            )}
            
            {isAuthenticated && (
              <Button 
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
