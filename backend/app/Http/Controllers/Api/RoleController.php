<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Permission;
use App\Http\Resources\RoleResource;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class RoleController extends Controller
{
    use LogsActivity;
    public function index(): JsonResponse
    {
        $roles = Role::withCount('users')->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => RoleResource::collection($roles)
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles',
            'display_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'permissions' => 'required|array',
            'permissions.*' => 'string|exists:permissions,name'
        ]);

        $role = Role::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Role created successfully',
            'data' => new RoleResource($role)
        ], 201);
    }

    public function show(Role $role): JsonResponse
    {
        $role->loadCount('users');

        return response()->json([
            'success' => true,
            'data' => new RoleResource($role)
        ]);
    }

    public function update(Request $request, Role $role): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255|unique:roles,name,' . $role->id,
            'display_name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'permissions' => 'sometimes|array',
            'permissions.*' => 'string|exists:permissions,name',
            'is_active' => 'sometimes|boolean'
        ]);

        $role->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Role updated successfully',
            'data' => new RoleResource($role)
        ]);
    }

    public function destroy(Role $role): JsonResponse
    {
        if ($role->users()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete role with assigned users'
            ], 422);
        }

        $role->delete();

        return response()->json([
            'success' => true,
            'message' => 'Role deleted successfully'
        ]);
    }

    public function all(): JsonResponse
    {
        $roles = Role::where('is_active', true)->orderBy('display_name')->get();

        return response()->json([
            'success' => true,
            'data' => RoleResource::collection($roles)
        ]);
    }

    public function permissions(): JsonResponse
    {
        $permissions = Permission::all();

        return response()->json([
            'success' => true,
            'data' => $permissions
        ]);
    }

    public function permissionsByCategory(): JsonResponse
    {
        $permissions = Permission::getAllGrouped();

        return response()->json([
            'success' => true,
            'data' => $permissions
        ]);
    }
}