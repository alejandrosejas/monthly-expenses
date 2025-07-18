import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  count?: number;
}

/**
 * Skeleton component for loading states
 */
const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  circle = false,
  count = 1,
}) => {
  const style: React.CSSProperties = {
    width: width,
    height: height,
    borderRadius: circle ? '50%' : '0.25rem',
  };

  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700';
  const classes = `${baseClasses} ${className}`;

  return (
    <>
      {Array(count)
        .fill(0)
        .map((_, index) => (
          <div key={index} className={classes} style={style} />
        ))}
    </>
  );
};

/**
 * Skeleton for text lines
 */
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array(lines)
        .fill(0)
        .map((_, index) => (
          <Skeleton
            key={index}
            className="h-4 rounded"
            width={index === lines - 1 && lines > 1 ? '80%' : '100%'}
          />
        ))}
    </div>
  );
};

/**
 * Skeleton for a card
 */
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`p-4 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
      <div className="flex items-center space-x-4 mb-4">
        <Skeleton circle height={40} width={40} />
        <div className="flex-1">
          <Skeleton className="h-4 mb-2 rounded" width="70%" />
          <Skeleton className="h-3 rounded" width="40%" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
};

/**
 * Skeleton for a table row
 */
export const SkeletonTableRow: React.FC<{ columns?: number; className?: string }> = ({
  columns = 4,
  className = '',
}) => {
  return (
    <div className={`flex space-x-4 py-3 ${className}`}>
      {Array(columns)
        .fill(0)
        .map((_, index) => (
          <Skeleton
            key={index}
            className="h-4 rounded flex-1"
            width={`${100 / columns}%`}
          />
        ))}
    </div>
  );
};

/**
 * Skeleton for a table
 */
export const SkeletonTable: React.FC<{ rows?: number; columns?: number; className?: string }> = ({
  rows = 5,
  columns = 4,
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <SkeletonTableRow columns={columns} className="border-b border-gray-200 dark:border-gray-700 pb-2" />
      {Array(rows)
        .fill(0)
        .map((_, index) => (
          <SkeletonTableRow key={index} columns={columns} />
        ))}
    </div>
  );
};

export default Skeleton;