/**
 * Decorative backdrop for the dark header and footer bands: a faint low-power
 * "tissue section" of cells (hematoxylin-purple nuclei, eosin-pink cytoplasm)
 * that fades in from the left, two soft teal/purple glows, and an H&E-gradient
 * edge on the side that meets the page.
 */
export function HeaderTissueBackdrop({
  patternId = "hdr-tissue",
  edge = "bottom",
  subtle = false,
}: {
  /** Unique per instance; the header and footer both render a pattern. */
  patternId?: string;
  edge?: "top" | "bottom";
  /** Edge stripe only: no cell pattern or glows (used in the footer). */
  subtle?: boolean;
}) {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {subtle ? null : (
        <>
          <div className="absolute -left-20 -top-24 h-56 w-72 rounded-full bg-teal-400/20 blur-3xl" />
          <div className="absolute -bottom-28 right-1/4 h-56 w-80 rounded-full bg-fuchsia-500/15 blur-3xl" />

          <svg
            className="absolute inset-0 h-full w-full [mask-image:linear-gradient(to_right,transparent_18%,black_55%)]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id={patternId}
                width="132"
                height="88"
                patternUnits="userSpaceOnUse"
              >
                {/* cytoplasm outlines */}
                <g
                  fill="rgb(236 120 170 / 0.07)"
                  stroke="rgb(255 255 255 / 0.10)"
                  strokeWidth="0.8"
                >
                  <path d="M10 14c6-7 18-6 22 1s1 16-7 18-19-2-20-8 0-8 5-11z" />
                  <path d="M46 6c8-4 19 0 20 8s-5 15-13 15-14-5-14-11 2-9 7-12z" />
                  <path d="M84 16c7-6 19-3 21 5s-4 16-12 16-15-4-15-10 1-8 6-11z" />
                  <path d="M114 4c6-2 14 2 14 9s-6 11-12 10-9-5-9-10 2-7 7-9z" />
                  <path d="M22 50c7-5 18-2 19 6s-5 14-13 14-13-5-13-11 2-6 7-9z" />
                  <path d="M60 44c8-5 20-1 21 8s-6 15-14 15-15-5-15-12 3-8 8-11z" />
                  <path d="M100 52c6-4 16-1 17 6s-5 12-11 12-12-4-12-9 1-6 6-9z" />
                  <path d="M0 74c5-3 12 0 13 5s-4 9-9 9-8-3-8-7 1-5 4-7z" />
                  <path d="M40 74c6-3 14 1 14 6s-5 8-11 8-9-3-9-7 2-5 6-7z" />
                  <path d="M80 76c6-3 14 0 15 5s-4 7-10 7-10-3-10-6 1-4 5-6z" />
                </g>
                {/* nuclei */}
                <g fill="rgb(150 100 220 / 0.45)">
                  <ellipse cx="21" cy="24" rx="4.5" ry="3.6" />
                  <ellipse cx="55" cy="16" rx="4" ry="3.2" />
                  <ellipse cx="94" cy="26" rx="4.6" ry="3.4" />
                  <ellipse cx="120" cy="13" rx="3.4" ry="2.8" />
                  <ellipse cx="30" cy="60" rx="4.2" ry="3.3" />
                  <ellipse cx="70" cy="55" rx="4.8" ry="3.6" />
                  <ellipse cx="107" cy="60" rx="3.8" ry="3" />
                  <ellipse cx="6" cy="80" rx="3" ry="2.4" />
                  <ellipse cx="46" cy="81" rx="3.4" ry="2.6" />
                  <ellipse cx="88" cy="82" rx="3.4" ry="2.6" />
                </g>
                {/* scattered small lymphocyte-like dots */}
                <g fill="rgb(120 90 210 / 0.35)">
                  <circle cx="40" cy="36" r="1.6" />
                  <circle cx="76" cy="38" r="1.4" />
                  <circle cx="122" cy="40" r="1.7" />
                  <circle cx="12" cy="40" r="1.3" />
                  <circle cx="92" cy="70" r="1.5" />
                </g>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${patternId})`} />
          </svg>
        </>
      )}

      {/* H&E edge: hematoxylin purple to eosin pink */}
      <div
        className={`absolute inset-x-0 h-[3px] bg-gradient-to-r from-[#3b1f6e] via-[#8e3fa0] to-[#f08bb8] ${edge === "top" ? "top-0" : "bottom-0"}`}
      />
    </div>
  );
}
