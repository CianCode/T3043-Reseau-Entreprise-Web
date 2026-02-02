<?php

namespace Database\Seeders;

use App\Models\Conversation;
use App\Models\Course;
use App\Models\Exercise;
use App\Models\ExerciseAttempt;
use App\Models\Language;
use App\Models\Lesson;
use App\Models\LessonContent;
use App\Models\LessonProgress;
use App\Models\Message;
use App\Models\Module;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create users with different roles
        $student = User::factory()->create([
            'name' => 'John Student',
            'email' => 'student@example.com',
            'role' => 'student',
        ]);

        $teacher = User::factory()->teacher()->create([
            'name' => 'Jane Teacher',
            'email' => 'teacher@example.com',
        ]);

        $admin = User::factory()->admin()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
        ]);

        // Create languages
        $spanish = Language::factory()->create([
            'name' => 'Spanish',
            'code' => 'es',
            'flag_icon' => '🇪🇸',
        ]);

        $french = Language::factory()->create([
            'name' => 'French',
            'code' => 'fr',
            'flag_icon' => '🇫🇷',
        ]);

        // Create a course with complete structure
        $course = Course::factory()
            ->for($teacher, 'teacher')
            ->for($spanish, 'language')
            ->create([
                'title' => 'Spanish for Beginners',
                'level' => 'beginner',
                'is_published' => true,
            ]);

        // Create another course for the teacher
        $course2 = Course::factory()
            ->for($teacher, 'teacher')
            ->for($french, 'language')
            ->create([
                'title' => 'French Fundamentals',
                'level' => 'beginner',
                'is_published' => true,
            ]);

        // Create modules for the course
        $module = Module::factory()
            ->for($course)
            ->create([
                'title' => 'Introduction to Spanish',
                'order' => 1,
            ]);

        $module2 = Module::factory()
            ->for($course)
            ->create([
                'title' => 'Basic Conversations',
                'order' => 2,
            ]);

        // Create module for French course
        $frenchModule = Module::factory()
            ->for($course2)
            ->create([
                'title' => 'French Basics',
                'order' => 1,
            ]);

        // Create lessons for the module
        $lesson = Lesson::factory()
            ->for($module)
            ->create([
                'title' => 'Basic Greetings',
                'order' => 1,
            ]);

        // Create lesson content
        LessonContent::factory()
            ->for($lesson)
            ->create([
                'content_type' => 'text',
                'content' => 'In this lesson, you will learn basic Spanish greetings like "Hola" (Hello) and "Adiós" (Goodbye).',
                'order' => 1,
            ]);

        // Create exercises for the lesson
        $exercise = Exercise::factory()
            ->for($lesson)
            ->create([
                'title' => 'Greetings Quiz',
                'order' => 1,
            ]);

        // Create questions for the exercise
        $question = Question::factory()
            ->for($exercise)
            ->create([
                'question_type' => 'multiple_choice',
                'question_text' => 'How do you say "Hello" in Spanish?',
                'order' => 1,
            ]);

        // Create question options
        QuestionOption::factory()->for($question)->create([
            'option_text' => 'Hola',
            'is_correct' => true,
            'order' => 1,
        ]);

        QuestionOption::factory()->for($question)->create([
            'option_text' => 'Adiós',
            'is_correct' => false,
            'order' => 2,
        ]);

        QuestionOption::factory()->for($question)->create([
            'option_text' => 'Por favor',
            'is_correct' => false,
            'order' => 3,
        ]);

        // Enroll the student in the course
        $student->enrolledCourses()->attach($course, [
            'enrolled_at' => now(),
            'progress_percentage' => 25,
        ]);

        // Mark lesson as completed
        LessonProgress::factory()
            ->for($student, 'user')
            ->for($lesson)
            ->create([
                'is_completed' => true,
                'completed_at' => now(),
            ]);

        // Create exercise attempt
        ExerciseAttempt::factory()
            ->for($student, 'user')
            ->for($exercise)
            ->create([
                'score' => 90,
                'max_score' => 100,
                'is_passed' => true,
            ]);

        // Create conversation between student and teacher
        $conversation = Conversation::factory()
            ->for($student, 'student')
            ->for($teacher, 'teacher')
            ->create();

        // Create messages in the conversation
        $message1 = Message::factory()
            ->for($conversation)
            ->for($student, 'sender')
            ->create([
                'message' => 'Hello! I have a question about the Spanish greetings lesson.',
                'is_read' => true,
            ]);

        $message2 = Message::factory()
            ->for($conversation)
            ->for($teacher, 'sender')
            ->create([
                'message' => 'Of course! What would you like to know?',
                'is_read' => false,
            ]);

        // Update conversation with last message
        $conversation->update([
            'last_message_id' => $message2->id,
            'last_message_at' => $message2->created_at,
        ]);
    }
}
