<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CityDistance;
use App\Models\City;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CityDistanceController extends Controller
{
    use LogsActivity;
    /**
     * Display a listing of city distances
     */
    public function index(Request $request): JsonResponse
    {
        $query = CityDistance::with(['fromCity', 'toCity']);

        // Filter by cities
        if ($request->has('from_city_id')) {
            $query->where('from_city_id', $request->from_city_id);
        }

        if ($request->has('to_city_id')) {
            $query->where('to_city_id', $request->to_city_id);
        }

        $distances = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $distances
        ]);
    }

    /**
     * Store a new city distance
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from_city_id' => 'required|exists:cities,id',
            'to_city_id' => 'required|exists:cities,id|different:from_city_id',
            'travel_time_hours' => 'required|numeric|min:0|max:999.99',
            'notes' => 'nullable|string|max:1000'
        ]);

        // Check if distance already exists (in either direction)
        $existing = CityDistance::where(function ($query) use ($validated) {
            $query->where('from_city_id', $validated['from_city_id'])
                  ->where('to_city_id', $validated['to_city_id']);
        })->orWhere(function ($query) use ($validated) {
            $query->where('from_city_id', $validated['to_city_id'])
                  ->where('to_city_id', $validated['from_city_id']);
        })->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Distance between these cities already exists'
            ], 409);
        }

        $distance = CityDistance::create($validated);
        $distance->load(['fromCity', 'toCity']);

        return response()->json([
            'success' => true,
            'message' => 'Distance created successfully',
            'data' => $distance
        ], 201);
    }

    /**
     * Display the specified distance
     */
    public function show(CityDistance $cityDistance): JsonResponse
    {
        $cityDistance->load(['fromCity', 'toCity']);

        return response()->json([
            'success' => true,
            'data' => $cityDistance
        ]);
    }

    /**
     * Update the specified distance
     */
    public function update(Request $request, CityDistance $cityDistance): JsonResponse
    {
        $validated = $request->validate([
            'travel_time_hours' => 'sometimes|numeric|min:0|max:999.99',
            'notes' => 'nullable|string|max:1000'
        ]);

        $cityDistance->update($validated);
        $cityDistance->load(['fromCity', 'toCity']);

        return response()->json([
            'success' => true,
            'message' => 'Distance updated successfully',
            'data' => $cityDistance
        ]);
    }

    /**
     * Remove the specified distance
     */
    public function destroy(CityDistance $cityDistance): JsonResponse
    {
        $cityDistance->delete();

        return response()->json([
            'success' => true,
            'message' => 'Distance deleted successfully'
        ]);
    }

    /**
     * Get distance matrix for all cities
     */
    public function matrix(): JsonResponse
    {
        $cities = City::where('is_active', true)->orderBy('name')->get();
        $distances = CityDistance::with(['fromCity', 'toCity'])->get();

        $matrix = [];
        foreach ($cities as $fromCity) {
            $row = [];
            foreach ($cities as $toCity) {
                if ($fromCity->id === $toCity->id) {
                    $row[] = 0;
                } else {
                    $travelTime = $fromCity->getTravelTimeTo($toCity);
                    $row[] = $travelTime;
                }
            }
            $matrix[] = $row;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'cities' => $cities,
                'matrix' => $matrix
            ]
        ]);
    }

    /**
     * Batch update distances
     */
    public function batchUpdate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'distances' => 'required|array',
            'distances.*.from_city_id' => 'required|exists:cities,id',
            'distances.*.to_city_id' => 'required|exists:cities,id|different:distances.*.from_city_id',
            'distances.*.travel_time_hours' => 'required|numeric|min:0|max:999.99'
        ]);

        $updated = 0;
        $created = 0;

        foreach ($validated['distances'] as $distanceData) {
            $existing = CityDistance::where(function ($query) use ($distanceData) {
                $query->where('from_city_id', $distanceData['from_city_id'])
                      ->where('to_city_id', $distanceData['to_city_id']);
            })->orWhere(function ($query) use ($distanceData) {
                $query->where('from_city_id', $distanceData['to_city_id'])
                      ->where('to_city_id', $distanceData['from_city_id']);
            })->first();

            if ($existing) {
                $existing->update(['travel_time_hours' => $distanceData['travel_time_hours']]);
                $updated++;
            } else {
                CityDistance::create($distanceData);
                $created++;
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Batch update completed: {$created} created, {$updated} updated",
            'data' => [
                'created' => $created,
                'updated' => $updated
            ]
        ]);
    }
}