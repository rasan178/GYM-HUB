import { useState } from 'react';
import { Check, X } from 'lucide-react';

const ToggleInput = ({ 
  value = false, 
  onChange, 
  disabled = false, 
  size = 'md',
  label = '',
  description = '',
  onColor = 'bg-green-500',
  offColor = 'bg-gray-300',
  className = ''
}) => {
  const [isToggled, setIsToggled] = useState(value);

  const handleToggle = () => {
    if (disabled) return;
    const newValue = !isToggled;
    setIsToggled(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-4',
    md: 'w-12 h-6',
    lg: 'w-16 h-8'
  };

  const thumbSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-7 h-7'
  };

  const thumbTranslateClasses = {
    sm: isToggled ? 'translate-x-4' : 'translate-x-0.5',
    md: isToggled ? 'translate-x-6' : 'translate-x-0.5',
    lg: isToggled ? 'translate-x-8' : 'translate-x-0.5'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          relative inline-flex items-center rounded-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          ${sizeClasses[size]}
          ${isToggled ? onColor : offColor}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}
        `}
      >
        <span
          className={`
            inline-block rounded-full bg-white shadow-lg transform transition-transform duration-200 ease-in-out flex items-center justify-center
            ${thumbSizeClasses[size]}
            ${thumbTranslateClasses[size]}
          `}
        >
          {size !== 'sm' && (
            <>
              {isToggled ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : (
                <X className="w-3 h-3 text-gray-600" />
              )}
            </>
          )}
        </span>
      </button>
      
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className={`font-medium text-gray-900 ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'}`}>
              {label}
            </span>
          )}
          {description && (
            <span className={`text-gray-500 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ToggleInput;
