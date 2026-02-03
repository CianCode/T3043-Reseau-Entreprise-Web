import { Trash2, Plus, X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import InputError from '@/components/input-error';

type QuestionOption = {
    id?: number;
    option_text: string;
    is_correct: boolean;
};

type Question = {
    id?: number;
    question_text: string;
    options: QuestionOption[];
};

type QuestionCardProps = {
    question: Question;
    index: number;
    onUpdate: (index: number, question: Question) => void;
    onRemove: (index: number) => void;
    errors?: Record<string, string>;
};

export function QuestionCard({
    question,
    index,
    onUpdate,
    onRemove,
    errors = {},
}: QuestionCardProps) {
    const updateQuestionText = (text: string) => {
        onUpdate(index, { ...question, question_text: text });
    };

    const updateOption = (
        optionIndex: number,
        updates: Partial<QuestionOption>,
    ) => {
        const newOptions = [...question.options];
        newOptions[optionIndex] = { ...newOptions[optionIndex], ...updates };
        onUpdate(index, { ...question, options: newOptions });
    };

    const setCorrectAnswer = (optionIndex: number) => {
        const newOptions = question.options.map((opt, idx) => ({
            ...opt,
            is_correct: idx === optionIndex,
        }));
        onUpdate(index, { ...question, options: newOptions });
    };

    const addOption = () => {
        const newOptions = [
            ...question.options,
            { option_text: '', is_correct: false },
        ];
        onUpdate(index, { ...question, options: newOptions });
    };

    const removeOption = (optionIndex: number) => {
        if (question.options.length <= 2) return; // Minimum 2 options
        const newOptions = question.options.filter(
            (_, idx) => idx !== optionIndex,
        );
        onUpdate(index, { ...question, options: newOptions });
    };

    return (
        <Card className="relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                    <GripVertical className="h-5 w-5 cursor-move text-muted-foreground" />
                    <h3 className="font-semibold">Question {index + 1}</h3>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(index)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor={`question-${index}-text`}>
                        Question Text
                    </Label>
                    <Input
                        id={`question-${index}-text`}
                        value={question.question_text}
                        onChange={(e) => updateQuestionText(e.target.value)}
                        placeholder="Enter your question..."
                        required
                    />
                    <InputError
                        message={errors[`questions.${index}.question_text`]}
                    />
                </div>

                <div className="space-y-3">
                    <Label>Answer Options</Label>
                    {question.options.map((option, optionIndex) => (
                        <div
                            key={optionIndex}
                            className="flex items-start gap-2"
                        >
                            <input
                                type="radio"
                                name={`question-${index}-correct`}
                                checked={option.is_correct}
                                onChange={() => setCorrectAnswer(optionIndex)}
                                className="mt-2.5 h-4 w-4 cursor-pointer"
                                title="Mark as correct answer"
                            />
                            <div className="flex-1 space-y-1">
                                <Input
                                    value={option.option_text}
                                    onChange={(e) =>
                                        updateOption(optionIndex, {
                                            option_text: e.target.value,
                                        })
                                    }
                                    placeholder={`Option ${optionIndex + 1}`}
                                    required
                                />
                                <InputError
                                    message={
                                        errors[
                                            `questions.${index}.options.${optionIndex}.option_text`
                                        ]
                                    }
                                />
                            </div>
                            {question.options.length > 2 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeOption(optionIndex)}
                                    className="mt-0.5 h-8 w-8 p-0"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                    <InputError
                        message={errors[`questions.${index}.options`]}
                    />
                </div>

                {question.options.length < 6 && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addOption}
                        className="w-full"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Option
                    </Button>
                )}

                {!question.options.some((opt) => opt.is_correct) && (
                    <p className="text-sm text-destructive">
                        Please select the correct answer
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
