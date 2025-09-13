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
use App\Models\Generator;
use App\Events\EventUpdated;
use App\Events\EventDeleted;

use App\Http\Resources\EventResource;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class EventController extends Controller
{
    use LogsActivity;
    public function index(Request $request): JsonResponse
    {
        $query = Event::with(['eventType', 'city', 'venue', 'observers', 'sngs', 'generators', 'creator']);
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
                $q->where('title', 'like', "%{$search}%");
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
            $query->whereHas('observers', function ($q) use ($observers) {
                $q->whereIn('code', $observers);
            });
        }

        // Filter by SNGs
        if ($request->has('sngs') && !empty($request->sngs)) {
            $sngs = explode(',', $request->sngs);
            $query->whereHas('sngs', function ($q) use ($sngs) {
                $q->whereIn('code', $sngs);
            });
        }

        // Filter by Generators
        if ($request->has('generators') && !empty($request->generators)) {
            $generators = explode(',', $request->generators);
            $query->whereHas('generators', function ($q) use ($generators) {
                $q->whereIn('code', $generators);
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
                    $query->orderBy('event_date', $sortDirection)->orderBy('event_time', $sortDirection);
                    break;
                case 'datetime':
                    // Sort by date first (priority), then by time
                    $query->orderBy('event_date', $sortDirection)->orderBy('event_time', $sortDirection);
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
                    // Use subquery to avoid breaking eager loading with joins
                    $query->orderByRaw("(
                        SELECT observers.code
                        FROM observers
                        INNER JOIN event_observers ON observers.id = event_observers.observer_id
                        WHERE event_observers.event_id = events.id
                        LIMIT 1
                    ) $sortDirection");
                    break;
                case 'sng':
                    // Use subquery to avoid breaking eager loading with joins
                    $query->orderByRaw("(
                        SELECT sngs.code
                        FROM sngs
                        INNER JOIN event_sngs ON sngs.id = event_sngs.sng_id
                        WHERE event_sngs.event_id = events.id
                        LIMIT 1
                    ) $sortDirection");
                    break;
                case 'generator':
                    // Use subquery to avoid breaking eager loading with joins
                    $query->orderByRaw("(
                        SELECT generators.code
                        FROM generators
                        INNER JOIN event_generators ON generators.id = event_generators.generator_id
                        WHERE event_generators.event_id = events.id
                        LIMIT 1
                    ) $sortDirection");
                    break;
                default:
                    $query->orderBy('event_date', 'desc')
                          ->orderBy('event_time', 'desc');
                    break;
            }
        } else {
            // Default sorting: Date and Time descending (newest first)
            $query->orderBy('event_date', 'desc')
                  ->orderBy('event_time', 'desc');
        }

        $events = $query->with(['eventType', 'city', 'venue', 'observers', 'sngs', 'generators', 'creator'])->paginate($perPage);

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
                'event_time' => 'nullable|date_format:H:i',

                // Support both new and legacy formats
                'event_type' => 'nullable|string',
                'event_type_id' => 'nullable|integer|exists:event_types,id',
                'city' => 'nullable|string',
                'city_id' => 'nullable|integer|exists:cities,id',
                'venue' => 'nullable|string',
                'venue_id' => 'nullable|integer|exists:venues,id',

                // New multi-select format
                'observers' => 'nullable|array',
                'observers.*' => 'string',
                'sngs' => 'nullable|array',
                'sngs.*' => 'string',
                'generators' => 'nullable|array',
                'generators.*' => 'string',

                // Legacy single-select format (for backward compatibility)
                'observer_id' => 'nullable|integer|exists:observers,id',
                'sng_id' => 'nullable|integer|exists:sngs,id',
                'generator_id' => 'nullable|integer|exists:generators,id',

                'description' => 'nullable|string',
                'teams' => 'nullable|array',
                'metadata' => 'nullable|array'
            ]);

            // Find or create event type (support both formats)
            $eventType = null;
            if (isset($validated['event_type_id'])) {
                $eventType = EventType::find($validated['event_type_id']);
            } else if (isset($validated['event_type'])) {
                $eventType = EventType::firstOrCreate(['name' => $validated['event_type']], [
                    'code' => strtoupper(substr($validated['event_type'], 0, 3)),
                    'color' => '#' . substr(md5($validated['event_type']), 0, 6)
                ]);
            }

            // Find or create city (support both formats)
            $city = null;
            if (isset($validated['city_id'])) {
                $city = City::find($validated['city_id']);
            } else if (!empty($validated['city'])) {
                $city = City::firstOrCreate(['name' => $validated['city']]);
            }

            // Find or create venue (optional)
            $venue = null;
            if (!empty($validated['venue']) && $city) {
                $venue = Venue::firstOrCreate(
                    ['name' => $validated['venue']],
                    ['city_id' => $city->id]
                );
            }

            // Handle observers - support both formats
            $observers = [];
            if (isset($validated['observer_id'])) {
                // Legacy single ID format
                $observer = Observer::find($validated['observer_id']);
                if ($observer) {
                    $observers[] = $observer;
                }
            } elseif (!empty($validated['observers'])) {
                // New multi-select format
                foreach ($validated['observers'] as $observerCode) {
                    $observers[] = Observer::firstOrCreate(['code' => $observerCode]);
                }
            }

            // Handle SNGs - support both formats
            $sngs = [];
            if (isset($validated['sng_id'])) {
                // Legacy single ID format
                $sng = Sng::find($validated['sng_id']);
                if ($sng) {
                    $sngs[] = $sng;
                }
            } elseif (!empty($validated['sngs'])) {
                // New multi-select format
                foreach ($validated['sngs'] as $sngCode) {
                    $sngs[] = Sng::firstOrCreate(['code' => $sngCode]);
                }
            }

            // Handle Generators - support both formats
            $generators = [];
            if (isset($validated['generator_id'])) {
                // Legacy single ID format
                $generator = Generator::find($validated['generator_id']);
                if ($generator) {
                    $generators[] = $generator;
                }
            } elseif (!empty($validated['generators'])) {
                // New multi-select format
                foreach ($validated['generators'] as $generatorCode) {
                    $generators[] = Generator::firstOrCreate(['code' => $generatorCode]);
                }
            }

            // Check conflicts for all observers
            if (!empty($observers) && $city) {
                foreach ($observers as $observer) {
                    $obConflictValidation = $this->validateObserverConflict(
                        $observer->id,
                        $validated['event_date'],
                        $validated['event_time'] ?? '00:00',
                        $city->id
                    );

                    if (!$obConflictValidation['valid']) {
                        $response = [
                            'success' => false,
                            'message' => "Observer {$observer->code}: " . $obConflictValidation['message'],
                            'error_type' => 'observer_conflict'
                        ];

                        if (isset($obConflictValidation['details'])) {
                            $response['details'] = $obConflictValidation['details'];
                        }

                        return response()->json($response, 422);
                    }
                }
            }

            // Check conflicts for all SNGs
            if (!empty($sngs) && $city) {
                foreach ($sngs as $sng) {
                    $sngConflictValidation = $this->validateSngConflict(
                        $sng->id,
                        $validated['event_date'],
                        $validated['event_time'] ?? '00:00',
                        $city->id
                    );

                    if (!$sngConflictValidation['valid']) {
                        $response = [
                            'success' => false,
                            'message' => "SNG {$sng->code}: " . $sngConflictValidation['message'],
                            'error_type' => 'sng_conflict'
                        ];

                        if (isset($sngConflictValidation['details'])) {
                            $response['details'] = $sngConflictValidation['details'];
                        }

                        return response()->json($response, 422);
                    }
                }
            }

            // Create event
            $event = Event::create([
                'title' => $validated['title'],
                'description' => $validated['description'] ?? '',
                'event_date' => $validated['event_date'],
                'event_time' => $validated['event_time'] ?? '00:00',
                'event_type_id' => $eventType ? $eventType->id : null,
                'city_id' => $city?->id,
                'venue_id' => $venue?->id,
                'created_by' => auth()->id(),
                'teams' => $validated['teams'] ?? [],
                'metadata' => $validated['metadata'] ?? []
            ]);

            // Attach the many-to-many relationships
            if (!empty($observers)) {
                $observerIds = collect($observers)->pluck('id')->toArray();
                $event->observers()->attach($observerIds);
            }

            if (!empty($sngs)) {
                $sngIds = collect($sngs)->pluck('id')->toArray();
                $event->sngs()->attach($sngIds);
            }

            if (!empty($generators)) {
                $generatorIds = collect($generators)->pluck('id')->toArray();
                $event->generators()->attach($generatorIds);
            }

            $event->load(['eventType', 'city', 'venue', 'observers', 'sngs', 'generators', 'creator']);
            // Activity logging is handled automatically by ModelActivityObserver

            // Broadcast creation event from Controller for reliability
            broadcast(new EventUpdated($event, 'created'))->toOthers();

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
        $event->load(['eventType', 'city', 'venue', 'observers', 'sngs', 'generators', 'creator']);

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
            'observer_ids' => 'sometimes|nullable|array',
            'observer_ids.*' => 'exists:observers,id',
            'sng_ids' => 'sometimes|nullable|array',
            'sng_ids.*' => 'exists:sngs,id',
            'generator_ids' => 'sometimes|nullable|array',
            'generator_ids.*' => 'exists:generators,id',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:scheduled,ongoing,completed,cancelled,postponed',
            'teams' => 'nullable|array',
            'metadata' => 'nullable|array'
        ]);

        if (isset($validated['city_id']) && $validated['city_id'] != $event->city_id) {
            $currentObserverIds = $event->observers()->pluck('observers.id')->toArray();
            $observerIds = $validated['observer_ids'] ?? $currentObserverIds;

            $travelTimeValidation = $this->validateTravelTime(
                $event->city_id,
                $validated['city_id'],
                $validated['event_date'] ?? $event->event_date,
                $validated['event_time'] ?? $event->event_time,
                !empty($observerIds) ? $observerIds[0] : null,
                $event->id,
                !empty($validated['sng_ids']) ? $validated['sng_ids'][0] : null
            );

            if (!$travelTimeValidation['valid']) {
                $response = [
                    'success' => false,
                    'message' => $travelTimeValidation['message'],
                    'error_type' => 'travel_time_insufficient'
                ];

                if (isset($travelTimeValidation['details'])) {
                    $response['details'] = $travelTimeValidation['details'];
                }

                return response()->json($response, 422);
            }
        }

        if (isset($validated['observer_ids']) || isset($validated['event_time']) || isset($validated['event_date'])) {
            $currentObserverIds = $event->observers()->pluck('observers.id')->toArray();
            $observerIds = $validated['observer_ids'] ?? $currentObserverIds;

            if (!empty($observerIds)) {
                foreach ($observerIds as $observerId) {
                    $obConflictValidation = $this->validateObserverConflict(
                        $observerId,
                        $validated['event_date'] ?? $event->event_date,
                        $validated['event_time'] ?? $event->event_time,
                        $validated['city_id'] ?? $event->city_id,
                        $event->id
                    );

                    if (!$obConflictValidation['valid']) {
                        $response = [
                            'success' => false,
                            'message' => $obConflictValidation['message'],
                            'error_type' => 'observer_conflict'
                        ];

                        if (isset($obConflictValidation['details'])) {
                            $response['details'] = $obConflictValidation['details'];
                        }

                        return response()->json($response, 422);
                    }
                }
            }
        }

        // Check SNG conflicts even if city didn't change (in case sng or time changed)
        if (isset($validated['sng_ids']) || isset($validated['event_time']) || isset($validated['event_date'])) {
            $currentSngIds = $event->sngs()->pluck('sngs.id')->toArray();
            $sngIds = $validated['sng_ids'] ?? $currentSngIds;

            if (!empty($sngIds)) {
                foreach ($sngIds as $sngId) {
                    $sngConflictValidation = $this->validateSngConflict(
                        $sngId,
                        $validated['event_date'] ?? $event->event_date,
                        $validated['event_time'] ?? $event->event_time,
                        $validated['city_id'] ?? $event->city_id,
                        $event->id
                    );

                    if (!$sngConflictValidation['valid']) {
                        $response = [
                            'success' => false,
                            'message' => $sngConflictValidation['message'],
                            'error_type' => 'sng_conflict'
                        ];

                        if (isset($sngConflictValidation['details'])) {
                            $response['details'] = $sngConflictValidation['details'];
                        }

                        return response()->json($response, 422);
                    }
                }
            }
        }

        // Update basic event data (excluding relationship fields)
        $updateData = collect($validated)->except(['observer_ids', 'sng_ids', 'generator_ids'])->toArray();
        $event->update($updateData);

        if (isset($validated['observer_ids'])) {
            $event->observers()->sync($validated['observer_ids'] ?? []);
        }

        if (isset($validated['sng_ids'])) {
            $event->sngs()->sync($validated['sng_ids'] ?? []);
        }

        if (isset($validated['generator_ids'])) {
            $event->generators()->sync($validated['generator_ids'] ?? []);
        }


        $event->load(['eventType', 'city', 'venue', 'observers', 'sngs', 'generators', 'creator']);

        // Broadcast update event
        broadcast(new EventUpdated($event, 'updated'))->toOthers();

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
        // Load relationships before deletion to ensure data is available for broadcasting
        $eventWithRelations = $event->load(['eventType', 'city', 'venue', 'observers', 'sngs', 'generators']);

        // Convert to array to avoid model serialization issues
        $eventData = $eventWithRelations->toArray();

        // Activity logging is handled automatically by ModelActivityObserver
        $event->delete();

        // Broadcast deletion event using array data (no model serialization)
        broadcast(new EventDeleted($eventData))->toOthers();

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

        // Log status change using the trait method
        $this->logStatusChange($event, $oldStatus, $validated['status']);

        return response()->json([
            'success' => true,
            'message' => 'Event status updated successfully',
            'data' => new EventResource($event)
        ]);
    }

    // Public methods for guest access
    public function publicIndex(Request $request): JsonResponse
    {
        $query = Event::with(['eventType', 'city', 'venue', 'observers', 'sngs', 'generators'])
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
                $q->where('title', 'like', "%{$search}%");
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
            $query->whereHas('observers', function ($q) use ($observers) {
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
                case 'datetime':
                    // Sort by date first (priority), then by time
                    $query->orderBy('event_date', $sortDirection)->orderBy('event_time', $sortDirection);
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
                    // Use subquery to avoid breaking eager loading with joins
                    $query->orderByRaw("(
                        SELECT observers.code
                        FROM observers
                        INNER JOIN event_observers ON observers.id = event_observers.observer_id
                        WHERE event_observers.event_id = events.id
                        LIMIT 1
                    ) $sortDirection");
                    break;
                case 'sng':
                    // Use subquery to avoid breaking eager loading with joins
                    $query->orderByRaw("(
                        SELECT sngs.code
                        FROM sngs
                        INNER JOIN event_sngs ON sngs.id = event_sngs.sng_id
                        WHERE event_sngs.event_id = events.id
                        LIMIT 1
                    ) $sortDirection");
                    break;
                case 'generator':
                    // Use subquery to avoid breaking eager loading with joins
                    $query->orderByRaw("(
                        SELECT generators.code
                        FROM generators
                        INNER JOIN event_generators ON generators.id = event_generators.generator_id
                        WHERE event_generators.event_id = events.id
                        LIMIT 1
                    ) $sortDirection");
                    break;
                default:
                    $query->orderBy('event_date', 'desc')
                          ->orderBy('event_time', 'desc');
                    break;
            }
        } else {
            // Default sorting: Date and Time descending (newest first)
            $query->orderBy('event_date', 'asc')
                  ->orderBy('event_time', 'asc');
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
            ->orderBy('event_date'  , 'asc')
            ->orderBy('event_time', 'asc')
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

            $query = Event::whereHas('sngs', function($q) use ($sngId) {
                    $q->where('sngs.id', $sngId);
                })
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

            $query = Event::whereHas('observers', function($q) use ($observerId) {
                    $q->where('observers.id', $observerId);
                })
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

            // ✅ FIRST CHECK: Observer can only have ONE event per day (daily limit)
            if ($observerEvents->count() > 0) {
                $existingEvent = $observerEvents->first();
                return [
                    'valid' => false,
                    'message' => sprintf(
                        'Observer daily limit: OB is already assigned to "%s" on this date (%s). Each observer can only have one event per day.',
                        $existingEvent->title,
                        Carbon::parse($dateOnly)->format('Y-m-d')
                    ),
                    'details' => [
                        'conflict_event' => $existingEvent->title,
                        'conflict_city' => $existingEvent->city ? $existingEvent->city->name : 'Unknown',
                        'conflict_date' => Carbon::parse($dateOnly)->format('Y-m-d'),
                        'existing_events_count' => $observerEvents->count(),
                        'error_type' => 'daily_observer_limit'
                    ]
                ];
            }

            // ✅ SECOND CHECK: Direct time conflicts (same time) - This code won't be reached due to daily limit
            foreach ($observerEvents as $existingEvent) {
                $existingDateTime = $this->parseEventDateTime($existingEvent->event_date, $existingEvent->event_time);

                // Check if events are at exactly the same time
                if ($eventDateTime->equalTo($existingDateTime)) {
                    return [
                        'valid' => false,
                        'message' => sprintf(
                            'Ob conflict: OB is already assigned to "%s" at the same time (%s)',
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
                                'Ob travel conflict: OB cannot travel from %s (%s) to %s in time. Required: %.1f hours, Available: %.1f hours',
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
                                'Ob travel conflict: OB cannot travel from %s (%s) to %s (%s) in time. Required: %.1f hours, Available: %.1f hours',
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
                    'Ob available - no conflicts found with %d existing events on this date',
                    $observerEvents->count()
                ),
                'details' => [
                    'existing_events_count' => $observerEvents->count(),
                    'checked_date' => $eventDate
                ]
            ];

        } catch (\Exception $e) {
            \Log::error('Ob conflict validation error: ' . $e->getMessage());

            return [
                'valid' => true,
                'message' => 'Ob validation failed, proceeding anyway',
                'details' => ['error' => $e->getMessage()]
            ];
        }
    }
}
