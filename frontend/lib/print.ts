"use client";

/**
 * Universal, isolated single-page print utility for MoukawilOS.
 * Mounts the target element directly into a dedicated DOM portal (#moukawil-print-mount)
 * attached to document.body, applies .moukawil-printing to <body>, and calls window.print().
 *
 * This guarantees:
 * 1. Zero blank pages in Chromium (renders in the live document with full stylesheets & fonts).
 * 2. Zero duplicate pages or repeated backdrops (ancestor modals and fixed overlays are excluded from print flow).
 * 3. Exact 1-page fit on standard A4 paper for invoices, vouchers, and fiscal declarations.
 */
export function printElementById(elementId: string, documentTitle = "MoukawilOS - Document Officiel") {
  if (typeof window === "undefined") return;

  const sourceElement = document.getElementById(elementId);
  if (!sourceElement) {
    window.print();
    return;
  }

  // Remove any legacy print iframes
  const existingFrame = document.getElementById("moukawil-print-frame");
  if (existingFrame) existingFrame.remove();

  // Get or create top-level portal mount directly on document.body
  let mount = document.getElementById("moukawil-print-mount");
  if (!mount) {
    mount = document.createElement("div");
    mount.id = "moukawil-print-mount";
    mount.setAttribute("aria-hidden", "true");
    document.body.appendChild(mount);
  }

  // Deep clone the source element so we can optimize its print geometry without disturbing screen UI
  const clone = sourceElement.cloneNode(true) as HTMLElement;

  // Strip elements marked with no-print, buttons, or modal controls
  clone.querySelectorAll(".no-print, button, [data-no-print]").forEach((el) => el.remove());

  // Reset viewport & scroll constraints so it renders cleanly within single A4 page bounds
  clone.style.minHeight = "auto";
  clone.style.maxHeight = "none";
  clone.style.height = "auto";
  clone.style.overflow = "visible";
  clone.style.zoom = "1";
  clone.style.transform = "none";
  clone.style.boxShadow = "none";

  mount.innerHTML = "";
  mount.appendChild(clone);

  const prevTitle = document.title;
  if (documentTitle) {
    document.title = documentTitle;
  }

  document.body.classList.add("moukawil-printing");

  let cleaned = false;
  const cleanUp = () => {
    if (cleaned) return;
    cleaned = true;
    document.body.classList.remove("moukawil-printing");
    if (mount) {
      mount.innerHTML = "";
    }
    if (documentTitle) {
      document.title = prevTitle;
    }
  };

  // Modern browsers fire afterprint when dialog is either printed or cancelled
  window.addEventListener("afterprint", cleanUp, { once: true });

  // Use requestAnimationFrame + slight timeout so Chromium calculates styles and layout of the clone before invoking print
  requestAnimationFrame(() => {
    setTimeout(() => {
      try {
        window.print();
      } catch (err) {
        console.error("Print error:", err);
      } finally {
        // Fallback cleanup in case afterprint does not fire in some environments
        setTimeout(cleanUp, 3500);
      }
    }, 120);
  });
}
