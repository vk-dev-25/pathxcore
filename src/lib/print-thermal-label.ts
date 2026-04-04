/**
 * Open the browser print dialog for small thermal labels.
 *
 * Chrome/Edge/Safari add date, title, and URL in the margin unless the user turns off
 * "Headers and footers" (Print → More settings). We cannot remove those from code.
 * Shortening document.title during print hides the long site title in that header line.
 */
export function printThermalLabel(): void {
  const previousTitle = document.title;
  document.title = "\u200b";

  const revert = () => {
    document.title = previousTitle;
  };

  window.addEventListener("afterprint", revert, { once: true });
  window.print();
  window.setTimeout(revert, 4_000);
}
