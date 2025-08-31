<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventType;
use App\Models\City;
use App\Models\CityDistance;
use App\Models\Venue;
use App\Models\Observer;
use App\Models\Sng;
use App\Models\ActivityLog;
use App\Http\Resources\EventResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class EventController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Event::with(['eventType', 'city', 'venue', 'observer', 'sng', 'creator']);

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->byDateRange($request->start_date, $request->end_date);
        }

        // Filter by month/year
        if ($request->has('month') && $request->has('year')) {
            $query->whereMonth('event_date', $request->month)
                  ->whereYear('event_date', $request->year);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        // Filter by event type
        if ($request->has('event_type_id')) {
            $query->where('event_type_id', $request->event_type_id);
        }

        // Filter by city
        if ($request->has('city_id')) {
            $query->where('city_id', $request->city_id);
        }

        // Search
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhereHas('eventType', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('city', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('venue', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('observer', function ($q) use ($search) {
                      $q->where('code', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by event types
        if ($request->has('event_types') && !empty($request->event_types)) {
            $eventTypes = explode(',', $request->event_types);
            $query->whereHas('eventType', function ($q) use ($eventTypes) {
                $q->whereIn('name', $eventTypes);
            });
        }

        // Filter by cities
        if ($request->has('cities') && !empty($request->cities)) {
            $cities = explode(',', $request->cities);
            $query->whereHas('city', function ($q) use ($cities) {
                $q->whereIn('name', $cities);
            });
        }

        // Filter by observers
        if ($request->has('observers') && !empty($request->observers)) {
            $observers = explode(',', $request->observers);
            $query->whereHas('observer', function ($q) use ($observers) {
                $q->whereIn('code', $observers);
            });
        }

        // Filter by SNGs
        if ($request->has('sngs') && !empty($request->sngs)) {
            $sngs = explode(',', $request->sngs);
            $query->whereHas('sng', function ($q) use ($sngs) {
                $q->whereIn('code', $sngs);
            });
        }

        // Filter by date range
        if ($request->has('date_from') && $request->has('date_to')) {
            $query->whereBetween('event_date', [$request->date_from, $request->date_to]);
        }

        // Get pagination parameters
        $perPage = $request->get('per_page', 50); // Default to 50 items per page
        $perPage = min($perPage, 100); // Max 100 items per page

        // Apply sorting
        if ($request->has('sort_field') && $request->has('sort_direction')) {
            $sortField = $request->sort_field;
            $sortDirection = $request->sort_direction;

            switch ($sortField) {
                case 'date':
                    $query->orderBy('event_date', $sortDirection);
                    break;
                case 'time':
                    $query->orderBy('event_time', $sortDirection);
                    break;
                case 'event':
                    $query->orderBy('title', $sortDirection);
                    break;
                case 'eventType':
                    $query->join('event_types', 'events.event_type_id', '=', 'event_types.id')
                          ->orderBy('event_types.name', $sortDirection)
                          ->select('events.*');
                    break;
                case 'city':
                    $query->join('cities', 'events.city_id', '=', 'cities.id')
                          ->orderBy('cities.name', $sortDirection)
                          ->select('events.*');
                    break;
                case 'venue':
                    $query->join('venues', 'events.venue_id', '=', 'venues.id')
                          ->orderBy('venues.name', $sortDirection)
                          ->select('events.*');
                    break;
                case 'ob':
                    $query->join('observers', 'events.observer_id', '=', 'observers.id')
                          ->orderBy('observers.code', $sortDirection)
                          ->select('events.*');
                    break;
                case 'sng':
                    $query->join('sngs', 'events.sng_id', '=', 'sngs.id')
                          ->orderBy('sngs.code', $sortDirection)
                          ->select('events.*');
                    break;
                default:
                    $query->orderBy('event_date', 'desc')
                          ->orderBy('event_time', 'desc');
                    break;
            }
        } else {
            $query->orderBy('event_date', 'desc')
                  ->orderBy('event_time', 'desc');
        }

        $events = $query->with(['eventType', 'city', 'venue', 'observer', 'sng', 'creator'])->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => [
                'data' => EventResource::collection($events->items()),
                'current_page' => $events->currentPage(),
                'first_page_url' => $events->url(1),
                'from' => $events->firstItem(),
                'last_page' => $events->lastPage(),
                'last_page_url' => $events->url($events->lastPage()),
                'links' => $events->linkCollection(),
                'next_page_url' => $events->nextPageUrl(),
                'path' => $events->path(),
                'per_page' => $events->perPage(),
                'prev_page_url' => $events->previousPageUrl(),
                'to' => $events->lastItem(),
                'total' => $events->total()
            ]
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'event_date' => 'required|date',
                'event_time' => 'required|date_format:H:i',
                'event_type' => 'required|string',
                'city' => 'required|string',
                'venue' => 'required|string',
                'observer' => 'required|string',
                'sng' => 'nullable|string',
                'description' => 'nullable|string',
                'teams' => 'nullable|array',
                'metadata' => 'nullable|array'
            ]);

            // Find or create event type
            $eventType = EventType::firstOrCreate(['name' => $validated['event_type']], [
                'code' => strtoupper(substr($validated['event_type'], 0, 3)),
                'color' => '#' . substr(md5($validated['event_type']), 0, 6)
            ]);

            // Find or create city
            $city = City::firstOrCreate(['name' => $validated['city']]);

            // Find or create venue
            $venue = Venue::firstOrCreate(
                ['name' => $validated['venue']],
                ['city_id' => $city->id]
            );

            // Find or create observer
            $observer = Observer::firstOrCreate(['code' => $validated['observer']]);

            // Find or create SNG
            $sng = null;
            if (!empty($validated['sng'])) {
                $sng = Sng::firstOrCreate(['code' => $validated['sng']]);
            }

            // Check OB conflicts before creating
            $obConflictValidation = $this->validateObserverConflict(
                $observer->id,
                $validated['event_date'],
                $validated['event_time'],
                $city->id
            );

            if (!$obConflictValidation['valid']) {
                return response()->json([
                    'success' => false,
                    'message' => $obConflictValidation['message'],
                    'error_type' => 'observer_conflict',
                    'details' => $obConflictValidation['details']
                ], 422);
            }

            // Check SNG conflicts before creating (if SNG is provided)
            if ($sng) {
                $sngConflictValidation = $this->validateSngConflict(
                    $sng->id,
                    $validated['event_date'],
                    $validated['event_time'],
                    $city->id
                );

                if (!$sngConflictValidation['valid']) {
                    return response()->json([
                        'success' => false,
                        'message' => $sngConflictValidation['message'],
                        'error_type' => 'sng_conflict',
                        'details' => $sngConflictValidation['details']
                    ], 422);
                }
            }

            // Create event with IDs
            $event = Event::create([
                'title' => $validated['title'],
                'description' => $validated['description'] ?? '',
                'event_date' => $validated['event_date'],
                'event_time' => $validated['event_time'],
                'event_type_id' => $eventType->id,
                'city_id' => $city->id,
                'venue_id' => $venue->id,
                'observer_id' => $observer->id,
                'sng_id' => $sng?->id,
                'created_by' => auth()->id(),
                'teams' => $validated['teams'] ?? [],
                'metadata' => $validated['metadata'] ?? []
            ]);

            $event->load(['eventType', 'city', 'venue', 'observer', 'sng', 'creator']);
            ActivityLog::logActivity('created', $event, null, $validated);

            return response()->json([
                'success' => true,
                'message' => 'Event created successfully',
                'data' => new EventResource($event)
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->validator->getMessageBag(),
                'details' => $e->validator->getMessageBag()->first()
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create event. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Event $event): JsonResponse
    {
        $event->load(['eventType', 'city', 'venue', 'observer', 'sng', 'creator']);

        return response()->json([
            'success' => true,
            'data' => new EventResource($event)
        ]);
    }

    public function update(Request $request, Event $event): JsonResponse
    {
        $oldValues = $event->toArray();

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'event_date' => 'sometimes|date',
            'event_time' => 'sometimes|date_format:H:i',
            'event_type_id' => 'sometimes|exists:event_types,id',
            'city_id' => 'sometimes|exists:cities,id',
            'venue_id' => 'sometimes|exists:venues,id',
            'sng_id' => 'sometimes|exists:sngs,id',
            'observer_id' => 'nullable|exists:observers,id',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:scheduled,ongoing,completed,cancelled,postponed',
            'teams' => 'nullable|array',
            'metadata' => 'nullable|array'
        ]);

        if (isset($validated['city_id']) && $validated['city_id'] != $event->city_id) {
            $travelTimeValidation = $this->validateTravelTime(
                $event->city_id,
                $validated['city_id'],
                $validated['event_date'] ?? $event->event_date,
                $validated['event_time'] ?? $event->event_time,
                $validated['observer_id'] ?? $event->observer_id,
                $event->id,
                $validated['sng_id'] ?? $event->sng_id
            );

            if (!$travelTimeValidation['valid']) {
                return response()->json([
                    'success' => false,
                    'message' => $travelTimeValidation['message'],
                    'error_type' => 'travel_time_insufficient',
                    'details' => $travelTimeValidation['details']
                ], 422);
            }
        }

        // Check OB conflicts even if city didn't change (in case observer or time changed)
        if (isset($validated['observer_id']) || isset($validated['event_time']) || isset($validated['event_date'])) {
            $obConflictValidation = $this->validateObserverConflict(
                $validated['observer_id'] ?? $event->observer_id,
                $validated['event_date'] ?? $event->event_date,
                $validated['event_time'] ?? $event->event_time,
                $validated['city_id'] ?? $event->city_id,
                $event->id
            );

            if (!$obConflictValidation['valid']) {
                return response()->json([
                    'success' => false,
                    'message' => $obConflictValidation['message'],
                    'error_type' => 'observer_conflict',
                    'details' => $obConflictValidation['details']
                ], 422);
            }
        }

        // Check SNG conflicts even if city didn't change (in case sng or time changed)
        if (isset($validated['sng_id']) || isset($validated['event_time']) || isset($validated['event_date'])) {
            $sngId = $validated['sng_id'] ?? $event->sng_id;
            if ($sngId) {
                $sngConflictValidation = $this->validateSngConflict(
                    $sngId,
                    $validated['event_date'] ?? $event->event_date,
                    $validated['event_time'] ?? $event->event_time,
                    $validated['city_id'] ?? $event->city_id,
                    $event->id
                );

                if (!$sngConflictValidation['valid']) {
                    return response()->json([
                        'success' => false,
                        'message' => $sngConflictValidation['message'],
                        'error_type' => 'sng_conflict',
                        'details' => $sngConflictValidation['details']
                    ], 422);
                }
            }
        }

        $event->update($validated);
        $event->load(['eventType', 'city', 'venue', 'observer', 'sng', 'creator']);

        ActivityLog::logActivity('updated', $event, $oldValues, $validated);

        return response()->json([
            'success' => true,
            'message' => 'Event updated successfully',
            'data' => new EventResource($event)
        ]);
    }

    /**
     * Validate if there's enough time to travel between cities and OB availability
     */
    private function validateTravelTime($oldCityId, $newCityId, $eventDate, $eventTime, $observerId = null, $currentEventId = null, $sngId = null): array
    {
        try {
            $eventDateTime = Carbon::parse($eventDate . ' ' . $eventTime);

            $oldCity = City::find($oldCityId);
            $newCity = City::find($newCityId);

            if (!$oldCity || !$newCity) {
                return ['valid' => true, 'message' => 'Cities not found, proceeding anyway'];
            }

            if ($oldCityId == $newCityId) {
                return ['valid' => true, 'message' => 'Same city, no travel required'];
            }

            // ✅ التحقق من تعارض الـ OB مع الأحداث الأخرى مباشرة
            if ($observerId) {
                $obConflictValidation = $this->validateObserverConflict(
                    $observerId,
                    $eventDate,
                    $eventTime,
                    $newCityId,
                    $currentEventId
                );

                if (!$obConflictValidation['valid']) {
                    return $obConflictValidation;
                }
            }

            // ✅ التحقق من تعارض الـ SNG مع الأحداث الأخرى مباشرة
            if ($sngId) {
                $sngConflictValidation = $this->validateSngConflict(
                    $sngId,
                    $eventDate,
                    $eventTime,
                    $newCityId,
                    $currentEventId
                );

                if (!$sngConflictValidation['valid']) {
                    return $sngConflictValidation;
                }
            }

            return [
                'valid' => true,
                'message' => sprintf(
                    'Resources are available for travel from %s to %s',
                    $oldCity->name,
                    $newCity->name
                ),
                'details' => [
                    'old_city' => $oldCity->name,
                    'new_city' => $newCity->name,
                    'observer_available' => $observerId ? true : false,
                    'sng_available' => $sngId ? true : false
                ]
            ];

            // If no observer specified, just validate basic city change
            return [
                'valid' => true,
                'message' => sprintf(
                    'City change validated from %s to %s',
                    $oldCity->name,
                    $newCity->name
                ),
                'details' => [
                    'old_city' => $oldCity->name,
                    'new_city' => $newCity->name
                ]
            ];

        } catch (\Exception $e) {
            // Log error but don't block the update
            \Log::error('Travel time validation error: ' . $e->getMessage());

            return [
                'valid' => true,
                'message' => 'Travel time validation failed, proceeding anyway',
                'details' => ['error' => $e->getMessage()]
            ];
        }
    }

    public function destroy(Event $event): JsonResponse
    {
        ActivityLog::logActivity('deleted', $event, $event->toArray());

        $event->delete();

        return response()->json([
            'success' => true,
            'message' => 'Event deleted successfully'
        ]);
    }

    public function calendar(Request $request): JsonResponse
    {
        $month = $request->get('month', date('m'));
        $year = $request->get('year', date('Y'));

        $events = Event::with(['eventType', 'city', 'venue'])
            ->whereMonth('event_date', $month)
            ->whereYear('event_date', $year)
            ->orderBy('event_date')
            ->orderBy('event_time')
            ->get();

        $calendarData = [];
        foreach ($events as $event) {
            $date = $event->event_date->format('Y-m-d');
            if (!isset($calendarData[$date])) {
                $calendarData[$date] = [];
            }
            $calendarData[$date][] = new EventResource($event);
        }

        return response()->json([
            'success' => true,
            'data' => $calendarData,
            'meta' => [
                'month' => $month,
                'year' => $year,
                'total_events' => $events->count()
            ]
        ]);
    }

    public function updateStatus(Request $request, Event $event): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:scheduled,ongoing,completed,cancelled,postponed'
        ]);

        $oldStatus = $event->status;
        $event->update($validated);

        ActivityLog::logActivity('status_updated', $event, ['status' => $oldStatus], $validated);

        return response()->json([
            'success' => true,
            'message' => 'Event status updated successfully',
            'data' => new EventResource($event)
        ]);
    }

    // Public methods for guest access
    public function publicIndex(Request $request): JsonResponse
    {
        $query = Event::with(['eventType', 'city', 'venue', 'observer' , 'sng'])
            ->where('status', 'scheduled'); // Only show scheduled events for guests

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->byDateRange($request->start_date, $request->end_date);
        }

        // Filter by month/year
        if ($request->has('month') && $request->has('year')) {
            $query->whereMonth('event_date', $request->month)
                  ->whereYear('event_date', $request->year);
        }

        // Filter by event type
        if ($request->has('event_type_id')) {
            $query->where('event_type_id', $request->event_type_id);
        }

        // Filter by city
        if ($request->has('city_id')) {
            $query->where('city_id', $request->city_id);
        }

        // Search
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhereHas('eventType', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('city', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('venue', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('observer', function ($q) use ($search) {
                      $q->where('code', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by event types
        if ($request->has('event_types') && !empty($request->event_types)) {
            $eventTypes = explode(',', $request->event_types);
            $query->whereHas('eventType', function ($q) use ($eventTypes) {
                $q->whereIn('name', $eventTypes);
            });
        }

        // Filter by cities
        if ($request->has('cities') && !empty($request->cities)) {
            $cities = explode(',', $request->cities);
            $query->whereHas('city', function ($q) use ($cities) {
                $q->whereIn('name', $cities);
            });
        }

        // Filter by observers
        if ($request->has('observers') && !empty($request->observers)) {
            $observers = explode(',', $request->observers);
            $query->whereHas('observer', function ($q) use ($observers) {
                $q->whereIn('code', $observers);
            });
        }

        // Filter by date range
        if ($request->has('date_from') && $request->has('date_to')) {
            $query->whereBetween('event_date', [$request->date_from, $request->date_to]);
        }

        // Apply sorting
        if ($request->has('sort_field') && $request->has('sort_direction')) {
            $sortField = $request->sort_field;
            $sortDirection = $request->sort_direction;

            switch ($sortField) {
                case 'date':
                    $query->orderBy('event_date', $sortDirection);
                    break;
                case 'time':
                    $query->orderBy('event_time', $sortDirection);
                    break;
                case 'event':
                    $query->orderBy('title', $sortDirection);
                    break;
                case 'eventType':
                    $query->join('event_types', 'events.event_type_id', '=', 'event_types.id')
                          ->orderBy('event_types.name', $sortDirection)
                          ->select('events.*');
                    break;
                case 'city':
                    $query->join('cities', 'events.city_id', '=', 'cities.id')
                          ->orderBy('cities.name', $sortDirection)
                          ->select('events.*');
                    break;
                case 'venue':
                    $query->join('venues', 'events.venue_id', '=', 'venues.id')
                          ->orderBy('venues.name', $sortDirection)
                          ->select('events.*');
                    break;
                case 'ob':
                    $query->join('observers', 'events.observer_id', '=', 'observers.id')
                          ->orderBy('observers.code', $sortDirection)
                          ->select('events.*');
                    break;
                case 'sng':
                    $query->join('sngs', 'events.sng_id', '=', 'sngs.id')
                          ->orderBy('sngs.code', $sortDirection)
                          ->select('events.*');
                    break;
                default:
                    $query->orderBy('event_date', 'desc')
                          ->orderBy('event_time', 'desc');
                    break;
            }
        } else {
            $query->orderBy('event_date', 'desc')
                  ->orderBy('event_time', 'desc');
        }

        // Get all events without pagination
        $events = $query->get();

        return response()->json([
            'success' => true,
            'data' => [
                'data' => EventResource::collection($events),
                'total' => $events->count()
            ]
        ]);
    }

    public function publicCalendar(Request $request): JsonResponse
    {
        $month = $request->get('month', date('m'));
        $year = $request->get('year', date('Y'));

        $events = Event::with(['eventType', 'city', 'venue'])
            ->where('status', 'scheduled') // Only scheduled events for guests
            ->whereMonth('event_date', $month)
            ->whereYear('event_date', $year)
            ->orderBy('event_date')
            ->orderBy('event_time')
            ->get();

        $calendarData = [];
        foreach ($events as $event) {
            $date = $event->event_date->format('Y-m-d');
            if (!isset($calendarData[$date])) {
                $calendarData[$date] = [];
            }
            $calendarData[$date][] = new EventResource($event);
        }

        return response()->json([
            'success' => true,
            'data' => $calendarData,
            'meta' => [
                'month' => $month,
                'year' => $year,
                'total_events' => $events->count()
            ]
        ]);
    }

    /**
     * Safely parse event date and time into Carbon instance
     */
    private function parseEventDateTime($eventDate, $eventTime)
    {
        try {
            // If eventDate already contains time (datetime format), extract date part
            if (strpos($eventDate, ' ') !== false) {
                $eventDate = Carbon::parse($eventDate)->format('Y-m-d');
            }

            // If eventTime contains date (datetime format), extract time part
            if (strpos($eventTime, ' ') !== false) {
                $eventTime = Carbon::parse($eventTime)->format('H:i:s');
            }

            // Safely combine date and time
            return Carbon::parse($eventDate . ' ' . $eventTime);

        } catch (\Exception $e) {
            // Fallback: try to parse each part separately
            try {
                $dateCarbon = Carbon::parse($eventDate);
                $timeCarbon = Carbon::parse($eventTime);

                return Carbon::create(
                    $dateCarbon->year,
                    $dateCarbon->month,
                    $dateCarbon->day,
                    $timeCarbon->hour,
                    $timeCarbon->minute,
                    $timeCarbon->second
                );
            } catch (\Exception $e2) {
                throw new \Exception("Could not parse event date/time: {$eventDate} / {$eventTime}. Error: {$e2->getMessage()}");
            }
        }
    }

    /**
     * Validate if SNG is available and can travel between events
     */
    private function validateSngConflict($sngId, $eventDate, $eventTime, $cityId, $currentEventId = null): array
    {
        try {
            // ✅ Safe parsing: Handle both date/time formats
            $eventDateTime = $this->parseEventDateTime($eventDate, $eventTime);

            // Get SNG's events on the same day (excluding current event if updating)
            // Extract date part safely in case eventDate contains datetime
            $dateOnly = strpos($eventDate, ' ') !== false ?
                Carbon::parse($eventDate)->format('Y-m-d') :
                $eventDate;

            $query = Event::where('sng_id', $sngId)
                ->whereDate('event_date', $dateOnly);

            if ($currentEventId) {
                $query->where('id', '!=', $currentEventId);
            }

            $sngEvents = $query->with(['city'])
                ->orderBy('event_time')
                ->get();

            if ($sngEvents->isEmpty()) {
                return [
                    'valid' => true,
                    'message' => 'SNG is available - no conflicts found'
                ];
            }

            // Check for direct time conflicts (same time)
            foreach ($sngEvents as $existingEvent) {
                $existingDateTime = $this->parseEventDateTime($existingEvent->event_date, $existingEvent->event_time);

                // Check if events are at exactly the same time
                if ($eventDateTime->equalTo($existingDateTime)) {
                    return [
                        'valid' => false,
                        'message' => sprintf(
                            'SNG conflict: SNG is already assigned to "%s" at the same time (%s)',
                            $existingEvent->title,
                            $eventDateTime->format('Y-m-d H:i')
                        ),
                        'details' => [
                            'conflict_event' => $existingEvent->title,
                            'conflict_city' => $existingEvent->city->name,
                            'conflict_time' => $existingDateTime->format('Y-m-d H:i'),
                            'error_type' => 'exact_time_conflict'
                        ]
                    ];
                }
            }

            // Check travel time conflicts - SNG needs time to move between cities
            foreach ($sngEvents as $existingEvent) {
                $existingDateTime = $this->parseEventDateTime($existingEvent->event_date, $existingEvent->event_time);
                $existingCityId = $existingEvent->city_id;

                // Skip if same city (no travel required)
                if ($existingCityId == $cityId) {
                    continue;
                }

                // Get travel time between cities
                $travelTime = CityDistance::where(function ($query) use ($existingCityId, $cityId) {
                    $query->where('from_city_id', $existingCityId)
                          ->where('to_city_id', $cityId);
                })->orWhere(function ($query) use ($existingCityId, $cityId) {
                    $query->where('from_city_id', $cityId)
                          ->where('to_city_id', $existingCityId);
                })->first();

                if (!$travelTime) {
                    // No travel time configured - issue warning but allow
                    continue;
                }

                $requiredTravelHours = $travelTime->travel_time_hours;

                // Check if new event is after existing event
                if ($eventDateTime->greaterThan($existingDateTime)) {
                    $timeBetween = $existingDateTime->diffInHours($eventDateTime, false);

                    if ($timeBetween < $requiredTravelHours) {
                        return [
                            'valid' => false,
                            'message' => sprintf(
                                'SNG travel conflict: SNG cannot travel from %s (%s) to %s in time. Required: %.1f hours, Available: %.1f hours',
                                $existingEvent->city->name,
                                $existingDateTime->format('H:i'),
                                City::find($cityId)->name,
                                $requiredTravelHours,
                                $timeBetween
                            ),
                            'details' => [
                                'previous_event' => $existingEvent->title,
                                'previous_city' => $existingEvent->city->name,
                                'previous_time' => $existingDateTime->format('Y-m-d H:i'),
                                'new_city' => City::find($cityId)->name,
                                'new_time' => $eventDateTime->format('Y-m-d H:i'),
                                'required_travel_hours' => $requiredTravelHours,
                                'available_hours' => round($timeBetween, 1),
                                'shortage_hours' => round($requiredTravelHours - $timeBetween, 1),
                                'error_type' => 'insufficient_travel_time_after'
                            ]
                        ];
                    }
                }

                // Check if new event is before existing event
                if ($eventDateTime->lessThan($existingDateTime)) {
                    $timeBetween = $eventDateTime->diffInHours($existingDateTime, false);

                    if ($timeBetween < $requiredTravelHours) {
                        return [
                            'valid' => false,
                            'message' => sprintf(
                                'SNG travel conflict: SNG cannot travel from %s (%s) to %s (%s) in time. Required: %.1f hours, Available: %.1f hours',
                                City::find($cityId)->name,
                                $eventDateTime->format('H:i'),
                                $existingEvent->city->name,
                                $existingDateTime->format('H:i'),
                                $requiredTravelHours,
                                $timeBetween
                            ),
                            'details' => [
                                'next_event' => $existingEvent->title,
                                'next_city' => $existingEvent->city->name,
                                'next_time' => $existingDateTime->format('Y-m-d H:i'),
                                'current_city' => City::find($cityId)->name,
                                'current_time' => $eventDateTime->format('Y-m-d H:i'),
                                'required_travel_hours' => $requiredTravelHours,
                                'available_hours' => round($timeBetween, 1),
                                'shortage_hours' => round($requiredTravelHours - $timeBetween, 1),
                                'error_type' => 'insufficient_travel_time_before'
                            ]
                        ];
                    }
                }
            }

            // All checks passed
            return [
                'valid' => true,
                'message' => 'SNG is available - no conflicts found'
            ];

        } catch (\Exception $e) {
            return [
                'valid' => false,
                'message' => 'Error validating SNG conflicts: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Validate if Observer (OB) is available and can travel between events
     */
    private function validateObserverConflict($observerId, $eventDate, $eventTime, $cityId, $currentEventId = null): array
    {
        try {
            // ✅ Safe parsing: Handle both date/time formats
            $eventDateTime = $this->parseEventDateTime($eventDate, $eventTime);

            // Get observer's events on the same day (excluding current event if updating)
            // Extract date part safely in case eventDate contains datetime
            $dateOnly = strpos($eventDate, ' ') !== false ?
                Carbon::parse($eventDate)->format('Y-m-d') :
                $eventDate;

            $query = Event::where('observer_id', $observerId)
                ->whereDate('event_date', $dateOnly);

            if ($currentEventId) {
                $query->where('id', '!=', $currentEventId);
            }

            $observerEvents = $query->with(['city'])
                ->orderBy('event_time')
                ->get();

            if ($observerEvents->isEmpty()) {
                return [
                    'valid' => true,
                    'message' => 'Observer is available - no conflicts found'
                ];
            }

            // Check for direct time conflicts (same time)
            foreach ($observerEvents as $existingEvent) {
                $existingDateTime = $this->parseEventDateTime($existingEvent->event_date, $existingEvent->event_time);

                // Check if events are at exactly the same time
                if ($eventDateTime->equalTo($existingDateTime)) {
                    return [
                        'valid' => false,
                        'message' => sprintf(
                            'Observer conflict: OB is already assigned to "%s" at the same time (%s)',
                            $existingEvent->title,
                            $eventDateTime->format('Y-m-d H:i')
                        ),
                        'details' => [
                            'conflict_event' => $existingEvent->title,
                            'conflict_city' => $existingEvent->city->name,
                            'conflict_time' => $existingDateTime->format('Y-m-d H:i'),
                            'error_type' => 'exact_time_conflict'
                        ]
                    ];
                }
            }

            // Check travel time conflicts - OB needs time to move between cities
            foreach ($observerEvents as $existingEvent) {
                $existingDateTime = $this->parseEventDateTime($existingEvent->event_date, $existingEvent->event_time);
                $existingCityId = $existingEvent->city_id;

                // Skip if same city (no travel required)
                if ($existingCityId == $cityId) {
                    continue;
                }

                // Get travel time between cities
                $travelTime = CityDistance::where(function ($query) use ($existingCityId, $cityId) {
                    $query->where('from_city_id', $existingCityId)
                          ->where('to_city_id', $cityId);
                })->orWhere(function ($query) use ($existingCityId, $cityId) {
                    $query->where('from_city_id', $cityId)
                          ->where('to_city_id', $existingCityId);
                })->first();

                if (!$travelTime) {
                    // No travel time configured - issue warning but allow
                    continue;
                }

                $requiredTravelHours = $travelTime->travel_time_hours;

                // Check if new event is after existing event
                if ($eventDateTime->greaterThan($existingDateTime)) {
                    $timeBetween = $existingDateTime->diffInHours($eventDateTime, false);

                    if ($timeBetween < $requiredTravelHours) {
                        return [
                            'valid' => false,
                            'message' => sprintf(
                                'Observer travel conflict: OB cannot travel from %s (%s) to %s in time. Required: %.1f hours, Available: %.1f hours',
                                $existingEvent->city->name,
                                $existingDateTime->format('H:i'),
                                City::find($cityId)->name,
                                $requiredTravelHours,
                                $timeBetween
                            ),
                            'details' => [
                                'previous_event' => $existingEvent->title,
                                'previous_city' => $existingEvent->city->name,
                                'previous_time' => $existingDateTime->format('Y-m-d H:i'),
                                'new_city' => City::find($cityId)->name,
                                'new_time' => $eventDateTime->format('Y-m-d H:i'),
                                'required_travel_hours' => $requiredTravelHours,
                                'available_hours' => round($timeBetween, 1),
                                'shortage_hours' => round($requiredTravelHours - $timeBetween, 1),
                                'error_type' => 'insufficient_travel_time_after'
                            ]
                        ];
                    }
                }

                // Check if new event is before existing event
                if ($eventDateTime->lessThan($existingDateTime)) {
                    $timeBetween = $eventDateTime->diffInHours($existingDateTime, false);

                    if ($timeBetween < $requiredTravelHours) {
                        return [
                            'valid' => false,
                            'message' => sprintf(
                                'Observer travel conflict: OB cannot travel from %s (%s) to %s (%s) in time. Required: %.1f hours, Available: %.1f hours',
                                City::find($cityId)->name,
                                $eventDateTime->format('H:i'),
                                $existingEvent->city->name,
                                $existingDateTime->format('H:i'),
                                $requiredTravelHours,
                                $timeBetween
                            ),
                            'details' => [
                                'next_event' => $existingEvent->title,
                                'next_city' => $existingEvent->city->name,
                                'next_time' => $existingDateTime->format('Y-m-d H:i'),
                                'current_city' => City::find($cityId)->name,
                                'current_time' => $eventDateTime->format('Y-m-d H:i'),
                                'required_travel_hours' => $requiredTravelHours,
                                'available_hours' => round($timeBetween, 1),
                                'shortage_hours' => round($requiredTravelHours - $timeBetween, 1),
                                'error_type' => 'insufficient_travel_time_before'
                            ]
                        ];
                    }
                }
            }

            // All checks passed
            return [
                'valid' => true,
                'message' => sprintf(
                    'Observer available - no conflicts found with %d existing events on this date',
                    $observerEvents->count()
                ),
                'details' => [
                    'existing_events_count' => $observerEvents->count(),
                    'checked_date' => $eventDate
                ]
            ];

        } catch (\Exception $e) {
            \Log::error('Observer conflict validation error: ' . $e->getMessage());

            return [
                'valid' => true,
                'message' => 'Observer validation failed, proceeding anyway',
                'details' => ['error' => $e->getMessage()]
            ];
        }
    }
}
