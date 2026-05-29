<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Food extends Model
{
    use HasFactory;

    protected $table = 'foods';

    protected $fillable = [
        'name',
        'portions',
        'claimed_portions',
        'weight_kg',
        'pickup_address',
        'lat',
        'lng',
        'expired_date',
        'description',
        'category',
        'status',
        'donor_id',
        'donor_name',
        'image',
        'claimed_by',
        'claimed_at',
    ];

    protected function casts(): array
    {
        return [
            'claimed_at' => 'datetime',
            'weight_kg' => 'decimal:2',
            'lat' => 'decimal:7',
            'lng' => 'decimal:7',
        ];
    }

    public function remainingPortions(): int
    {
        return max(0, $this->portions - $this->claimed_portions);
    }

    public function donor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'donor_id');
    }

    public function claimer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'claimed_by');
    }

    public function claims(): HasMany
    {
        return $this->hasMany(Claim::class, 'food_id');
    }
}
