import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, LayoutDashboard, Menu as MenuIcon, QrCode, Settings, LogOut, User, LogIn, UserPlus } from 'lucide-react';
import logo from '../assets/navicon.png';

interface MobileDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const MobileDrawer = ({ isOpen, onOpenChange }: MobileDrawerProps) => {
  const { isAuthenticated, isAdmin, isOwner, logout } = useAuth();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  const closeDrawer = () => onOpenChange(false);

  const logoDestination = isAuthenticated ? (isAdmin ? '/admin' : '/dashboard') : '/';

  const navigationItems = [
    ...(isAuthenticated ? [] : [
      { to: "/", label: "Home", icon: Home },
      { to: "/login", label: "Login", icon: LogIn },
      { to: "/register", label: "Register", icon: UserPlus },
    ]),
    ...(isOwner ? [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/menu-builder", label: "Menu Builder", icon: MenuIcon },
      { to: "/qr-code", label: "QR Code", icon: QrCode },
      { to: "/profile", label: "Profile", icon: User },
    ] : []),
    ...(isAdmin ? [
      { to: "/admin", label: "Admin Panel", icon: Settings },
    ] : []),
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>
            <Link to={logoDestination} onClick={closeDrawer} className="flex items-center gap-2">
              <img src={logo} alt="Menuor" className="h-6 w-auto" />
            </Link>
          </SheetTitle>
        </SheetHeader>
        <div className="mt-8 flex flex-col gap-4">
          {navigationItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={closeDrawer}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                isActive(item.to)
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
          {isAuthenticated && (
            <Button
              onClick={() => {
                logout();
                closeDrawer();
              }}
              className="logout-btn mt-4 w-full justify-start gap-3"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileDrawer;
