import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export default function Input({
  label,
  error,
  helpText,
  id,
  ...props
}: InputProps) {
  const inputId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-neutral-900 mb-2">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 transition ${
          error
            ? 'border-error focus:ring-error'
            : 'border-neutral-300 focus:ring-brand-600'
        }`}
        {...props}
      />
      {error && <p className="text-sm text-error mt-1">{error}</p>}
      {helpText && <p className="text-sm text-neutral-600 mt-1">{helpText}</p>}
    </div>
  );
}
