"use client";

import { useState } from "react";
import { SearchFilterBar } from "@/components/SearchFilterBar";
import { useDrawer } from "@/components/AppShell";
import type { Idea } from "@/types/idea";
import type { Status } from "@/lib/validators";

interface IdeasListClientProps {
  initialIdeas: Idea[];
  initialTotal: number;
}

const PAGE_SIZE = 50;

export function IdeasListClient({ initialIdeas, initialTotal }: IdeasListClientProps) {
  const [ideas] = useState<Idea[]>(initialIdeas);
  const [total] = useState(initialTotal);
  const [page, setPage] = useState(1);

  // Open the IdeaFormDrawer from the layout-level AppShell context
  const { openEdit } = useDrawer();

  // Edit handler — opens IdeaFormDrawer in edit mode with this idea's data
  const handleEdit = (idea: Idea) => {
    openEdit(idea);
  };

  // Status change is handled inline within IdeaRow (optimistic PATCH)
  const handleStatusChange = async (_id: string, _newStatus: Status): Promise<void> => {
    // IdeaRow handles optimistic PATCH directly — no-op here
  };

  return (
    <SearchFilterBar
      ideas={ideas}
      onEdit={handleEdit}
      onStatusChange={handleStatusChange}
      total={total}
      page={page}
      onPageChange={setPage}
      pageSize={PAGE_SIZE}
    />
  );
}
