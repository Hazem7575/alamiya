<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class ActivityLoggingMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Only log for authenticated users and API routes
        if (Auth::check() && $request->is('api/*')) {
            $this->logActivity($request, $response);
        }

        return $response;
    }

    /**
     * Log the activity
     */
    private function logActivity(Request $request, $response)
    {
        try {
            $method = $request->method();
            $path = $request->path();
            $user = Auth::user();

            // Skip logging for certain routes
            if ($this->shouldSkipLogging($path, $method)) {
                return;
            }

            // Determine action based on HTTP method and path
            $action = $this->determineAction($method, $path);
            
            // Extract model information from path
            $modelInfo = $this->extractModelInfo($path);

            // Get request data (excluding sensitive information)
            $requestData = $this->getCleanRequestData($request);

            // Only log if we have meaningful activity
            if ($action && $modelInfo['model_type']) {
                // Create a mock model for description generation
                $modelClass = $modelInfo['model_type'];
                $model = null;
                
                if ($modelInfo['model_id'] && class_exists($modelClass)) {
                    try {
                        $model = $modelClass::find($modelInfo['model_id']);
                    } catch (\Exception $e) {
                        // Model might not exist yet for create operations
                    }
                }
                
                $description = ActivityLog::generateDescription($action, $model);
                
                ActivityLog::create([
                    'user_id' => $user->id,
                    'action' => $action,
                    'model_type' => $modelInfo['model_type'],
                    'model_id' => $modelInfo['model_id'],
                    'description' => $description,
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);
            }

        } catch (\Exception $e) {
            // Don't let logging errors break the application
            \Log::error('Activity logging failed: ' . $e->getMessage());
        }
    }

    /**
     * Determine if we should skip logging for this request
     */
    private function shouldSkipLogging(string $path, string $method): bool
    {
        $skipPaths = [
            'api/auth/me',
            'api/auth/refresh',
            'api/activity-logs',
            'api/dashboard',
            'api/health',
        ];

        foreach ($skipPaths as $skipPath) {
            if (Str::contains($path, $skipPath)) {
                return true;
            }
        }

        // Skip GET requests for listing (but allow specific item GET)
        if ($method === 'GET' && !preg_match('/\/\d+$/', $path)) {
            return true;
        }

        // Skip CRUD operations as they are handled by Model Observers
        $crudPaths = [
            'api/events',
            'api/users', 
            'api/roles',
            'api/cities',
            'api/venues',
            'api/observers',
            'api/event-types',
            'api/sngs',
            'api/city-distances'
        ];

        foreach ($crudPaths as $crudPath) {
            if (Str::contains($path, $crudPath) && in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'])) {
                return true;
            }
        }

        return false;
    }

    /**
     * Determine action based on HTTP method and path
     */
    private function determineAction(string $method, string $path): ?string
    {
        switch ($method) {
            case 'POST':
                return 'created';
            case 'PUT':
            case 'PATCH':
                return 'updated';
            case 'DELETE':
                return 'deleted';
            case 'GET':
                // Only log GET for specific items
                if (preg_match('/\/\d+$/', $path)) {
                    return 'viewed';
                }
                return null;
            default:
                return null;
        }
    }

    /**
     * Extract model information from the request path
     */
    private function extractModelInfo(string $path): array
    {
        $modelMap = [
            'events' => 'App\Models\Event',
            'users' => 'App\Models\User',
            'roles' => 'App\Models\Role',
            'cities' => 'App\Models\City',
            'venues' => 'App\Models\Venue',
            'observers' => 'App\Models\Observer',
            'event-types' => 'App\Models\EventType',
            'sngs' => 'App\Models\Sng',
            'city-distances' => 'App\Models\CityDistance',
        ];

        $modelId = null;
        $modelType = null;

        // Extract model ID if present
        if (preg_match('/\/(\d+)(?:\/|$)/', $path, $matches)) {
            $modelId = (int) $matches[1];
        }

        // Determine model type from path
        foreach ($modelMap as $pathSegment => $model) {
            if (Str::contains($path, "api/{$pathSegment}")) {
                $modelType = $model;
                break;
            }
        }

        return [
            'model_type' => $modelType,
            'model_id' => $modelId,
        ];
    }

    /**
     * Get clean request data (excluding sensitive information)
     */
    private function getCleanRequestData(Request $request): array
    {
        $data = $request->all();

        // Remove sensitive fields
        $sensitiveFields = [
            'password',
            'password_confirmation',
            'current_password',
            'new_password',
            'token',
            'api_key',
        ];

        foreach ($sensitiveFields as $field) {
            unset($data[$field]);
        }

        // Limit data size to prevent huge logs
        $jsonData = json_encode($data);
        if (strlen($jsonData) > 5000) {
            return ['data' => 'Data too large to log'];
        }

        return $data;
    }
}
