import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`bg-white p-6 rounded-lg border border-neutral-200 ${
        hover ? 'hover:shadow-lg transition' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
