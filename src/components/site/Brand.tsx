import { GraduationCap } from "lucide-react";

export function BrandMark({ size = 8 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-xl bg-gradient-primary shadow-glow"
      style={{ height: `${size * 0.25}rem`, width: `${size * 0.25}rem` }}
    >
      <GraduationCap className="h-4 w-4 text-primary-foreground" />
    </span>
  );
}

export function BrandWordmark() {
  return (
    <span className="font-semibold tracking-tight">
      Uppseekers <span className="text-muted-foreground font-normal">— Common Admission App</span>
    </span>
  );
}

export function BrandShort() {
  return (
    <span className="font-semibold tracking-tight">
      Uppseekers <span className="text-gradient">CAA</span>
    </span>
  );
}
