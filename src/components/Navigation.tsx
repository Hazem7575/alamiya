import { Button } from '@/components/ui/button';
import { Settings, LayoutDashboard, History } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { canViewDashboard, canViewSettings, canViewHistory } = usePermissions();

  const allNavItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      permission: canViewDashboard,
    },

    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/settings',
      permission: canViewSettings,
    },
    {
      id: 'history',
      label: '', // Empty label to show only icon
      icon: History,
      path: '/history',
      permission: canViewHistory,
    },
  ];

  // Filter nav items based on permissions
  const navItems = allNavItems.filter(item => item.permission());

  // Don't render navigation if no items are available
  if (navItems.length === 0) {
    return null;
  }

  return (
    <nav className="flex gap-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <Button
            key={item.id}
            variant={isActive ? 'default' : 'ghost'}
            size="sm"
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-2 border !border-[rgb(var(--border))] ${
              isActive 
                ? 'bg-primary  text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.label && <span>{item.label}</span>}
          </Button>
        );
      })}
    </nav>
  );
}