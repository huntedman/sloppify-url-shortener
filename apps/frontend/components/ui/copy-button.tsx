"use client";

import { useState } from "react";

import { Button } from "./button";

interface CopyButtonProps {
  value: string;
}

export function CopyButton({ value }: CopyButtonProps) {
  const [label, setLabel] = useState("Copy");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setLabel("Copied");
    } catch {
      setLabel("Copy failed");
    }
  }

  return (
    <Button
      aria-live="polite"
      onClick={handleCopy}
      size="compact"
      variant="secondary"
    >
      {label}
    </Button>
  );
}
