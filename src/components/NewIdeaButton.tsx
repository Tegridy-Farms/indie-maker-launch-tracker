"use client";

import { useDrawer } from "@/components/AppShell";

/**
 * NewIdeaButton — a client component that opens the IdeaFormDrawer in create
 * mode. Used in page headers (server components can render this since it's a
 * client component leaf).
 */
export function NewIdeaButton() {
  const { openCreate } = useDrawer();

  return (
    <button
      type="button"
      onClick={openCreate}
      className="bg-primary hover:bg-primary-hover text-white text-[14px] font-medium py-2 px-4 rounded-lg transition-colors"
    >
      New Idea
    </button>
  );
}
