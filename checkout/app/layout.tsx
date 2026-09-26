import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Dodo Checkout",
  description: "Secure test checkout",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className=" antialiased">
      <body className={`${roboto.className}`}>{children}</body>
    </html>
  );
}
