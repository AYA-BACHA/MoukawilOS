"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/provider";

export function QrMark({ seed }: { seed: string }) {
  const { t } = useI18n();
  const [imgError, setImgError] = useState(false);

  // Encode real verification payload that smartphone cameras can scan and open
  const verifyData = `https://moukawil-os.vercel.app/invoices/verify?ref=${encodeURIComponent(seed)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    verifyData
  )}&margin=1`;

  return (
    <div className="relative size-full flex items-center justify-center overflow-hidden bg-white">
      {!imgError ? (
        <img
          src={qrUrl}
          alt={t("Authenticity QR Code for {seed}", { seed })}
          className="size-full object-contain"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        /* Scannable-like SVG finder pattern fallback if offline */
        <svg
          viewBox="0 0 21 21"
          className="size-full fill-slate-900"
          shapeRendering="crispEdges"
          role="img"
          aria-label={t("Authenticity code")}
        >
          <rect x="0" y="0" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="1" />
          <rect x="2" y="2" width="3" height="3" fill="currentColor" />
          <rect x="14" y="0" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="1" />
          <rect x="16" y="2" width="3" height="3" fill="currentColor" />
          <rect x="0" y="14" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="1" />
          <rect x="2" y="16" width="3" height="3" fill="currentColor" />
          <rect x="8" y="2" width="1" height="1" fill="currentColor" />
          <rect x="10" y="4" width="2" height="1" fill="currentColor" />
          <rect x="8" y="8" width="5" height="5" fill="currentColor" />
          <rect x="15" y="9" width="2" height="2" fill="currentColor" />
          <rect x="9" y="15" width="3" height="1" fill="currentColor" />
          <rect x="14" y="14" width="5" height="5" fill="currentColor" />
        </svg>
      )}
    </div>
  );
}
