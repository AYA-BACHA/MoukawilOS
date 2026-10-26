import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5", className)}>
      <span className={cn("grid shrink-0 place-items-center", light && "size-9 rounded-xl bg-white")}>
        <Image src="/brand/monogram.png" alt="" width={light ? 26 : 32} height={light ? 26 : 32} priority />
      </span>
      <span className={cn("text-base font-extrabold tracking-tight", light ? "text-white" : "text-ink")}>MoukawilOS</span>
    </Link>
  );
}
