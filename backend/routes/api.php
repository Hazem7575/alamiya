<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CityController;
use App\Http\Controllers\Api\CityDistanceController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\EventTypeController;
use App\Http\Controllers\Api\VenueController;
use App\Http\Controllers\Api\ObserverController;
use App\Http\Controllers\Api\SngController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Authentication routes (public)
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:api');
    Route::post('refresh', [AuthController::class, 'refresh'])->middleware('auth:api');
    Route::get('me', [AuthController::class, 'me'])->middleware('auth:api');
});

// Protected routes
Route::middleware(['api', 'auth:api'])->group(function () {
    
    // Dashboard routes
    Route::get('dashboard', [DashboardController::class, 'index']);
    Route::get('dashboard/data', [DashboardController::class, 'getDashboardData']);
    Route::get('dashboard/calendar', [DashboardController::class, 'eventCalendar']);
    
    // Cities routes
    Route::apiResource('cities', CityController::class);
    Route::get('cities-missing-distances', [CityController::class, 'missingDistances']);
    
    // City distances routes
    Route::apiResource('city-distances', CityDistanceController::class);
    Route::get('distance-matrix', [CityDistanceController::class, 'matrix']);
    Route::post('city-distances/batch', [CityDistanceController::class, 'batchUpdate']);
    
    // Users routes
    Route::apiResource('users', UserController::class);
    Route::patch('users/{user}/status', [UserController::class, 'updateStatus']);
    Route::patch('users/{user}/permissions', [UserController::class, 'updatePermissions']);
    
    // Roles routes  
    Route::apiResource('roles', RoleController::class);
    Route::get('roles-all', [RoleController::class, 'all']);
    Route::get('permissions', [RoleController::class, 'permissions']);
    Route::get('permissions/by-category', [RoleController::class, 'permissionsByCategory']);
    
    // Event Types routes
    Route::apiResource('event-types', EventTypeController::class);
    
    // Venues routes
    Route::apiResource('venues', VenueController::class);
    
    // Observers routes
    Route::apiResource('observers', ObserverController::class);
    Route::patch('observers/{observer}/status', [ObserverController::class, 'updateStatus']);
    
    // SNGs routes
    Route::apiResource('sngs', SngController::class);
    
    // Events routes
    Route::apiResource('events', EventController::class);
    Route::get('calendar', [EventController::class, 'calendar']);
    Route::patch('events/{event}/status', [EventController::class, 'updateStatus']);
    
});

// Public routes for guests (no authentication required)
Route::prefix('guest')->group(function () {
    Route::get('events', [EventController::class, 'publicIndex']);
    Route::get('dashboard/data', [DashboardController::class, 'publicDashboardData']);
    Route::get('calendar', [EventController::class, 'publicCalendar']);
});

// Health check route
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now(),
        'version' => '1.0.0'
    ]);
});