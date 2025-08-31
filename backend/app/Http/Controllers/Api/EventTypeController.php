<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EventType;
use App\Http\Resources\EventTypeResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EventTypeController extends Controller
{
    public function index(): JsonResponse
    {
        $eventTypes = EventType::withCount('events')->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => EventTypeResource::collection($eventTypes)
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'code' => 'required|string|max:10|unique:event_types',
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'color' => 'required|string',
                'settings' => 'nullable|array'
            ], [
                'code.required' => 'Event type code is required',
                'code.string' => 'Event type code must be text',
                'code.max' => 'Event type code cannot exceed 10 characters',
                'code.unique' => 'This event type code already exists. Please choose a different code.',
                'name.required' => 'Event type name is required',
                'name.string' => 'Event type name must be text',
                'name.max' => 'Event type name cannot exceed 255 characters',
                'color.required' => 'Event type color is required',
                'color.string' => 'Event type color must be text',
            ]);

            // Validate color format (hex or light variant)
            if (!$this->isValidColor($validated['color'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => [
                        'color' => ['Event type color must be a valid hex color (e.g., #FF5733) or light variant (e.g., light_blue)']
                    ],
                    'details' => 'Event type color must be a valid hex color (e.g., #FF5733) or light variant (e.g., light_blue)'
                ], 422);
            }

            $eventType = EventType::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Event type created successfully',
                'data' => new EventTypeResource($eventType)
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
                'message' => 'Failed to create event type. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(EventType $eventType): JsonResponse
    {
        $eventType->loadCount('events');

        return response()->json([
            'success' => true,
            'data' => new EventTypeResource($eventType)
        ]);
    }

    public function update(Request $request, EventType $eventType): JsonResponse
    {
        try {
            $validated = $request->validate([
                'code' => 'sometimes|string|max:10|unique:event_types,code,' . $eventType->id,
                'name' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'color' => 'sometimes|string',
                'is_active' => 'sometimes|boolean',
                'settings' => 'nullable|array'
            ], [
                'code.string' => 'Event type code must be text',
                'code.max' => 'Event type code cannot exceed 10 characters',
                'code.unique' => 'This event type code already exists. Please choose a different code.',
                'name.string' => 'Event type name must be text',
                'name.max' => 'Event type name cannot exceed 255 characters',
                'color.string' => 'Event type color must be text',
                'is_active.boolean' => 'Event type status must be true or false',
            ]);

            // Validate color format if provided (hex or light variant)
            if (isset($validated['color']) && !$this->isValidColor($validated['color'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => [
                        'color' => ['Event type color must be a valid hex color (e.g., #FF5733) or light variant (e.g., light_blue)']
                    ],
                    'details' => 'Event type color must be a valid hex color (e.g., #FF5733) or light variant (e.g., light_blue)'
                ], 422);
            }

            $eventType->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Event type updated successfully',
                'data' => new EventTypeResource($eventType)
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
                'message' => 'Failed to update event type. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(EventType $eventType): JsonResponse
    {
        try {
            $eventsCount = $eventType->events()->count();
            
            if ($eventsCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => "Cannot delete event type '{$eventType->name}' because it is used in {$eventsCount} event(s). Please remove this event type from all events first.",
                    'details' => "Event type is currently used in {$eventsCount} event(s)"
                ], 422);
            }

            $eventTypeName = $eventType->name;
            $eventType->delete();

            return response()->json([
                'success' => true,
                'message' => "Event type '{$eventTypeName}' deleted successfully"
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete event type. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Validate if color is either a valid hex color or light variant
     */
    private function isValidColor(string $color): bool
    {
        // Define valid light color variants
        $lightColorVariants = [
            'light_blue', 'light_green', 'light_red', 'light_purple', 'light_pink',
            'light_orange', 'light_yellow', 'light_teal', 'light_indigo', 'light_cyan',
            'light_emerald', 'light_violet', 'light_rose', 'light_amber', 'light_slate'
        ];

        // Check if it's a valid light color variant
        if (in_array($color, $lightColorVariants)) {
            return true;
        }

        // Check if it's a valid hex color
        if (preg_match('/^#[a-fA-F0-9]{6}$/', $color)) {
            return true;
        }

        return false;
    }
}