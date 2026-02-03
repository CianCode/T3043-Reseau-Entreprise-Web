<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLessonRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $lesson = $this->route('lesson');

        return $this->user()?->role === 'teacher' && $lesson?->module->course->teacher_id === $this->user()?->id;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'content' => ['nullable', 'string'],
            'duration_minutes' => ['nullable', 'integer', 'min:1'],
            'questions' => ['nullable', 'array'],
            'questions.*.id' => ['nullable', 'integer', 'exists:questions,id'],
            'questions.*.question_text' => ['required', 'string'],
            'questions.*.options' => ['required', 'array', 'min:2'],
            'passing_score' => ['nullable', 'integer', 'min:1'],
            'questions.*.options.*.id' => ['nullable', 'integer', 'exists:question_options,id'],
            'questions.*.options.*.option_text' => ['required', 'string'],
            'questions.*.options.*.is_correct' => ['required', 'boolean'],
        ];
    }

    /**
     * Get custom error messages for validator.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.required' => 'The lesson title is required.',
            'duration_minutes.min' => 'Duration must be at least 1 minute.',
        ];
    }
}
