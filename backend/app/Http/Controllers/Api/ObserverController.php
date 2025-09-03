<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Observer;
use App\Http\Resources\ObserverResource;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ObserverController extends Controller
{
    use LogsActivity;
    public function index(Request $request): JsonResponse
    {
        $query = Observer::query();
        $observers = $query->get();

        return response()->json([
            'success' => true,
            'data' => ObserverResource::collection($observers)
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'code' => 'required|string|max:255|unique:observers,code',
            ], [
                'code.required' => 'Observer code is required',
                'code.string' => 'Observer code must be text',
                'code.max' => 'Observer code cannot exceed 255 characters',
                'code.unique' => 'This observer code already exists. Please choose a different code.',
            ]);

            $observer = Observer::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Observer created successfully',
                'data' => new ObserverResource($observer)
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
                'message' => 'Failed to create observer. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Observer $observer): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new ObserverResource($observer)
        ]);
    }

    public function update(Request $request, Observer $observer): JsonResponse
    {
        try {
            $validated = $request->validate([
                'code' => 'required|string|max:255|unique:observers,code,' . $observer->id,
            ], [
                'code.required' => 'Observer code is required',
                'code.string' => 'Observer code must be text',
                'code.max' => 'Observer code cannot exceed 255 characters',
                'code.unique' => 'This observer code already exists. Please choose a different code.',
            ]);

            $observer->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Observer updated successfully',
                'data' => new ObserverResource($observer)
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
                'message' => 'Failed to update observer. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Observer $observer): JsonResponse
    {
        try {
            $eventsCount = $observer->events()->count();
            
            if ($eventsCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => "Cannot delete observer '{$observer->code}' because it is assigned to {$eventsCount} event(s). Please remove the observer from all events first.",
                    'details' => "Observer is currently assigned to {$eventsCount} event(s)"
                ], 422);
            }

            $observerCode = $observer->code;
            $observer->delete();

            return response()->json([
                'success' => true,
                'message' => "Observer '{$observerCode}' deleted successfully"
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete observer. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }


}
