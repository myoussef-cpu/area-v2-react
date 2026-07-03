import { cn } from '../lib/cn';

interface LabelProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'text-xs font-semibold tracking-wide',
  md: 'text-sm font-bold',
  lg: 'text-lg font-bold',
};

export function Label({ children, className, as: Tag = 'h3', size = 'md' }: LabelProps) {
  return (
    <Tag className={cn('text-[#1c1c1e] dark:text-white', sizeClasses[size], className)}>
      {children}
    </Tag>
  );
}
