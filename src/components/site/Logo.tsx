import Image from "next/image";
import { cn } from "@/lib/utils";

/** FINETHY wordmark (296×67 source). */
export function Logo({ className, priority }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src="/logo.png"
      alt="FINETHY: Plan. Protect. Prosper."
      width={296}
      height={67}
      priority={priority}
      className={cn("h-10 w-auto", className)}
    />
  );
}
