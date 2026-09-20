import React, { useState } from 'react';

interface ItemIconProps {
  id: string;
  fallbackEmoji: string;
  name?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ItemIcon: React.FC<ItemIconProps> = ({
  id,
  fallbackEmoji,
  name,
  className = '',
  size = 'md'
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-5 h-5 text-sm',
    md: 'w-8 h-8 text-2xl',
    lg: 'w-12 h-12 text-3xl'
  };

  // Intentar cargar la imagen oficial si está disponible en /items/[id].png o .webp
  const imageSrc = `./items/${id}.png`;

  if (!imageError) {
    return (
      <span className={`inline-flex items-center justify-center flex-shrink-0 ${className}`}>
        <img
          src={imageSrc}
          alt={name || id}
          className={`${sizeClasses[size]} object-contain`}
          onError={() => setImageError(true)}
          loading="lazy"
        />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}
      role="img"
      aria-label={name || id}
    >
      {fallbackEmoji}
    </span>
  );
};
