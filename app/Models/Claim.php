<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Claim extends Model
{
    use HasFactory;

    protected $fillable = [
        'food_id',
        'receiver_id',
        'portions',
        'status',
        'donor_completed_at',
        'receiver_completed_at',
    ];

    protected function casts(): array
    {
        return [
            'portions' => 'integer',
            'donor_completed_at' => 'datetime',
            'receiver_completed_at' => 'datetime',
        ];
    }

    public function food(): BelongsTo
    {
        return $this->belongsTo(Food::class);
    }

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class, 'claim_id');
    }

    public function isFullyConfirmed(): bool
    {
        return !is_null($this->donor_completed_at) && !is_null($this->receiver_completed_at);
    }
}
