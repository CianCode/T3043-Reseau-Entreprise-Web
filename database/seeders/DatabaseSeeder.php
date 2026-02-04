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

        $frenchTeacher = User::factory()->teacher()->create([
            'name' => 'Marie Dubois',
            'email' => 'marie@example.com',
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
            ->for($frenchTeacher, 'teacher')
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
                'description' => 'Learn how to greet people in Spanish',
                'duration_minutes' => 15,
                'order' => 1,
            ]);

        $lesson2 = Lesson::factory()
            ->for($module)
            ->create([
                'title' => 'Common Phrases',
                'description' => 'Essential Spanish phrases for daily use',
                'duration_minutes' => 20,
                'order' => 2,
            ]);

        $lesson3 = Lesson::factory()
            ->for($module)
            ->create([
                'title' => 'Pronunciation Guide',
                'description' => 'Master Spanish pronunciation basics',
                'duration_minutes' => 25,
                'order' => 3,
            ]);

        // Create lessons for module 2
        $lesson4 = Lesson::factory()
            ->for($module2)
            ->create([
                'title' => 'At the Restaurant',
                'description' => 'Learn how to order food in Spanish',
                'duration_minutes' => 30,
                'order' => 1,
            ]);

        $lesson5 = Lesson::factory()
            ->for($module2)
            ->create([
                'title' => 'Shopping Vocabulary',
                'description' => 'Essential vocabulary for shopping',
                'duration_minutes' => 20,
                'order' => 2,
            ]);

        // Create lesson content
        LessonContent::factory()
            ->for($lesson)
            ->create([
                'content_type' => 'text',
                'content' => '# Basic Greetings in Spanish

In this lesson, you will learn basic Spanish greetings:

- **Hola** - Hello
- **Buenos días** - Good morning
- **Buenas tardes** - Good afternoon
- **Buenas noches** - Good evening/night
- **Adiós** - Goodbye
- **Hasta luego** - See you later

These are essential phrases you\'ll use every day!',
                'order' => 1,
            ]);

        LessonContent::factory()
            ->for($lesson2)
            ->create([
                'content_type' => 'text',
                'content' => '# Common Spanish Phrases

Here are some useful phrases:

- **Por favor** - Please
- **Gracias** - Thank you
- **De nada** - You\'re welcome
- **Lo siento** - I\'m sorry
- **Perdón** - Excuse me
- **¿Cómo estás?** - How are you?
- **Bien, gracias** - Fine, thanks',
                'order' => 1,
            ]);

        LessonContent::factory()
            ->for($lesson3)
            ->create([
                'content_type' => 'text',
                'content' => '# Spanish Pronunciation Basics

Spanish pronunciation is generally phonetic. Here are key points:

1. **Vowels** are always pronounced the same way
2. **H** is always silent
3. **LL** sounds like the "y" in "yes"
4. **Ñ** sounds like "ny" in "canyon"

Practice these sounds to improve your accent!',
                'order' => 1,
            ]);

        LessonContent::factory()
            ->for($lesson4)
            ->create([
                'content_type' => 'text',
                'content' => '# Restaurant Vocabulary

Essential phrases for dining out:

- **Una mesa para dos, por favor** - A table for two, please
- **El menú, por favor** - The menu, please
- **Quisiera...** - I would like...
- **La cuenta, por favor** - The bill, please
- **¿Qué recomienda?** - What do you recommend?',
                'order' => 1,
            ]);

        LessonContent::factory()
            ->for($lesson5)
            ->create([
                'content_type' => 'text',
                'content' => '# Shopping Vocabulary

Useful phrases for shopping:

- **¿Cuánto cuesta?** - How much does it cost?
- **¿Tiene esto en otra talla?** - Do you have this in another size?
- **Quiero comprar...** - I want to buy...
- **¿Aceptan tarjetas?** - Do you accept cards?',
                'order' => 1,
            ]);

        // Create exercises for the lessons
        $exercise = Exercise::factory()
            ->for($lesson)
            ->create([
                'title' => 'Greetings Quiz',
                'instructions' => 'Test your knowledge of Spanish greetings',
                'passing_score' => 70,
                'order' => 1,
            ]);

        $exercise2 = Exercise::factory()
            ->for($lesson2)
            ->create([
                'title' => 'Common Phrases Quiz',
                'instructions' => 'Match the phrases with their meanings',
                'passing_score' => 80,
                'order' => 1,
            ]);

        $exercise4 = Exercise::factory()
            ->for($lesson4)
            ->create([
                'title' => 'Restaurant Conversation',
                'instructions' => 'Complete the restaurant dialogue',
                'passing_score' => 75,
                'order' => 1,
            ]);

        // Create questions for exercise 1 (Greetings)
        $question = Question::factory()
            ->for($exercise)
            ->create([
                'question_type' => 'multiple_choice',
                'question_text' => 'How do you say "Hello" in Spanish?',
                'order' => 1,
            ]);

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

        $question2 = Question::factory()
            ->for($exercise)
            ->create([
                'question_type' => 'multiple_choice',
                'question_text' => 'What does "Adiós" mean?',
                'order' => 2,
            ]);

        QuestionOption::factory()->for($question2)->create([
            'option_text' => 'Hello',
            'is_correct' => false,
            'order' => 1,
        ]);

        QuestionOption::factory()->for($question2)->create([
            'option_text' => 'Goodbye',
            'is_correct' => true,
            'order' => 2,
        ]);

        QuestionOption::factory()->for($question2)->create([
            'option_text' => 'Thank you',
            'is_correct' => false,
            'order' => 3,
        ]);

        // Create questions for exercise 2 (Common Phrases)
        $question3 = Question::factory()
            ->for($exercise2)
            ->create([
                'question_type' => 'multiple_choice',
                'question_text' => 'How do you say "Thank you" in Spanish?',
                'order' => 1,
            ]);

        QuestionOption::factory()->for($question3)->create([
            'option_text' => 'Gracias',
            'is_correct' => true,
            'order' => 1,
        ]);

        QuestionOption::factory()->for($question3)->create([
            'option_text' => 'Por favor',
            'is_correct' => false,
            'order' => 2,
        ]);

        QuestionOption::factory()->for($question3)->create([
            'option_text' => 'De nada',
            'is_correct' => false,
            'order' => 3,
        ]);

        $question4 = Question::factory()
            ->for($exercise2)
            ->create([
                'question_type' => 'multiple_choice',
                'question_text' => 'What does "Por favor" mean?',
                'order' => 2,
            ]);

        QuestionOption::factory()->for($question4)->create([
            'option_text' => 'Thank you',
            'is_correct' => false,
            'order' => 1,
        ]);

        QuestionOption::factory()->for($question4)->create([
            'option_text' => 'Please',
            'is_correct' => true,
            'order' => 2,
        ]);

        QuestionOption::factory()->for($question4)->create([
            'option_text' => 'Excuse me',
            'is_correct' => false,
            'order' => 3,
        ]);

        // Create questions for exercise 4 (Restaurant)
        $question5 = Question::factory()
            ->for($exercise4)
            ->create([
                'question_type' => 'multiple_choice',
                'question_text' => 'How do you ask for the menu?',
                'order' => 1,
            ]);

        QuestionOption::factory()->for($question5)->create([
            'option_text' => 'El menú, por favor',
            'is_correct' => true,
            'order' => 1,
        ]);

        QuestionOption::factory()->for($question5)->create([
            'option_text' => 'La cuenta, por favor',
            'is_correct' => false,
            'order' => 2,
        ]);

        QuestionOption::factory()->for($question5)->create([
            'option_text' => 'Una mesa, por favor',
            'is_correct' => false,
            'order' => 3,
        ]);

        $question6 = Question::factory()
            ->for($exercise4)
            ->create([
                'question_type' => 'multiple_choice',
                'question_text' => 'How do you ask for the bill?',
                'order' => 2,
            ]);

        QuestionOption::factory()->for($question6)->create([
            'option_text' => 'El menú, por favor',
            'is_correct' => false,
            'order' => 1,
        ]);

        QuestionOption::factory()->for($question6)->create([
            'option_text' => 'La cuenta, por favor',
            'is_correct' => true,
            'order' => 2,
        ]);

        QuestionOption::factory()->for($question6)->create([
            'option_text' => '¿Qué recomienda?',
            'is_correct' => false,
            'order' => 3,
        ]);

        // Enroll the student in the course
        $student->enrolledCourses()->attach($course, [
            'enrolled_at' => now()->subDays(7),
            'progress_percentage' => 40,
        ]);

        // Create additional students for more realistic data
        $student2 = User::factory()->create([
            'name' => 'Maria Garcia',
            'email' => 'maria@example.com',
            'role' => 'student',
        ]);

        $student3 = User::factory()->create([
            'name' => 'Ahmed Hassan',
            'email' => 'ahmed@example.com',
            'role' => 'student',
        ]);

        $student2->enrolledCourses()->attach($course, [
            'enrolled_at' => now()->subDays(3),
            'progress_percentage' => 15,
        ]);

        $student3->enrolledCourses()->attach($course2, [
            'enrolled_at' => now()->subDays(5),
            'progress_percentage' => 30,
        ]);

        // Create French lesson with grammar content
        $frenchLesson = Lesson::factory()
            ->for($frenchModule)
            ->create([
                'title' => 'Le genre des noms en français',
                'description' => 'Learn about noun genders and articles in French',
                'duration_minutes' => 30,
                'order' => 1,
                'content' => '# Le genre des noms en français

En français, chaque nom a un genre : il est masculin ou féminin.

Le genre ne dépend pas toujours du sens du mot, il faut souvent l\'apprendre avec l\'article.

## 1. Les articles définis

Les articles définis servent à parler de quelque chose de précis.

- **masculin singulier : le**
  - le livre, le stylo, le chien

- **féminin singulier : la**
  - la table, la voiture, la maison

- **pluriel (masc. et fém.) : les**
  - les livres, les maisons, les enfants

Devant un nom qui commence par une voyelle (a, e, i, o, u, y) ou un h muet, on utilise **l\'** au singulier (masculin ou féminin) :

- l\'école (féminin), l\'ordinateur (masculin), l\'hôtel (masculin)

## 2. Les articles indéfinis

Les articles indéfinis servent à parler de quelque chose de non précis ou de nouveau dans le discours.

- **masculin singulier : un**
  - un livre, un garçon, un appartement

- **féminin singulier : une**
  - une chaise, une fille, une idée

- **pluriel (masc. et fém.) : des**
  - des livres, des chaises, des idées

## 3. Indices pour reconnaître le genre

Ce ne sont que des tendances, il y a des exceptions.

- **Souvent masculins** : les noms en -ment, -age, -eau
  - un appartement, un village, un château

- **Souvent féminins** : les noms en -tion, -sion, -té
  - la nation, la télévision, la liberté

Il est important d\'apprendre le nom avec son article :

- dire « le livre », « la chaise », « l\'école » et non seulement « livre », « chaise », « école ».',
            ]);

        // Create French exercise
        $frenchExercise = Exercise::factory()
            ->for($frenchLesson)
            ->create([
                'title' => 'Les articles en français - QCM',
                'instructions' => 'Questions à choix multiple sur les articles définis et indéfinis',
                'passing_score' => 70,
                'order' => 1,
            ]);

        // French Question 1
        $frenchQ1 = Question::factory()
            ->for($frenchExercise)
            ->create([
                'question_type' => 'multiple_choice',
                'question_text' => 'Quel est l\'article défini correct pour compléter la phrase : « … table est dans la cuisine. »',
                'order' => 1,
            ]);

        QuestionOption::factory()->for($frenchQ1)->create([
            'option_text' => 'le',
            'is_correct' => false,
            'order' => 1,
        ]);

        QuestionOption::factory()->for($frenchQ1)->create([
            'option_text' => 'la',
            'is_correct' => true,
            'order' => 2,
        ]);

        QuestionOption::factory()->for($frenchQ1)->create([
            'option_text' => 'un',
            'is_correct' => false,
            'order' => 3,
        ]);

        // French Question 2
        $frenchQ2 = Question::factory()
            ->for($frenchExercise)
            ->create([
                'question_type' => 'multiple_choice',
                'question_text' => 'Quel article indéfini complète correctement : « J\'achète … ordinateur. »',
                'order' => 2,
            ]);

        QuestionOption::factory()->for($frenchQ2)->create([
            'option_text' => 'une',
            'is_correct' => false,
            'order' => 1,
        ]);

        QuestionOption::factory()->for($frenchQ2)->create([
            'option_text' => 'un',
            'is_correct' => true,
            'order' => 2,
        ]);

        QuestionOption::factory()->for($frenchQ2)->create([
            'option_text' => 'des',
            'is_correct' => false,
            'order' => 3,
        ]);

        // French Question 3
        $frenchQ3 = Question::factory()
            ->for($frenchExercise)
            ->create([
                'question_type' => 'multiple_choice',
                'question_text' => 'Choisissez la phrase correcte.',
                'order' => 3,
            ]);

        QuestionOption::factory()->for($frenchQ3)->create([
            'option_text' => 'Le liberté est importante.',
            'is_correct' => false,
            'order' => 1,
        ]);

        QuestionOption::factory()->for($frenchQ3)->create([
            'option_text' => 'La liberté est importante.',
            'is_correct' => true,
            'order' => 2,
        ]);

        QuestionOption::factory()->for($frenchQ3)->create([
            'option_text' => 'Une liberté est importante.',
            'is_correct' => false,
            'order' => 3,
        ]);

        // Lesson 1: Completed with passing score
        LessonProgress::factory()
            ->for($student, 'user')
            ->for($lesson)
            ->create([
                'is_completed' => true,
                'completed_at' => now()->subDays(5),
                'attempts' => 1,
                'views' => 3,
                'best_score' => 100.0,
            ]);

        ExerciseAttempt::factory()
            ->for($student, 'user')
            ->for($exercise)
            ->create([
                'score' => 100,
                'max_score' => 100,
                'is_passed' => true,
                'attempt_number' => 1,
                'answers' => [
                    $question->id => $question->options()->where('is_correct', true)->first()->id,
                    $question2->id => $question2->options()->where('is_correct', true)->first()->id,
                ],
            ]);

        // Lesson 2: Attempted but failed, then passed on second try
        LessonProgress::factory()
            ->for($student, 'user')
            ->for($lesson2)
            ->create([
                'is_completed' => true,
                'completed_at' => now()->subDays(3),
                'attempts' => 2,
                'views' => 5,
                'best_score' => 100.0,
            ]);

        // First attempt - failed
        ExerciseAttempt::factory()
            ->for($student, 'user')
            ->for($exercise2)
            ->create([
                'score' => 50,
                'max_score' => 100,
                'is_passed' => false,
                'attempt_number' => 1,
                'answers' => [
                    $question3->id => $question3->options()->where('is_correct', false)->first()->id,
                    $question4->id => $question4->options()->where('is_correct', false)->first()->id,
                ],
                'created_at' => now()->subDays(3)->subHours(2),
            ]);

        // Second attempt - passed
        ExerciseAttempt::factory()
            ->for($student, 'user')
            ->for($exercise2)
            ->create([
                'score' => 100,
                'max_score' => 100,
                'is_passed' => true,
                'attempt_number' => 2,
                'answers' => [
                    $question3->id => $question3->options()->where('is_correct', true)->first()->id,
                    $question4->id => $question4->options()->where('is_correct', true)->first()->id,
                ],
                'created_at' => now()->subDays(3),
            ]);

        // Lesson 3: Viewed but not completed (no exercises, just content)
        LessonProgress::factory()
            ->for($student, 'user')
            ->for($lesson3)
            ->create([
                'is_completed' => true,
                'completed_at' => now()->subDays(2),
                'attempts' => 0,
                'views' => 1,
                'best_score' => null,
            ]);

        // Lesson 4: Currently failing
        LessonProgress::factory()
            ->for($student, 'user')
            ->for($lesson4)
            ->create([
                'is_completed' => false,
                'completed_at' => null,
                'attempts' => 1,
                'views' => 2,
                'best_score' => 50.0,
            ]);

        ExerciseAttempt::factory()
            ->for($student, 'user')
            ->for($exercise4)
            ->create([
                'score' => 50,
                'max_score' => 100,
                'is_passed' => false,
                'attempt_number' => 1,
                'answers' => [
                    $question5->id => $question5->options()->where('is_correct', false)->first()->id,
                    $question6->id => $question6->options()->where('is_correct', true)->first()->id,
                ],
            ]);

        // Student 2 progress - just started
        LessonProgress::factory()
            ->for($student2, 'user')
            ->for($lesson)
            ->create([
                'is_completed' => true,
                'completed_at' => now()->subDays(2),
                'attempts' => 1,
                'views' => 2,
                'best_score' => 100.0,
            ]);

        ExerciseAttempt::factory()
            ->for($student2, 'user')
            ->for($exercise)
            ->create([
                'score' => 100,
                'max_score' => 100,
                'is_passed' => true,
                'attempt_number' => 1,
                'answers' => [
                    $question->id => $question->options()->where('is_correct', true)->first()->id,
                    $question2->id => $question2->options()->where('is_correct', true)->first()->id,
                ],
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
                'created_at' => now()->subDays(2),
            ]);

        $message2 = Message::factory()
            ->for($conversation)
            ->for($teacher, 'sender')
            ->create([
                'message' => 'Of course! What would you like to know?',
                'is_read' => true,
                'created_at' => now()->subDays(2)->addHours(1),
            ]);

        $message3 = Message::factory()
            ->for($conversation)
            ->for($student, 'sender')
            ->create([
                'message' => 'I\'m struggling with the pronunciation of "ll" in Spanish. Can you help?',
                'is_read' => false,
                'created_at' => now()->subHours(3),
            ]);

        // Create another conversation
        $conversation2 = Conversation::factory()
            ->for($student2, 'student')
            ->for($teacher, 'teacher')
            ->create();

        $message4 = Message::factory()
            ->for($conversation2)
            ->for($student2, 'sender')
            ->create([
                'message' => 'Hi! When will the next module be available?',
                'is_read' => false,
                'created_at' => now()->subHours(1),
            ]);

        // Update conversations with last messages
        $conversation->update([
            'last_message_id' => $message3->id,
            'last_message_at' => $message3->created_at,
        ]);

        $conversation2->update([
            'last_message_id' => $message4->id,
            'last_message_at' => $message4->created_at,
        ]);

        $this->command->info('Database seeded successfully!');
        $this->command->info('Created:');
        $this->command->info('- 6 Users (1 admin, 2 teachers, 3 students)');
        $this->command->info('- 2 Languages (Spanish, French)');
        $this->command->info('- 2 Courses with modules and lessons');
        $this->command->info('- 6 Lessons with content and exercises');
        $this->command->info('- 4 Exercises with multiple questions');
        $this->command->info('- Realistic progress tracking with attempts and scores');
        $this->command->info('- 2 Conversations with messages');
        $this->command->info('');
        $this->command->info('Login credentials:');
        $this->command->info('Student: student@example.com / password');
        $this->command->info('Student 2: maria@example.com / password');
        $this->command->info('Student 3: ahmed@example.com / password');
        $this->command->info('Teacher: teacher@example.com / password');
        $this->command->info('French Teacher: marie@example.com / password');
        $this->command->info('Admin: admin@example.com / password');
    }
}
