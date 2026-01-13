import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface IconWrapperProps {
  icon: LucideIcon;
  variant?: 'default' | 'soft' | 'minimal' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const IconWrapper = ({ 
  icon: Icon, 
  variant = 'default', 
  size = 'md', 
  color = 'primary',
  className 
}: IconWrapperProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const colorClasses = {
    primary: {
      default: 'bg-primary/10 text-primary border-primary/20',
      soft: 'bg-primary/5 text-primary/80',
      minimal: 'text-primary/70',
      gradient: 'bg-gradient-to-br from-primary/10 to-primary/20 text-primary'
    },
    secondary: {
      default: 'bg-secondary/10 text-secondary border-secondary/20',
      soft: 'bg-secondary/5 text-secondary/80',
      minimal: 'text-secondary/70',
      gradient: 'bg-gradient-to-br from-secondary/10 to-secondary/20 text-secondary'
    },
    success: {
      default: 'bg-green-50 text-green-600 border-green-200',
      soft: 'bg-green-25 text-green-500',
      minimal: 'text-green-500',
      gradient: 'bg-gradient-to-br from-green-50 to-green-100 text-green-600'
    },
    warning: {
      default: 'bg-amber-50 text-amber-600 border-amber-200',
      soft: 'bg-amber-25 text-amber-500',
      minimal: 'text-amber-500',
      gradient: 'bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600'
    },
    danger: {
      default: 'bg-red-50 text-red-600 border-red-200',
      soft: 'bg-red-25 text-red-500',
      minimal: 'text-red-500',
      gradient: 'bg-gradient-to-br from-red-50 to-red-100 text-red-600'
    },
    info: {
      default: 'bg-blue-50 text-blue-600 border-blue-200',
      soft: 'bg-blue-25 text-blue-500',
      minimal: 'text-blue-500',
      gradient: 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600'
    }
  };

  const baseClasses = variant === 'minimal' 
    ? '' 
    : 'rounded-xl flex items-center justify-center transition-all duration-200';

  const variantClasses = variant !== 'minimal' ? 'border' : '';

  return (
    <div className={cn(
      baseClasses,
      sizeClasses[size],
      colorClasses[color][variant],
      variantClasses,
      className
    )}>
      <Icon className={iconSizes[size]} strokeWidth={1.5} />
    </div>
  );
};

export default IconWrapper;