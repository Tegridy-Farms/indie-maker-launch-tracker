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

  // Placeholder handlers — wired fully in Stage 5 & 6
  const handleEdit = (_idea: Idea) => {
    // TODO: Stage 6 — open IdeaFormDrawer in edit mode
  };

  const handleDelete = (_idea: Idea) => {
    // TODO: Stage 5 — open ConfirmDialog
  };

  const handleStatusChange = async (_id: string, _newStatus: Status): Promise<void> => {
    // TODO: Stage 5 — optimistic PATCH
  };

  return (
    <SearchFilterBar
      ideas={ideas}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onStatusChange={handleStatusChange}
      total={total}
      page={page}
      onPageChange={setPage}
      pageSize={PAGE_SIZE}
    />
  );
}
