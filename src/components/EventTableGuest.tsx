"use client";

import { cn, getEventTypeBadgeVariant } from "@/lib/utils";
import { Event } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { ModernDateRangePicker } from "@/components/ui/ModernDateRangePicker";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
  Filter,
  ListFilter,
  SlidersHorizontal,
  Calendar as CalendarIcon,
  Search,
  Eye,
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
  if (!filterValue || filterValue.length === 0) return true;
  return filterValue.includes(row.getValue(columnId) as string);
};

const obFilterFn: FilterFn<Event> = (row, columnId, filterValue: string[]) => {
  if (!filterValue || filterValue.length === 0) return true;
  return filterValue.includes(row.getValue(columnId) as string);
};

const cityFilterFn: FilterFn<Event> = (row, columnId, filterValue: string[]) => {
  if (!filterValue || filterValue.length === 0) return true;
  return filterValue.includes(row.getValue(columnId) as string);
};

const sngFilterFn: FilterFn<Event> = (row, columnId, filterValue: string[]) => {
  if (!filterValue || filterValue.length === 0) return true;
  return filterValue.includes(row.getValue(columnId) as string);
};

const dateRangeFilterFn: FilterFn<Event> = (row, columnId, filterValue: DateRange | undefined) => {
  if (!filterValue || (!filterValue.from && !filterValue.to)) return true;
  
  const rowDate = parseISO(row.original.date);
  
  if (filterValue.from && filterValue.to) {
    return isWithinInterval(rowDate, { start: filterValue.from, end: filterValue.to });
  } else if (filterValue.from) {
    return rowDate >= filterValue.from;
  } else if (filterValue.to) {
    return rowDate <= filterValue.to;
  }
  
  return true;
};



interface EventTableGuestProps {
  events: Event[];
  eventTypes?: any[]; // Keep only for badge colors
  isLoading?: boolean;
}

