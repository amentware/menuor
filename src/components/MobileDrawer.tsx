import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Menu, Home, LayoutDashboard, Menu as MenuIcon, QrCode, Settings, LogOut, User, LogIn, UserPlus } from 'lucide-react';
import logo from '../assets/navicon.png';

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
    ...(isAuthenticated ? [
      {
        to: "#",
        label: "Logout",
        icon: LogOut,
        onClick: () => {
          logout();
          closeDrawer();
        },
        className: "mt-4 text-red-600 hover:bg-red-50 hover:text-red-700"
      }
    ] : [])
  ];

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-4 w-6" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="px-6 pb-10">
        <div className="flex flex-col h-full pt-2">
          {/* <div className="mb-6">
            <img src={logo} alt="Menuor" className="h-6 w-auto" />
          </div> */}
          
          <div className="flex flex-col justify-between flex-1 pt-2">
            <nav className="flex-1 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                if (item.onClick) {
                  return (
                    <button
                      key={item.to}
                      onClick={item.onClick}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${item.className || ''} ${
                        isActive(item.to)
                          ? 'bg-gray-50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </button>
                  );
                }
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={closeDrawer}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg ${item.className || ''} ${
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
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileDrawer;
