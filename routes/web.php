<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| SPA Catch-All Route
|--------------------------------------------------------------------------
| Semua request non-API di-serve React SPA (index.html).
| React Router akan handle routing di client-side.
*/

Route::get('/{any?}', function () {
    $indexPath = public_path('index.html');

    // Kalau build React belum ada, kasih pesan jelas
    if (!file_exists($indexPath)) {
        return response(
            '<h1>Frontend belum di-build.</h1>' .
            '<p>Jalankan <code>cd frontend &amp;&amp; npm install &amp;&amp; npm run build</code> dulu.</p>',
            500
        )->header('Content-Type', 'text/html');
    }

    return response()->file($indexPath);
})->where('any', '^(?!api|sanctum|storage|up).*$');
