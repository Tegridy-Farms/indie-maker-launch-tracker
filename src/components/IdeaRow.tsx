"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  PencilIcon,
  TrashIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/20/solid";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusDropdown } from "@/components/StatusDropdown";
import { TagChip } from "@/components/TagChip";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useToast } from "@/components/Toast";
import { formatDate } from "@/lib/utils";
import type { Idea } from "@/types/idea";
import type { Status } from "@/lib/validators";

interface IdeaRowProps {
  idea: Idea;
  onEdit: (idea: Idea) => void;
  onDelete?: (idea: Idea) => void;
  onStatusChange?: (id: string, newStatus: Status) => Promise<void>;
}

export function IdeaRow({ idea, onEdit, onDelete, onStatusChange }: IdeaRowProps) {
  const router = useRouter();
  const { addToast } = useToast();

  // ── Status optimistic state ────────────────────────────────────────────────
  const [localStatus, setLocalStatus] = useState<Status>(idea.status as Status);
  const [isStatusLoading, setIsStatusLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const previousStatusRef = useRef<Status>(idea.status as Status);

  const handleStatusSelect = useCallback(
    async (newStatus: Status) => {
      if (newStatus === localStatus) {
        setDropdownOpen(false);
        return;
      }

      const previous = localStatus;
      previousStatusRef.current = previous;

      // Optimistic update
      setLocalStatus(newStatus);
      setDropdownOpen(false);
      setIsStatusLoading(true);

      try {
        const res = await fetch(`/api/ideas/${idea.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!res.ok) {
          throw new Error(`PATCH failed: ${res.status}`);
        }

        // Sync server state for dashboard counts
        router.refresh();
      } catch {
        // Revert
        setLocalStatus(previous);
        addToast("error", "Couldn't update status. Try again.");
      } finally {
        setIsStatusLoading(false);
      }
    },
    [localStatus, idea.id, router, addToast]
  );

  // ── Delete optimistic state ────────────────────────────────────────────────
  const [isDeleted, setIsDeleted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const handleDeleteClick = useCallback(() => {
    setConfirmOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    setIsDeleteLoading(true);

    // Optimistic: fade out row
    setIsDeleted(true);
    setConfirmOpen(false);

    try {
      const res = await fetch(`/api/ideas/${idea.id}`, {
        method: "DELETE",
      });

      if (res.status === 404) {
        // Already gone — show informational, row stays removed
        addToast("info", "That idea was already removed.");
        router.refresh();
        return;
      }

      if (!res.ok) {
        throw new Error(`DELETE failed: ${res.status}`);
      }

      addToast("success", "Idea deleted.");
      router.refresh();
    } catch {
      // Revert row back
      setIsDeleted(false);
      addToast("error", "Couldn't delete idea. Try again.");
    } finally {
      setIsDeleteLoading(false);
    }
  }, [idea.id, router, addToast]);

  const handleDeleteCancel = useCallback(() => {
    setConfirmOpen(false);
  }, []);

  // ── If row is deleted, collapse it out ─────────────────────────────────────
  if (isDeleted) {
    return (
      <li
        role="listitem"
        aria-hidden="true"
        className="overflow-hidden transition-all duration-[250ms] ease-in"
        style={{ opacity: 0, maxHeight: 0, padding: 0, margin: 0 }}
      />
    );
  }

  return (
    <>
      <li
        role="listitem"
        className="group flex items-center gap-3 px-4 py-0 min-h-[56px] border-b border-border-default hover:bg-[#F3F4F6] transition-colors relative"
      >
        {/* Title (flex-grow) */}
        <div className="flex-1 min-w-0">
          <button
            type="button"
            onClick={() => onEdit(idea)}
            className="text-[14px] font-medium text-text-primary truncate hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded text-left block w-full"
            title={idea.title}
          >
            {idea.title}
          </button>
        </div>

        {/* Tags (hidden on mobile, 200px on tablet+) */}
        <div className="hidden sm:flex items-center gap-1 w-[200px] flex-shrink-0 overflow-hidden">
          {idea.tags && idea.tags.length > 0
            ? idea.tags.slice(0, 3).map((tag) => (
                <TagChip key={tag} label={tag} variant="display" />
              ))
            : null}
        </div>

        {/* Link icon (24px) — shown only when URL is present */}
        <div className="flex-shrink-0 w-6 flex items-center justify-center">
          {idea.url ? (
            <a
              href={idea.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open project URL in new tab"
              className="text-accent hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded"
              onClick={(e) => e.stopPropagation()}
            >
              <ArrowTopRightOnSquareIcon className="w-4 h-4" aria-hidden="true" />
            </a>
          ) : null}
        </div>

        {/* StatusBadge with dropdown (120px) */}
        <div className="flex-shrink-0 w-[120px] flex items-center relative">
          <StatusBadge
            status={localStatus}
            interactive={true}
            size="md"
            onClick={() => setDropdownOpen((prev) => !prev)}
            isLoading={isStatusLoading}
          />
          {dropdownOpen && (
            <StatusDropdown
              currentStatus={localStatus}
              onSelect={handleStatusSelect}
              onClose={() => setDropdownOpen(false)}
            />
          )}
        </div>

        {/* Date (96px, hidden on mobile) */}
        <div className="flex-shrink-0 w-[96px] hidden sm:block">
          <time
            dateTime={
              idea.created_at instanceof Date
                ? idea.created_at.toISOString()
                : idea.created_at
            }
            className="text-[12px] text-text-secondary"
          >
            {formatDate(idea.created_at)}
          </time>
        </div>

        {/* Mobile: date as secondary line */}
        <div className="flex-shrink-0 sm:hidden">
          <time
            dateTime={
              idea.created_at instanceof Date
                ? idea.created_at.toISOString()
                : idea.created_at
            }
            className="text-[11px] text-text-secondary"
          >
            {formatDate(idea.created_at)}
          </time>
        </div>

        {/* Actions (64px): Edit + Delete */}
        <div className="flex-shrink-0 w-[64px] flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 sm:transition-opacity sm:duration-100 sm:ease-in-out focus-within:opacity-100">
          <button
            type="button"
            onClick={() => onEdit(idea)}
            aria-label={`Edit idea: ${idea.title}`}
            className="p-1.5 text-text-secondary hover:text-primary transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
          >
            <PencilIcon className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onDelete ? () => onDelete(idea) : handleDeleteClick}
            aria-label={`Delete idea: ${idea.title}`}
            className="p-1.5 text-text-secondary hover:text-error transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-1"
          >
            <TrashIcon className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </li>

      {/* Confirm delete dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title={`Delete "${idea.title}"?`}
        body="This cannot be undone. The idea and all its details will be permanently removed."
        confirmLabel="Delete"
        isLoading={isDeleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
}
