import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, MapPin, Edit, Trash2, Loader2, Lock } from 'lucide-react';
import { useCities, useCreateCity, useUpdateCity, useDeleteCity } from '@/hooks/useApi';
import { CreateCityRequest } from '@/types/api';
import { toast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';

export function CityManager() {
  const { hasPermission } = usePermissions();
  
  // Permission checks
  const canCreate = hasPermission('cities.create');
  const canEdit = hasPermission('cities.edit');
  const canDelete = hasPermission('cities.delete');
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<any>(null);
  const [newCity, setNewCity] = useState<CreateCityRequest>({
    name: '',
    country: 'السعودية',
    is_active: true
  });

  const { data: cities, isLoading } = useCities();
  const createCityMutation = useCreateCity();
  const updateCityMutation = useUpdateCity();
  const deleteCityMutation = useDeleteCity();

  const handleCreateCity = async () => {
    if (!canCreate) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to create cities",
      });
      return;
    }
    
    if (!newCity.name.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "City name is required",
      });
      return;
    }

    try {
      await createCityMutation.mutateAsync(newCity);
      setNewCity({ name: '', country: 'السعودية', is_active: true });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create city:', error);
    }
  };

  const handleUpdateCity = async () => {
    if (!canEdit) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to edit cities",
      });
      return;
    }
    
    if (!editingCity || !editingCity.name.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "City name is required",
      });
      return;
    }

    try {
      await updateCityMutation.mutateAsync({
        id: editingCity.id,
        city: {
          name: editingCity.name,
          country: editingCity.country,
          is_active: editingCity.is_active
        }
      });
      setEditingCity(null);
    } catch (error) {
      console.error('Failed to update city:', error);
    }
  };

  const handleDeleteCity = async (id: number) => {
    if (!canDelete) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to delete cities",
      });
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this city?')) {
      try {
        await deleteCityMutation.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete city:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
        <h3 className="text-lg font-medium mb-2">Loading Cities</h3>
        <p className="text-muted-foreground">Please wait...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <MapPin className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">City Management</h2>
                {!canCreate && !canEdit && !canDelete && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Read-only
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">Manage cities in the system</p>
            </div>
          </div>
          
          {/* Only show Add City button if user has create permission */}
          {canCreate && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add City
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New City</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="city-name">City Name</Label>
                  <Input
                    id="city-name"
                    value={newCity.name}
                    onChange={(e) => setNewCity(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter city name"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={newCity.country}
                    onChange={(e) => setNewCity(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="Enter country"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateCity}
                    disabled={createCityMutation.isPending}
                  >
                    {createCityMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Create City
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          Total Cities: {cities?.length || 0}
        </div>
      </Card>

      {/* Cities List */}
      <div className="grid gap-4">
        {!cities || cities.length === 0 ? (
          <Card className="p-8 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Cities Found</h3>
            <p className="text-muted-foreground">Start by adding your first city</p>
          </Card>
        ) : (
          cities.map((city) => (
            <Card key={city.id} className="p-4 border !shadow-none">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="font-medium">{city.name}</h3>
                    <p className="text-sm text-muted-foreground">{city.country}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Edit button - Only show if user has edit permission */}
                  {canEdit && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingCity(city)}
                      title={`Edit ${city.name}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {/* Delete button - Only show if user has delete permission */}
                  {canDelete && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteCity(city.id)}
                      disabled={deleteCityMutation.isPending}
                      title={`Delete ${city.name}`}
                    >
                      {deleteCityMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  
                  {/* Show read-only indicator if user has no edit/delete permissions */}
                  {!canEdit && !canDelete && (
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Lock className="h-4 w-4" />
                      <span>Read-only</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog - Only show if user has edit permission */}
      {canEdit && (
        <Dialog open={!!editingCity} onOpenChange={() => setEditingCity(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit City</DialogTitle>
            </DialogHeader>
            {editingCity && (
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="edit-city-name">City Name</Label>
                <Input
                  id="edit-city-name"
                  value={editingCity.name}
                  onChange={(e) => setEditingCity(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter city name"
                />
              </div>
              <div>
                <Label htmlFor="edit-country">Country</Label>
                <Input
                  id="edit-country"
                  value={editingCity.country}
                  onChange={(e) => setEditingCity(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="Enter country"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setEditingCity(null)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateCity}
                  disabled={updateCityMutation.isPending}
                >
                  {updateCityMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Update City
                </Button>
              </div>
            </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}