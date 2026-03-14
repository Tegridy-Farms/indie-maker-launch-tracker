"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { TagChip } from "@/components/TagChip";
import { useToast } from "@/components/Toast";
import { STATUS_LABELS, STATUS_COLOURS } from "@/lib/constants";
import { STATUS_VALUES } from "@/lib/validators";
import type { Status } from "@/lib/validators";
import type { Idea } from "@/types/idea";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DrawerMode = "create" | "edit";

interface IdeaFormDrawerProps {
  isOpen: boolean;
  mode: DrawerMode;
  initialValues?: Partial<Idea>;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormValues {
  title: string;
  description: string;
  status: Status;
  tags: string[];
  url: string;
}

interface FieldErrors {
  title?: string;
  description?: string;
  url?: string;
  general?: string;
}

const DEFAULT_VALUES: FormValues = {
  title: "",
  description: "",
  status: "idea",
  tags: [],
  url: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isValidUrl(value: string): boolean {
  if (!value) return true; // optional field
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function toFormValues(idea?: Partial<Idea>): FormValues {
  if (!idea) return { ...DEFAULT_VALUES };
  return {
    title: idea.title ?? "",
    description: idea.description ?? "",
    status: (idea.status as Status) ?? "idea",
    tags: idea.tags ?? [],
    url: idea.url ?? "",
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function IdeaFormDrawer({
  isOpen,
  mode,
  initialValues,
  onClose,
  onSuccess,
}: IdeaFormDrawerProps) {
  const { addToast } = useToast();
  const titleRef = useRef<HTMLInputElement>(null);

  // ── Form state ──────────────────────────────────────────────────────────────
  const [values, setValues] = useState<FormValues>(() =>
    toFormValues(initialValues)
  );
  const [isDirty, setIsDirty] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [urlError, setUrlError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tag input state
  const [tagInput, setTagInput] = useState("");

  // ── Sync form values when drawer opens/mode changes ──────────────────────
  useEffect(() => {
    if (isOpen) {
      setValues(toFormValues(initialValues));
      setIsDirty(false);
      setFieldErrors({});
      setUrlError("");
      setTagInput("");
    }
  }, [isOpen, initialValues]);

  // ── Field change handlers ────────────────────────────────────────────────────
  const handleChange = useCallback(
    (field: keyof FormValues, value: string | Status | string[]) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      setIsDirty(true);
      // Clear field-level error on change
      if (field in fieldErrors) {
        setFieldErrors((prev) => {
          const next = { ...prev };
          delete next[field as keyof FieldErrors];
          return next;
        });
      }
    },
    [fieldErrors]
  );

  // ── URL blur validation ──────────────────────────────────────────────────────
  const handleUrlBlur = useCallback(() => {
    if (values.url && !isValidUrl(values.url)) {
      setUrlError("Enter a valid URL (e.g. https://example.com)");
    } else {
      setUrlError("");
    }
  }, [values.url]);

  // ── Tag input ────────────────────────────────────────────────────────────────
  const handleTagKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "," || e.key === "Enter") {
        e.preventDefault();
        const raw = tagInput.trim().replace(/,+$/, "");
        if (!raw) return;
        if (values.tags.length >= 5) return;
        if (values.tags.includes(raw)) {
          setTagInput("");
          return;
        }
        setValues((prev) => ({ ...prev, tags: [...prev.tags, raw] }));
        setIsDirty(true);
        setTagInput("");
      }
    },
    [tagInput, values.tags]
  );

  const removeTag = useCallback((tag: string) => {
    setValues((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
    setIsDirty(true);
  }, []);

  // ── Unsaved-changes guard ───────────────────────────────────────────────────
  const handleCloseAttempt = useCallback(() => {
    if (isDirty) {
      const confirmed = window.confirm(
        "You have unsaved changes. Close anyway?"
      );
      if (!confirmed) return;
    }
    onClose();
  }, [isDirty, onClose]);

  // ── Validation ───────────────────────────────────────────────────────────────
  const validate = useCallback((): boolean => {
    const errors: FieldErrors = {};
    if (!values.title.trim()) {
      errors.title = "Title is required";
    } else if (values.title.length > 120) {
      errors.title = "Title must be 120 characters or fewer";
    }
    if (values.description.length > 2000) {
      errors.description = "Description must be 2000 characters or fewer";
    }
    if (values.url && !isValidUrl(values.url)) {
      setUrlError("Enter a valid URL (e.g. https://example.com)");
      errors.url = "url_invalid";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [values]);

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;

      setIsSubmitting(true);
      try {
        const body = {
          title: values.title.trim(),
          description: values.description || undefined,
          status: values.status,
          tags: values.tags.length > 0 ? values.tags : undefined,
          url: values.url || undefined,
        };

        let res: Response;
        if (mode === "create") {
          res = await fetch("/api/ideas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
        } else {
          const id = initialValues?.id;
          res = await fetch(`/api/ideas/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
        }

        if (res.ok) {
          setIsDirty(false);
          addToast("success", mode === "create" ? "Idea saved" : "Idea updated");
          onSuccess?.();
          onClose();
        } else {
          const data = await res.json().catch(() => ({}));
          if (res.status === 400 && data.fieldErrors) {
            // Map server fieldErrors to local state
            const mapped: FieldErrors = {};
            for (const [k, v] of Object.entries(data.fieldErrors as Record<string, string[]>)) {
              (mapped as Record<string, string>)[k] = Array.isArray(v) ? v[0] : String(v);
            }
            setFieldErrors(mapped);
          } else {
            setFieldErrors({
              general: data.error ?? "Something went wrong. Please try again.",
            });
          }
        }
      } catch {
        addToast("error", "Network error. Please check your connection.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [validate, values, mode, initialValues?.id, addToast, onSuccess, onClose]
  );

  // ── Derived UI state ─────────────────────────────────────────────────────────
  const titleTooLong = values.title.length > 120;
  const descTooLong = values.description.length > 2000;
  const urlInvalid = Boolean(urlError);
  const submitDisabled = isSubmitting || titleTooLong || descTooLong || urlInvalid;

  const drawerTitle = mode === "create" ? "New Idea" : "Edit Idea";
  const submitLabel = mode === "create" ? "Save Idea" : "Save Changes";

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={handleCloseAttempt}
        initialFocus={titleRef}
      >
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-250"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 transition-opacity" aria-hidden="true" />
        </Transition.Child>

        {/* Drawer panel */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            {/* Desktop: slides from right; Mobile: slides from bottom */}
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-0">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-out duration-[250ms]"
                enterFrom="translate-x-full sm:translate-x-full translate-y-0 sm:translate-y-0"
                enterTo="translate-x-0"
                leave="transform transition ease-in duration-[200ms]"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                {/* Desktop right drawer */}
                <Dialog.Panel className="pointer-events-auto hidden sm:flex w-[480px] flex-col bg-surface shadow-xl h-full">
                  <DrawerContent
                    titleRef={titleRef}
                    drawerTitle={drawerTitle}
                    submitLabel={submitLabel}
                    values={values}
                    tagInput={tagInput}
                    fieldErrors={fieldErrors}
                    urlError={urlError}
                    titleTooLong={titleTooLong}
                    descTooLong={descTooLong}
                    isSubmitting={isSubmitting}
                    submitDisabled={submitDisabled}
                    onChange={handleChange}
                    onUrlBlur={handleUrlBlur}
                    onTagKeyDown={handleTagKeyDown}
                    onTagInputChange={setTagInput}
                    onRemoveTag={removeTag}
                    onClose={handleCloseAttempt}
                    onSubmit={handleSubmit}
                  />
                </Dialog.Panel>
              </Transition.Child>
            </div>

            {/* Mobile: bottom sheet */}
            <div className="pointer-events-none sm:hidden fixed inset-x-0 bottom-0">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-out duration-[250ms]"
                enterFrom="translate-y-full"
                enterTo="translate-y-0"
                leave="transform transition ease-in duration-[200ms]"
                leaveFrom="translate-y-0"
                leaveTo="translate-y-full"
              >
                <Dialog.Panel className="pointer-events-auto w-full h-[90vh] rounded-t-2xl bg-surface shadow-xl flex flex-col overflow-hidden">
                  <DrawerContent
                    titleRef={undefined}
                    drawerTitle={drawerTitle}
                    submitLabel={submitLabel}
                    values={values}
                    tagInput={tagInput}
                    fieldErrors={fieldErrors}
                    urlError={urlError}
                    titleTooLong={titleTooLong}
                    descTooLong={descTooLong}
                    isSubmitting={isSubmitting}
                    submitDisabled={submitDisabled}
                    onChange={handleChange}
                    onUrlBlur={handleUrlBlur}
                    onTagKeyDown={handleTagKeyDown}
                    onTagInputChange={setTagInput}
                    onRemoveTag={removeTag}
                    onClose={handleCloseAttempt}
                    onSubmit={handleSubmit}
                  />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

// ─── DrawerContent (shared between desktop and mobile) ────────────────────────

interface DrawerContentProps {
  titleRef?: React.RefObject<HTMLInputElement>;
  drawerTitle: string;
  submitLabel: string;
  values: FormValues;
  tagInput: string;
  fieldErrors: FieldErrors;
  urlError: string;
  titleTooLong: boolean;
  descTooLong: boolean;
  isSubmitting: boolean;
  submitDisabled: boolean;
  onChange: (field: keyof FormValues, value: string | Status | string[]) => void;
  onUrlBlur: () => void;
  onTagKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onTagInputChange: (v: string) => void;
  onRemoveTag: (tag: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

function DrawerContent({
  titleRef,
  drawerTitle,
  submitLabel,
  values,
  tagInput,
  fieldErrors,
  urlError,
  titleTooLong,
  descTooLong,
  isSubmitting,
  submitDisabled,
  onChange,
  onUrlBlur,
  onTagKeyDown,
  onTagInputChange,
  onRemoveTag,
  onClose,
  onSubmit,
}: DrawerContentProps) {
  const titleId = "drawer-title";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border-default flex-shrink-0">
        <Dialog.Title
          id={titleId}
          className="text-[16px] font-semibold text-text-primary"
        >
          {drawerTitle}
        </Dialog.Title>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close drawer"
          className="p-1.5 text-text-secondary hover:text-text-primary transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
        >
          <XMarkIcon className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* Scrollable body */}
      <form
        onSubmit={onSubmit}
        className="flex flex-col flex-1 overflow-hidden"
        noValidate
      >
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {/* General error banner */}
          {fieldErrors.general && (
            <div
              role="alert"
              className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-error text-[14px]"
            >
              {fieldErrors.general}
            </div>
          )}

          {/* Title */}
          <div>
            <label
              htmlFor="field-title"
              className="block text-[12px] font-medium text-text-primary mb-1"
            >
              Title <span aria-hidden="true">*</span>
            </label>
            <input
              ref={titleRef}
              id="field-title"
              type="text"
              value={values.title}
              onChange={(e) => onChange("title", e.target.value)}
              maxLength={200}
              autoComplete="off"
              className={`w-full border rounded-lg px-3 py-2 text-[14px] text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                fieldErrors.title || titleTooLong
                  ? "border-error bg-red-50"
                  : "border-border-default bg-surface"
              }`}
              placeholder="My awesome idea"
              aria-invalid={Boolean(fieldErrors.title || titleTooLong)}
              aria-describedby={
                fieldErrors.title
                  ? "title-error"
                  : titleTooLong
                  ? "title-counter"
                  : "title-counter"
              }
            />
            <div className="flex items-start justify-between mt-1">
              <div>
                {fieldErrors.title && (
                  <span
                    id="title-error"
                    role="alert"
                    className="text-[12px] text-error"
                  >
                    {fieldErrors.title}
                  </span>
                )}
              </div>
              <span
                id="title-counter"
                aria-live="polite"
                className={`text-[12px] flex-shrink-0 ${
                  titleTooLong ? "text-error font-medium" : "text-text-secondary"
                }`}
              >
                {values.title.length} / 120
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="field-description"
              className="block text-[12px] font-medium text-text-primary mb-1"
            >
              Description
            </label>
            <textarea
              id="field-description"
              value={values.description}
              onChange={(e) => onChange("description", e.target.value)}
              rows={3}
              className={`w-full border rounded-lg px-3 py-2 text-[14px] text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-y ${
                descTooLong
                  ? "border-error bg-red-50"
                  : "border-border-default bg-surface"
              }`}
              placeholder="Describe your idea…"
              aria-describedby="desc-counter"
            />
            <div className="flex items-start justify-between mt-1">
              <div>
                {descTooLong && (
                  <span role="alert" className="text-[12px] text-error">
                    Description must be 2000 characters or fewer
                  </span>
                )}
              </div>
              <span
                id="desc-counter"
                aria-live="polite"
                className={`text-[12px] flex-shrink-0 ${
                  descTooLong ? "text-error font-medium" : "text-text-secondary"
                }`}
              >
                {values.description.length} / 2000
              </span>
            </div>
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="field-status"
              className="block text-[12px] font-medium text-text-primary mb-1"
            >
              Status
            </label>
            <div className="relative">
              <select
                id="field-status"
                value={values.status}
                onChange={(e) => onChange("status", e.target.value as Status)}
                className="w-full border border-border-default bg-surface rounded-lg px-3 py-2 text-[14px] text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors appearance-none pr-8"
              >
                {STATUS_VALUES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
              {/* Colour dot indicator */}
              <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: STATUS_COLOURS[values.status] }}
                />
              </div>
              {/* Chevron arrow */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label
              htmlFor="field-tags"
              className="block text-[12px] font-medium text-text-primary mb-1"
            >
              Tags (max 5)
            </label>
            <p className="text-[11px] text-text-secondary mb-2">
              Press comma or Enter after each tag
            </p>
            {/* Existing tags */}
            {values.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {values.tags.map((tag) => (
                  <TagChip
                    key={tag}
                    label={tag}
                    variant="removable"
                    onRemove={() => onRemoveTag(tag)}
                  />
                ))}
              </div>
            )}
            {/* Tag input — hidden when at limit */}
            {values.tags.length < 5 && (
              <input
                id="field-tags"
                type="text"
                value={tagInput}
                onChange={(e) => onTagInputChange(e.target.value)}
                onKeyDown={onTagKeyDown}
                className="w-full border border-border-default bg-surface rounded-lg px-3 py-2 text-[14px] text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                placeholder="Type a tag, then press Enter or comma…"
                autoComplete="off"
              />
            )}
            {values.tags.length === 5 && (
              <p className="text-[11px] text-text-secondary italic">
                Tag limit reached (5/5)
              </p>
            )}
          </div>

          {/* URL */}
          <div>
            <label
              htmlFor="field-url"
              className="block text-[12px] font-medium text-text-primary mb-1"
            >
              URL
            </label>
            <input
              id="field-url"
              type="url"
              value={values.url}
              onChange={(e) => {
                onChange("url", e.target.value);
                // Clear URL error while user is typing
                // (re-validates on blur)
              }}
              onBlur={onUrlBlur}
              className={`w-full border rounded-lg px-3 py-2 text-[14px] text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                urlError
                  ? "border-error bg-red-50"
                  : "border-border-default bg-surface"
              }`}
              placeholder="https://..."
              aria-invalid={Boolean(urlError)}
              aria-describedby={urlError ? "url-error" : undefined}
            />
            {urlError && (
              <span
                id="url-error"
                role="alert"
                className="mt-1 block text-[12px] text-error"
              >
                {urlError}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border-default flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="text-[14px] font-medium text-text-secondary hover:text-text-primary border border-border-default rounded-lg px-4 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitDisabled}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-[14px] font-medium py-2 px-5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
          >
            {isSubmitting && (
              <svg
                className="animate-spin w-4 h-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 12 0 12 0v4a8 8 0 00-8 8H0z"
                />
              </svg>
            )}
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
