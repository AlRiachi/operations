import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  AlertTriangle,
  Bug,
  Activity,
  FileText,
  Users,
  Settings,
  LogOut,
  Zap,
  Menu,
  X
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  active?: boolean;
};

export function Sidebar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);
  
  if (!user) return null;
  
  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/",
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: location === "/"
    },
    {
      title: "Events",
      href: "/events",
      icon: <AlertTriangle className="h-5 w-5" />,
      active: location === "/events"
    },
    {
      title: "Defects",
      href: "/defects",
      icon: <Bug className="h-5 w-5" />,
      active: location === "/defects"
    },
    {
      title: "Signals",
      href: "/signals",
      icon: <Activity className="h-5 w-5" />,
      active: location === "/signals"
    },
    {
      title: "Reports",
      href: "/reports",
      icon: <FileText className="h-5 w-5" />,
      active: location === "/reports"
    },
    {
      title: "Team",
      href: "/team",
      icon: <Users className="h-5 w-5" />,
      active: location === "/team"
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
      active: location === "/settings"
    }
  ];
  
  // Get user initials for avatar
  const getInitials = () => {
    return `${user.firstName[0]}${user.lastName[0]}`;
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const sidebarClasses = `
    fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-20 transition-transform duration-300 transform
    ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
  `;
  
  return (
    <>
      {/* Mobile menu toggle button */}
      <button
        className="md:hidden fixed z-30 top-4 left-4 p-2 rounded-md bg-white shadow-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6 text-textColor" />
        ) : (
          <Menu className="h-6 w-6 text-textColor" />
        )}
      </button>
      
      {/* Backdrop for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-10"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      <aside className={sidebarClasses}>
        <div className="flex flex-col h-full">
          {/* Logo area */}
          <div className="p-6 border-b border-neutral-300">
            <div className="flex items-center">
              <div className="bg-primary rounded p-2 mr-2">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-lg font-semibold">PowerPlant Ops</h1>
            </div>
          </div>
          
          {/* User area */}
          <div className="p-4 border-b border-neutral-300">
            <div className="flex items-center">
              <Avatar className="h-10 w-10 bg-accent text-white">
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user.role}
                </p>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <ScrollArea className="flex-1">
            <nav className="px-4 py-6">
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>
                      <a className={`flex items-center px-3 py-2 text-sm rounded-md 
                        ${item.active 
                          ? "bg-primary text-white" 
                          : "hover:bg-neutral-200 text-textColor"
                        }`}
                      >
                        <span className="mr-3">{item.icon}</span>
                        <span>{item.title}</span>
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </ScrollArea>
          
          {/* Logout button */}
          <div className="p-4 border-t border-neutral-300">
            <Button 
              variant="ghost" 
              className="flex w-full items-center justify-start text-sm text-destructive hover:text-destructive/90 hover:bg-destructive/10 px-3 py-2 h-auto"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-5 w-5 mr-2" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
