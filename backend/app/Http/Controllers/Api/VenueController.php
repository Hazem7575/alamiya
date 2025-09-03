<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Venue;
use App\Http\Resources\VenueResource;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class VenueController extends Controller
{
    use LogsActivity;
    public function index(Request $request): JsonResponse
    {
        $query = Venue::with('city');

        if ($request->has('city_id')) {
            $query->where('city_id', $request->city_id);
        }

        if ($request->has('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%");
            });
        }

        $venues = $query->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => VenueResource::collection($venues)
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'city_id' => 'required|exists:cities,id',
            'address' => 'nullable|string',
            'capacity' => 'nullable|integer|min:1',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'facilities' => 'nullable|array',
            'contact_info' => 'nullable|array',
            'image' => 'nullable|string'
        ]);

        $venue = Venue::create($validated);
        $venue->load('city');

        return response()->json([
            'success' => true,
            'message' => 'Venue created successfully',
            'data' => new VenueResource($venue)
        ], 201);
    }

    public function show(Venue $venue): JsonResponse
    {
        $venue->load('city');

        return response()->json([
            'success' => true,
            'data' => new VenueResource($venue)
        ]);
    }

    public function update(Request $request, Venue $venue): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'city_id' => 'sometimes|exists:cities,id',
            'address' => 'nullable|string',
            'capacity' => 'nullable|integer|min:1',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'facilities' => 'nullable|array',
            'contact_info' => 'nullable|array',
            'is_active' => 'sometimes|boolean',
            'image' => 'nullable|string'
        ]);

        $venue->update($validated);
        $venue->load('city');

        return response()->json([
            'success' => true,
            'message' => 'Venue updated successfully',
            'data' => new VenueResource($venue)
        ]);
    }

    public function destroy(Venue $venue): JsonResponse
    {
        if ($venue->events()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete venue with existing events'
            ], 422);
        }

        $venue->delete();

        return response()->json([
            'success' => true,
            'message' => 'Venue deleted successfully'
        ]);
    }
}