import localFont from "next/font/local";
import "../globals.css";

const satoshi = localFont({
  src: [
    { path: "../../fonts/satoshi/Satoshi-Light.otf", weight: "300", style: "normal" },
    { path: "../../fonts/satoshi/Satoshi-Regular.otf", weight: "400", style: "normal" },
    { path: "../../fonts/satoshi/Satoshi-Medium.otf", weight: "500", style: "normal" },
    { path: "../../fonts/satoshi/Satoshi-Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

export default function LinksLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${satoshi.variable} h-full antialiased`}>
      <body className="min-h-full bg-ink text-white">{children}</body>
    </html>
  );
}
