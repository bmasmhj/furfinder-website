import React from 'react';

interface AlertProps {
  children: React.ReactNode;
  type?: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  onClose?: () => void;
}

export default function Alert({ children, type = 'info', title, onClose }: AlertProps) {
  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const icons = {
    success: '✓',
    warning: '⚠',
    error: '✕',
    info: 'ℹ',
  };

  return (
    <div className={`border p-4 rounded-lg ${styles[type]}`}>
      <div className="flex items-start justify-between">
        <div>
          {title && <h3 className="font-semibold mb-1">{title}</h3>}
          <p className="text-sm">{children}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-lg font-bold opacity-70 hover:opacity-100 transition"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
