<?php

namespace App\Traits;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

trait LogsActivity
{
    /**
     * Log a custom activity
     */
    protected function logCustomActivity(
        string $action,
        ?Model $model = null,
        ?string $description = null
    ): void {
        try {
            if (!Auth::check()) {
                return;
            }

            $user = Auth::user();

            // Generate description if not provided
            if (!$description) {
                $description = ActivityLog::generateDescription($action, $model);
            }

            ActivityLog::create([
                'user_id' => $user->id,
                'action' => $action,
                'model_type' => $model ? get_class($model) : null,
                'model_id' => $model?->id,
                'description' => $description,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

        } catch (\Exception $e) {
            \Log::error('Custom activity logging failed: ' . $e->getMessage());
        }
    }

    /**
     * Log bulk operations
     */
    protected function logBulkActivity(
        string $action,
        string $modelType,
        array $modelIds,
        ?string $description = null
    ): void {
        try {
            if (!Auth::check()) {
                return;
            }

            $user = Auth::user();
            $modelName = class_basename($modelType);
            $count = count($modelIds);
            
            if (!$description) {
                $description = "Performed {$action} action on {$count} {$modelName} items";
            }

            ActivityLog::create([
                'user_id' => $user->id,
                'action' => $action,
                'model_type' => $modelType,
                'model_id' => null, // Bulk operation
                'description' => $description,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

        } catch (\Exception $e) {
            \Log::error('Bulk activity logging failed: ' . $e->getMessage());
        }
    }

    /**
     * Log status changes
     */
    protected function logStatusChange(
        Model $model,
        string $oldStatus,
        string $newStatus,
        ?string $reason = null
    ): void {
        $modelName = class_basename($model);
        $itemName = $model->name ?? $model->title ?? "ID: {$model->id}";
        $description = "Changed status of {$modelName} '{$itemName}' from {$oldStatus} to {$newStatus}";
        
        if ($reason) {
            $description .= " - Reason: {$reason}";
        }
        
        $this->logCustomActivity('status_changed', $model, $description);
    }

    /**
     * Log permission changes
     */
    protected function logPermissionChange(
        Model $model,
        array $oldPermissions,
        array $newPermissions
    ): void {
        $added = array_diff($newPermissions, $oldPermissions);
        $removed = array_diff($oldPermissions, $newPermissions);

        if (!empty($added) || !empty($removed)) {
            $modelName = class_basename($model);
            $itemName = $model->name ?? $model->email ?? "ID: {$model->id}";
            $description = "Changed permissions of {$modelName} '{$itemName}'";
            
            if (!empty($added)) {
                $description .= " - Added: " . implode(', ', $added);
            }
            if (!empty($removed)) {
                $description .= " - Removed: " . implode(', ', $removed);
            }
            
            $this->logCustomActivity('permissions_changed', $model, $description);
        }
    }

    /**
     * Log file operations
     */
    protected function logFileOperation(
        string $action,
        string $filename,
        ?Model $relatedModel = null
    ): void {
        $description = "File '{$filename}' was {$action}";
        
        if ($relatedModel) {
            $modelName = class_basename($relatedModel);
            $itemName = $relatedModel->name ?? $relatedModel->title ?? "ID: {$relatedModel->id}";
            $description .= " related to {$modelName} '{$itemName}'";
        }
        
        $this->logCustomActivity($action, $relatedModel, $description);
    }

    /**
     * Log API access
     */
    protected function logApiAccess(
        string $endpoint,
        string $method
    ): void {
        $description = "Accessed API endpoint '{$endpoint}' using {$method} method";
        $this->logCustomActivity('api_access', null, $description);
    }
}
