<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FinancialDonation extends Model
{
    protected $table = 'financial_donations';

    protected $fillable = [
        'user_id',
        'amount',
        'donor_name',
        'payment_method',
        'message',
        'is_anonymous',
    ];

    protected $casts = [
        'is_anonymous' => 'boolean',
        'amount'       => 'float',
    ];
}
