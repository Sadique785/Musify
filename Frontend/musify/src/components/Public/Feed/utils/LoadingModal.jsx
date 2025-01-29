import React from 'react';
import { Circle } from 'lucide-react';

const LoadingModal = ({ isOpen, currentStep, uploadProgress }) => {
  if (!isOpen) return null;

  const steps = [
    { id: 'verify', label: 'Verifying session...' },
    { id: 'upload', label: 'Uploading to cloud...' },
    { id: 'save', label: 'Saving changes...' }
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 flex flex-col items-center">
        {/* Progress Circle */}
        <div className="relative w-20 h-20 mb-4">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              className="text-gray-200"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r="42"
              cx="50"
              cy="50"
            />
            <circle
              className="text-blue-600"
              strokeWidth="8"
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="42"
              cx="50"
              cy="50"
              strokeDasharray="264"
              strokeDashoffset={264 - (uploadProgress / 100) * 264}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-semibold">{Math.round(uploadProgress)}%</span>
          </div>
        </div>

        {/* Steps */}
        <div className="w-full space-y-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center space-x-2 ${
                index <= getCurrentStepIndex() ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <Circle 
                className={`w-4 h-4 ${
                  index < getCurrentStepIndex() ? 'fill-blue-600' : 'fill-transparent'
                }`}
              />
              <span className="text-sm">{step.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingModal;