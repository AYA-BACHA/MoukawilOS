"use client";

/**
 * Robust, isolated single-page print utility for MoukawilOS.
 * Renders the specified DOM element into an isolated hidden iframe
 * so that background pages, modal dialogs, and outer scrollbars never
 * produce blank or duplicate pages in the print preview.
 */
export function printElementById(elementId: string, documentTitle = "MoukawilOS - Document Officiel") {
  if (typeof window === "undefined") return;

  const sourceElement = document.getElementById(elementId);
  if (!sourceElement) {
    window.print();
    return;
  }

  // Remove any pre-existing print iframe
  const existingIframe = document.getElementById("moukawil-print-frame");
  if (existingIframe) {
    existingIframe.remove();
  }

  const iframe = document.createElement("iframe");
  iframe.id = "moukawil-print-frame";
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";
  iframe.style.visibility = "hidden";
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) {
    window.print();
    return;
  }

  // Collect all stylesheets and style tags from host document
  const headStyles = Array.from(document.querySelectorAll("link[rel='stylesheet'], style"))
    .map((el) => el.outerHTML)
    .join("\n");

  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <title>${documentTitle}</title>
        ${headStyles}
        <style>
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #0f172a !important;
            height: auto !important;
            min-height: auto !important;
            overflow: visible !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }
          #${elementId} {
            width: 100% !important;
            max-width: 800px !important;
            margin: 0 auto !important;
            padding: 16px !important;
            border: none !important;
            box-shadow: none !important;
            background: #ffffff !important;
            display: block !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .no-print {
            display: none !important;
          }
        </style>
      </head>
      <body>
        ${sourceElement.outerHTML}
      </body>
    </html>
  `);
  iframeDoc.close();

  // Allow styles and font assets to settle
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      window.print();
    } finally {
      setTimeout(() => {
        iframe.remove();
      }, 1500);
    }
  }, 250);
}
