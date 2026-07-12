import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  const classes = [
    "rounded-full border border-border-strong bg-surface px-6 py-4 text-base text-foreground transition-colors placeholder:text-foreground-muted focus-visible:border-focus",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <input className={classes} {...props} />;
}
