<?php

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;

test('teacher can view their conversations', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    $student = User::factory()->create(['role' => 'student']);

    $conversation = Conversation::factory()->create([
        'teacher_id' => $teacher->id,
        'student_id' => $student->id,
    ]);

    $response = $this->actingAs($teacher)->get('/conversations');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('conversations/index')
        ->has('conversations', 1)
    );
});

test('student cannot access teacher conversations list', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    $student = User::factory()->create(['role' => 'student']);

    Conversation::factory()->create([
        'teacher_id' => $teacher->id,
        'student_id' => $student->id,
    ]);

    $response = $this->actingAs($student)->get('/conversations');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('conversations/index')
        ->has('conversations', 1)
    );
});

test('user can view a specific conversation', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    $student = User::factory()->create(['role' => 'student']);

    $conversation = Conversation::factory()->create([
        'teacher_id' => $teacher->id,
        'student_id' => $student->id,
    ]);

    Message::factory()->count(3)->create([
        'conversation_id' => $conversation->id,
        'sender_id' => $student->id,
    ]);

    $response = $this->actingAs($teacher)->get("/conversations/{$conversation->id}");

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('conversations/show')
        ->has('messages', 3)
    );
});

test('user cannot view other users conversations', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    $student = User::factory()->create(['role' => 'student']);
    $otherTeacher = User::factory()->create(['role' => 'teacher']);

    $conversation = Conversation::factory()->create([
        'teacher_id' => $teacher->id,
        'student_id' => $student->id,
    ]);

    $response = $this->actingAs($otherTeacher)->get("/conversations/{$conversation->id}");

    $response->assertStatus(403);
});

test('user can send a message in their conversation', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    $student = User::factory()->create(['role' => 'student']);

    $conversation = Conversation::factory()->create([
        'teacher_id' => $teacher->id,
        'student_id' => $student->id,
    ]);

    $response = $this->actingAs($teacher)->post('/conversations/messages', [
        'conversation_id' => $conversation->id,
        'message' => 'Hello, how can I help you?',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('messages', [
        'conversation_id' => $conversation->id,
        'sender_id' => $teacher->id,
        'message' => 'Hello, how can I help you?',
    ]);
});

test('message requires content', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    $student = User::factory()->create(['role' => 'student']);

    $conversation = Conversation::factory()->create([
        'teacher_id' => $teacher->id,
        'student_id' => $student->id,
    ]);

    $response = $this->actingAs($teacher)->post('/conversations/messages', [
        'conversation_id' => $conversation->id,
        'message' => '',
    ]);

    $response->assertSessionHasErrors('message');
});

test('student can create conversation with teacher', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    $student = User::factory()->create(['role' => 'student']);

    $response = $this->actingAs($student)->post('/conversations/get-or-create', [
        'teacher_id' => $teacher->id,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('conversations', [
        'teacher_id' => $teacher->id,
        'student_id' => $student->id,
    ]);
});

test('teacher cannot create conversation as initiator', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);
    $otherTeacher = User::factory()->create(['role' => 'teacher']);

    $response = $this->actingAs($teacher)->post('/conversations/get-or-create', [
        'teacher_id' => $otherTeacher->id,
    ]);

    $response->assertStatus(403);
});
