<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCourseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->role === 'teacher';
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'language_id' => ['required', 'exists:languages,id'],
            'level' => ['required', Rule::in(['beginner', 'intermediate', 'advanced'])],
            'thumbnail' => ['nullable', 'string', 'max:255'],
            'is_published' => ['boolean'],
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
            'title.required' => 'The course title is required.',
            'language_id.required' => 'Please select a language for this course.',
            'language_id.exists' => 'The selected language is invalid.',
            'level.required' => 'Please select a difficulty level.',
            'level.in' => 'The level must be beginner, intermediate, or advanced.',
        ];
    }
}
