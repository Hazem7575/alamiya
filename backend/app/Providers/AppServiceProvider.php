<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Event;
use App\Models\User;
use App\Models\Role;
use App\Models\City;
use App\Models\Venue;
use App\Models\Observer;
use App\Models\EventType;
use App\Models\Sng;
use App\Models\Generator;
use App\Models\CityDistance;
use App\Observers\ModelActivityObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register model observers for activity logging
        Event::observe(ModelActivityObserver::class);
        User::observe(ModelActivityObserver::class);
        Role::observe(ModelActivityObserver::class);
        City::observe(ModelActivityObserver::class);
        Venue::observe(ModelActivityObserver::class);
        Observer::observe(ModelActivityObserver::class);
        EventType::observe(ModelActivityObserver::class);
        Sng::observe(ModelActivityObserver::class);
        Generator::observe(ModelActivityObserver::class);
        CityDistance::observe(ModelActivityObserver::class);
    }
}
