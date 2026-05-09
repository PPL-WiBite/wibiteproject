<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Claim extends Model
{
    use HasFactory;

    protected $fillable = [
        'food_id',
        'receiver_id',
        'status',
    ];

    public function food(): BelongsTo
    {
        return $this->belongsTo(Food::class);
    }

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }
}
