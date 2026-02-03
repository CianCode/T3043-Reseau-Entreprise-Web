<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Events\MessagesRead;
use App\Http\Requests\StoreMessageRequest;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ConversationController extends Controller
{
    /**
     * Display a listing of conversations for the authenticated user.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $conversations = Conversation::query()
            ->where(function ($query) use ($user) {
                if ($user->role === 'teacher') {
                    $query->where('teacher_id', $user->id);
                } else {
                    $query->where('student_id', $user->id);
                }
            })
            ->with(['student', 'teacher', 'lastMessage'])
            ->withCount([
                'messages as unread_count' => function ($query) use ($user) {
                    $query->where('is_read', false)
                        ->where('sender_id', '!=', $user->id);
                },
            ])
            ->orderBy('last_message_at', 'desc')
            ->get();

        // Get available teachers for students to start conversations with
        $availableTeachers = [];
        if ($user->role === 'student') {
            $availableTeachers = $user->enrolledCourses()
                ->with('teacher:id,name,email')
                ->get()
                ->pluck('teacher')
                ->unique('id')
                ->values();
        }

        return Inertia::render('conversations/index', [
            'conversations' => $conversations,
            'availableTeachers' => $availableTeachers,
        ]);
    }

    /**
     * Display the specified conversation.
     */
    public function show(Request $request, Conversation $conversation)
    {
        $user = $request->user();

        // Check authorization
        if ($conversation->teacher_id !== $user->id && $conversation->student_id !== $user->id) {
            abort(403);
        }

        $messages = $conversation->messages()
            ->with('sender')
            ->orderBy('created_at', 'asc')
            ->get();

        // Mark messages as read
        $updatedCount = $conversation->messages()
            ->where('sender_id', '!=', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        // Broadcast if any messages were marked as read
        if ($updatedCount > 0) {
            broadcast(new MessagesRead($conversation, $user->id))->toOthers();
        }

        // Get all conversations for the sidebar
        $allConversations = Conversation::query()
            ->where(function ($query) use ($user) {
                if ($user->role === 'teacher') {
                    $query->where('teacher_id', $user->id);
                } else {
                    $query->where('student_id', $user->id);
                }
            })
            ->with(['student', 'teacher', 'lastMessage'])
            ->withCount([
                'messages as unread_count' => function ($query) use ($user) {
                    $query->where('is_read', false)
                        ->where('sender_id', '!=', $user->id);
                },
            ])
            ->orderBy('last_message_at', 'desc')
            ->get();

        // Get available teachers for students to start conversations with
        $availableTeachers = [];
        if ($user->role === 'student') {
            $availableTeachers = $user->enrolledCourses()
                ->with('teacher:id,name,email')
                ->get()
                ->pluck('teacher')
                ->unique('id')
                ->values();
        }

        return Inertia::render('conversations/show', [
            'conversation' => $conversation->load(['student', 'teacher']),
            'messages' => $messages,
            'allConversations' => $allConversations,
            'availableTeachers' => $availableTeachers,
        ]);
    }

    /**
     * Store a newly created message in storage.
     */
    public function storeMessage(StoreMessageRequest $request)
    {
        $user = $request->user();
        $conversation = Conversation::findOrFail($request->conversation_id);

        // Check authorization
        if ($conversation->teacher_id !== $user->id && $conversation->student_id !== $user->id) {
            abort(403);
        }

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'message' => $request->message,
            'is_read' => false,
        ]);

        $message->load('sender');

        // Update conversation last message
        $conversation->update([
            'last_message_id' => $message->id,
            'last_message_at' => now(),
        ]);

        // Broadcast the message
        broadcast(new MessageSent($message))->toOthers();

        return back();
    }

    /**
     * Create or get a conversation between student and teacher.
     */
    public function getOrCreate(Request $request)
    {
        $request->validate([
            'teacher_id' => ['required', 'exists:users,id'],
        ]);

        $user = $request->user();

        if ($user->role !== 'student') {
            abort(403, 'Only students can initiate conversations.');
        }

        $conversation = Conversation::firstOrCreate(
            [
                'student_id' => $user->id,
                'teacher_id' => $request->teacher_id,
            ],
            [
                'last_message_at' => now(),
            ]
        );

        return redirect()->route('conversations.show', $conversation);
    }

    /**
     * Mark messages as read in a conversation.
     */
    public function markAsRead(Request $request, Conversation $conversation)
    {
        $user = $request->user();

        // Check authorization
        if ($conversation->teacher_id !== $user->id && $conversation->student_id !== $user->id) {
            abort(403);
        }

        $updatedCount = $conversation->messages()
            ->where('sender_id', '!=', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        // Broadcast if any messages were marked as read
        if ($updatedCount > 0) {
            broadcast(new MessagesRead($conversation, $user->id));
        }

        return response()->json(['success' => true, 'updated_count' => $updatedCount]);
    }
}
