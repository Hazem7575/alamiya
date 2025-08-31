<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\User;
use App\Models\City;
use App\Models\EventType;
use App\Models\Venue;
use App\Models\Observer;
use App\Models\Sng;
use App\Models\ActivityLog;
use App\Http\Resources\EventTypeResource;
use App\Http\Resources\ObserverResource;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();
        $nextMonth = Carbon::now()->addMonth()->startOfMonth();

        // Basic stats
        $stats = [
            'total_events' => Event::count(),
            'upcoming_events' => Event::upcoming()->count(),
            'events_today' => Event::whereDate('event_date', $today)->count(),
            'events_this_month' => Event::whereBetween('event_date', [$thisMonth, $nextMonth])->count(),
            'total_cities' => City::where('is_active', true)->count(),
            'total_venues' => Venue::where('is_active', true)->count(),
            'total_observers' => Observer::where('status', '!=', 'inactive')->count(),
            'total_users' => User::where('status', 'active')->count(),
        ];

        // Events by status
        $eventsByStatus = Event::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');

        // Events by type
        $eventsByType = Event::join('event_types', 'events.event_type_id', '=', 'event_types.id')
            ->selectRaw('event_types.name, event_types.color, COUNT(*) as count')
            ->groupBy('event_types.id', 'event_types.name', 'event_types.color')
            ->get();

        // Upcoming events (next 7 days)
        $upcomingEvents = Event::with(['eventType', 'city', 'venue', 'observer'])
            ->whereBetween('event_date', [$today, $today->copy()->addDays(7)])
            ->orderBy('event_date')
            ->orderBy('event_time')
            ->limit(10)
            ->get();

        // Events by city
        $eventsByCity = Event::join('cities', 'events.city_id', '=', 'cities.id')
            ->selectRaw('cities.name, COUNT(*) as count')
            ->groupBy('cities.id', 'cities.name')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        // Monthly events trend (last 6 months)
        $monthlyTrend = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $count = Event::whereMonth('event_date', $date->month)
                          ->whereYear('event_date', $date->year)
                          ->count();
            $monthlyTrend[] = [
                'month' => $date->format('M Y'),
                'count' => $count
            ];
        }

        // Recent activity
        $recentActivity = ActivityLog::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Observer workload
        $observerWorkload = Observer::withCount(['events' => function($query) {
                $query->where('event_date', '>=', Carbon::today());
            }])
            ->where('status', '!=', 'inactive')
            ->orderBy('events_count', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
                'events_by_status' => $eventsByStatus,
                'events_by_type' => $eventsByType,
                'upcoming_events' => $upcomingEvents,
                'events_by_city' => $eventsByCity,
                'monthly_trend' => $monthlyTrend,
                'recent_activity' => $recentActivity,
                'observer_workload' => $observerWorkload,
            ]
        ]);
    }

    public function getDashboardData(): JsonResponse
    {
        $eventTypes = EventType::orderBy('name')->get();
        $cities = City::orderBy('name')->get();
        $venues = Venue::with('city')->orderBy('name')->get();
        $observers = Observer::orderBy('code')->get();
        $sngs = Sng::orderBy('code')->get();

        return response()->json([
            'success' => true,
            'data' => [
                'eventTypes' => EventTypeResource::collection($eventTypes),
                'cities' => $cities->map(function($city) {
                    return [
                        'id' => $city->id,
                        'name' => $city->name,
                        'created_at' => $city->created_at,
                        'updated_at' => $city->updated_at,
                    ];
                }),
                'venues' => $venues->map(function($venue) {
                    return [
                        'id' => $venue->id,
                        'name' => $venue->name,
                        'city' => $venue->city ? $venue->city->name : null,
                        'created_at' => $venue->created_at,
                        'updated_at' => $venue->updated_at,
                    ];
                }),
                'observers' => ObserverResource::collection($observers),
                'sngs' => $sngs->map(function($sng) {
                    return [
                        'id' => $sng->id,
                        'name' => $sng->code,
                        'created_at' => $sng->created_at,
                        'updated_at' => $sng->updated_at,
                    ];
                }),
            ]
        ]);
    }

    public function eventCalendar(): JsonResponse
    {
        $events = Event::with(['eventType', 'city', 'venue'])
            ->where('event_date', '>=', Carbon::today())
            ->where('event_date', '<=', Carbon::today()->addDays(30))
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'start' => $event->event_date->format('Y-m-d') . 'T' . $event->event_time->format('H:i:s'),
                    'backgroundColor' => $event->eventType->color,
                    'borderColor' => $event->eventType->color,
                    'textColor' => '#ffffff',
                    'extendedProps' => [
                        'event_type' => $event->eventType->name,
                        'city' => $event->city->name,
                        'venue' => $event->venue->name,
                        'status' => $event->status
                    ]
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $events
        ]);
    }

    // Public method for guest access to dashboard data
    public function publicDashboardData(): JsonResponse
    {
        $eventTypes = EventType::orderBy('name')->get();
        $cities = City::orderBy('name')->get();
        $venues = Venue::with('city')->orderBy('name')->get();
        $observers = Observer::orderBy('code')->get();
        $sngs = Sng::orderBy('code')->get();

        return response()->json([
            'success' => true,
            'data' => [
                'eventTypes' => EventTypeResource::collection($eventTypes),
                'cities' => $cities->map(function($city) {
                    return [
                        'id' => $city->id,
                        'name' => $city->name,
                        'created_at' => $city->created_at,
                        'updated_at' => $city->updated_at,
                    ];
                }),
                'venues' => $venues->map(function($venue) {
                    return [
                        'id' => $venue->id,
                        'name' => $venue->name,
                        'city' => $venue->city ? $venue->city->name : null,
                        'created_at' => $venue->created_at,
                        'updated_at' => $venue->updated_at,
                    ];
                }),
                'observers' => ObserverResource::collection($observers),
                'sngs' => $sngs->map(function($sng) {
                    return [
                        'id' => $sng->id,
                        'name' => $sng->code,
                        'created_at' => $sng->created_at,
                        'updated_at' => $sng->updated_at,
                    ];
                }),
            ]
        ]);
    }
}