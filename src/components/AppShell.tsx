"use client";

import { useState, useCallback } from "react";
import { NavBar } from "@/components/NavBar";
import { IdeaFormDrawer } from "@/components/IdeaFormDrawer";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import type { Idea } from "@/types/idea";

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * AppShell — client-side wrapper that holds the IdeaFormDrawer state at the
 * layout level so it persists across route changes and the keyboard shortcut
 * (N) can open it from any page.
 */
export function AppShell({ children }: AppShellProps) {
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

  // Keyboard shortcut: N opens create-mode drawer (only when not in an input)
  useKeyboardShortcut("n", openCreate, !drawerOpen);

  return (
    <>
      <NavBar onNewIdea={openCreate} />
      <main>{children}</main>

      <IdeaFormDrawer
        isOpen={drawerOpen}
        onClose={handleClose}
        mode={drawerMode}
        initialValues={editIdea}
      />
    </>
  );
}

// ─── Context for child components to open the drawer ─────────────────────────

import { createContext, useContext } from "react";

interface DrawerContextValue {
  openCreate: () => void;
  openEdit: (idea: Idea) => void;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

export function useDrawer(): DrawerContextValue {
  const ctx = useContext(DrawerContext);
  if (!ctx) {
    throw new Error("useDrawer must be used inside AppShell");
  }
  return ctx;
}

/**
 * AppShellWithContext — provides DrawerContext to the subtree so child
 * components (IdeaRow, RecentActivity) can open the drawer programmatically.
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

  // Keyboard shortcut: N opens create-mode drawer (only when not in an input)
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
