"use client";

import { cn, getEventTypeBadgeVariant } from "@/lib/utils";
import { Event } from "@/types";
import { PermissionGuard } from "@/components/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";
// Note: Using real data passed as props instead of mockDropdownConfig
import { AddEventDialog } from "@/components/AddEventDialog";
import { EditEventDialog } from "@/components/EditEventDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { ModernDateRangePicker } from "@/components/ui/ModernDateRangePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  PaginationState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleX,
  Columns3,
  Ellipsis,
  Filter,
  ListFilter,
  SearchIcon,
  Edit2,
  Trash2,
  SlidersHorizontal,
  Calendar as CalendarIcon,
  Search,
} from "lucide-react";
import { useMemo, useRef, useState, useId, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { isWithinInterval, parseISO } from "date-fns";

// Custom filter function for multi-column searching
const multiColumnFilterFn: FilterFn<Event> = (row, columnId, filterValue) => {
  const searchableRowContent = `${row.original.event} ${row.original.city} ${row.original.venue}`.toLowerCase();
  const searchTerm = (filterValue ?? "").toLowerCase();
  return searchableRowContent.includes(searchTerm);
};

const eventTypeFilterFn: FilterFn<Event> = (row, columnId, filterValue: string[]) => {
  if (!filterValue?.length) return true;
  const eventType = row.getValue(columnId) as string;
  return filterValue.includes(eventType);
};

const dateRangeFilterFn: FilterFn<Event> = (row, columnId, filterValue: DateRange) => {
  if (!filterValue?.from) return true;
  
  const eventDate = parseISO(row.getValue(columnId) as string);
  const from = filterValue.from;
  const to = filterValue.to || filterValue.from;
  
  return isWithinInterval(eventDate, { start: from, end: to });
};



interface EventTableProps {
  events: Event[];
  eventTypes?: any[];
  cities?: any[];
  venues?: any[];
  observers?: any[];
  sngs?: any[];
  onDeleteEvents?: (eventIds: string[]) => void;
  onEditEvent?: (event: Event) => void;
  onUpdateEvent?: (event: Event) => void;
  onAddEvent?: (newEventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => void;
  // Filter props
  filters?: {
    search: string;
    eventTypes: string[];
    cities: string[];
    observers: string[];
    sngs: string[];
    dateRange: any;
  };
  onSearchChange?: (search: string) => void;
  onEventTypeFilter?: (eventTypes: string[]) => void;
  onCityFilter?: (cities: string[]) => void;
  onObserverFilter?: (observers: string[]) => void;
  onSngFilter?: (sngs: string[]) => void;
  onDateRangeFilter?: (dateRange: any) => void;
  // Sort props
  sorting?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  // Loading state
  isLoading?: boolean;
  // Search state
  isSearching?: boolean;
  // Server-side pagination props
  paginationInfo?: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
    from: number | null;
    to: number | null;
  };
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onNextPage?: () => void;
  onPreviousPage?: () => void;
}

export function EventTable({ 
  events, 
  eventTypes = [],
  cities = [],
  venues = [],
  observers = [],
  sngs = [],
  onDeleteEvents, 
  onEditEvent, 
  onUpdateEvent, 
  onAddEvent,
  // Filter props
  filters,
  onSearchChange,
  onEventTypeFilter,
  onCityFilter,
  onObserverFilter,
  onSngFilter,
  onDateRangeFilter,
  // Sort props
  sorting,
  onSort,
    // Loading state
  isLoading = false,
  // Search state
  isSearching = false,
  // Server-side pagination props
  paginationInfo,
  currentPage = 1,
  pageSize = 100,
  onPageChange,
  onPageSizeChange, 
  onNextPage,
  onPreviousPage
}: EventTableProps) {
  
  // Permissions
  const { canCreateEvents, canEditEvents, canDeleteEvents } = usePermissions();
  
  const id = useId();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  // Remove client-side pagination state - now handled by parent component
  // const [pagination, setPagination] = useState<PaginationState>({
  //   pageIndex: 0,
  //   pageSize: 10,
  // });
  const inputRef = useRef<HTMLInputElement>(null);
  const [editingCell, setEditingCell] = useState<{ rowId: string; columnId: string } | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [selectedObs, setSelectedObs] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedSngs, setSelectedSngs] = useState<string[]>([]);
  const [obSearchTerm, setObSearchTerm] = useState('');
  const [citySearchTerm, setCitySearchTerm] = useState('');
  const [sngSearchTerm, setSngSearchTerm] = useState('');
  
  // Edit modal state
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [tableSorting, setTableSorting] = useState<SortingState>([
    {
      id: "date",
      desc: false,
    },
  ]);

  // Set next 30 days as default filter for future events - disabled for now to show all events
  /*useEffect(() => {
    const today = new Date();
    const next30Days = new Date();
    next30Days.setDate(today.getDate() + 29);
    
    setColumnFilters([{ 
      id: "date", 
      value: { from: today, to: next30Days } 
    }]);
  }, []);*/

  const columns: ColumnDef<Event>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() 
              ? true 
              : table.getIsSomePageRowsSelected() 
                ? "indeterminate" 
                : false
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      size: 28,
      enableSorting: false,
      enableHiding: false,
    },
    {
      header: "Date",
      accessorKey: "date",
      cell: ({ row }) => {
        const isEditing = editingCell?.rowId === row.id && editingCell?.columnId === "date";
        const currentDate = new Date(row.getValue("date"));
        
        return isEditing ? (
          <Popover open={true} onOpenChange={(open) => !open && handleCancelEdit()}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-8 w-full justify-start">
                {format(editValue ? new Date(editValue) : currentDate, "dd-MM-yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-popover border border-border z-[70]" align="start">
              <Calendar
                mode="single"
                selected={editValue ? new Date(editValue) : currentDate}
                onSelect={(date) => {
                  if (date) {
                    const dateString = format(date, "yyyy-MM-dd");
                    setEditValue(dateString);
                    handleSaveEdit(row.original, "date", dateString);
                  }
                }}
                className="rounded-md shadow-md"
              />
            </PopoverContent>
          </Popover>
        ) : (
          <div 
            className={`font-medium ${canEditEvents() ? 'cursor-pointer hover:bg-accent/50' : 'cursor-default'} p-1 rounded`}
            onClick={() => canEditEvents() && handleStartEdit(row.id, "date", row.getValue("date"))}
            title={canEditEvents() ? "Click to edit date" : "No permission to edit"}
          >
            {format(currentDate, "dd-MM-yyyy")}
          </div>
        );
      },
      size: 120,
      enableHiding: false,
      filterFn: dateRangeFilterFn,
    },
    {
      header: "Event",
      accessorKey: "event",
      cell: ({ row }) => {
        const isEditing = editingCell?.rowId === row.id && editingCell?.columnId === "event";
        return isEditing ? (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => handleSaveEdit(row.original, "event")}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveEdit(row.original, "event");
              if (e.key === "Escape") handleCancelEdit();
            }}
            autoFocus
            className="h-8"
          />
        ) : (
          <div 
            className={`font-medium ${canEditEvents() ? 'cursor-pointer hover:bg-accent/50' : 'cursor-default'} p-1 rounded`}
            onClick={() => canEditEvents() && handleStartEdit(row.id, "event", row.getValue("event"))}
            title={canEditEvents() ? "Click to edit event" : "No permission to edit"}
          >
            {row.getValue("event")}
          </div>
        );
      },
      size: 220,
      filterFn: multiColumnFilterFn,
      enableHiding: false,
    },
    {
      header: "Type",
      accessorKey: "eventType",
      cell: ({ row }) => {
        const isEditing = editingCell?.rowId === row.id && editingCell?.columnId === "eventType";
        return isEditing ? (
          <Popover open={true} onOpenChange={(open) => !open && handleCancelEdit()}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-8 w-full justify-between">
                {editValue || row.getValue("eventType")}
                <span className="ml-2">▼</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-0 bg-popover border border-border z-50">
              <Command>
                <CommandInput placeholder="Search event types..." />
                <CommandList>
                  <CommandEmpty>No event type found.</CommandEmpty>
                  <CommandGroup>
                    {eventTypes.map((type) => (
                      <CommandItem
                        key={type.id}
                        value={type.name}
                        onSelect={() => {
                          setEditValue(type.name);
                          handleSaveEdit(row.original, "eventType", type.name);
                        }}
                      >
                        {type.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        ) : (
          <div 
            className={`${canEditEvents() ? 'cursor-pointer hover:bg-[--hover-primary] border border-transparent hover:border-[--primary-brand]/20' : 'cursor-default border border-muted'} p-2 rounded-lg transition-all duration-300 hover:shadow-glow`}
            onClick={() => canEditEvents() && handleStartEdit(row.id, "eventType", row.getValue("eventType"))}
            title={canEditEvents() ? "Click to edit event type" : "No permission to edit"}
          >
            {(() => {
              const eventTypeValue = row.getValue("eventType") as string;
              const eventTypeData = eventTypes.find(et => et.name === eventTypeValue);
              const variant = getEventTypeBadgeVariant(eventTypeValue, eventTypeData);
              
              return (
                <Badge variant={variant}>
                  {eventTypeValue}
                </Badge>
              );
            })()}
          </div>
        );
      },
      size: 150,
      filterFn: eventTypeFilterFn,
    },
    {
      header: "City",
      accessorKey: "city",
      cell: ({ row }) => {
        const isEditing = editingCell?.rowId === row.id && editingCell?.columnId === "city";
        return isEditing ? (
          <Popover open={true} onOpenChange={(open) => !open && handleCancelEdit()}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-8 w-full justify-between">
                {editValue || row.getValue("city")}
                <span className="ml-2">▼</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-0 bg-popover border border-border z-50">
              <Command>
                <CommandInput placeholder="Search cities..." />
                <CommandList>
                  <CommandEmpty>No city found.</CommandEmpty>
                  <CommandGroup>
                    {cities.map((city) => (
                      <CommandItem
                        key={city.id}
                        value={city.name}
                        onSelect={() => {
                          setEditValue(city.name);
                          handleSaveEdit(row.original, "city", city.name);
                        }}
                      >
                        {city.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        ) : (
          <div 
            className={`${canEditEvents() ? 'cursor-pointer hover:bg-accent/50' : 'cursor-default'} p-1 rounded`}
            onClick={() => canEditEvents() && handleStartEdit(row.id, "city", row.getValue("city"))}
            title={canEditEvents() ? "Click to edit city" : "No permission to edit"}
          >
            {row.getValue("city")}
          </div>
        );
      },
      size: 150,
    },
    {
      header: "Venue",
      accessorKey: "venue",
      cell: ({ row }) => {
        const isEditing = editingCell?.rowId === row.id && editingCell?.columnId === "venue";
        return isEditing ? (
          <Popover open={true} onOpenChange={(open) => !open && handleCancelEdit()}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-8 w-full justify-between">
                {editValue || row.getValue("venue")}
                <span className="ml-2">▼</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0 bg-popover border border-border z-50">
              <Command>
                <CommandInput placeholder="Search venues..." />
                <CommandList>
                  <CommandEmpty>No venue found.</CommandEmpty>
                  <CommandGroup>
                    {venues.map((venue) => (
                      <CommandItem
                        key={venue.id}
                        value={venue.name}
                        onSelect={() => {
                          setEditValue(venue.name);
                          handleSaveEdit(row.original, "venue", venue.name);
                        }}
                      >
                        {venue.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        ) : (
          <div 
            className={`${canEditEvents() ? 'cursor-pointer hover:bg-accent/50' : 'cursor-default'} p-1 rounded`}
            onClick={() => canEditEvents() && handleStartEdit(row.id, "venue", row.getValue("venue"))}
            title={canEditEvents() ? "Click to edit venue" : "No permission to edit"}
          >
            {row.getValue("venue")}
          </div>
        );
      },
      size: 150,
    },
    {
      header: "Time",
      accessorKey: "time",
      cell: ({ row }) => {
        const isEditing = editingCell?.rowId === row.id && editingCell?.columnId === "time";
        return isEditing ? (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => handleSaveEdit(row.original, "time", editValue)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSaveEdit(row.original, "time", editValue);
              } else if (e.key === "Escape") {
                handleCancelEdit();
              }
            }}
            className="h-8"
            type="time"
            autoFocus
          />
        ) : (
          <div 
            className={`${canEditEvents() ? 'cursor-pointer hover:bg-accent/50' : 'cursor-default'} p-1 rounded font-mono`}
            onClick={() => canEditEvents() && handleStartEdit(row.id, "time", row.getValue("time"))}
            title={canEditEvents() ? "Click to edit time" : "No permission to edit"}
          >
            {row.getValue("time") || "00:00"}
          </div>
        );
      },
      size: 100,
    },
    {
      header: "OB",
      accessorKey: "ob",
      cell: ({ row }) => {
        const isEditing = editingCell?.rowId === row.id && editingCell?.columnId === "ob";
        return isEditing ? (
          <Popover open={true} onOpenChange={(open) => !open && handleCancelEdit()}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-8 w-full justify-between">
                {editValue || row.getValue("ob")}
                <span className="ml-2">▼</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-32 p-0 bg-popover border border-border z-50">
              <Command>
                <CommandInput placeholder="Search OB..." />
                <CommandList>
                  <CommandEmpty>No OB found.</CommandEmpty>
                  <CommandGroup>
                    {observers.map((ob) => (
                      <CommandItem
                        key={ob.id}
                        value={ob.code}
                        onSelect={() => {
                          setEditValue(ob.code);
                          handleSaveEdit(row.original, "ob", ob.code);
                        }}
                      >
                        {ob.code}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        ) : (
          <div 
            className={`${canEditEvents() ? 'cursor-pointer hover:bg-accent/50' : 'cursor-default'} p-1 rounded`}
            onClick={() => canEditEvents() && handleStartEdit(row.id, "ob", row.getValue("ob"))}
            title={canEditEvents() ? "Click to edit observer" : "No permission to edit"}
          >
            {row.getValue("ob")}
          </div>
        );
      },
      size: 100,
    },
    {
      header: "SNG",
      accessorKey: "sng",
      cell: ({ row }) => {
        const isEditing = editingCell?.rowId === row.id && editingCell?.columnId === "sng";
        return isEditing ? (
          <Popover open={true} onOpenChange={(open) => !open && handleCancelEdit()}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-8 w-full justify-between">
                {editValue || row.getValue("sng")}
                <span className="ml-2">▼</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-32 p-0 bg-popover border border-border z-50">
              <Command>
                <CommandInput placeholder="Search SNG..." />
                <CommandList>
                  <CommandEmpty>No SNG found.</CommandEmpty>
                  <CommandGroup>
                    {sngs.map((sng) => (
                      <CommandItem
                        key={sng.id}
                        value={sng.name}
                        onSelect={() => {
                          setEditValue(sng.name);
                          handleSaveEdit(row.original, "sng", sng.name);
                        }}
                      >
                        {sng.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        ) : (
          <div 
            className={`${canEditEvents() ? 'cursor-pointer hover:bg-accent/50' : 'cursor-default'} p-1 rounded`}
            onClick={() => canEditEvents() && handleStartEdit(row.id, "sng", row.getValue("sng"))}
            title={canEditEvents() ? "Click to edit SNG" : "No permission to edit"}
          >
            {row.getValue("sng")}
          </div>
        );
      },
      size: 100,
    },
    ...(canEditEvents() || canDeleteEvents() ? [{
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <RowActions 
          row={row} 
          onEdit={onEditEvent}
          onOpenEditModal={handleOpenEditModal}
          canEdit={canEditEvents()}
          canDelete={canDeleteEvents()}
        />
      ),
      size: 60,
      enableHiding: false,
    }] : []),
  ];

  const handleDeleteRows = () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const eventIds = selectedRows.map(row => row.original.id);
    onDeleteEvents?.(eventIds);
    table.resetRowSelection();
  };

  const handleStartEdit = (rowId: string, columnId: string, currentValue: any) => {
    if (!canEditEvents()) {
      return; // Don't allow editing if no permission
    }
    setEditingCell({ rowId, columnId });
    setEditValue(String(currentValue || ""));
  };

  const handleSaveEdit = (event: Event, field: string, value?: string) => {
    if (!canEditEvents()) {
      setEditingCell(null); // Cancel editing if no permission
      return;
    }
    const finalValue = value || editValue.trim();
    if (finalValue && onUpdateEvent) {
      const updatedEvent = { 
        ...event, 
        [field]: finalValue,
        updatedAt: new Date().toISOString()
      };
      onUpdateEvent(updatedEvent);
    }
    setEditingCell(null);
    setEditValue("");
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  // Edit modal handlers
  const handleOpenEditModal = (event: Event) => {
    setEditingEvent(event);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingEvent(null);
  };

  // Sync local filter state with props from backend
  useEffect(() => {
    if (filters?.observers) {
      setSelectedObs(filters.observers);
    }
    if (filters?.cities) {
      setSelectedCities(filters.cities);
    }
    if (filters?.sngs) {
      setSelectedSngs(filters.sngs);
    }
  }, [filters]);
  
  // Events are already filtered by backend, no need for client-side filtering

  const table = useReactTable({
    data: events,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // onPaginationChange: setPagination, // Remove client-side pagination
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      // Remove client-side pagination from state
      columnFilters,
      columnVisibility,
    },
    // Manual sorting and pagination - handled in parent component
    manualSorting: true,
    manualPagination: true,
  });

  // Get unique values for filters from dashboard data instead of events
  const uniqueObs = useMemo(() => 
    observers?.map(o => o.code || o.name).filter(Boolean) || [], 
    [observers]
  );
  const uniqueCities = useMemo(() => 
    cities?.map(c => c.name).filter(Boolean) || [], 
    [cities]
  );
    const uniqueSngs = useMemo(() => 
    sngs?.map(s => s.name).filter(Boolean) || [], 
    [sngs]
  );
  const uniqueEventTypes = useMemo(() => 
    eventTypes?.map(et => et.name).filter(Boolean) || [], 
    [eventTypes]
  );

  // Get unique event type values from dashboard data
  const uniqueEventTypeValues = useMemo(() => {
    return uniqueEventTypes.sort();
  }, [uniqueEventTypes]);

  // Get counts for each event type
  const eventTypeCounts = useMemo(() => {
    const eventTypeColumn = table.getColumn("eventType");
    if (!eventTypeColumn) return new Map();
    return eventTypeColumn.getFacetedUniqueValues();
  }, [table.getColumn("eventType")?.getFacetedUniqueValues()]);

  // Filter options based on search
  const filteredObs = uniqueObs.filter(ob => 
    ob.toLowerCase().includes(obSearchTerm.toLowerCase())
  );
  const filteredCities = uniqueCities.filter(city => 
    city.toLowerCase().includes(citySearchTerm.toLowerCase())
  );
  const filteredSngs = uniqueSngs.filter(sng => 
    sng.toLowerCase().includes(sngSearchTerm.toLowerCase())
  );

  const selectedEventTypes = useMemo(() => {
    const filterValue = table.getColumn("eventType")?.getFilterValue() as string[];
    return filterValue ?? [];
  }, [table.getColumn("eventType")?.getFilterValue()]);

  const handleEventTypeChange = (checked: boolean, value: string) => {
    const filterValue = table.getColumn("eventType")?.getFilterValue() as string[];
    const newFilterValue = filterValue ? [...filterValue] : [];

    if (checked) {
      newFilterValue.push(value);
    } else {
      const index = newFilterValue.indexOf(value);
      if (index > -1) {
        newFilterValue.splice(index, 1);
      }
    }

    table.getColumn("eventType")?.setFilterValue(newFilterValue.length ? newFilterValue : undefined);
    // Call the backend filter handler
    onEventTypeFilter?.(newFilterValue);
  };

  const handleObChange = (ob: string, checked: boolean) => {
    let newSelectedObs: string[];
    if (checked) {
      newSelectedObs = [...selectedObs, ob];
    } else {
      newSelectedObs = selectedObs.filter(o => o !== ob);
    }
    setSelectedObs(newSelectedObs);
    // Call the backend filter handler
    onObserverFilter?.(newSelectedObs);
  };

  const handleCityChange = (city: string, checked: boolean) => {
    let newSelectedCities: string[];
    if (checked) {
      newSelectedCities = [...selectedCities, city];
    } else {
      newSelectedCities = selectedCities.filter(c => c !== city);
    }
    setSelectedCities(newSelectedCities);
    // Call the backend filter handler
    onCityFilter?.(newSelectedCities);
  };

  const handleSngChange = (sng: string, checked: boolean) => {
    let newSelectedSngs: string[];
    if (checked) {
      newSelectedSngs = [...selectedSngs, sng];
    } else {
      newSelectedSngs = selectedSngs.filter(s => s !== sng);
    }
    setSelectedSngs(newSelectedSngs);
    // Call the backend filter handler
    onSngFilter?.(newSelectedSngs);
  };

  // Date range filter logic with calendar
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>();

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setSelectedDateRange(range);
    table.getColumn("date")?.setFilterValue(range);
    // Call the backend filter handler
    onDateRangeFilter?.(range);
  };

  const getDateRangeDisplayText = () => {
    if (!selectedDateRange?.from) return "Next 30 days";
    
    const from = selectedDateRange.from.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    
    if (!selectedDateRange.to || selectedDateRange.from === selectedDateRange.to) {
      return from;
    }
    
    const to = selectedDateRange.to.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    
    return `${from} - ${to}`;
  };

  return (
    <div className="space-y-4">
      {/* Professional Filters Section */}
      <div className="bg-card rounded-xl border  p-6 mb-6">
        
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Filter by event, city or venue */}
            <div className="relative">
              <Input
                id={`${id}-input`}
                ref={inputRef}
                className={cn(
                  "peer min-w-60 ps-9",
                  Boolean(table.getColumn("event")?.getFilterValue()) && "pe-9",
                )}
                value={filters?.search || ""}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder="Search events, cities, venues..."
                type="text"
                aria-label="Filter events"
              />
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                {isSearching ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-muted-foreground/20 border-t-muted-foreground/80" />
                ) : (
                  <SearchIcon size={16} strokeWidth={2} aria-hidden="true" />
                )}
              </div>
              {Boolean(filters?.search) && (
                <button
                  className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Clear filter"
                  onClick={() => {
                    onSearchChange?.("");
                    if (inputRef.current) {
                      inputRef.current.focus();
                    }
                  }}
                >
                  <CircleX size={16} strokeWidth={2} aria-hidden="true" />
                </button>
              )}
            </div>
            
            {/* Filter by event type */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Filter
                    className="-ms-1 me-2 opacity-60"
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  Event Type
                  {(filters?.eventTypes.length || 0) > 0 && (
                    <span className="-me-1 ms-3 inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
                      {filters?.eventTypes.length || 0}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="min-w-36 p-3" align="start">
                <div className="space-y-3">
                  <div className="text-xs font-medium text-muted-foreground">Filters</div>
                  <div className="space-y-3">
                    {uniqueEventTypeValues.map((value, i) => (
                      <div key={value} className="flex items-center gap-2">
                        <Checkbox
                          id={`${id}-${i}`}
                          checked={(filters?.eventTypes || []).includes(value)}
                          onCheckedChange={(checked: boolean) => {
                            const current = filters?.eventTypes || [];
                            const newEventTypes = checked 
                              ? [...current, value]
                              : current.filter(et => et !== value);
                            onEventTypeFilter?.(newEventTypes);
                          }}
                        />
                        <Label
                          htmlFor={`${id}-${i}`}
                          className="flex grow justify-between gap-2 font-normal"
                        >
                          {value}{" "}
                          <span className="ms-2 text-xs text-muted-foreground">
                            {eventTypeCounts.get(value)}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Filter by date range */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon
                    className="-ms-1 me-2 opacity-60"
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  {getDateRangeDisplayText()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[9999] bg-background border-0 shadow-lg" align="start">
                <ModernDateRangePicker 
                  onDateSelect={handleDateRangeSelect}
                />
              </PopoverContent>
            </Popover>
            
            {/* OB Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Filter
                    className="-ms-1 me-2 opacity-60"
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  OB
                  {selectedObs.length > 0 && (
                    <span className="-me-1 ms-3 inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
                      {selectedObs.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0" align="start">
                <div className="p-3 space-y-3">
                  <Input
                    placeholder="Search OB..."
                    value={obSearchTerm}
                    onChange={(e) => setObSearchTerm(e.target.value)}
                    className="h-8"
                  />
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {filteredObs.map((ob) => (
                      <div key={ob} className="flex items-center space-x-2">
                        <Checkbox
                          id={`ob-${ob}`}
                          checked={selectedObs.includes(ob)}
                          onCheckedChange={(checked) => handleObChange(ob, !!checked)}
                        />
                        <Label htmlFor={`ob-${ob}`} className="text-sm">{ob}</Label>
                      </div>
                    ))}
                    {filteredObs.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-2">No OBs found</p>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* SNG Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Filter
                    className="-ms-1 me-2 opacity-60"
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  SNG
                  {selectedSngs.length > 0 && (
                    <span className="-me-1 ms-3 inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
                      {selectedSngs.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0" align="start">
                <div className="p-3 space-y-3">
                  <Input
                    placeholder="Search SNG..."
                    value={sngSearchTerm}
                    onChange={(e) => setSngSearchTerm(e.target.value)}
                    className="h-8"
                  />
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {filteredSngs.map((sng) => (
                      <div key={sng} className="flex items-center space-x-2">
                        <Checkbox
                          id={`sng-${sng}`}
                          checked={selectedSngs.includes(sng)}
                          onCheckedChange={(checked) => handleSngChange(sng, !!checked)}
                        />
                        <Label htmlFor={`sng-${sng}`} className="text-sm">{sng}</Label>
                      </div>
                    ))}
                    {filteredSngs.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-2">No SNGs found</p>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* City Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Filter
                    className="-ms-1 me-2 opacity-60"
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  City
                  {selectedCities.length > 0 && (
                    <span className="-me-1 ms-3 inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
                      {selectedCities.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0" align="start">
                <div className="p-3 space-y-3">
                  <Input
                    placeholder="Search cities..."
                    value={citySearchTerm}
                    onChange={(e) => setCitySearchTerm(e.target.value)}
                    className="h-8"
                  />
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {filteredCities.map((city) => (
                      <div key={city} className="flex items-center space-x-2">
                        <Checkbox
                          id={`city-${city}`}
                          checked={selectedCities.includes(city)}
                          onCheckedChange={(checked) => handleCityChange(city, !!checked)}
                        />
                        <Label htmlFor={`city-${city}`} className="text-sm">{city}</Label>
                      </div>
                    ))}
                    {filteredCities.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-2">No cities found</p>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Column visibility */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <SlidersHorizontal
                    className="-ms-1 me-2 opacity-60"
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  View
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                        onSelect={(event) => event.preventDefault()}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Add Event Button */}
          <div className="flex items-center">
            {onAddEvent && canCreateEvents && (
              <PermissionGuard permission="events.create">
                <AddEventDialog 
                  dropdownConfig={{
                    eventTypes: eventTypes.map(et => ({ id: et.id?.toString(), value: et.name, label: et.name })),
                    cities: cities.map(c => ({ id: c.id?.toString(), value: c.name, label: c.name })),
                    venues: venues.map(v => ({ id: v.id?.toString(), value: v.name, label: v.name })),
                    obs: observers.map(o => ({ id: o.id?.toString(), value: o.code || o.name, label: o.code || o.name })),
                    sngs: sngs?.map(s => ({ id: s.id?.toString(), value: s.name, label: s.name })) || []
                  }}
                  onAddEvent={onAddEvent}
                />
              </PermissionGuard>
            )}
          </div>
        </div>
        
        {/* Delete button */}
        {table.getSelectedRowModel().rows.length > 0 && canDeleteEvents() && (
          <PermissionGuard permission="events.delete">
            <Button 
              variant="outline"
              onClick={handleDeleteRows}
              className="text-destructive hover:text-destructive"
            >
              <Trash2
                className="-ms-1 me-2 opacity-60"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
              Delete
              <span className="-me-1 ms-3 inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
                {table.getSelectedRowModel().rows.length}
              </span>
            </Button>
          </PermissionGuard>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card ">
        <Table className="table-fixed">
          <TableHeader className="bg-[#FBFBFB]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-border">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: `${header.getSize()}px` }}
                      className="h-14  text-foreground px-6 py-4 border-r border-border/30 last:border-r-0"
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <div
                          className={cn(
                            header.column.getCanSort() &&
                              "flex h-full cursor-pointer select-none items-center justify-between gap-2",
                          )}
                          onClick={() => {
                            if (header.column.getCanSort()) {
                              const field = header.column.id;
                              const currentDirection = sorting?.field === field && sorting?.direction === 'asc' ? 'desc' : 'asc';
                              onSort?.(field, currentDirection);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (
                              header.column.getCanSort() &&
                              (e.key === "Enter" || e.key === " ")
                            ) {
                              e.preventDefault();
                              const field = header.column.id;
                              const currentDirection = sorting?.field === field && sorting?.direction === 'asc' ? 'desc' : 'asc';
                              onSort?.(field, currentDirection);
                            }
                          }}
                          tabIndex={header.column.getCanSort() ? 0 : undefined}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sorting?.field === header.column.id && (
                            sorting.direction === 'asc' ? (
                              <ChevronUp
                                className="shrink-0 opacity-60"
                                size={16}
                                strokeWidth={2}
                                aria-hidden="true"
                              />
                            ) : (
                              <ChevronDown
                                className="shrink-0 opacity-60"
                                size={16}
                                strokeWidth={2}
                                aria-hidden="true"
                              />
                            )
                          )}
                        </div>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Show skeleton while loading
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell className="px-6 py-4 border-r border-border/20 last:border-r-0">
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                  <TableCell className="px-6 py-4 border-r border-border/20 last:border-r-0">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="px-6 py-4 border-r border-border/20 last:border-r-0">
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell className="px-6 py-4 border-r border-border/20 last:border-r-0">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </TableCell>
                  <TableCell className="px-6 py-4 border-r border-border/20 last:border-r-0">
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell className="px-6 py-4 border-r border-border/20 last:border-r-0">
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="px-6 py-4 border-r border-border/20 last:border-r-0">
                    <Skeleton className="h-4 w-14" />
                  </TableCell>
                  <TableCell className="px-6 py-4 border-r border-border/20 last:border-r-0">
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow 
                  key={row.id} 
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/30 transition-colors duration-200 border-b border-border/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="last:py-0 px-6 py-4 text-sm border-r border-border/20 last:border-r-0">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center px-6 py-4">
                  No events found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-8">
        {/* Results per page */}
        <div className="flex items-center gap-3">
          <Label htmlFor={id} className="max-sm:sr-only">
            Rows per page
          </Label>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              onPageSizeChange?.(Number(value));
            }}
          >
            <SelectTrigger id={id} className="w-fit whitespace-nowrap border !border-[rgb(var(--border))]">
              <SelectValue placeholder="Select number of results" />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100, 200].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Page number information */}
        <div className="flex grow justify-end whitespace-nowrap text-sm text-muted-foreground">
          <p className="whitespace-nowrap text-sm text-muted-foreground" aria-live="polite">
            <span className="text-foreground">
              {paginationInfo?.from || 0}-{paginationInfo?.to || 0}
            </span>{" "}
            of <span className="text-foreground">{paginationInfo?.total || 0}</span>
          </p>
        </div>

        {/* Pagination buttons */}
        <div>
          <Pagination>
            <PaginationContent>
              {/* First page button */}
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => onPageChange?.(1)}
                  disabled={currentPage <= 1}
                  aria-label="Go to first page"
                >
                  <ChevronFirst size={16} strokeWidth={2} aria-hidden="true" />
                </Button>
              </PaginationItem>
              {/* Previous page button */}
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={onPreviousPage}
                  disabled={currentPage <= 1}
                  aria-label="Go to previous page"
                >
                  <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
                </Button>
              </PaginationItem>
              {/* Next page button */}
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={onNextPage}
                  disabled={!paginationInfo || currentPage >= paginationInfo.lastPage}
                  aria-label="Go to next page"
                >
                  <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
                </Button>
              </PaginationItem>
              {/* Last page button */}
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => paginationInfo && onPageChange?.(paginationInfo.lastPage)}
                  disabled={!paginationInfo || currentPage >= paginationInfo.lastPage}
                  aria-label="Go to last page"
                >
                  <ChevronLast size={16} strokeWidth={2} aria-hidden="true" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      {/* Edit Event Dialog */}
      <EditEventDialog
        event={editingEvent}
        dropdownConfig={{
          eventTypes: eventTypes.map(et => ({ id: et.id?.toString(), value: et.name, label: et.name })),
          cities: cities.map(c => ({ id: c.id?.toString(), value: c.name, label: c.name })),
          venues: venues.map(v => ({ id: v.id?.toString(), value: v.name, label: v.name })),
          obs: observers.map(o => ({ id: o.id?.toString(), value: o.code, label: o.code})),
          sngs: sngs?.map(s => ({ id: s.id?.toString(), value: s.name, label: s.name })) || []
        }}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onUpdateEvent={onUpdateEvent}
      />
    </div>
  );
}

function RowActions({ 
  row, 
  onEdit, 
  onOpenEditModal,
  canEdit = true,
  canDelete = true
}: { 
  row: Row<Event>; 
  onEdit?: (event: Event) => void;
  onOpenEditModal?: (event: Event) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex justify-end">
          <Button size="icon" variant="ghost" className="shadow-none" aria-label="Event actions">
            <Ellipsis size={16} strokeWidth={2} aria-hidden="true" />
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canEdit && (
          <>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => onOpenEditModal?.(row.original)}>
                <Edit2 className="mr-2 h-4 w-4" />
                <span>Edit</span>
                <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            {canDelete && <DropdownMenuSeparator />}
          </>
        )}
        {canDelete && (
          <DropdownMenuItem className="text-destructive focus:text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete</span>
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}