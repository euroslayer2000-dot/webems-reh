import type { Metadata } from "next";
import { Noto_Sans_Thai, Sarabun } from "next/font/google";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["thai", "latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "EMS ROI-ET HOSPITAL",
  description: "หน่วยกู้ชีพและการแพทย์ฉุกเฉิน โรงพยาบาลร้อยเอ็ด",
};

const THEME_INIT_SCRIPT = `
(function () {
  var saved = localStorage.getItem("ems-theme");
  var theme = saved === "light" || saved === "dark"
    ? saved
    : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      suppressHydrationWarning
      className={`${notoSansThai.variable} ${sarabun.variable} h-full antialiased`}
    >
      <head>
        {/* Runs before hydration to avoid a flash of the wrong theme. */}
        <script
          type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
