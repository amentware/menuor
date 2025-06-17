import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu, Home, LayoutDashboard, Menu as MenuIcon, QrCode, Settings, LogOut, User, LogIn, UserPlus, X, Info, Mail, Store, MessageSquare } from 'lucide-react';
import logo from '../assets/navicon.png';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

const MobileDrawer = () => {
  const { isAuthenticated, isAdmin, isOwner, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const touchStartX = useRef(0);
  const isNavigating = useRef(false);
  const unreadMessages = useUnreadMessages();
  
  const isActive = (path: string) => location.pathname === path;
  
  const closeDrawer = useCallback(() => {
    setIsOpen(false);
    // Remove drawer from DOM after animation
    setTimeout(() => {
      setIsRendered(false);
    }, 200);
  }, []);

  const openDrawer = useCallback(() => {
    setIsRendered(true);
    // Small delay to ensure DOM is ready before animation
    requestAnimationFrame(() => {
      setIsOpen(true);
    });
  }, []);

  // Handle navigation with delay to prevent drawer flash
  const handleNavigation = useCallback((to: string) => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    closeDrawer();
    
    setTimeout(() => {
      navigate(to);
      isNavigating.current = false;
    }, 200);
  }, [navigate, closeDrawer]);

  // Handle touch events to detect back gesture
  useEffect(() => {
    if (!isRendered) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touchX = e.touches[0].clientX;
      const deltaX = touchX - touchStartX.current;

      if (touchStartX.current < 20 && deltaX > 0) {
        closeDrawer();
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [closeDrawer, isRendered]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const navigationItems = [
    ...(isAuthenticated ? [] : [
      { to: "/", label: "Home", icon: Home },
      { to: "/about-us", label: "About Us", icon: Info },
      { to: "/contact-us", label: "Contact Us", icon: Mail },
      { to: "/login", label: "Login", icon: LogIn },
      { to: "/register", label: "Register", icon: UserPlus },
    ]),
    ...(isOwner ? [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/menu-builder", label: "Menu Builder", icon: MenuIcon },
      { to: "/qr-code", label: "QR Code", icon: QrCode },
      { to: "/settings", label: "Settings", icon: Settings },
    ] : []),
    ...(isAdmin ? [
      { to: "/admin", label: "Admin Panel", icon: Settings },
      { 
        to: "/admin/messages", 
        label: "Messages", 
        icon: Mail,
        badge: unreadMessages > 0 ? unreadMessages : null 
      },
    ] : []),
  ];

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        className="md:hidden"
        onClick={openDrawer}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {isRendered && (
        <>
          <div 
            className={`fixed inset-0 h-[100dvh] bg-black/50 z-40 md:hidden transition-opacity duration-200 ${
              isOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={closeDrawer}
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0
            }}
          />
          
          <div 
            className={`fixed right-0 top-0 z-50 h-[100dvh] w-80 bg-white transform transition-transform duration-200 ease-out shadow-lg ${
              isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
            style={{
              backgroundColor: 'white',
              boxShadow: '-4px 0 6px -1px rgba(0, 0, 0, 0.1), -2px 0 4px -1px rgba(0, 0, 0, 0.06)'
            }}
          >
            <div className="h-full flex flex-col bg-white">
              <div className="p-4 border-b bg-white">
                <div className="flex items-center justify-between">
                  <img src={logo} alt="Menuor" className="h-6 w-auto" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={closeDrawer}
                    className="h-8 w-8 rounded-full hover:bg-gray-100"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close</span>
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-col justify-between flex-1 h-[calc(100dvh-64px)] bg-white">
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto bg-white">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.to}
                        onClick={() => handleNavigation(item.to)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
                          isActive(item.to)
                            ? 'bg-gray-50 text-primary'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-700'
                        }`}
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                        {item.badge && (
                          <span className="absolute right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
                
                {isAuthenticated && (
                  <div className="px-4 py-4 pb-10 border-t bg-white">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        logout();
                        closeDrawer();
                      }}
                      className="group w-full bg-primary justify-start border-red-300 text-primary-foreground hover:bg-secondary hover:text-secondary-foreground flex items-center gap-2 transition-colors"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      <LogOut className="h-5 w-5 mr-3 group-hover:text-secondary-foreground" />
                      Logout
                    </Button>
                  </div>
                )}

                {isAdmin && (
                  <>
                    <button
                      onClick={() => handleNavigation('/admin')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive('/admin')
                          ? 'bg-gray-50 text-primary'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-700'
                      }`}
                    >
                      <Settings className="h-5 w-5" />
                      Admin Panel
                    </button>
                    <button
                      onClick={() => handleNavigation('/admin/messages')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
                        isActive('/admin/messages')
                          ? 'bg-gray-50 text-primary'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-700'
                      }`}
                    >
                      <Mail className="h-5 w-5" />
                      Messages
                      {unreadMessages > 0 && (
                        <span className="absolute right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadMessages}
                        </span>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MobileDrawer;