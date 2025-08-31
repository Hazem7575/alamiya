import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { MapPin, AlertTriangle, Filter, Search, Save, Plus, Loader2, Lock } from 'lucide-react';
import { DropdownOption } from '@/types';
import { toast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import debounce from 'lodash/debounce';
import { 
  useCities, 
  useDistances, 
  useMissingDistances, 
  useBatchUpdateDistances,
  useCreateDistance,
  useUpdateDistance,
  useDeleteDistance
} from '@/hooks/useApi';
import { City, CityDistance as ApiCityDistance } from '@/types/api';

interface CityDistance {
  fromCityId: number;
  toCityId: number;
  fromCity: string;
  toCity: string;
  distance: number | null;
  id?: number;
}

interface DistanceManagerProps {
  cities: DropdownOption[];
}

export function DistanceManager({ cities }: DistanceManagerProps) {
  const { hasPermission } = usePermissions();
  
  // Permission checks - for distance management, we need cities.edit permission
  const canEditDistances = hasPermission('cities.edit');
  
  const [localDistances, setLocalDistances] = useState<CityDistance[]>([]);
  const [showMissingOnly, setShowMissingOnly] = useState(false);
  const [fromCitySearch, setFromCitySearch] = useState('');
  const [toCitySearch, setToCitySearch] = useState('');
  const [loadingPairs, setLoadingPairs] = useState<Set<string>>(new Set());
  const [pendingUpdates, setPendingUpdates] = useState<Map<string, string>>(new Map());

  // API hooks
  const { data: apiCities, isLoading: citiesLoading } = useCities();
  const { data: apiDistances, isLoading: distancesLoading } = useDistances();
  const { data: missingDistances } = useMissingDistances();
  const batchUpdateMutation = useBatchUpdateDistances();
  const createDistanceMutation = useCreateDistance();
  const updateDistanceMutation = useUpdateDistance();
  const deleteDistanceMutation = useDeleteDistance();

  // Convert API cities to local format and sync distances
  useEffect(() => {
    if (apiCities && apiDistances) {
      const pairs: CityDistance[] = [];
      
      for (let i = 0; i < apiCities.length; i++) {
        for (let j = i + 1; j < apiCities.length; j++) {
          const fromCity = apiCities[i];
          const toCity = apiCities[j];
          
          // Check if distance already exists in API
          const existingDistance = apiDistances.find(
            d => (d.from_city_id === fromCity.id && d.to_city_id === toCity.id) ||
                 (d.from_city_id === toCity.id && d.to_city_id === fromCity.id)
          );

          pairs.push({
            fromCityId: fromCity.id,
            toCityId: toCity.id,
            fromCity: fromCity.name,
            toCity: toCity.name,
            distance: existingDistance?.travel_time_hours || null,
            id: existingDistance?.id
          });
        }
      }
      
      setLocalDistances(pairs);
    }
  }, [apiCities, apiDistances]);

  // Generate all city pairs for display
  const allCityPairs = useMemo(() => {
    return localDistances;
  }, [localDistances]);

  // Filter pairs based on city searches and missing filter
  const filteredPairs = useMemo(() => {
    return allCityPairs.filter(pair => {
      const matchesFromCity = fromCitySearch === '' || 
        pair.fromCity.toLowerCase().includes(fromCitySearch.toLowerCase());
      
      const matchesToCity = toCitySearch === '' || 
        pair.toCity.toLowerCase().includes(toCitySearch.toLowerCase());

      const matchesMissingFilter = !showMissingOnly || pair.distance === null;

      return matchesFromCity && matchesToCity && matchesMissingFilter;
    });
  }, [allCityPairs, fromCitySearch, toCitySearch, showMissingOnly]);

  // Count missing distances
  const missingCount = allCityPairs.filter(pair => pair.distance === null).length;
  const totalCount = allCityPairs.length;

  // Helper function to create pair key for tracking
  const getPairKey = (fromCity: string, toCity: string) => `${fromCity}-${toCity}`;

  // Immediate UI update function
  const updateDistanceUI = (fromCity: string, toCity: string, distance: string) => {
    const distanceValue = distance === '' ? null : parseFloat(distance);
    
    // Update local state immediately for UI responsiveness
    setLocalDistances(prev => {
      return prev.map(d => {
        if ((d.fromCity === fromCity && d.toCity === toCity) ||
            (d.fromCity === toCity && d.toCity === fromCity)) {
          return { ...d, distance: distanceValue };
        }
        return d;
      });
    });

    // Store pending update
    const pairKey = getPairKey(fromCity, toCity);
    setPendingUpdates(prev => {
      const newMap = new Map(prev);
      newMap.set(pairKey, distance);
      return newMap;
    });

    // Trigger debounced backend update
    debouncedBackendUpdate(fromCity, toCity, distance);
  };

  // Backend update function
  const updateDistanceBackend = async (fromCity: string, toCity: string, distance: string) => {
    const pairKey = getPairKey(fromCity, toCity);
    
    // Mark as loading
    setLoadingPairs(prev => new Set(prev).add(pairKey));

    const distanceValue = distance === '' ? null : parseFloat(distance);

    // Find the distance pair to get IDs
    const pair = localDistances.find(d => 
      (d.fromCity === fromCity && d.toCity === toCity) ||
      (d.fromCity === toCity && d.toCity === fromCity)
    );

    if (!pair) {
      setLoadingPairs(prev => {
        const newSet = new Set(prev);
        newSet.delete(pairKey);
        return newSet;
      });
      return;
    }

    try {
      // If distance is null (cleared), delete from backend if it exists
      if (distanceValue === null) {
        if (pair.id) {
          // Delete existing distance from backend
          await deleteDistanceMutation.mutateAsync(pair.id);
          
          // Update local state to remove the ID
          setLocalDistances(prev => {
            return prev.map(d => {
              if ((d.fromCity === fromCity && d.toCity === toCity) ||
                  (d.fromCity === toCity && d.toCity === fromCity)) {
                return { ...d, id: undefined, distance: null };
              }
              return d;
            });
          });
        } else {
          // Just show toast for clearing UI value (no backend action needed)
          toast({
            title: "Distance Cleared",
            description: `Travel time between ${fromCity} and ${toCity} has been cleared.`,
          });
        }
        return;
      }

      const distanceData = {
        from_city_id: pair.fromCityId,
        to_city_id: pair.toCityId,
        travel_time_hours: distanceValue
      };

      // If distance already exists, update it; otherwise create new
      if (pair.id) {
        await updateDistanceMutation.mutateAsync({
          id: pair.id,
          distance: distanceData
        });
      } else {
        const result = await createDistanceMutation.mutateAsync(distanceData);
        // Update the local state with the new ID from backend
        setLocalDistances(prev => {
          return prev.map(d => {
            if ((d.fromCity === fromCity && d.toCity === toCity) ||
                (d.fromCity === toCity && d.toCity === fromCity)) {
              return { ...d, id: result.data.id };
            }
            return d;
          });
        });
      }

      // Show success notification only for the last update
      const currentPending = pendingUpdates.get(pairKey);
      if (currentPending === distance) {
        toast({
          title: "Distance Saved",
          description: `Travel time between ${fromCity} and ${toCity}: ${distanceValue} hours`,
        });
      }
    } catch (error: any) {
      console.error('Failed to update distance:', error);
      
      // Revert local state on error
      setLocalDistances(prev => {
        return prev.map(d => {
          if ((d.fromCity === fromCity && d.toCity === toCity) ||
              (d.fromCity === toCity && d.toCity === fromCity)) {
            // Revert to original value (get from API again)
            const originalDistance = apiDistances?.find(
              ad => (ad.from_city_id === pair.fromCityId && ad.to_city_id === pair.toCityId) ||
                    (ad.from_city_id === pair.toCityId && ad.to_city_id === pair.fromCityId)
            );
            return { ...d, distance: originalDistance?.travel_time_hours || null };
          }
          return d;
        });
      });
      
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.response?.data?.message || `Failed to update travel time between ${fromCity} and ${toCity}`,
      });
    } finally {
      // Remove loading state
      setLoadingPairs(prev => {
        const newSet = new Set(prev);
        newSet.delete(pairKey);
        return newSet;
      });
      
      // Remove from pending updates
      setPendingUpdates(prev => {
        const newMap = new Map(prev);
        newMap.delete(pairKey);
        return newMap;
      });
    }
  };

  // Debounced version of backend update (1 second delay)
  const debouncedBackendUpdate = useCallback(
    debounce((fromCity: string, toCity: string, distance: string) => {
      updateDistanceBackend(fromCity, toCity, distance);
    }, 1000),
    [localDistances, apiDistances, pendingUpdates]
  );

  const saveAllDistances = async () => {
    if (!canEditDistances) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to edit city distances",
      });
      return;
    }
    
    if (!apiCities) return;
    
    const distancesToUpdate = localDistances.filter(d => d.distance !== null);
    
    const batchRequest = {
      distances: distancesToUpdate.map(d => ({
        from_city_id: d.fromCityId,
        to_city_id: d.toCityId,
        travel_time_hours: d.distance!
      }))
    };

    try {
      await batchUpdateMutation.mutateAsync(batchRequest);
    } catch (error) {
      console.error('Failed to save distances:', error);
    }
  };

  const getDistance = (fromCity: string, toCity: string) => {
    const distance = localDistances.find(
      d => (d.fromCity === fromCity && d.toCity === toCity) ||
           (d.fromCity === toCity && d.toCity === fromCity)
    );
    return distance?.distance;
  };

  const isLoading = citiesLoading || distancesLoading;

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <MapPin className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">City Travel Time Management</h2>
                {!canEditDistances && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Read-only
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">Manage travel times between cities for route planning</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">
                {totalCount - missingCount}/{totalCount}
              </div>
              <div className="text-sm text-muted-foreground">Travel Times Configured</div>
            </div>
            
            <div className="flex items-center gap-2">
              {missingCount > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {missingCount} Missing
                </Badge>
              )}
              
              {pendingUpdates.size > 0 && (
                <Badge variant="outline" className="flex items-center gap-1 border-blue-200 text-blue-700">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {pendingUpdates.size} Saving...
                </Badge>
              )}
              
              {loadingPairs.size > 0 && pendingUpdates.size === 0 && (
                <Badge variant="outline" className="flex items-center gap-1 border-green-200 text-green-700">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Updating...
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* From City Search */}
            <div className="relative">
              <Input
                placeholder="From city..."
                value={fromCitySearch}
                onChange={(e) => setFromCitySearch(e.target.value)}
                className="pl-9 w-48"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>

            {/* To City Search */}
            <div className="relative">
              <Input
                placeholder="To city..."
                value={toCitySearch}
                onChange={(e) => setToCitySearch(e.target.value)}
                className="pl-9 w-48"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>

            {/* Missing Only Filter */}
            <div className="flex items-center space-x-2">
              <Switch
                id="missing-only"
                checked={showMissingOnly}
                onCheckedChange={setShowMissingOnly}
              />
              <Label htmlFor="missing-only" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Show Missing Only
              </Label>
            </div>
          </div>

          {/* Only show Save button if user has edit permission - now mainly for manual backup */}
          {canEditDistances && (
            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground text-right">
                <div>Auto-save enabled</div>
                <div>Changes save automatically</div>
              </div>
              {/*<Button */}
              {/*  onClick={saveAllDistances} */}
              {/*  variant="outline"*/}
              {/*  size="sm"*/}
              {/*  className="flex items-center gap-2"*/}
              {/*  disabled={batchUpdateMutation.isPending || isLoading}*/}
              {/*  title="Manual save all distances (backup)"*/}
              {/*>*/}
              {/*  {batchUpdateMutation.isPending ? (*/}
              {/*    <Loader2 className="h-4 w-4 animate-spin" />*/}
              {/*  ) : (*/}
              {/*    <Save className="h-4 w-4" />*/}
              {/*  )}*/}
              {/*  Backup Save All*/}
              {/*</Button>*/}
            </div>
          )}
          
          {/* Show read-only indicator if user has no edit permission */}
          {!canEditDistances && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Lock className="h-4 w-4" />
              <span>Read-only</span>
            </div>
          )}
        </div>
      </Card>

      {/* Distance Grid */}
      {isLoading ? (
        <Card className="p-8 text-center">
          <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-medium mb-2">Loading Cities and Distances</h3>
          <p className="text-muted-foreground">
            Please wait while we fetch the data...
          </p>
        </Card>
      ) : !apiCities || apiCities.length === 0 ? (
        <Card className="p-8 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Cities Available</h3>
          <p className="text-muted-foreground">
            Add cities in the Dropdown Configuration tab first to manage travel times.
          </p>
        </Card>
      ) : apiCities.length === 1 ? (
        <Card className="p-8 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Need More Cities</h3>
          <p className="text-muted-foreground">
            Add at least 2 cities to start managing travel times between them.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredPairs.length === 0 ? (
            <Card className="p-8 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Results Found</h3>
              <p className="text-muted-foreground">
                Try adjusting your city search terms or filters.
              </p>
            </Card>
          ) : (
            filteredPairs.map((pair, index) => (
              <Card key={`${pair.fromCity}-${pair.toCity}`} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Badge variant="outline" className="shrink-0">
                        {pair.fromCity}
                      </Badge>
                      <span className="text-muted-foreground">↔</span>
                      <Badge variant="outline" className="shrink-0">
                        {pair.toCity}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {pair.distance === null && (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Input
                            type="number"
                            placeholder={canEditDistances ? "Travel Time" : "Read-only"}
                            value={getDistance(pair.fromCity, pair.toCity) || ''}
                            onChange={(e) => canEditDistances && updateDistanceUI(pair.fromCity, pair.toCity, e.target.value)}
                            className={`w-24 text-center ${!canEditDistances ? 'opacity-60 cursor-not-allowed' : ''} ${loadingPairs.has(getPairKey(pair.fromCity, pair.toCity)) ? 'pr-8' : ''}`}
                            min="0"
                            step="0.1"
                            disabled={!canEditDistances}
                            title={canEditDistances ? `Set travel time between ${pair.fromCity} and ${pair.toCity}` : "You don't have permission to edit distances"}
                          />
                          {loadingPairs.has(getPairKey(pair.fromCity, pair.toCity)) && (
                            <Loader2 className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 animate-spin text-muted-foreground" />
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">hr</span>
                        {!canEditDistances && (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                        {pendingUpdates.has(getPairKey(pair.fromCity, pair.toCity)) && (
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            Saving...
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}