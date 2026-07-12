import type { ButtonHTMLAttributes } from "react";

const variantClasses = {
  primary:
    "bg-action text-action-foreground hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-60",
  secondary: "bg-surface-subtle text-foreground hover:bg-highlight",
} as const;

const sizeClasses = {
  default: "rounded-full px-7 py-4 text-base",
  compact: "rounded-xl px-4 py-2 text-sm",
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: keyof typeof sizeClasses;
  variant?: keyof typeof variantClasses;
}

export function Button({
  className,
  size = "default",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  const classes = [
    "font-semibold whitespace-nowrap transition-colors",
    variantClasses[variant],
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <button className={classes} type={type} {...props} />;
}
