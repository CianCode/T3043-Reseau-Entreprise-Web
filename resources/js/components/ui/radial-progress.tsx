import { cn } from '@/lib/utils';

interface RadialProgressProps {
    percentage: number;
    size?: number;
    strokeWidth?: number;
    variant?: 'success' | 'danger' | 'neutral';
    showPercentage?: boolean;
    className?: string;
}

export function RadialProgress({
    percentage,
    size = 32,
    strokeWidth = 3,
    variant = 'neutral',
    showPercentage = true,
    className,
}: RadialProgressProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    const variantColors = {
        success: {
            circle: 'stroke-green-500 dark:stroke-green-400',
            text: 'text-green-600 dark:text-green-400',
        },
        danger: {
            circle: 'stroke-red-500 dark:stroke-red-400',
            text: 'text-red-600 dark:text-red-400',
        },
        neutral: {
            circle: 'stroke-gray-400 dark:stroke-gray-500',
            text: 'text-gray-600 dark:text-gray-400',
        },
    };

    const colors = variantColors[variant];

    return (
        <div className={cn('relative inline-flex items-center justify-center', className)}>
            <svg
                width={size}
                height={size}
                className="transform -rotate-90"
            >
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    className="stroke-gray-200 dark:stroke-gray-700"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={cn('transition-all duration-300', colors.circle)}
                />
            </svg>
            {showPercentage && (
                <span
                    className={cn(
                        'absolute text-[10px] font-semibold',
                        colors.text,
                    )}
                >
                    {Math.round(percentage)}%
                </span>
            )}
        </div>
    );
}
