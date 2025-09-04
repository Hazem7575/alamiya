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
        if (!$model) {
            return "Performed {$action} action";
        }

        $modelName = class_basename($model);

        // Generate detailed descriptions based on model type
        switch ($modelName) {
            case 'Observer':
                return static::generateObserverDescription($action, $model);
            case 'CityDistance':
                return static::generateCityDistanceDescription($action, $model);
            case 'City':
                return static::generateCityDescription($action, $model);
            case 'Venue':
                return static::generateVenueDescription($action, $model);
            case 'EventType':
                return static::generateEventTypeDescription($action, $model);
            case 'User':
                return static::generateUserDescription($action, $model);
            case 'Sng':
                return static::generateSngDescription($action, $model);
            case 'Generator':
                return static::generateGeneratorDescription($action, $model);
            case 'Role':
                return static::generateRoleDescription($action, $model);
            case 'Event':
                return static::generateEventDescription($action, $model);
            default:
                return static::generateDefaultDescription($action, $model);
        }
    }

    private static function generateObserverDescription(string $action, Model $model): string
    {
        switch ($action) {
            case 'created':
                return "Created new ob: {$model->code}";
            case 'updated':
                return "Updated ob: {$model->code}";
            case 'deleted':
                return "Deleted ob: {$model->code}";
            default:
                return "Performed {$action} on ob: {$model->code}";
        }
    }

    private static function generateCityDistanceDescription(string $action, Model $model): string
    {
        $model->load(['fromCity', 'toCity']);
        $fromCity = $model->fromCity->name ?? 'Unknown';
        $toCity = $model->toCity->name ?? 'Unknown';
        $hours = $model->travel_time_hours;

        switch ($action) {
            case 'created':
                return "Created travel time between {$fromCity} and {$toCity}: {$hours} hours";
            case 'updated':
                return "Updated travel time between {$fromCity} and {$toCity}: {$hours} hours";
            case 'deleted':
                return "Deleted travel time between {$fromCity} and {$toCity} ({$hours} hours)";
            default:
                return "Performed {$action} on travel time between {$fromCity} and {$toCity}";
        }
    }

    private static function generateCityDescription(string $action, Model $model): string
    {
        switch ($action) {
            case 'created':
                return "Created new city: {$model->name}";
            case 'updated':
                return "Updated city: {$model->name}";
            case 'deleted':
                return "Deleted city: {$model->name}";
            default:
                return "Performed {$action} on city: {$model->name}";
        }
    }

    private static function generateVenueDescription(string $action, Model $model): string
    {
        $model->load('city');
        $cityName = $model->city->name ?? 'Unknown City';

        switch ($action) {
            case 'created':
                return "Created new venue: {$model->name} in {$cityName}";
            case 'updated':
                return "Updated venue: {$model->name} in {$cityName}";
            case 'deleted':
                return "Deleted venue: {$model->name} in {$cityName}";
            default:
                return "Performed {$action} on venue: {$model->name}";
        }
    }

    private static function generateEventTypeDescription(string $action, Model $model): string
    {
        switch ($action) {
            case 'created':
                return "Created new event type: {$model->name} ({$model->code})";
            case 'updated':
                return "Updated event type: {$model->name} ({$model->code})";
            case 'deleted':
                return "Deleted event type: {$model->name} ({$model->code})";
            default:
                return "Performed {$action} on event type: {$model->name}";
        }
    }

    private static function generateUserDescription(string $action, Model $model): string
    {
        switch ($action) {
            case 'created':
                return "Created user: {$model->name} ({$model->email})";
            case 'updated':
                return "Updated user: {$model->name} ({$model->email})";
            case 'deleted':
                return "Deleted user: {$model->name} ({$model->email})";
            default:
                return "Performed {$action} on user: {$model->name}";
        }
    }

    private static function generateSngDescription(string $action, Model $model): string
    {
        switch ($action) {
            case 'created':
                return "Created SNG: {$model->code}";
            case 'updated':
                return "Updated SNG: {$model->code}";
            case 'deleted':
                return "Deleted SNG: {$model->code}";
            default:
                return "Performed {$action} on SNG: {$model->code}";
        }
    }

    private static function generateGeneratorDescription(string $action, Model $model): string
    {
        switch ($action) {
            case 'created':
                return "Created Generator: {$model->code}";
            case 'updated':
                return "Updated Generator: {$model->code}";
            case 'deleted':
                return "Deleted Generator: {$model->code}";
            default:
                return "Performed {$action} on Generator: {$model->code}";
        }
    }

    private static function generateRoleDescription(string $action, Model $model): string
    {
        switch ($action) {
            case 'created':
                $permissionsCount = count($model->permissions ?? []);
                return "Created new role: {$model->display_name} with {$permissionsCount} permissions";
            case 'updated':
                return "Updated role: {$model->display_name}";
            case 'deleted':
                return "Deleted role: {$model->display_name}";
            default:
                return "Performed {$action} on role: {$model->display_name}";
        }
    }

    private static function generateEventDescription(string $action, Model $model): string
    {
        switch ($action) {
            case 'created':
                return "Created event: {$model->title}";
            case 'updated':
                return "Updated event: {$model->title}";
            case 'deleted':
                return "Deleted event: {$model->title}";
            default:
                return "Performed {$action} on event: {$model->title}";
        }
    }

    private static function generateDefaultDescription(string $action, Model $model): string
    {
        $modelName = class_basename($model);
        $itemName = $model->name ?? $model->title ?? $model->email ?? "ID: {$model->id}";

        switch ($action) {
            case 'created':
                return "Created new {$modelName}: {$itemName}";
            case 'updated':
                return "Updated {$modelName}: {$itemName}";
            case 'deleted':
                return "Deleted {$modelName}: {$itemName}";
            default:
                return "Performed {$action} on {$modelName}: {$itemName}";
        }
    }
}
