"use client";

import { useState } from "react";
import { SearchFilterBar } from "@/components/SearchFilterBar";
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

  // Edit handler — wired fully in Stage 6 (IdeaFormDrawer)
  const handleEdit = (_idea: Idea) => {
    // TODO: Stage 6 — open IdeaFormDrawer in edit mode
  };

  // Status change is handled inline within IdeaRow (optimistic PATCH)
  // This prop is kept for SearchFilterBar compatibility but IdeaRow owns the actual mutation
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
