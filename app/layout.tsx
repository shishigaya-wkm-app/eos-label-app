import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "バーコード作成アプリ",
  description: "EOS/JANバーコード発行アプリ",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "バーコード作成",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}