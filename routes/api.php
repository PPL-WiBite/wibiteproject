<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\FoodController;
use App\Http\Controllers\ForumController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\StatsController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\AdminMiddleware;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes (tanpa auth)
|--------------------------------------------------------------------------
*/

// Auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Food - public read
Route::get('/food', [FoodController::class, 'index']);

// Forum - public read
Route::get('/forum', [ForumController::class, 'index']);
Route::get('/forum/{forumPost}/comments', [ForumController::class, 'comments']);

// Stats
Route::get('/stats', [StatsController::class, 'index']);

/*
|--------------------------------------------------------------------------
| Protected Routes (perlu auth token)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // User Profile
    Route::get('/users/profile', [UserController::class, 'profile']);
    Route::put('/users/profile', [UserController::class, 'updateProfile']);
    Route::put('/users/role', [UserController::class, 'updateRole']);
    Route::get('/users/{user}', [UserController::class, 'show']);

    // Food - CRUD
    Route::post('/food', [FoodController::class, 'store']);
    Route::put('/food/{food}', [FoodController::class, 'update']);
    Route::delete('/food/{food}', [FoodController::class, 'destroy']);

    // Claim
    Route::post('/claim', [FoodController::class, 'claim']);
    Route::post('/claims/complete', [FoodController::class, 'completeClaim']);
    Route::get('/claims/mine', [FoodController::class, 'myClaims']);
    Route::get('/claims/incoming', [FoodController::class, 'incomingClaims']);

    // Chat antara donor dan receiver per claim
    Route::get('/claims/{claim}/messages', [MessageController::class, 'index']);
    Route::post('/claims/{claim}/messages', [MessageController::class, 'store']);

    // Forum - CRUD
    Route::post('/forum', [ForumController::class, 'store']);
    Route::put('/forum/{forumPost}', [ForumController::class, 'update']);
    Route::delete('/forum/{forumPost}', [ForumController::class, 'destroy']);
    Route::post('/forum/{forumPost}/comments', [ForumController::class, 'storeComment']);

    // Feedback
    Route::post('/feedback', [FeedbackController::class, 'store']);

    // Admin Routes
    Route::middleware(AdminMiddleware::class)->prefix('admin')->group(function () {
        Route::get('/users', [AdminController::class, 'users']);
        Route::delete('/users/{user}', [AdminController::class, 'deleteUser']);
    });
});
