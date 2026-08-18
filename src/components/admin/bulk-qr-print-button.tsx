"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { Printer } from "lucide-react";
import { btnPrimary } from "./button-styles";

type QrItem = { code: string; name: string; location: string | null; url: string };

export function BulkQrPrintButton({ items }: { items: QrItem[] }) {
  const [printing, setPrinting] = useState(false);

  async function handlePrint() {
    if (items.length === 0 || printing) return;
    setPrinting(true);
    try {
      const cards = await Promise.all(
        items.map(async (item) => {
          const dataUrl = await QRCode.toDataURL(item.url, { width: 200, margin: 1, color: { dark: "#1f2937", light: "#ffffff" } });
          return `
            <div class="card">
              <img src="${dataUrl}" width="200" height="200">
              <div class="meta">เลขครุภัณฑ์: ${item.code}<br>ชื่อ: ${item.name}<br>สถานที่: ${item.location ?? "-"}</div>
            </div>
          `;
        })
      );

      const w = window.open("", "_blank", "width=900,height=700");
      if (!w) return;
      w.document.write(`
        <html>
          <head>
            <title>QR Code ครุภัณฑ์ (${items.length} รายการ)</title>
            <style>
              body { font-family: sans-serif; padding: 20px; }
              .grid { display: flex; flex-wrap: wrap; gap: 16px; }
              .card { width: 220px; text-align: center; padding: 12px; border: 1px solid #ddd; border-radius: 8px; page-break-inside: avoid; }
              .meta { margin-top: 8px; font-size: 12px; text-align: left; }
            </style>
          </head>
          <body>
            <div class="grid">${cards.join("")}</div>
          </body>
        </html>
      `);
      w.document.close();
      w.focus();
      w.print();
    } finally {
      setPrinting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handlePrint}
      disabled={items.length === 0 || printing}
      className={`${btnPrimary} disabled:cursor-not-allowed disabled:opacity-40`}
    >
      <Printer size={16} /> {printing ? "กำลังสร้าง QR..." : `พิมพ์ QR ที่เลือก (${items.length})`}
    </button>
  );
}
