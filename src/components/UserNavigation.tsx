import { Button } from '@/components/ui/button';
import { Users, Shield, UserCheck } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export function UserNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      id: 'users',
      label: 'المستخدمين',
      icon: Users,
      path: '/users',
    },
    {
      id: 'roles',
      label: 'الأدوار',
      icon: Shield,
      path: '/roles',
    },
  ];

  return (
    <nav className="flex gap-2 mb-6">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <Button
            key={item.id}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-2`}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Button>
        );
      })}
    </nav>
  );
}






