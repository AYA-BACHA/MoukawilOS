"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // When pathname changes, complete and reset
    if (loading) {
      const timer = setTimeout(() => {
        setProgress(100);
        setTimeout(() => {
          setLoading(false);
          setProgress(0);
        }, 300);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [pathname, loading]);

  useEffect(() => {
    // Intercept clicks on links to start progress bar immediately
    function handleAnchorClick(event: MouseEvent) {
      const target = (event.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("javascript:")) {
        return;
      }

      if (href === pathname) return;

      // Start progress animation
      setLoading(true);
      setProgress(25);

      const t1 = setTimeout(() => setProgress(65), 150);
      const t2 = setTimeout(() => setProgress(85), 350);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }

    document.addEventListener("click", handleAnchorClick, { capture: true });
    return () => document.removeEventListener("click", handleAnchorClick, { capture: true });
  }, [pathname]);

  if (!loading && progress === 0) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[9999] h-1 overflow-hidden pointer-events-none bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-teal via-emerald-400 to-primary transition-all duration-300 ease-out shadow-[0_0_12px_rgba(13,148,136,0.8)]"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transition: progress === 100 ? "width 200ms ease-out, opacity 300ms ease-in" : "width 300ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />
    </div>
  );
}
