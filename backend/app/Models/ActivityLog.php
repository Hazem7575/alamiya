<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'action',
        'model_type',
        'model_id',
        'description',
        'ip_address',
        'user_agent'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getModelAttribute()
    {
        return $this->model_type::find($this->model_id);
    }

    public static function logActivity(string $action, ?Model $model = null, ?string $description = null): void
    {
        static::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'model_type' => $model ? get_class($model) : null,
            'model_id' => $model?->id,
            'description' => $description,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ]);
    }

    /**
     * Generate a clear description for the activity
     */
    public static function generateDescription(string $action, ?Model $model = null, ?array $context = null): string
    {
        $modelName = $model ? class_basename($model) : 'Item';
        $itemName = '';

        // Try to get a meaningful name for the item
        if ($model) {
            if (isset($model->name)) {
                $itemName = " '{$model->name}'";
            } elseif (isset($model->title)) {
                $itemName = " '{$model->title}'";
            } elseif (isset($model->email)) {
                $itemName = " '{$model->email}'";
            } elseif ($model->id) {
                $itemName = " (ID: {$model->id})";
            }
        }

        $descriptions = [
            'created' => "Created new {$modelName}{$itemName}",
            'updated' => "Updated {$modelName}{$itemName}",
            'deleted' => "Deleted {$modelName}{$itemName}",
            'restored' => "Restored {$modelName}{$itemName}",
            'viewed' => "Viewed {$modelName}{$itemName}",
            'login' => "Logged into the system",
            'logout' => "Logged out of the system",
            'password_changed' => "Changed account password",
            'status_changed' => "Changed status of {$modelName}{$itemName}",
            'permissions_changed' => "Changed permissions of {$modelName}{$itemName}",
        ];

        return $descriptions[$action] ?? "Performed {$action} action on {$modelName}{$itemName}";
    }
}