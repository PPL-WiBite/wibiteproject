<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ForumComment extends Model
{
    use HasFactory;

    protected $fillable = [
        'post_id',
        'content',
        'author_id',
        'author_name',
    ];

    public function post(): BelongsTo
    {
        return $this->belongsTo(ForumPost::class, 'post_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
