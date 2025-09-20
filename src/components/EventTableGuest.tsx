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
import { format, addDays } from "date-fns";
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
  ArrowUpDown,
} from "lucide-react";
import { useMemo, useRef, useState, useId, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { isWithinInterval, parseISO } from "date-fns";

// Custom filter function for event title only searching
const eventTitleFilterFn: FilterFn<Event> = (row, columnId, filterValue) => {
  const eventTitle = row.original.event.toLowerCase();
  const searchTerm = (filterValue ?? "").toLowerCase();
  return eventTitle.includes(searchTerm);
};

const eventTypeFilterFn: FilterFn<Event> = (row, columnId, filterValue: string[]) => {
  if (!filterValue || filterValue.length === 0) return true;
  const eventTypeValue = row.getValue(columnId);
  const eventTypeName = typeof eventTypeValue === 'object' ? (eventTypeValue as any)?.name : eventTypeValue;
  return filterValue.includes(eventTypeName as string);
};

const obFilterFn: FilterFn<Event> = (row, columnId, filterValue: string[]) => {
  if (!filterValue || filterValue.length === 0) return true;
  const event = row.original;
  
  // Check observers array if available
  if (event.observers && event.observers.length > 0) {
    return event.observers.some((observer: any) => {
      const observerCode = typeof observer === 'object' ? observer.code || (observer as any).name : observer;
      return filterValue.includes(observerCode);
    });
  }
  
  // Fallback to single ob
  return filterValue.includes(row.getValue(columnId) as string);
};

const cityFilterFn: FilterFn<Event> = (row, columnId, filterValue: string[]) => {
  if (!filterValue || filterValue.length === 0) return true;
  const cityValue = row.getValue(columnId);
  const cityName = typeof cityValue === 'object' ? (cityValue as any)?.name : cityValue;
  return filterValue.includes(cityName as string);
};

const sngFilterFn: FilterFn<Event> = (row, columnId, filterValue: string[]) => {
  if (!filterValue || filterValue.length === 0) return true;
  const event = row.original;
  
  // Check sngs array if available
  if (event.sngs && event.sngs.length > 0) {
    return event.sngs.some((sng: any) => {
      const sngCode = typeof sng === 'object' ? sng.code || sng.name : sng;
      return filterValue.includes(sngCode);
    });
  }
  
  // Fallback to single sng
  const sngValue = row.getValue(columnId) as string;
  return filterValue.includes(sngValue);
};

const generatorFilterFn: FilterFn<Event> = (row, columnId, filterValue: string[]) => {
  if (!filterValue || filterValue.length === 0) return true;
  const event = row.original;
  
  // Check generators array if available
  if (event.generators && event.generators.length > 0) {
    return event.generators.some((generator: any) => {
      const generatorCode = typeof generator === 'object' ? generator.code || generator.name : generator;
      return filterValue.includes(generatorCode);
    });
  }
  
  // Fallback to single generator
  const generatorValue = row.getValue(columnId) as string;
  return filterValue.includes(generatorValue);
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
  // Table state - إضافة state للفرز
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // Filter states - local only
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [selectedObs, setSelectedObs] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedSngs, setSelectedSngs] = useState<string[]>([]);
  const [selectedGenerators, setSelectedGenerators] = useState<string[]>([]);
  
  // Set default date range to "next 30 days"
  const getNext30DaysRange = () => {
    const today = new Date();
    return { from: today, to: addDays(today, 29) };
  };
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>(getNext30DaysRange());
  const [isDefaultDateRange, setIsDefaultDateRange] = useState(true);

  // Search terms for filter dropdowns
  const [eventTypeSearchTerm, setEventTypeSearchTerm] = useState("");
  const [obSearchTerm, setObSearchTerm] = useState("");
  const [citySearchTerm, setCitySearchTerm] = useState("");
  const [sngSearchTerm, setSngSearchTerm] = useState("");
  const [generatorSearchTerm, setGeneratorSearchTerm] = useState("");

  // Modern date range picker state
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchId = useId();

  // Define columns مع إضافة خاصية الفرز
  const columns: ColumnDef<Event>[] = [
    {
      header: ({ column }) => {
        return (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
            >
              Date
            </Button>
        );
      },
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
      // إضافة دالة فرز مخصصة للتاريخ
      sortingFn: (rowA, rowB, columnId) => {
        const dateA = new Date(rowA.getValue(columnId));
        const dateB = new Date(rowB.getValue(columnId));
        return dateA.getTime() - dateB.getTime();
      },
    },
    {
      header: ({ column }) => {
        return (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
            >
              Event
            </Button>
        );
      },
      accessorKey: "event",
      cell: ({ row }) => (
          <div className="font-medium max-w-[200px] truncate" title={row.getValue("event")}>
            {row.getValue("event")}
          </div>
      ),
      size: 200,
    },
    {
      header: ({ column }) => {
        return (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
            >
              Type
            </Button>
        );
      },
      accessorKey: "eventType",
      cell: ({ row }) => {
        const eventTypeValue = row.getValue("eventType");
        const eventTypeName = typeof eventTypeValue === 'object' ? (eventTypeValue as any)?.name : eventTypeValue;
        const eventTypeData = eventTypes.find(et => et.name === eventTypeName);
        const variant = getEventTypeBadgeVariant(eventTypeName, eventTypeData);

        return (
            <Badge variant={variant}>
              {eventTypeName || '-'}
            </Badge>
        );
      },
      size: 150,
      filterFn: eventTypeFilterFn,
    },
    {
      header: ({ column }) => {
        return (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
            >
              City
            </Button>
        );
      },
      accessorKey: "city",
      cell: ({ row }) => {
        const cityValue = row.getValue("city");
        const cityName = typeof cityValue === 'object' ? (cityValue as any)?.name : cityValue;
        return (
          <div className="text-sm">
            {cityName || '-'}
          </div>
        );
      },
      size: 150,
    },
    {
      header: ({ column }) => {
        return (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
            >
              Venue
            </Button>
        );
      },
      accessorKey: "venue",
      cell: ({ row }) => {
        const venueValue = row.getValue("venue");
        const venueName = typeof venueValue === 'object' ? (venueValue as any)?.name : venueValue;
        return (
          <div className="text-sm max-w-[150px] truncate" title={venueName}>
            {venueName || '-'}
          </div>
        );
      },
      size: 150,
    },
    {
      header: ({ column }) => {
        return (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
            >
              Time
            </Button>
        );
      },
      accessorKey: "time",
      cell: ({ row }) => (
          <div className="font-mono text-sm">
            {row.getValue("time") || "00:00"}
          </div>
      ),
      size: 100,
      // إضافة دالة فرز مخصصة للوقت
      sortingFn: (rowA, rowB, columnId) => {
        const timeA = rowA.getValue(columnId) as string || "00:00";
        const timeB = rowB.getValue(columnId) as string || "00:00";
        return timeA.localeCompare(timeB);
      },
    },
    {
      header: ({ column }) => {
        return (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
            >
              OB
            </Button>
        );
      },
      accessorKey: "ob",
      cell: ({ row }) => {
        const event = row.original;
        // Use observers array if available, fallback to single ob
        const currentObservers = event.observers && event.observers.length > 0 ? event.observers : [event.ob].filter(Boolean);
        
        if (currentObservers.length === 0) {
          return <div className="text-sm text-muted-foreground">-</div>;
        }
        
        if (currentObservers.length === 1) {
          const observer = currentObservers[0];
          const observerCode = typeof observer === 'object' ? observer.code || (observer as any).name || '-' : observer;
          return (
            <div className="text-sm">
              <Badge variant="outline" className="text-xs truncate">
                {observerCode}
              </Badge>
            </div>
          );
        }
        
        // Multiple observers - show first 2 and +N more
        return (
          <div className="flex flex-wrap gap-1">
            {currentObservers.slice(0, 2).map((observer: any, index: number) => {
              const observerCode = typeof observer === 'object' ? observer.code || (observer as any).name || '-' : observer;
              return (
                <Badge key={index} variant="outline" className="text-xs truncate">
                  {observerCode}
                </Badge>
              );
            })}
            {currentObservers.length > 2 && (
              <Popover>
                <PopoverTrigger asChild>
                  <button className="inline-flex items-center justify-center rounded-md border border-input bg-background px-2 py-1 text-xs font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    +{currentObservers.length - 2} more
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start">
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {currentObservers.map((observer: any, index: number) => {
                      const observerCode = typeof observer === 'object' ? observer.code || (observer as any).name || '-' : observer;
                      return (
                        <Badge key={index} variant="outline" className="text-xs">
                          {observerCode}
                        </Badge>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        );
      },
      size: 100,
    },
    {
      header: ({ column }) => {
        return (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
            >
              SNG
            </Button>
        );
      },
      accessorKey: "sng",
      cell: ({ row }) => {
        const event = row.original;
        // Use sngs array if available, fallback to single sng
        const currentSngs = event.sngs && event.sngs.length > 0 ? event.sngs : [event.sng].filter(Boolean);
        
        if (currentSngs.length === 0) {
          return <div className="text-sm text-muted-foreground">-</div>;
        }
        
        if (currentSngs.length === 1) {
          const sng = currentSngs[0];
          const sngCode = typeof sng === 'object' ? sng.code || sng.name || '-' : sng;
          return (
            <div className="text-sm">
              <Badge variant="outline" className="text-xs truncate">
                {sngCode}
              </Badge>
            </div>
          );
        }
        
        // Multiple SNGs - show first 2 and +N more
        return (
          <div className="flex flex-wrap gap-1">
            {currentSngs.slice(0, 2).map((sng: any, index: number) => {
              const sngCode = typeof sng === 'object' ? sng.code || sng.name || '-' : sng;
              return (
                <Badge key={index} variant="outline" className="text-xs truncate">
                  {sngCode}
                </Badge>
              );
            })}
            {currentSngs.length > 2 && (
              <Popover>
                <PopoverTrigger asChild>
                  <button className="inline-flex items-center justify-center rounded-md border border-input bg-background px-2 py-1 text-xs font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    +{currentSngs.length - 2} more
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start">
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {currentSngs.map((sng: any, index: number) => {
                      const sngCode = typeof sng === 'object' ? sng.code || sng.name || '-' : sng;
                      return (
                        <Badge key={index} variant="outline" className="text-xs">
                          {sngCode}
                        </Badge>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        );
      },
      size: 100,
      filterFn: sngFilterFn,
    },
    {
      header: ({ column }) => {
        return (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="h-auto p-0 font-semibold hover:bg-transparent"
            >
              Generator
            </Button>
        );
      },
      accessorKey: "generator",
      cell: ({ row }) => {
        const event = row.original;
        // Use generators array if available, fallback to single generator
        const currentGenerators = event.generators && event.generators.length > 0 ? event.generators : [event.generator].filter(Boolean);
        
        if (currentGenerators.length === 0) {
          return <div className="text-sm text-muted-foreground">-</div>;
        }
        
        if (currentGenerators.length === 1) {
          const generator = currentGenerators[0];
          const generatorCode = typeof generator === 'object' ? generator.code || generator.name || '-' : generator;
          return (
            <div className="text-sm">
              <Badge variant="outline" className="text-xs truncate">
                {generatorCode}
              </Badge>
            </div>
          );
        }
        
        // Multiple Generators - show first 1 and +N more (generators usually fewer)
        return (
          <div className="flex flex-wrap gap-1">
            {currentGenerators.slice(0, 1).map((generator: any, index: number) => {
              const generatorCode = typeof generator === 'object' ? generator.code || generator.name || '-' : generator;
              return (
                <Badge key={index} variant="outline" className="text-xs truncate">
                  {generatorCode}
                </Badge>
              );
            })}
            {currentGenerators.length > 1 && (
              <Popover>
                <PopoverTrigger asChild>
                  <button className="inline-flex items-center justify-center rounded-md border border-input bg-background px-2 py-1 text-xs font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    +{currentGenerators.length - 1} more
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start">
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {currentGenerators.map((generator: any, index: number) => {
                      const generatorCode = typeof generator === 'object' ? generator.code || generator.name || '-' : generator;
                      return (
                        <Badge key={index} variant="outline" className="text-xs">
                          {generatorCode}
                        </Badge>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        );
      },
      size: 100,
      filterFn: generatorFilterFn,
    },
  ];

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
    if (selectedGenerators.length > 0) {
      filters.push({ id: 'generator', value: selectedGenerators });
    }
    if (dateRange) {
      filters.push({ id: 'date', value: dateRange });
    }

    return filters;
  }, [globalFilter, selectedEventTypes, selectedCities, selectedObs, selectedSngs, selectedGenerators, dateRange]);

  const table = useReactTable({
    data: events,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    // إضافة معالجات الفرز
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      sorting, // إضافة state الفرز
      columnFilters: tableFilters,
      columnVisibility,
      globalFilter,
    },
    // Local filtering and sorting
    manualSorting: false, // تفعيل الفرز المحلي
    manualPagination: false,
    enableGlobalFilter: true,
    globalFilterFn: eventTitleFilterFn,
    // تفعيل الفرز متعدد الأعمدة
    enableMultiSort: true,
  });

  // Get unique values for filters from loaded events
  const uniqueObs = useMemo(() => {
    const obs: string[] = [];
    events.forEach(event => {
      // Include observers from array
      if (event.observers && event.observers.length > 0) {
        event.observers.forEach((observer: any) => {
          const observerCode = typeof observer === 'object' ? observer.code || (observer as any).name : observer;
          if (observerCode) obs.push(observerCode);
        });
      } else if (event.ob) {
        // Fallback to single ob
        obs.push(event.ob);
      }
    });
    return Array.from(new Set(obs)).sort();
  }, [events]);

  const uniqueCities = useMemo(() => {
    const cities = events.map(event => 
      typeof event.city === 'object' ? (event.city as any)?.name : event.city
    ).filter(Boolean) as string[];
    return Array.from(new Set(cities)).sort();
  }, [events]);

  const uniqueEventTypes = useMemo(() => {
    const types = events.map(event => 
      typeof event.eventType === 'object' ? (event.eventType as any)?.name : event.eventType
    ).filter(Boolean) as string[];
    return Array.from(new Set(types)).sort();
  }, [events]);

  const uniqueSngs = useMemo(() => {
    const sngs: string[] = [];
    events.forEach(event => {
      // Include SNGs from array
      if (event.sngs && event.sngs.length > 0) {
        event.sngs.forEach((sng: any) => {
          const sngCode = typeof sng === 'object' ? sng.code || sng.name : sng;
          if (sngCode) sngs.push(sngCode);
        });
      } else if (event.sng) {
        // Fallback to single sng
        const sngCode = typeof event.sng === 'object' ? (event.sng as any)?.name || (event.sng as any)?.code : event.sng;
        if (sngCode) sngs.push(sngCode);
      }
    });
    return Array.from(new Set(sngs)).sort();
  }, [events]);

  const uniqueGenerators = useMemo(() => {
    const generators: string[] = [];
    events.forEach(event => {
      // Include generators from array
      if (event.generators && event.generators.length > 0) {
        event.generators.forEach((generator: any) => {
          const generatorCode = typeof generator === 'object' ? generator.code || generator.name : generator;
          if (generatorCode) generators.push(generatorCode);
        });
      } else if (event.generator) {
        // Fallback to single generator
        const generatorCode = typeof event.generator === 'object' ? (event.generator as any)?.name || (event.generator as any)?.code : event.generator;
        if (generatorCode) generators.push(generatorCode);
      }
    });
    return Array.from(new Set(generators)).sort();
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
  const filteredGenerators = uniqueGenerators.filter(generator =>
      generator.toLowerCase().includes(generatorSearchTerm.toLowerCase())
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

  const handleGeneratorFilterChange = (generators: string[]) => {
    setSelectedGenerators(generators);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setIsDefaultDateRange(false); // Mark as no longer using default
    setShowDateRangePicker(false); // Close the picker after selection
  };

  // Clear all filters and sorting
  const clearAllFilters = () => {
    setGlobalFilter("");
    setSelectedEventTypes([]);
    setSelectedObs([]);
    setSelectedCities([]);
    setSelectedSngs([]);
    setSelectedGenerators([]);
    setDateRange(getNext30DaysRange()); // Reset to default next 30 days
    setIsDefaultDateRange(true); // Mark as using default
    setShowDateRangePicker(false);
    setSorting([]); // إعادة تعيين الفرز أيضاً
  };

  const hasActiveFilters = globalFilter || selectedEventTypes.length > 0 || selectedObs.length > 0 || selectedCities.length > 0 || selectedSngs.length > 0 || selectedGenerators.length > 0 || (!isDefaultDateRange && dateRange) || sorting.length > 0;

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
                    placeholder="Search events..."
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
                    {isDefaultDateRange && dateRange?.from && dateRange?.to 
                        ? "Next 30 days"
                        : dateRange?.from && dateRange?.to
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
                    <div className="text-xs font-medium text-muted-foreground">Ob</div>
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

              {/* Generator Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <Filter className="-ms-1 me-2 opacity-60" size={16} strokeWidth={2} />
                    Generator
                    {selectedGenerators.length > 0 && (
                        <span className="-me-1 ms-3 inline-flex h-5 items-center rounded border bg-background px-1 text-[0.625rem] font-medium text-muted-foreground/70">
                    {selectedGenerators.length}
                  </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="min-w-36 p-3" align="start">
                  <div className="space-y-3">
                    <div className="text-xs font-medium text-muted-foreground">Generators</div>
                    <div className="space-y-3">
                      {filteredGenerators.map((generator, i) => (
                          <div key={generator} className="flex items-center gap-2">
                            <Checkbox
                                id={`generator-${i}`}
                                checked={selectedGenerators.includes(generator)}
                                onCheckedChange={(checked: boolean) => {
                                  const newGenerators = checked
                                      ? [...selectedGenerators, generator]
                                      : selectedGenerators.filter(g => g !== generator);
                                  handleGeneratorFilterChange(newGenerators);
                                }}
                            />
                            <Label htmlFor={`generator-${i}`} className="flex grow justify-between gap-2 font-normal">
                              {generator}
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
                Clear All
              </Button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-border bg-card ">
          <Table className="table-fixed">
            <TableHeader className="bg-[#FBFBFB]">
              {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-border">
                    {headerGroup.headers.map((header) => (
                        <TableHead
                            key={header.id}
                            style={{ width: header.getSize() }}
                            className="h-14 text-foreground px-6 py-4 border-r border-border/30 last:border-r-0"
                        >
                          {header.isPlaceholder ? null : header.column.getCanSort() ? (
                              <div
                                  className={cn(
                                      "flex h-full cursor-pointer select-none items-center justify-between gap-2"
                                  )}
                                  onClick={() => header.column.toggleSorting(header.column.getIsSorted() === "asc")}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.preventDefault();
                                      header.column.toggleSorting(header.column.getIsSorted() === "asc");
                                    }
                                  }}
                                  tabIndex={0}
                              >
                                <span className="font-medium">{flexRender(header.column.columnDef.header, header.getContext())}</span>
                                {{
                                  asc: <ChevronUp className="shrink-0 opacity-60" size={16} strokeWidth={2} aria-hidden="true" />,
                                  desc: <ChevronDown className="shrink-0 opacity-60" size={16} strokeWidth={2} aria-hidden="true" />,
                                }[header.column.getIsSorted() as string] }
                              </div>
                          ) : (
                              <span className="font-medium">{flexRender(header.column.columnDef.header, header.getContext())}</span>
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
                          className="hover:bg-muted/30 transition-colors duration-200 border-b border-border/50"
                      >
                        {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} style={{ width: cell.column.getSize() }} className="last:py-0 px-6 py-4 text-sm border-r border-border/20 last:border-r-0">

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