<?php

namespace App\Observers;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class ModelActivityObserver
{
    /**
     * Handle the model "created" event.
     */
    public function created(Model $model): void
    {
        $description = ActivityLog::generateDescription('created', $model);
        $this->logActivity('created', $model, $description);
    }

    /**
     * Handle the model "updated" event.
     */
    public function updated(Model $model): void
    {
        $changes = $model->getChanges();
        
        // Only log if there are actual changes
        if (!empty($changes)) {
            $description = ActivityLog::generateDescription('updated', $model);
            $this->logActivity('updated', $model, $description);
        }
    }

    /**
     * Handle the model "deleted" event.
     */
    public function deleted(Model $model): void
    {
        $description = ActivityLog::generateDescription('deleted', $model);
        $this->logActivity('deleted', $model, $description);
    }

    /**
     * Handle the model "restored" event.
     */
    public function restored(Model $model): void
    {
        $description = ActivityLog::generateDescription('restored', $model);
        $this->logActivity('restored', $model, $description);
    }

    /**
     * Log the activity
     */
    private function logActivity(string $action, Model $model, string $description): void
    {
        try {
            // Don't log ActivityLog changes to prevent infinite loops
            if ($model instanceof ActivityLog) {
                return;
            }

            // Only log if user is authenticated
            if (!Auth::check()) {
                return;
            }

            $user = Auth::user();

            ActivityLog::create([
                'user_id' => $user->id,
                'action' => $action,
                'model_type' => get_class($model),
                'model_id' => $model->id ?? null,
                'description' => $description,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

        } catch (\Exception $e) {
            // Don't let logging errors break the application
            \Log::error('Model activity logging failed: ' . $e->getMessage());
        }
    }


}
