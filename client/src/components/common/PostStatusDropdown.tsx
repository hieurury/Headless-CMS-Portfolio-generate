import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, FileText, Globe, Archive, Clock } from "lucide-react";
import clsx from "clsx";

export type PostStatusOption = "draft" | "published" | "archived" | "scheduled";

interface StatusConfig {
  label: string;
  description: string;
  icon: React.ReactNode;
  badgeClass: string;
  dotClass: string;
}

const STATUS_CONFIGS: Record<PostStatusOption, StatusConfig> = {
  draft: {
    label: "Draft",
    description: "Saved as draft, not visible publicly",
    icon: <FileText size={14} className="text-zinc-400" />,
    badgeClass: "bg-zinc-500/10 text-zinc-300 border-zinc-500/20",
    dotClass: "bg-zinc-400",
  },
  published: {
    label: "Publish Now",
    description: "Immediately visible on your site",
    icon: <Globe size={14} className="text-emerald-400" />,
    badgeClass: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    dotClass: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]",
  },
  scheduled: {
    label: "Schedule",
    description: "Set a future date & time to go live",
    icon: <Clock size={14} className="text-sky-400" />,
    badgeClass: "bg-sky-500/10 text-sky-300 border-sky-500/20",
    dotClass: "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]",
  },
  archived: {
    label: "Archived",
    description: "Hidden from site, kept for records",
    icon: <Archive size={14} className="text-amber-400" />,
    badgeClass: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    dotClass: "bg-amber-400",
  },
};

interface PostStatusDropdownProps {
  value: PostStatusOption;
  onChange: (status: PostStatusOption) => void;
  options?: PostStatusOption[];
  disabled?: boolean;
}

export const PostStatusDropdown: React.FC<PostStatusDropdownProps> = ({
  value,
  onChange,
  options = ["draft", "published", "scheduled", "archived"],
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const currentConfig = STATUS_CONFIGS[value] || STATUS_CONFIGS.draft;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "h-9 px-3.5 rounded-lg border text-xs font-medium transition-all duration-200",
          "flex items-center gap-2.5 select-none focus:outline-none",
          "bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)]",
          "border-[var(--color-border)] hover:border-[var(--color-text-muted)]",
          "text-[var(--color-text)] shadow-sm",
          isOpen && "border-[var(--color-text-muted)] ring-2 ring-[var(--color-text)]/10"
        )}
      >
        <span className={clsx("w-2 h-2 rounded-full", currentConfig.dotClass)} />
        <span className="font-medium tracking-wide">
          {value === "published" ? "Published" : currentConfig.label}
        </span>
        <ChevronDown
          size={14}
          className={clsx(
            "text-[var(--color-text-muted)] transition-transform duration-200",
            isOpen && "rotate-180 text-[var(--color-text)]"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={clsx(
            "absolute right-0 mt-1.5 w-64 rounded-xl z-50 py-1.5",
            "bg-[var(--color-surface)] border border-[var(--color-border)]",
            "shadow-xl shadow-black/40 backdrop-blur-xl",
            "animate-in fade-in zoom-in-95 duration-150 origin-top-right"
          )}
        >
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-faint)]">
            Post Status
          </div>

          <div className="space-y-0.5 px-1">
            {options.map((optionKey) => {
              const config = STATUS_CONFIGS[optionKey];
              const isSelected = value === optionKey;

              return (
                <button
                  key={optionKey}
                  type="button"
                  onClick={() => {
                    onChange(optionKey);
                    setIsOpen(false);
                  }}
                  className={clsx(
                    "w-full px-2.5 py-2 rounded-lg text-left text-xs transition-all flex items-start gap-2.5 group",
                    isSelected
                      ? "bg-[var(--color-surface-2)] text-[var(--color-text)] font-medium"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]/60"
                  )}
                >
                  <div className="mt-0.5 shrink-0 flex items-center justify-center">
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={clsx("font-medium", isSelected && "text-[var(--color-text)]")}>
                        {config.label}
                      </span>
                      {isSelected && (
                        <Check size={13} className="text-emerald-400 ml-1.5 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-[var(--color-text-faint)] leading-tight mt-0.5 line-clamp-1">
                      {config.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
