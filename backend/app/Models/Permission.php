<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'display_name',
        'category',
        'description'
    ];

    public static function getByCategory(string $category): array
    {
        return static::where('category', $category)->get()->toArray();
    }

    public static function getAllGrouped(): array
    {
        return static::all()->groupBy('category')->toArray();
    }
}