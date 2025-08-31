<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCityDistanceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'travel_time_hours' => 'sometimes|numeric|min:0|max:999.99',
            'notes' => 'nullable|string|max:1000'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'travel_time_hours.numeric' => 'وقت السفر يجب أن يكون رقم',
            'travel_time_hours.min' => 'وقت السفر لا يمكن أن يكون سالب',
            'travel_time_hours.max' => 'وقت السفر لا يجب أن يتجاوز 999.99 ساعة',
            'notes.max' => 'الملاحظات لا يجب أن تتجاوز 1000 حرف',
        ];
    }
}