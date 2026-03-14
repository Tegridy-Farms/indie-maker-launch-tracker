"use client";

interface EmptyStateProps {
  variant: "no-ideas" | "no-results";
  onClear?: () => void;
  onCreateNew?: () => void;
}

export function EmptyState({ variant, onClear, onCreateNew }: EmptyStateProps) {
  if (variant === "no-ideas") {
    return (
      <div className="flex flex-col items-center justify-center py-12 max-w-[360px] mx-auto text-center">
        {/* Simple SVG illustration */}
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="mb-4 text-border-default"
        >
          <rect x="10" y="20" width="60" height="45" rx="6" fill="#E5E7EB" />
          <rect x="20" y="32" width="40" height="4" rx="2" fill="#D1D5DB" />
          <rect x="20" y="42" width="28" height="4" rx="2" fill="#D1D5DB" />
          <rect x="20" y="52" width="16" height="4" rx="2" fill="#D1D5DB" />
          <circle cx="40" cy="16" r="8" fill="#E5E7EB" />
          <path d="M37 16l2 2 4-4" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        <h3 className="text-[16px] font-semibold text-text-primary mb-2">
          No ideas yet
        </h3>
        <p className="text-[14px] text-text-secondary mb-6">
          Start capturing your ideas. Create your first one to track it from
          concept to launch.
        </p>

        {onCreateNew ? (
          <button
            type="button"
            onClick={onCreateNew}
            className="bg-primary hover:bg-primary-hover text-white text-[14px] font-medium py-2 px-4 rounded-lg transition-colors"
          >
            New Idea
          </button>
        ) : (
          <a
            href="/ideas"
            className="bg-primary hover:bg-primary-hover text-white text-[14px] font-medium py-2 px-4 rounded-lg transition-colors inline-block"
          >
            New Idea
          </a>
        )}
      </div>
    );
  }

  // no-results variant
  return (
    <div className="flex flex-col items-center justify-center py-12 max-w-[360px] mx-auto text-center">
      <svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="mb-4"
      >
        <circle cx="36" cy="36" r="22" stroke="#E5E7EB" strokeWidth="4" fill="none" />
        <line x1="52" y1="52" x2="68" y2="68" stroke="#E5E7EB" strokeWidth="4" strokeLinecap="round" />
        <line x1="28" y1="36" x2="44" y2="36" stroke="#D1D5DB" strokeWidth="3" strokeLinecap="round" />
        <line x1="28" y1="28" x2="36" y2="28" stroke="#D1D5DB" strokeWidth="3" strokeLinecap="round" />
      </svg>

      <h3 className="text-[16px] font-semibold text-text-primary mb-2">
        No results found
      </h3>
      <p className="text-[14px] text-text-secondary mb-6">
        No ideas match your current filters. Try adjusting your search or
        clearing the filters.
      </p>

      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="bg-primary hover:bg-primary-hover text-white text-[14px] font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
