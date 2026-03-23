import { cn } from "@/lib/utils";
import type { AccessionStatus } from "@/lib/lims/types";

const STEPS: { key: AccessionStatus; label: string }[] = [
  { key: "received",   label: "Received" },
  { key: "blocked",    label: "Blocked" },
  { key: "slides_cut", label: "Slides Cut" },
  { key: "complete",   label: "Complete" },
];

const ORDER: Record<AccessionStatus, number> = {
  received: 0, blocked: 1, slides_cut: 2, complete: 3,
};

export function PipelineProgress({ status }: { status: AccessionStatus }) {
  const current = ORDER[status];
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const done = ORDER[step.key] <= current;
        const active = step.key === status;
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "h-2 w-2 rounded-full",
                  done ? "bg-primary" : "bg-muted-foreground/25",
                  active && "ring-2 ring-primary/30 ring-offset-1"
                )}
              />
              <span className={cn(
                "text-[9px] mt-1 whitespace-nowrap",
                active ? "text-primary font-medium" : "text-muted-foreground"
              )}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn(
                "h-px w-8 mx-1 mb-3",
                ORDER[step.key] < current ? "bg-primary" : "bg-muted-foreground/25"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
