import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  label: string;
  status: 'completed' | 'current' | 'upcoming';
  description?: string;
}

interface ProgressStepperProps {
  steps: Step[];
  orientation?: 'horizontal' | 'vertical';
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({ 
  steps, 
  orientation = 'horizontal' 
}) => {
  if (orientation === 'vertical') {
    return (
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step.status === 'completed'
                    ? 'bg-green-600 text-white'
                    : step.status === 'current'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}
              >
                {step.status === 'completed' ? (
                  <Check size={20} />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div className="w-0.5 h-12 bg-gray-200 dark:bg-gray-700 mt-2" />
              )}
            </div>
            <div className="flex-1 pb-8">
              <p
                className={`${
                  step.status === 'upcoming'
                    ? 'text-gray-500 dark:text-gray-400'
                    : 'text-gray-800 dark:text-white'
                }`}
              >
                {step.label}
              </p>
              {step.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Horizontal orientation
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className="flex flex-col items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step.status === 'completed'
                  ? 'bg-green-600 text-white'
                  : step.status === 'current'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}
            >
              {step.status === 'completed' ? (
                <Check size={20} />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <p
              className={`mt-2 text-center ${
                step.status === 'upcoming'
                  ? 'text-gray-500 dark:text-gray-400'
                  : 'text-gray-800 dark:text-white'
              }`}
            >
              {step.label}
            </p>
            {step.description && (
              <p className="text-gray-600 dark:text-gray-400 text-center mt-1">
                {step.description}
              </p>
            )}
          </div>
          {index < steps.length - 1 && (
            <div
              className={`h-0.5 flex-1 ${
                steps[index + 1].status === 'completed'
                  ? 'bg-green-600'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
