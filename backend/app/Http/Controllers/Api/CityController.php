<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCityRequest;
use App\Http\Requests\UpdateCityRequest;
use App\Http\Resources\CityResource;
use App\Models\City;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class CityController extends Controller
{
    use LogsActivity;
    /**
     * Display a listing of cities
     */
    public function index(Request $request): JsonResponse
    {
        $query = City::query();

        // Filter by active status
        if ($request->has('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        // Search by name
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $cities = $query->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => CityResource::collection($cities)
        ]);
    }

    /**
     * Store a new city
     */
    public function store(StoreCityRequest $request): JsonResponse
    {
        $city = City::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'City created successfully',
            'data' => new CityResource($city)
        ], 201);
    }

    /**
     * Display the specified city
     */
    public function show(City $city): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new CityResource($city)
        ]);
    }

    /**
     * Update the specified city
     */
    public function update(UpdateCityRequest $request, City $city): JsonResponse
    {
        $city->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'City updated successfully',
            'data' => new CityResource($city)
        ]);
    }

    /**
     * Remove the specified city
     */
    public function destroy(City $city): JsonResponse
    {
        $city->delete();

        return response()->json([
            'success' => true,
            'message' => 'City deleted successfully'
        ]);
    }

    /**
     * Get cities with missing distances
     */
    public function missingDistances(): JsonResponse
    {
        $cities = City::where('is_active', true)->get();
        $missingPairs = [];

        foreach ($cities as $fromCity) {
            foreach ($cities as $toCity) {
                if ($fromCity->id >= $toCity->id) continue;

                $travelTime = $fromCity->getTravelTimeTo($toCity);
                if ($travelTime === null) {
                    $missingPairs[] = [
                        'from_city' => $fromCity,
                        'to_city' => $toCity
                    ];
                }
            }
        }

        return response()->json([
            'success' => true,
            'data' => $missingPairs,
            'count' => count($missingPairs)
        ]);
    }
}