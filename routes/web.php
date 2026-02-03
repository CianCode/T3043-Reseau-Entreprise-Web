<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('dashboard', [App\Http\Controllers\DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::get('dashboard/module/{module}', [App\Http\Controllers\DashboardController::class, 'showModule'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard.module');

// Course routes for teachers
Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('courses', [App\Http\Controllers\CourseController::class, 'store'])->name('courses.store');
    Route::get('courses/{course}', [App\Http\Controllers\CourseController::class, 'show'])->name('courses.show');

    Route::post('modules', [App\Http\Controllers\ModuleController::class, 'store'])->name('modules.store');
    Route::post('courses/{course}/modules/reorder', [App\Http\Controllers\ModuleController::class, 'reorder'])->name('modules.reorder');

    Route::post('lessons', [App\Http\Controllers\LessonController::class, 'store'])->name('lessons.store');
    Route::get('lessons/{lesson}/edit', [App\Http\Controllers\LessonController::class, 'edit'])->name('lessons.edit');
    Route::patch('lessons/{lesson}', [App\Http\Controllers\LessonController::class, 'update'])->name('lessons.update');
    Route::delete('lessons/{lesson}', [App\Http\Controllers\LessonController::class, 'destroy'])->name('lessons.destroy');
});

// Admin routes
Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::resource('users', App\Http\Controllers\Admin\UserController::class);
});

require __DIR__.'/settings.php';
