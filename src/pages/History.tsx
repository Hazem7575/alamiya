import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getActivityLogs, getActivityStats } from '@/services/api';
import { 
  History as HistoryIcon, 
  Search, 
  Filter, 
  Calendar,
  User,
  Activity,
  Eye,
  Edit,
  Trash2,
  Plus,
  LogIn,
  LogOut,
  Lock,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

interface ActivityLog {
  id: number;
  action: string;
  model_type: string;
  model_id: number;
  description: string;
  old_values?: any;
  new_values?: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

interface ActivityStats {
  total_activities: number;
  activities_by_action: Record<string, number>;
  activities_by_model: Record<string, number>;
  recent_activity_count: number;
}

const History = () => {
  const { canViewHistory } = usePermissions();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    action: 'all',
    model_type: 'all',
    date_from: '',
    date_to: '',
    search: ''
  });
  const { toast } = useToast();

  // Check permissions
  if (!canViewHistory()) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Access Denied" subtitle="You don't have permission to view this page" />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <HistoryIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="text-muted-foreground text-center">
                You don't have permission to view the activity history.
                <br />
                Please contact your administrator for access.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const actionIcons: Record<string, any> = {
    'login': LogIn,
    'logout': LogOut,
    'created': Plus,
    'updated': Edit,
    'deleted': Trash2,
    'viewed': Eye,
    'password_changed': Lock,
  };

  const actionColors: Record<string, string> = {
    'login': 'bg-green-100 text-green-800',
    'logout': 'bg-gray-100 text-gray-800',
    'created': 'bg-blue-100 text-blue-800',
    'updated': 'bg-yellow-100 text-yellow-800',
    'deleted': 'bg-red-100 text-red-800',
    'viewed': 'bg-purple-100 text-purple-800',
    'password_changed': 'bg-orange-100 text-orange-800',
  };

  const fetchActivities = async (page = 1, customFilters?: any) => {
    try {
      setLoading(true);
      
      const currentFilters = customFilters || filters;
      
      // Prepare filters for API call
      const apiFilters = {
        ...currentFilters,
        action: currentFilters.action === 'all' ? '' : currentFilters.action,
        model_type: currentFilters.model_type === 'all' ? '' : currentFilters.model_type,
      };
      
      console.log('Sending filters:', apiFilters);
      const response = await getActivityLogs(page, 20, apiFilters);
      
      if (response.success) {
        setActivities(response.data.data);
        setCurrentPage(response.data.current_page);
        setTotalPages(response.data.last_page);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch activity logs",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        title: "Error",
        description: "An error occurred while fetching activity logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Prepare filters for API call
      const apiFilters = {
        ...filters,
        action: filters.action === 'all' ? '' : filters.action,
        model_type: filters.model_type === 'all' ? '' : filters.model_type,
      };
      
      const response = await getActivityStats(apiFilters);
      
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchActivities();
    fetchStats();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchActivities(1, filters);
    fetchStats();
  };

  const clearFilters = () => {
    setFilters({
      action: 'all',
      model_type: 'all',
      date_from: '',
      date_to: '',
      search: ''
    });
    setCurrentPage(1);
    fetchActivities(1);
    fetchStats();
  };

  const getActionIcon = (action: string) => {
    const IconComponent = actionIcons[action] || Activity;
    return <IconComponent className="h-4 w-4" />;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return dateString;
    }
  };



  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-6 py-8">
        <Header 
          title="Activity History"
          subtitle="Track all activities and changes in the system"
          showNavigation={true}
        />

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_activities}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Activities</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.recent_activity_count}</div>
                <p className="text-xs text-muted-foreground">Last 7 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Most Common Action</CardTitle>
                <Edit className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.keys(stats.activities_by_action).length > 0 
                    ? Object.entries(stats.activities_by_action).reduce((a, b) => 
                        stats.activities_by_action[a[0]] > stats.activities_by_action[b[0]] ? a : b
                      )[0]
                    : 'N/A'
                  }
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Most Active Model</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.keys(stats.activities_by_model).length > 0 
                    ? Object.entries(stats.activities_by_model).reduce((a, b) => 
                        stats.activities_by_model[a[0]] > stats.activities_by_model[b[0]] ? a : b
                      )[0]
                    : 'N/A'
                  }
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            <CardDescription>
              Filter activities by action, model type, or date range
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div>
                <Label htmlFor="action">Action</Label>
                <Select value={filters.action} onValueChange={(value) => handleFilterChange('action', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="logout">Logout</SelectItem>
                    <SelectItem value="created">Created</SelectItem>
                    <SelectItem value="updated">Updated</SelectItem>
                    <SelectItem value="deleted">Deleted</SelectItem>
                    <SelectItem value="viewed">Viewed</SelectItem>
                    <SelectItem value="password_changed">Password Changed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="model_type">Model Type</Label>
                <Select value={filters.model_type} onValueChange={(value) => handleFilterChange('model_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Models" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Models</SelectItem>
                    <SelectItem value="Event">Event</SelectItem>
                    <SelectItem value="User">User</SelectItem>
                    <SelectItem value="Role">Role</SelectItem>
                    <SelectItem value="City">City</SelectItem>
                    <SelectItem value="Venue">Venue</SelectItem>
                    <SelectItem value="Observer">Observer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="search">Search User</Label>
                <Input
                  id="search"
                  type="text"
                  placeholder="Search by user name or email"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="date_from">From Date</Label>
                <Input
                  id="date_from"
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => handleFilterChange('date_from', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="date_to">To Date</Label>
                <Input
                  id="date_to"
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => handleFilterChange('date_to', e.target.value)}
                />
              </div>

              <div className="flex items-end gap-2">
                <Button onClick={applyFilters} className="flex-1">
                  <Search className="h-4 w-4 mr-2" />
                  Apply
                </Button>
                <Button variant="outline" onClick={clearFilters}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activities Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HistoryIcon className="h-5 w-5" />
              Activity Log
            </CardTitle>
            <CardDescription>
              Complete history of all activities in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Loading activities...</span>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8">
                <HistoryIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No activities found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Action</th>
                        <th className="text-left py-3 px-4 font-medium">Description</th>
                        <th className="text-left py-3 px-4 font-medium">User</th>
                        <th className="text-left py-3 px-4 font-medium">Model</th>
                        <th className="text-left py-3 px-4 font-medium">Date & Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activities.map((activity) => (
                        <tr key={activity.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <Badge 
                              className={`inline-flex items-center gap-1 w-fit ${actionColors[activity.action] || 'bg-gray-100 text-gray-800'}`}
                              variant="secondary"
                            >
                              {getActionIcon(activity.action)}
                              <span className="capitalize">{activity.action}</span>
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="max-w-md">
                              <p className="text-sm">{activity.description}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{activity.user?.name || 'Unknown User'}</p>
                                <p className="text-xs text-muted-foreground">{activity.user?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">
                              {activity.model_type}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {formatDate(activity.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchActivities(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchActivities(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default History;
