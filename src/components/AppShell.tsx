"use client";

import { useState, useCallback, createContext, useContext } from "react";
import { NavBar } from "@/components/NavBar";
import { IdeaFormDrawer } from "@/components/IdeaFormDrawer";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import type { Idea } from "@/types/idea";

// ─── Drawer context ───────────────────────────────────────────────────────────

interface DrawerContextValue {
  openCreate: () => void;
  openEdit: (idea: Idea) => void;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

/**
 * useDrawer — access the IdeaFormDrawer opener from any client component in
 * the tree. Must be used inside <AppShellWithContext>.
 */
export function useDrawer(): DrawerContextValue {
  const ctx = useContext(DrawerContext);
  if (!ctx) {
    throw new Error("useDrawer must be used inside AppShellWithContext");
  }
  return ctx;
}

// ─── AppShellWithContext ──────────────────────────────────────────────────────

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * AppShellWithContext — client-side wrapper that:
 * 1. Holds the IdeaFormDrawer state at the layout level (persists across routes).
 * 2. Wires the NavBar "New Idea" button and the `N` keyboard shortcut to open
 *    the drawer in create mode.
 * 3. Provides DrawerContext so child components (IdeaRow, RecentActivity, etc.)
 *    can call openEdit() / openCreate() directly.
 */
export function AppShellWithContext({ children }: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
  const [editIdea, setEditIdea] = useState<Partial<Idea> | undefined>(undefined);

  const openCreate = useCallback(() => {
    setDrawerMode("create");
    setEditIdea(undefined);
    setDrawerOpen(true);
  }, []);

  const openEdit = useCallback((idea: Idea) => {
    setDrawerMode("edit");
    setEditIdea(idea);
    setDrawerOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  // Keyboard shortcut: N opens create-mode drawer (only when not in an input
  // and the drawer is not already open)
  useKeyboardShortcut("n", openCreate, !drawerOpen);

  return (
    <DrawerContext.Provider value={{ openCreate, openEdit }}>
      <NavBar onNewIdea={openCreate} />
      <main>{children}</main>

      <IdeaFormDrawer
        isOpen={drawerOpen}
        onClose={handleClose}
        mode={drawerMode}
        initialValues={editIdea}
      />
    </DrawerContext.Provider>
  );
}
