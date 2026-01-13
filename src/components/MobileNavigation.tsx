import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Activity, 
  TrendingUp, 
  User,
  Heart,
  Trophy
} from "lucide-react";
import IconWrapper from "@/components/ui/icon-wrapper";
import { useMobile } from "@/hooks/useMobile";

const MobileNavigation = () => {
  const location = useLocation();
  const { triggerHaptic } = useMobile();

  const handleNavClick = () => {
    triggerHaptic('light');
  };

  const navItems = [
    {
      path: "/dashboard",
      icon: Home,
      label: "Home",
      color: "primary" as const
    },
    {
      path: "/wellness",
      icon: Trophy,
      label: "Vitality",
      color: "warning" as const
    },
    {
      path: "/activities",
      icon: Activity,
      label: "Activities",
      color: "success" as const
    },
    {
      path: "/insights",
      icon: TrendingUp,
      label: "Insights",
      color: "info" as const
    },
    {
      path: "/profile",
      icon: User,
      label: "Profile",
      color: "secondary" as const
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50 md:hidden">
      <div className="flex justify-around items-center py-2 px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className="flex flex-col items-center py-2 px-3 min-w-0 flex-1"
            >
              <div className={`transition-all duration-200 ${isActive ? 'scale-110' : ''}`}>
                <IconWrapper 
                  icon={item.icon} 
                  variant={isActive ? "soft" : "minimal"} 
                  size="sm" 
                  color={isActive ? item.color : "primary"} 
                />
              </div>
              <span className={`text-xs mt-1 transition-colors duration-200 ${
                isActive ? 'text-primary font-medium' : 'text-gray-500'
              }`}>
                {item.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 bg-primary rounded-full mt-1" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavigation;