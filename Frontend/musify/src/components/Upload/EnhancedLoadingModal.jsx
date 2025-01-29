import React from 'react';

const EnhancedLoadingModal = ({ isOpen, currentStep, uploadProgress }) => {
  if (!isOpen) return null;

  const steps = [
    { id: 'verify', label: 'Verifying session' },
    { id: 'upload', label: 'Uploading to cloud' },
    { id: 'save', label: 'Saving changes' }
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-96 p-6 shadow-xl">
        {/* Main Progress Circle */}
        <div className="flex justify-center mb-8">
          <div className="relative w-32 h-32">
            {/* Background circle */}
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                className="text-gray-200"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                r="46"
                cx="50"
                cy="50"
              />
              {/* Animated progress circle */}
              <circle
                className="text-blue-500 transition-all duration-500 ease-in-out"
                strokeWidth="4"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                r="46"
                cx="50"
                cy="50"
                strokeDasharray="289"
                strokeDashoffset={289 - (uploadProgress / 100) * 289}
              />
            </svg>
            {/* Centered percentage */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-blue-500">
                {Math.round(uploadProgress)}%
              </span>
              <span className="text-sm text-gray-500">Uploading...</span>
            </div>
          </div>
        </div>

        {/* Steps Progress */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const currentIndex = getCurrentStepIndex();
            const isCompleted = index < currentIndex;
            const isActive = index === currentIndex;

            return (
              <div key={step.id} className="relative">
                {/* Progress bar connecting steps */}
                {index < steps.length - 1 && (
                  <div className="absolute left-4 ml-[3px] top-7 w-[2px] h-6">
                    <div
                      className={`w-full h-full transition-colors duration-300 ${
                        isCompleted ? 'bg-blue-500' : 'bg-gray-200'
                      }`}
                    />
                  </div>
                )}
                
                {/* Step item */}
                <div className="flex items-center space-x-3">
                  <div 
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center
                    ${isCompleted ? 'border-blue-500 bg-blue-50' : 
                      isActive ? 'border-blue-500 animate-pulse' : 'border-gray-200'}`}
                  >
                    {isCompleted ? (
                      <svg 
                        className="w-5 h-5 text-blue-500" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M5 13l4 4L19 7" 
                        />
                      </svg>
                    ) : (
                      <div 
                        className={`w-2 h-2 rounded-full 
                        ${isActive ? 'bg-blue-500' : 'bg-gray-200'}`}
                      />
                    )}
                  </div>
                  <span 
                    className={`text-sm font-medium
                    ${isCompleted || isActive ? 'text-gray-900' : 'text-gray-400'}`}
                  >
                    {step.label}
                    {isActive && <span className="animate-pulse">...</span>}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EnhancedLoadingModal;