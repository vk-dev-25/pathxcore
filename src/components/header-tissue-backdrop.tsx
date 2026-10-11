/**
 * Decorative backdrop for the dark header and footer bands: a soft primary
 * glow and a thin theme-aligned edge where the band meets the page.
 */
export function HeaderTissueBackdrop({
  edge = "bottom",
  subtle = false,
}: {
  /** Kept for call-site compatibility; pattern decoration was removed. */
  patternId?: string;
  edge?: "top" | "bottom";
  /** Edge stripe only: no glows (used in the footer). */
  subtle?: boolean;
}) {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {subtle ? null : (
        <>
          <div className="absolute -left-16 -top-28 h-52 w-64 rounded-full bg-primary/[0.07] blur-3xl" />
          <div className="absolute -bottom-32 right-0 h-48 w-72 rounded-full bg-primary/[0.04] blur-3xl" />
        </>
      )}

      <div
        className={`absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent ${edge === "top" ? "top-0" : "bottom-0"}`}
      />
    </div>
  );
}
