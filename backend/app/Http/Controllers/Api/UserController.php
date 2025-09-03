<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use App\Http\Resources\UserResource;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    use LogsActivity;
    public function index(Request $request): JsonResponse
    {
        $query = User::with('role')->where('id' , '!=' , 1);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('role_id')) {
            $query->where('role_id', $request->role_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('department', 'like', "%{$search}%");
            });
        }

        $perPage = $request->get('per_page', 15);
        $users = $query->orderBy('created_at', 'desc')->paginate($perPage);

        // Debug: Log user data with roles and permissions
        \Log::info('Users API Response:', [
            'users_count' => count($users->items()),
            'sample_user' => $users->items()[0] ?? null,
            'sample_user_role' => optional($users->items()[0] ?? null)->role,
            'sample_role_permissions' => optional(optional($users->items()[0] ?? null)->role)->permissions
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'data' => UserResource::collection($users->items()),
                'current_page' => $users->currentPage(),
                'from' => $users->firstItem(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'to' => $users->lastItem(),
                'total' => $users->total(),
            ]
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:20',
            'department' => 'nullable|string|max:255',
            'role_id' => 'nullable|exists:roles,id',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string'
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);
        $user->load('role');

        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'data' => new UserResource($user)
        ], 201);
    }

    public function show(User $user): JsonResponse
    {
        $user->load('role', 'events');

        return response()->json([
            'success' => true,
            'data' => new UserResource($user)
        ]);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'email', Rule::unique('users')->ignore($user->id)],
            'password' => 'sometimes|string|min:8',
            'phone' => 'nullable|string|max:20',
            'department' => 'nullable|string|max:255',
            'status' => 'sometimes|in:active,inactive,suspended',
            'role_id' => 'nullable|exists:roles,id',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string'
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);
        $user->load('role');

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data' => new UserResource($user)
        ]);
    }

    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully'
        ]);
    }

    public function updateStatus(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:active,inactive,suspended'
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'User status updated successfully',
            'data' => new UserResource($user)
        ]);
    }

    public function updatePermissions(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'string'
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'User permissions updated successfully',
            'data' => new UserResource($user)
        ]);
    }
}
