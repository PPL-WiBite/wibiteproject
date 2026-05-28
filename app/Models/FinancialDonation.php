<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinancialDonation extends Model
{
    // Pastikan nama tabelnya sesuai jika jamak/tunggal
    protected $table = 'financial_donations'; 

    protected $fillable = [
        'user_id',
        'amount',
        'donor_name',
        'payment_method',
        'message',
        'is_anonymous'
    ];
}