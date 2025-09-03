<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Generator;
use App\Http\Resources\GeneratorResource;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class GeneratorController extends Controller
{
    use LogsActivity;
    public function index(Request $request): JsonResponse
    {
        $query = Generator::query();
        $generators = $query->get();

        return response()->json([
            'success' => true,
            'data' => GeneratorResource::collection($generators)
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'code' => 'required|string|max:255|unique:generators,code',
            ], [
                'code.required' => 'Generator code is required',
                'code.string' => 'Generator code must be text',
                'code.max' => 'Generator code cannot exceed 255 characters',
                'code.unique' => 'This Generator code already exists. Please choose a different code.',
            ]);

            $generator = Generator::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Generator created successfully',
                'data' => new GeneratorResource($generator)
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
                'message' => 'Failed to create Generator. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Generator $generator): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new GeneratorResource($generator)
        ]);
    }

    public function update(Request $request, Generator $generator): JsonResponse
    {
        try {
            $validated = $request->validate([
                'code' => 'required|string|max:255|unique:generators,code,' . $generator->id,
            ], [
                'code.required' => 'Generator code is required',
                'code.string' => 'Generator code must be text',
                'code.max' => 'Generator code cannot exceed 255 characters',
                'code.unique' => 'This Generator code already exists. Please choose a different code.',
            ]);

            $generator->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Generator updated successfully',
                'data' => new GeneratorResource($generator)
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
                'message' => 'Failed to update Generator. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Generator $generator): JsonResponse
    {
        try {
            $eventsCount = $generator->events()->count();
            
            if ($eventsCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => "Cannot delete Generator '{$generator->code}' because it is assigned to {$eventsCount} event(s). Please remove the Generator from all events first.",
                    'details' => "Generator is currently assigned to {$eventsCount} event(s)"
                ], 422);
            }

            $generator->delete();

            return response()->json([
                'success' => true,
                'message' => "Generator '{$generatorCode}' deleted successfully"
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete Generator. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