export function EventTableGuest({
  events,
  eventTypes = [], // Keep only for badge colors
  isLoading = false,
}: EventTableGuestProps) {
  // Table state
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // Filter states - local only
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [selectedObs, setSelectedObs] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedSngs, setSelectedSngs] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Search terms for filter dropdowns
  const [eventTypeSearchTerm, setEventTypeSearchTerm] = useState("");
  const [obSearchTerm, setObSearchTerm] = useState("");
  const [citySearchTerm, setCitySearchTerm] = useState("");
  const [sngSearchTerm, setSngSearchTerm] = useState("");
  
  // Modern date range picker state
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchId = useId();

  // Define columns
  const columns: ColumnDef<Event>[] = [

    {
      header: "Date",
      accessorKey: "date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("date"));
        return (
          <div className="font-mono text-sm">
            {date.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
            })}
          </div>
        );
      },
      size: 100,
      filterFn: dateRangeFilterFn,
    },
    {
      header: "Event",
      accessorKey: "event",
      cell: ({ row }) => (
        <div className="font-medium max-w-[200px] truncate" title={row.getValue("event")}>
          {row.getValue("event")}
        </div>
      ),
      size: 200,
    },
    {
      header: "Type",
      accessorKey: "eventType",
      cell: ({ row }) => {
        const eventTypeValue = row.getValue("eventType") as string;
        const eventTypeData = eventTypes.find(et => et.name === eventTypeValue);
        const variant = getEventTypeBadgeVariant(eventTypeValue, eventTypeData);
        
        return (
          <Badge variant={variant}>
            {eventTypeValue}
          </Badge>
        );
      },
      size: 150,
      filterFn: eventTypeFilterFn,
    },
    {
      header: "City",
      accessorKey: "city",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.getValue("city")}
        </div>
      ),
      size: 150,
    },
    {
      header: "Venue",
      accessorKey: "venue",
      cell: ({ row }) => (
        <div className="text-sm max-w-[150px] truncate" title={row.getValue("venue")}>
          {row.getValue("venue")}
        </div>
      ),
      size: 150,
    },
    {
      header: "Time",
      accessorKey: "time",
      cell: ({ row }) => (
        <div className="font-mono text-sm">
          {row.getValue("time") || "00:00"}
        </div>
      ),
      size: 100,
    },
    {
      header: "OB",
      accessorKey: "ob",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.getValue("ob")}
        </div>
      ),
      size: 100,
    },
    {
      header: "SNG",
      accessorKey: "sng",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.getValue("sng")}
        </div>
      ),
      size: 100,
      filterFn: sngFilterFn,
    },
  ];

  // No need to sync with parent - using local filtering only

  // Apply filters to table columns for local filtering
  const tableFilters = useMemo(() => {
    const filters: ColumnFiltersState = [];
    
    if (globalFilter) {
      filters.push({ id: 'event', value: globalFilter });
    }
    if (selectedEventTypes.length > 0) {
      filters.push({ id: 'eventType', value: selectedEventTypes });
    }
    if (selectedCities.length > 0) {
      filters.push({ id: 'city', value: selectedCities });
    }
    if (selectedObs.length > 0) {
      filters.push({ id: 'ob', value: selectedObs });
    }
    if (selectedSngs.length > 0) {
      filters.push({ id: 'sng', value: selectedSngs });
    }
    if (dateRange) {
      filters.push({ id: 'date', value: dateRange });
    }
    
    return filters;
  }, [globalFilter, selectedEventTypes, selectedCities, selectedObs, selectedSngs, dateRange]);

  const table = useReactTable({
    data: events,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      columnFilters: tableFilters,
      columnVisibility,
      globalFilter,
    },
    // Local filtering and sorting
    manualSorting: false,
    manualPagination: false,
    enableGlobalFilter: true,
    globalFilterFn: multiColumnFilterFn,
  });

  // Get unique values for filters from loaded events
  const uniqueObs = useMemo(() => {
    const obs = events.map(event => event.ob).filter(Boolean);
    return Array.from(new Set(obs)).sort();
  }, [events]);
  
  const uniqueCities = useMemo(() => {
    const cities = events.map(event => event.city).filter(Boolean);
    return Array.from(new Set(cities)).sort();
  }, [events]);
  
  const uniqueEventTypes = useMemo(() => {
    const types = events.map(event => event.eventType).filter(Boolean);
    return Array.from(new Set(types)).sort();
  }, [events]);

  const uniqueSngs = useMemo(() => {
    const sngs = events.map(event => event.sng).filter(Boolean);
    return Array.from(new Set(sngs)).sort();
  }, [events]);



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

  // Local filter handlers - no need to sync with parent
  const handleGlobalFilterChange = (value: string) => {
    setGlobalFilter(value);
  };

  const handleEventTypeFilterChange = (eventTypes: string[]) => {
    setSelectedEventTypes(eventTypes);
  };

  const handleObFilterChange = (observers: string[]) => {
    setSelectedObs(observers);
  };

  const handleCityFilterChange = (cities: string[]) => {
    setSelectedCities(cities);
  };

  const handleSngFilterChange = (sngs: string[]) => {
    setSelectedSngs(sngs);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setShowDateRangePicker(false); // Close the picker after selection
  };

  // Clear all filters
  const clearAllFilters = () => {
    setGlobalFilter("");
    setSelectedEventTypes([]);
    setSelectedObs([]);
    setSelectedCities([]);
    setSelectedSngs([]);
    setDateRange(undefined);
    setShowDateRangePicker(false);
  };

  const hasActiveFilters = globalFilter || selectedEventTypes.length > 0 || selectedObs.length > 0 || selectedCities.length > 0 || selectedSngs.length > 0 || dateRange;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-10 w-[100px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
        <div className="rounded-md border">
          <div className="h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center space-y-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Mobile horizontal scroll container for filters */}
        <div className="overflow-x-auto">
          <div className="flex flex-1 items-center gap-3 min-w-max">
          {/* Search */}
          <div className="relative">
            <Input
              ref={searchInputRef}
              className="min-w-60 ps-9"
              value={globalFilter}
              onChange={(e) => handleGlobalFilterChange(e.target.value)}
              placeholder="Search events, cities, venues..."
              type="text"
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80">
              <Search size={16} strokeWidth={2} />
            </div>
            {globalFilter && (
              <button
                className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center text-muted-foreground/80 hover:text-foreground"
                onClick={() => handleGlobalFilterChange("")}
              >
                <CircleX size={16} strokeWidth={2} />
              </button>
            )}
          </div>
          
          {/* Event Type Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Filter className="-ms-1 me-2 opacity-60" size={16} strokeWidth={2} />
                Event Type
                {selectedEventTypes.length > 0 && (
                  <span className="-me-1 ms-3 inline-flex h-5 items-center rounded border bg-background px-1 text-[0.625rem] font-medium text-muted-foreground/70">
                    {selectedEventTypes.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="min-w-36 p-3" align="start">
              <div className="space-y-3">
                <div className="text-xs font-medium text-muted-foreground">Event Types</div>
                <div className="space-y-3">
                  {uniqueEventTypes.map((eventType, i) => (
                    <div key={eventType} className="flex items-center gap-2">
                      <Checkbox
                        id={`event-type-${i}`}
                        checked={selectedEventTypes.includes(eventType)}
                        onCheckedChange={(checked: boolean) => {
                          const newEventTypes = checked 
                            ? [...selectedEventTypes, eventType]
                            : selectedEventTypes.filter(et => et !== eventType);
                          handleEventTypeFilterChange(newEventTypes);
                        }}
                      />
                      <Label htmlFor={`event-type-${i}`} className="flex grow justify-between gap-2 font-normal">
                        {eventType}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          {/* City Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Filter className="-ms-1 me-2 opacity-60" size={16} strokeWidth={2} />
                City
                {selectedCities.length > 0 && (
                  <span className="-me-1 ms-3 inline-flex h-5 items-center rounded border bg-background px-1 text-[0.625rem] font-medium text-muted-foreground/70">
                    {selectedCities.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="min-w-36 p-3" align="start">
              <div className="space-y-3">
                <div className="text-xs font-medium text-muted-foreground">Cities</div>
                <div className="space-y-3">
                  {filteredCities.map((city, i) => (
                    <div key={city} className="flex items-center gap-2">
                      <Checkbox
                        id={`city-${i}`}
                        checked={selectedCities.includes(city)}
                        onCheckedChange={(checked: boolean) => {
                          const newCities = checked 
                            ? [...selectedCities, city]
                            : selectedCities.filter(c => c !== city);
                          handleCityFilterChange(newCities);
                        }}
                      />
                      <Label htmlFor={`city-${i}`} className="flex grow justify-between gap-2 font-normal">
                        {city}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Date Range Filter */}
          <Popover open={showDateRangePicker} onOpenChange={setShowDateRangePicker}>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="-ms-1 me-2 opacity-60" size={16} strokeWidth={2} />
                {dateRange?.from && dateRange?.to 
                  ? `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd")}`
                  : dateRange?.from
                  ? format(dateRange.from, "MMM dd")
                  : "Date Range"
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <ModernDateRangePicker
                onDateSelect={handleDateRangeChange}
                initialValue={dateRange}
                className="border-0 shadow-none"
              />
            </PopoverContent>
          </Popover>

          {/* OB Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Filter className="-ms-1 me-2 opacity-60" size={16} strokeWidth={2} />
                OB
                {selectedObs.length > 0 && (
                  <span className="-me-1 ms-3 inline-flex h-5 items-center rounded border bg-background px-1 text-[0.625rem] font-medium text-muted-foreground/70">
                    {selectedObs.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="min-w-36 p-3" align="start">
              <div className="space-y-3">
                <div className="text-xs font-medium text-muted-foreground">Observers</div>
                <div className="space-y-3">
                  {filteredObs.map((ob, i) => (
                    <div key={ob} className="flex items-center gap-2">
                      <Checkbox
                        id={`ob-${i}`}
                        checked={selectedObs.includes(ob)}
                        onCheckedChange={(checked: boolean) => {
                          const newObs = checked 
                            ? [...selectedObs, ob]
                            : selectedObs.filter(o => o !== ob);
                          handleObFilterChange(newObs);
                        }}
                      />
                      <Label htmlFor={`ob-${i}`} className="flex grow justify-between gap-2 font-normal">
                        {ob}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* SNG Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Filter className="-ms-1 me-2 opacity-60" size={16} strokeWidth={2} />
                SNG
                {selectedSngs.length > 0 && (
                  <span className="-me-1 ms-3 inline-flex h-5 items-center rounded border bg-background px-1 text-[0.625rem] font-medium text-muted-foreground/70">
                    {selectedSngs.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="min-w-36 p-3" align="start">
              <div className="space-y-3">
                <div className="text-xs font-medium text-muted-foreground">SNGs</div>
                <div className="space-y-3">
                  {filteredSngs.map((sng, i) => (
                    <div key={sng} className="flex items-center gap-2">
                      <Checkbox
                        id={`sng-${i}`}
                        checked={selectedSngs.includes(sng)}
                        onCheckedChange={(checked: boolean) => {
                          const newSngs = checked 
                            ? [...selectedSngs, sng]
                            : selectedSngs.filter(s => s !== sng);
                          handleSngFilterChange(newSngs);
                        }}
                      />
                      <Label htmlFor={`sng-${i}`} className="flex grow justify-between gap-2 font-normal">
                        {sng}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
            </div>
          </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearAllFilters}>
            <CircleX size={16} strokeWidth={2} className="mr-2" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
        <Table className="table-fixed">
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} style={{ width: header.getSize() }}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No events found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Events count */}
      <div className="flex items-center justify-center px-2">
        <div className="text-sm text-muted-foreground">
          Showing {table.getFilteredRowModel().rows.length} of {events.length} events
        </div>
      </div>
    </div>
  );
}
