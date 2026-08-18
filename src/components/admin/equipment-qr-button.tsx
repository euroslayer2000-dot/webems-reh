"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { QrCode, X } from "lucide-react";
import { btnGhostSm, btnPrimary } from "./button-styles";

export function EquipmentQrButton({
  code,
  name,
  location,
  url,
}: {
  code: string;
  name: string;
  location: string | null;
  url: string;
}) {
  const [open, setOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!open || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, url, { width: 220, margin: 1, color: { dark: "#1f2937", light: "#ffffff" } });
  }, [open, url]);

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `QR-${code}.png`;
    a.click();
  }

  function handlePrint() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const w = window.open("", "_blank", "width=400,height=500");
    if (!w) return;
    w.document.write(
      `<html><head><title>QR ${code}</title></head>` +
        `<body style="text-align:center;font-family:sans-serif;padding:20px">` +
        `<img src="${dataUrl}" style="width:220px">` +
        `<div style="margin-top:12px;font-size:14px">เลขครุภัณฑ์: ${code}<br>ชื่อ: ${name}<br>สถานที่: ${location ?? "-"}</div>` +
        `</body></html>`
    );
    w.document.close();
    w.focus();
    w.print();
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={btnGhostSm} title="QR Code">
        <QrCode size={14} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xs rounded-[var(--radius-lg)] bg-surface p-5 text-center shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-text">QR Code ครุภัณฑ์</h3>
              <button type="button" onClick={() => setOpen(false)} aria-label="ปิด" className="text-text-muted hover:text-text">
                <X size={18} />
              </button>
            </div>
            <canvas ref={canvasRef} className="mx-auto" />
            <p className="mt-3 text-xs text-text-muted">
              เลขครุภัณฑ์: {code}
              <br />
              ชื่อ: {name}
              <br />
              สถานที่: {location ?? "-"}
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <button type="button" onClick={handleDownload} className={btnGhostSm}>
                ดาวน์โหลด
              </button>
              <button type="button" onClick={handlePrint} className={btnPrimary}>
                พิมพ์
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
