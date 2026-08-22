"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { ClientSuggestion } from "@/lib/clients/types";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function ClientCombobox({
  id,
  value,
  onChange,
  onSelect,
  clients,
  placeholder,
  className,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (client: ClientSuggestion) => void;
  clients: ClientSuggestion[];
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return clients.slice(0, 8);
    return clients
      .filter((c) => {
        if (c.org_name.toLowerCase().includes(q)) return true;
        if (c.contact_name?.toLowerCase().includes(q)) return true;
        if (c.address?.toLowerCase().includes(q)) return true;
        return c.aliases.some((a) => a.toLowerCase().includes(q));
      })
      .slice(0, 8);
  }, [value, clients]);

  const exactMatch = useMemo(
    () =>
      clients.some(
        (c) => c.org_name.trim().toLowerCase() === value.trim().toLowerCase(),
      ),
    [clients, value],
  );

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function choose(client: ClientSuggestion) {
    onSelect(client);
    setOpen(false);
  }

  const showList = open && matches.length > 0;

  return (
    <div ref={wrapRef} className="relative">
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
        role="combobox"
        aria-expanded={showList}
        aria-controls={id ? `${id}-listbox` : undefined}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setHighlight(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!showList) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, matches.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
          } else if (e.key === "Enter") {
            const pick = matches[highlight];
            if (pick) {
              e.preventDefault();
              choose(pick);
            }
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {showList ? (
        <ul
          id={id ? `${id}-listbox` : undefined}
          role="listbox"
          className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-md border border-border bg-card p-1 shadow-xl"
        >
          {matches.map((c, i) => (
            <li key={c.id} role="option" aria-selected={i === highlight}>
              <button
                type="button"
                className={cn(
                  "flex w-full flex-col items-start rounded-sm px-2.5 py-1.5 text-left text-sm",
                  i === highlight
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/60",
                )}
                onMouseEnter={() => setHighlight(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(c);
                }}
              >
                <span className="font-medium">{c.org_name}</span>
                {c.contact_name ? (
                  <span className="truncate text-xs text-muted-foreground">
                    {c.contact_name}
                  </span>
                ) : null}
                {c.address ? (
                  <span className="truncate text-xs text-muted-foreground/80">
                    {c.address.replace(/\s*\n\s*/g, ", ")}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {value.trim() && !exactMatch ? (
        <p className="mt-1 text-xs text-muted-foreground">
          New client — will be saved as “{value.trim()}”.
        </p>
      ) : null}
    </div>
  );
}
