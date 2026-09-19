import { cn } from "@/lib/utils";

export function EmptyState({ icon: Icon, title, description, action, className, compact = false }) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center text-center gap-2",
        compact ? "py-6 px-4" : "py-10 px-4",
        className,
      )}
    >
      {Icon && (
        <Icon
          className={cn(
            "text-muted-foreground/60 mb-1",
            compact ? "w-5 h-5" : "w-8 h-8",
          )}
          aria-hidden="true"
        />
      )}
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && (
        <p className="text-xs text-muted-foreground max-w-sm">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}