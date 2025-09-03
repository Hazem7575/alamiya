<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ActivityLogController extends Controller
{
    /**
     * Get user's activity logs
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            
            $query = ActivityLog::with(['user'])
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc');

            // Apply filters if provided
            if ($request->has('action') && $request->action) {
                $query->where('action', $request->action);
            }

            if ($request->has('model_type') && $request->model_type) {
                $query->where('model_type', $request->model_type);
            }

            if ($request->has('date_from') && $request->date_from) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->has('date_to') && $request->date_to) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            if ($request->has('search') && $request->search) {
                $searchTerm = $request->search;
                $query->whereHas('user', function ($userQuery) use ($searchTerm) {
                    $userQuery->where('name', 'LIKE', "%{$searchTerm}%")
                             ->orWhere('email', 'LIKE', "%{$searchTerm}%");
                });
            }

            // Pagination
            $perPage = $request->get('per_page', 20);
            $activities = $query->paginate($perPage);

            // Transform the data for frontend
            $activities->getCollection()->transform(function ($activity) {
                return [
                    'id' => $activity->id,
                    'action' => $activity->action,
                    'model_type' => class_basename($activity->model_type),
                    'model_id' => $activity->model_id,
                    'description' => $activity->description,
                    'ip_address' => $activity->ip_address,
                    'user_agent' => $activity->user_agent,
                    'created_at' => $activity->created_at,
                    'user' => $activity->user ? [
                        'id' => $activity->user->id,
                        'name' => $activity->user->name,
                        'email' => $activity->user->email,
                    ] : null,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $activities,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch activity logs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all activity logs (admin only)
     */
    public function all(Request $request)
    {
        try {
            $user = Auth::user();
            
            // Check if user has permission to view all activities
            if (!$user->hasPermission('activity_logs.view_all')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to view all activity logs'
                ], 403);
            }

            $query = ActivityLog::with(['user'])
                ->orderBy('created_at', 'desc');

            // Apply filters if provided
            if ($request->has('user_id') && $request->user_id) {
                $query->where('user_id', $request->user_id);
            }

            if ($request->has('action') && $request->action) {
                $query->where('action', $request->action);
            }

            if ($request->has('model_type') && $request->model_type) {
                $query->where('model_type', $request->model_type);
            }

            if ($request->has('date_from') && $request->date_from) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->has('date_to') && $request->date_to) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            if ($request->has('search') && $request->search) {
                $searchTerm = $request->search;
                $query->whereHas('user', function ($userQuery) use ($searchTerm) {
                    $userQuery->where('name', 'LIKE', "%{$searchTerm}%")
                             ->orWhere('email', 'LIKE', "%{$searchTerm}%");
                });
            }

            // Pagination
            $perPage = $request->get('per_page', 20);
            $activities = $query->paginate($perPage);

            // Transform the data for frontend
            $activities->getCollection()->transform(function ($activity) {
                return [
                    'id' => $activity->id,
                    'action' => $activity->action,
                    'model_type' => class_basename($activity->model_type),
                    'model_id' => $activity->model_id,
                    'description' => $activity->description,
                    'ip_address' => $activity->ip_address,
                    'user_agent' => $activity->user_agent,
                    'created_at' => $activity->created_at,
                    'user' => $activity->user ? [
                        'id' => $activity->user->id,
                        'name' => $activity->user->name,
                        'email' => $activity->user->email,
                    ] : null,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $activities,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch activity logs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get activity statistics
     */
    public function stats(Request $request)
    {
        try {
            $user = Auth::user();
            
            $query = ActivityLog::where('user_id', $user->id);

            // Apply date filter if provided
            if ($request->has('date_from') && $request->date_from) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->has('date_to') && $request->date_to) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            $stats = [
                'total_activities' => $query->count(),
                'activities_by_action' => $query->selectRaw('action, COUNT(*) as count')
                    ->groupBy('action')
                    ->pluck('count', 'action'),
                'activities_by_model' => $query->selectRaw('model_type, COUNT(*) as count')
                    ->groupBy('model_type')
                    ->pluck('count', 'model_type')
                    ->mapWithKeys(function ($count, $modelType) {
                        return [class_basename($modelType) => $count];
                    }),
                'recent_activity_count' => ActivityLog::where('user_id', $user->id)
                    ->where('created_at', '>=', now()->subDays(7))
                    ->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch activity statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }


}
