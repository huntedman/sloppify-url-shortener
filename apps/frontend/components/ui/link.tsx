import NextLink from "next/link";
import type { ComponentProps } from "react";

const variantClasses = {
  default: "text-sm font-medium text-link hover:text-link-hover",
  brand:
    "font-serif text-5xl font-medium tracking-tight text-foreground hover:text-foreground sm:text-6xl",
} as const;

type LinkProps = ComponentProps<typeof NextLink> & {
  variant?: keyof typeof variantClasses;
};

export function Link({ className, variant = "default", ...props }: LinkProps) {
  const classes = ["transition-colors", variantClasses[variant], className]
    .filter(Boolean)
    .join(" ");

  return <NextLink className={classes} {...props} />;
}
