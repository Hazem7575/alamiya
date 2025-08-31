<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sng;
use App\Http\Resources\SngResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SngController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Sng::query();
        $sngs = $query->get();

        return response()->json([
            'success' => true,
            'data' => SngResource::collection($sngs)
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'code' => 'required|string|max:255|unique:sngs,code',
            ], [
                'code.required' => 'SNG code is required',
                'code.string' => 'SNG code must be text',
                'code.max' => 'SNG code cannot exceed 255 characters',
                'code.unique' => 'This SNG code already exists. Please choose a different code.',
            ]);

            $sng = Sng::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'SNG created successfully',
                'data' => new SngResource($sng)
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
                'message' => 'Failed to create SNG. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Sng $sng): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new SngResource($sng)
        ]);
    }

    public function update(Request $request, Sng $sng): JsonResponse
    {
        try {
            $validated = $request->validate([
                'code' => 'required|string|max:255|unique:sngs,code,' . $sng->id,
            ], [
                'code.required' => 'SNG code is required',
                'code.string' => 'SNG code must be text',
                'code.max' => 'SNG code cannot exceed 255 characters',
                'code.unique' => 'This SNG code already exists. Please choose a different code.',
            ]);

            $sng->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'SNG updated successfully',
                'data' => new SngResource($sng)
            ]);
            
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
                'message' => 'Failed to update SNG. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Sng $sng): JsonResponse
    {
        try {
            $eventsCount = $sng->events()->count();
            
            if ($eventsCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => "Cannot delete SNG '{$sng->code}' because it is assigned to {$eventsCount} event(s). Please remove the SNG from all events first.",
                    'details' => "SNG is currently assigned to {$eventsCount} event(s)"
                ], 422);
            }

            $sngCode = $sng->code;
            $sng->delete();

            return response()->json([
                'success' => true,
                'message' => "SNG '{$sngCode}' deleted successfully"
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete SNG. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
