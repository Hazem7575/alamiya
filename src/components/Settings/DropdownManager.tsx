import { useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Trash2, Edit2, Save, X, Loader2, Lock, Palette } from 'lucide-react';
import { LIGHT_BADGE_COLORS, getEventTypeBadgeVariant, type LightBadgeColor } from '@/lib/utils';
import { DropdownConfig, DropdownOption } from '@/types';
import { toast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { 
  useCreateEventType, 
  useUpdateEventType, 
  useDeleteEventType,
  useCreateVenue,
  useUpdateVenue, 
  useDeleteVenue,
  useCreateObserver,
  useUpdateObserver,
  useDeleteObserver,
  useCities,
  useVenues,
  useObservers
} from '@/hooks/useApi';

interface DropdownManagerProps {
  config: DropdownConfig;
}

export function DropdownManager({ config }: DropdownManagerProps) {
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();
  
  // Helper functions for permissions
  const getPermissions = (type: keyof DropdownConfig) => {
    switch (type) {
      case 'eventTypes':
        return {
          create: 'event_types.create',
          edit: 'event_types.edit',
          delete: 'event_types.delete'
        };
      case 'venues':
        return {
          create: 'venues.create',
          edit: 'venues.edit',
          delete: 'venues.delete'
        };
      case 'obs':
        return {
          create: 'observers.create',
          edit: 'observers.edit',
          delete: 'observers.delete'
        };
      default:
        return { create: '', edit: '', delete: '' };
    }
  };

  const canCreate = (type: keyof DropdownConfig) => hasPermission(getPermissions(type).create);
  const canEdit = (type: keyof DropdownConfig) => hasPermission(getPermissions(type).edit);
  const canDelete = (type: keyof DropdownConfig) => hasPermission(getPermissions(type).delete);

  const [editingItem, setEditingItem] = useState<{ type: string; id: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [activeDropdownTab, setActiveDropdownTab] = useState('eventTypes');
  const [selectedLightColors, setSelectedLightColors] = useState<Record<string, string>>({});
  const [hasInitialized, setHasInitialized] = useState(false);
  const [eventTypeColors, setEventTypeColors] = useState<Record<string, string>>({
    RSL: '#ef4444',
    FDL: '#3b82f6', 
    WOMEN: '#ec4899',
    NEOM: '#10b981',
    'First Division League': '#3b82f6',
    'NEOM League': '#10b981', 
    'Roshn Saudi League': '#ef4444',
    "Women's League": '#ec4899',
    'Youth League': '#f59e0b'
  });
  const [newValues, setNewValues] = useState({
    eventTypes: '',
    venues: '',
    obs: ''
  });

  // Mutation hooks
  const createEventType = useCreateEventType();
  const updateEventType = useUpdateEventType(); 
  const deleteEventType = useDeleteEventType();
  const createVenue = useCreateVenue();
  const updateVenue = useUpdateVenue();
  const deleteVenue = useDeleteVenue();
  const createObserver = useCreateObserver();
  const updateObserver = useUpdateObserver();
  const deleteObserver = useDeleteObserver();
  
  // Conditional data fetching for venues and observers
  const { data: citiesResponse } = useCities();
  const { data: venuesResponse, isLoading: venuesLoading } = useVenues({
    enabled: activeDropdownTab === 'venues'
  });
  const { data: observersResponse, isLoading: observersLoading } = useObservers({
    enabled: activeDropdownTab === 'obs'
  });

  // Prevent tab reset by maintaining state consistency
  useEffect(() => {
    if (!hasInitialized) {
      setHasInitialized(true);
    }
  }, [hasInitialized]);

  // Generate colors for new event types
  const getColorForEventType = (eventType: string): string => {
    if (eventTypeColors[eventType]) {
      return eventTypeColors[eventType];
    }
    
    // Default colors palette for new event types
    const defaultColors = [
      '#3b82f6', // Blue
      '#ef4444', // Red  
      '#ec4899', // Pink
      '#10b981', // Green
      '#f59e0b', // Yellow
      '#8b5cf6', // Purple
      '#06b6d4', // Cyan
      '#f97316', // Orange
      '#84cc16', // Lime
      '#6366f1'  // Indigo
    ];
    
    // Use hash of name to consistently assign colors
    let hash = 0;
    for (let i = 0; i < eventType.length; i++) {
      const char = eventType.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    const colorIndex = Math.abs(hash) % defaultColors.length;
    const color = defaultColors[colorIndex];
    
    // Save this color for future use
    const newColors = { ...eventTypeColors, [eventType]: color };
    setEventTypeColors(newColors);
    localStorage.setItem('eventTypeColors', JSON.stringify(newColors));
    
    // Apply color to CSS variables
    document.documentElement.style.setProperty(`--event-${eventType.toLowerCase().replace(/\s+/g, '-')}-color`, color);
    
    return color;
  };

  const updateEventTypeColor = async (eventType: string, color: string) => {
    // Check permission before allowing color change
    if (!canEdit('eventTypes')) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to edit event type colors"
      });
      return;
    }

    // Find the event type item to get its ID
    const eventTypeItem = config.eventTypes.find(item => item.value === eventType);
    if (!eventTypeItem) {
      toast({
        variant: "destructive",
        title: "Error", 
        description: "Event type not found"
      });
      return;
    }

    const newColors = { ...eventTypeColors, [eventType]: color };
    setEventTypeColors(newColors);
    
    // Apply color to CSS
    const root = document.documentElement;
    root.style.setProperty(`--event-${eventType.toLowerCase().replace(/\s+/g, '-')}-color`, color);
    
    // Store in localStorage
    localStorage.setItem('eventTypeColors', JSON.stringify(newColors));

    // Update color in backend
    try {
      await updateEventType.mutateAsync({ 
        id: parseInt(eventTypeItem.id), 
        color: color 
      });
    } catch (error) {
      // Revert local changes if backend update fails
      const revertedColors = { ...eventTypeColors };
      setEventTypeColors(revertedColors);
      localStorage.setItem('eventTypeColors', JSON.stringify(revertedColors));
      root.style.setProperty(`--event-${eventType.toLowerCase().replace(/\s+/g, '-')}-color`, revertedColors[eventType] || '#3b82f6');
    }
  };

  // Function to update event type with light color variant
  const updateEventTypeLightColor = async (eventType: string, lightColorVariant: string) => {
    // Check permission before allowing color change
    if (!canEdit('eventTypes')) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to edit event type colors"
      });
      return;
    }

    // Find the event type item to get its ID
    const eventTypeItem = config.eventTypes.find(item => item.value === eventType);
    if (!eventTypeItem) {
      toast({
        variant: "destructive",
        title: "Error", 
        description: "Event type not found"
      });
      return;
    }

    try {
      // Update backend with light color variant
      await updateEventType.mutateAsync({
        id: parseInt(eventTypeItem.id),
        color: lightColorVariant // Store the light color variant instead of hex
      });

      // Update local state after successful backend update
      const newLightColors = { ...selectedLightColors, [eventType]: lightColorVariant };
      setSelectedLightColors(newLightColors);
      
      // ✅ Invalidate queries for immediate data refresh without page reload
      await queryClient.invalidateQueries({ queryKey: ['eventTypes'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      await queryClient.invalidateQueries({ queryKey: ['events'] });
      
      toast({
        title: "Color Updated",
        description: `${eventType} color has been updated successfully.`
      });
    } catch (error) {
      console.error('Failed to update light color:', error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update event type color. Please try again."
      });
    }
  };

  // Get the light color variant for an event type
  const getLightColorForEventType = (eventType: string): LightBadgeColor => {
    // First check if we have the color from backend (config.eventTypes)
    const eventTypeData = config.eventTypes.find(item => item.value === eventType);
    
    // If backend has a light color variant stored, use it
    if (eventTypeData?.color && LIGHT_BADGE_COLORS.includes(eventTypeData.color as any)) {
      return eventTypeData.color as LightBadgeColor;
    }
    
    // Otherwise use auto-generated color
    return getEventTypeBadgeVariant(eventType);
  };

  useEffect(() => {
    // Load light colors from backend config instead of localStorage
    const lightColorsFromBackend: Record<string, string> = {};
    
    config.eventTypes.forEach(eventType => {
      if (eventType.color && LIGHT_BADGE_COLORS.includes(eventType.color as any)) {
        lightColorsFromBackend[eventType.value] = eventType.color;
      }
    });
    
    setSelectedLightColors(lightColorsFromBackend);
  }, [config.eventTypes]);

  useEffect(() => {
    // Load saved colors on mount
    const savedColors = localStorage.getItem('eventTypeColors');
    if (savedColors) {
      try {
        const colorMap = JSON.parse(savedColors);
        setEventTypeColors(prevColors => ({ ...prevColors, ...colorMap }));
        // Apply colors to CSS
        Object.entries(colorMap).forEach(([eventType, color]) => {
          document.documentElement.style.setProperty(`--event-${eventType.toLowerCase().replace(/\s+/g, '-')}-color`, color as string);
        });
      } catch (e) {
        console.error('Failed to load saved colors:', e);
      }
    } else {
      // Apply default colors to CSS on first mount
      const defaultColors = {
        RSL: '#ef4444',
        FDL: '#3b82f6', 
        WOMEN: '#ec4899',
        NEOM: '#10b981',
        'First Division League': '#3b82f6',
        'NEOM League': '#10b981', 
        'Roshn Saudi League': '#ef4444',
        "Women's League": '#ec4899',
        'Youth League': '#f59e0b'
      };
      
      Object.entries(defaultColors).forEach(([eventType, color]) => {
        document.documentElement.style.setProperty(`--event-${eventType.toLowerCase().replace(/\s+/g, '-')}-color`, color);
      });
    }
  }, []);

  const handleEdit = (type: string, item: DropdownOption) => {
    // Check permission before allowing edit
    if (!canEdit(type as keyof DropdownConfig)) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: `You don't have permission to edit ${type}`
      });
      return;
    }
    
    setEditingItem({ type, id: item.id });
    setEditValue(item.label);
  };

  const handleSave = async (type: keyof DropdownConfig) => {
    if (!editingItem || !editValue.trim()) return;

    // Check permission before allowing save
    if (!canEdit(type)) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: `You don't have permission to edit ${type}`
      });
      return;
    }

    const id = parseInt(editingItem.id);
    const newName = editValue.trim();

    try {
      switch (type) {
        case 'eventTypes':
          await updateEventType.mutateAsync({ id, name: newName });
          break;
        case 'venues':
          await updateVenue.mutateAsync({ id, name: newName });
          break;
        case 'obs':
          await updateObserver.mutateAsync({ id, code: newName });
          break;
        default:
          toast({ 
            variant: "destructive", 
            title: "Error", 
            description: "This type cannot be edited yet" 
          });
          return;
      }
      
      setEditingItem(null);
      setEditValue('');
    } catch (error) {
      // Error is already handled by the hooks
    }
  };

  const handleDelete = async (type: keyof DropdownConfig, id: string) => {
    // Check permission before allowing delete
    if (!canDelete(type)) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: `You don't have permission to delete ${type}`
      });
      return;
    }

    const numId = parseInt(id);

    try {
      switch (type) {
        case 'eventTypes':
          await deleteEventType.mutateAsync(numId);
          break;
        case 'venues':
          await deleteVenue.mutateAsync(numId);
          break;
        case 'obs':
          await deleteObserver.mutateAsync(numId);
          break;
        default:
          toast({ 
            variant: "destructive", 
            title: "Error", 
            description: "This type cannot be deleted yet" 
          });
          return;
      }
    } catch (error) {
      // Error is already handled by the hooks
    }
  };

  const handleAdd = async (type: keyof DropdownConfig) => {
    const value = newValues[type].trim();
    if (!value) return;

    // Check permission before allowing add
    if (!canCreate(type)) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: `You don't have permission to create ${type}`
      });
      return;
    }

    try {
      switch (type) {
        case 'eventTypes':
          // Generate color for new event type
          const newColor = getColorForEventType(value);
          await createEventType.mutateAsync({ 
            name: value, 
            code: value.toLowerCase().replace(/\s+/g, '_'),
            description: `${value} events`,
            color: newColor
          });
          break;
        case 'venues':
          // Default to first city if available  
          const firstCity = citiesResponse && citiesResponse.length > 0 ? citiesResponse[0] : null;
          if (!firstCity) {
            toast({ 
              variant: "destructive", 
              title: "Error", 
              description: "Please create cities first before adding venues" 
            });
            return;
          }
          await createVenue.mutateAsync({ 
            name: value, 
            city_id: firstCity.id,
            address: `${value} Address`,
            capacity: 30000
          });
          break;
        case 'obs':
          await createObserver.mutateAsync({ 
            code: value
          });
          break;
        default:
          toast({ 
            variant: "destructive", 
            title: "Error", 
            description: "This type cannot be added yet" 
          });
          return;
      }
      
      setNewValues({ ...newValues, [type]: '' });
    } catch (error) {
      // Error is already handled by the hooks
    }
  };

  const renderDropdownSection = (
    type: keyof DropdownConfig,
    title: string,
    items: DropdownOption[]
  ) => {
    const permissions = getPermissions(type);
    const hasAnyPermission = canCreate(type) || canEdit(type) || canDelete(type);
    
    return (
      <Card className="p-6 !border !shadow-none">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          {!hasAnyPermission && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span>Read-only</span>
            </div>
          )}
        </div>
      
      {/* Add new item - Only show if user has create permission */}
      {canCreate(type) && (
        <div className="flex gap-2 mb-6">
          <Input
            className="border-2 border-muted-foreground/20 focus:border-primary/50 transition-all"
            placeholder={`Add new ${title.toLowerCase()}...`}
            value={newValues[type]}
            onChange={(e) => setNewValues({ ...newValues, [type]: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd(type)}
          />
          <Button 
            onClick={() => handleAdd(type)} 
            size="sm"
            disabled={
              (type === 'eventTypes' && createEventType.isPending) ||
              (type === 'venues' && createVenue.isPending) ||
              (type === 'obs' && createObserver.isPending)
            }
          >
            {((type === 'eventTypes' && createEventType.isPending) ||
              (type === 'venues' && createVenue.isPending) ||
              (type === 'obs' && createObserver.isPending)) ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}

      {/* Items list */}
      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="mb-2">No {title.toLowerCase()} available</p>
          </div>
        ) : (
          items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-4 border-2 border-muted rounded-lg bg-card hover:bg-muted/5 transition-colors">
                  {editingItem?.type === type && editingItem?.id === item.id && canEdit(type) ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 border-2 border-primary/30 focus:border-primary"
                        placeholder={`Edit ${title.toLowerCase()}...`}
                      />
                {canEdit(type) && (
                  <Button
                    size="sm"
                    onClick={() => handleSave(type)}
                    disabled={
                      (type === 'eventTypes' && updateEventType.isPending) ||
                      (type === 'venues' && updateVenue.isPending) ||
                      (type === 'obs' && updateObserver.isPending)
                    }
                  >
                    {((type === 'eventTypes' && updateEventType.isPending) ||
                      (type === 'venues' && updateVenue.isPending) ||
                      (type === 'obs' && updateObserver.isPending)) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingItem(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={type === 'eventTypes' ? getLightColorForEventType(item.value) : "outline"}
                  >
                    {item.label}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-1">
                  {/* Light color selector for event types - Only show if user has edit permission */}
                  {type === 'eventTypes' && canEdit(type) && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          title={`Change ${item.label} color`}
                          disabled={updateEventType.isPending}
                          className="w-8 h-8 p-0"
                        >
                          <Palette className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-3" align="start">
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-foreground">
                            Choose Light Color
                          </h4>
                          <div className="grid grid-cols-5 gap-2">
                            {LIGHT_BADGE_COLORS.map((colorVariant) => (
                              <button
                                key={colorVariant}
                                onClick={() => updateEventTypeLightColor(item.value, colorVariant)}
                                className={`p-2 rounded-lg border-2 transition-all ${
                                  getLightColorForEventType(item.value) === colorVariant
                                    ? 'border-primary shadow-md'
                                    : 'border-transparent hover:border-muted-foreground/30'
                                }`}
                                title={colorVariant.replace('light_', '').charAt(0).toUpperCase() + colorVariant.replace('light_', '').slice(1)}
                              >
                                <Badge variant={colorVariant} className="w-full text-xs px-1">
                                  {colorVariant.replace('light_', '').charAt(0).toUpperCase()}
                                </Badge>
                              </button>
                            ))}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Current: <Badge variant={getLightColorForEventType(item.value)} className="ml-1">
                              {item.label}
                            </Badge>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                  
                  {/* Edit button - Only show if user has edit permission */}
                  {canEdit(type) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(type, item)}
                      title={`Edit ${item.label}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}

                  {/* Delete button - Only show if user has delete permission */}
                  {canDelete(type) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(type, item.id)}
                      className="text-destructive hover:text-destructive"
                      disabled={
                        (type === 'eventTypes' && deleteEventType.isPending) ||
                        (type === 'venues' && deleteVenue.isPending) ||
                        (type === 'obs' && deleteObserver.isPending)
                      }
                      title={`Delete ${item.label}`}
                    >
                      {((type === 'eventTypes' && deleteEventType.isPending) ||
                        (type === 'venues' && deleteVenue.isPending) ||
                        (type === 'obs' && deleteObserver.isPending)) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
          ))
        )}
      </div>
    </Card>
  );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Dropdown Configuration</h2>
        <p className="text-muted-foreground">
          Manage the available options for event creation dropdowns.
        </p>
      </div>

                  <Tabs
              value={activeDropdownTab}
              onValueChange={(value) => {
                if (hasInitialized) {
                  setActiveDropdownTab(value);
                }
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="eventTypes">Event Types</TabsTrigger>
          <TabsTrigger value="venues">Venues</TabsTrigger>
          <TabsTrigger value="obs">OB</TabsTrigger>
        </TabsList>
        
        <TabsContent value="eventTypes" className="mt-6">
          {renderDropdownSection('eventTypes', 'Event Types', config.eventTypes)}
        </TabsContent>
        

        <TabsContent value="venues" className="mt-6">
          {venuesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-muted-foreground">Loading venues...</p>
              </div>
            </div>
          ) : (
            renderDropdownSection('venues', 'Venues', venuesResponse?.success ? venuesResponse.data.map(venue => ({
              id: venue.id.toString(),
              value: venue.name,
              label: venue.name
            })) : [])
          )}
        </TabsContent>
        
        <TabsContent value="obs" className="mt-6">
          {observersLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-muted-foreground">Loading observers...</p>
              </div>
            </div>
          ) : (
            renderDropdownSection('obs', 'OB', config.obs)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}