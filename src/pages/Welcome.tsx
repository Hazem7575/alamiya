import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Eye, UserCheck } from 'lucide-react';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Header */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-xl shadow-card mr-4">
            <Building2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground">Alamiya Calendar</h1>
            <p className="text-xl text-muted-foreground">Sports Events Management System</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
          Welcome to Alamiya Calendar - your comprehensive platform for managing and viewing sports events, 
          venues, and schedules across Saudi Arabia.
        </p>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/guest')}>
            <Eye className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-3">View Schedule</h2>
            <p className="text-muted-foreground mb-4">
              Browse all upcoming events, schedules, and venues as a guest. No login required.
            </p>
            <Button variant="outline" className="w-full">
              👁️ View as Guest
            </Button>
          </Card>

          <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/login')}>
            <UserCheck className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-3">Admin Dashboard</h2>
            <p className="text-muted-foreground mb-4">
              Access the full management dashboard with event creation and editing capabilities.
            </p>
            <Button className="w-full">
              🔐 Login to Admin Panel
            </Button>
          </Card>
        </div>

        {/* Footer */}
        <footer className="mt-16 py-6">
          <p className="text-xs text-muted-foreground">Powered by Konhub</p>
        </footer>
      </div>
    </div>
  );
};

export default Welcome;
