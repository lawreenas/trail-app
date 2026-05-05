import { type ButtonHTMLAttributes, forwardRef } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  size?: 'sm' | 'md';
  variant?: 'glass' | 'ghost' | 'solid';
}

export const IconButton = forwardRef<HTMLButtonElement, Props>(function IconButton(
  { active, size = 'md', variant = 'ghost', className = '', ...rest },
  ref,
) {
  const sizeClass = size === 'sm' ? 'w-8 h-8' : 'w-9 h-9';
  const variantClass =
    variant === 'glass'
      ? `bg-black/60 backdrop-blur-md border border-white/10 hover:bg-black/80 ${active ? 'text-primary border-primary/40' : 'text-white'}`
      : variant === 'solid'
      ? `${active ? 'bg-primary text-primary-foreground' : 'bg-white/[0.06] hover:bg-white/[0.10] text-white'}`
      : `${active ? 'text-primary' : 'text-gray-400 hover:text-white'} hover:bg-white/[0.06]`;
  return (
    <button
      ref={ref}
      type="button"
      className={`flex items-center justify-center rounded-md transition-colors ${sizeClass} ${variantClass} ${className}`}
      {...rest}
    />
  );
});
