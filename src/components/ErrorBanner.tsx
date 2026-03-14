"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Displays an error banner and automatically retries (refreshes server data)
 * after 5 seconds by calling router.refresh().
 */
export function ErrorBanner() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.refresh();
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div
      role="alert"
      className="bg-red-50 border border-red-200 text-error rounded-lg px-4 py-3 mb-6 text-[14px]"
    >
      Couldn&apos;t load stats. Retrying&hellip;
    </div>
  );
}
