import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, LayoutDashboard, Menu as MenuIcon, QrCode, Settings, LogOut, User, X } from 'lucide-react';
import logo from '../assets/logo512.png';

const MobileDrawer = () => {
  const { isAuthenticated, isAdmin, isOwner, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  const closeDrawer = () => setIsOpen(false);

  const logoDestination = isAuthenticated ? "/dashboard" : "/";

  const navigationItems = [
    ...(isAuthenticated ? [] : [
      { to: "/", label: "Home", icon: Home },
      { to: "/login", label: "Login", icon: User },
      { to: "/register", label: "Register", icon: User },
    ]),
    ...(isOwner ? [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/menu-builder", label: "Menu Builder", icon: MenuIcon },
      { to: "/qr-code", label: "QR Code", icon: QrCode },
    ] : []),
    ...(isAdmin ? [
      { to: "/admin", label: "Admin Panel", icon: Settings },
    ] : []),
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 bg-white">
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center">
            <img src={logo} alt="Menuor" className="h-12 w-auto" />
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col justify-between h-[calc(100vh-80px)] pt-6 pb-8">
          <nav className="flex-1 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={closeDrawer}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                    isActive(item.to)
                      ? 'bg-gray-50 text-primary'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          
          {isAuthenticated && (
            <div className="border-t pt-4">
              <Button
                variant="ghost"
                onClick={() => {
                  logout();
                  closeDrawer();
                }}
                className="w-full justify-start border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400 flex items-center gap-2 transition-colors"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileDrawer;
