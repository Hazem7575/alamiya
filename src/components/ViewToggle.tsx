import { Button } from '@/components/ui/button';
import { ViewMode } from '@/types';
import { Calendar, CalendarDays, Table } from 'lucide-react';

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  const views = [
    { id: 'table' as ViewMode, label: 'Table', icon: Table },
    { id: 'monthly' as ViewMode, label: 'Monthly', icon: Calendar },
    { id: 'weekly' as ViewMode, label: 'Weekly', icon: CalendarDays },
  ];

  return (
    <div className="inline-flex bg-white rounded-lg p-1  border">
      {views.map(({ id, label, icon: Icon }) => (
        <Button
          key={id}
          variant={currentView === id ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange(id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
            currentView === id 
              ? 'bg-primary text-primary-foreground  font-medium' 
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
          }`}
        >
          <Icon className="h-4 w-4" />
          <span className="font-medium">{label}</span>
        </Button>
      ))}
    </div>
  );
}