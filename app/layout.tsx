// app/layout.tsx
import './globals.css'; // You can add bootstrap and custom styles here
import Script from 'next/script';
import BootstrapClient from "@/components/BootstrapClient";
import Footer from '@/components/Footer';
const appName = process.env.NEXT_PUBLIC_APP_NAME;

export const metadata = {
  title: appName,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-100" data-bs-theme="light">
      <head>
        <link rel="icon" href="/img/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/img/favicon.png" type="image/png" />
      </head>
      <body className="d-flex flex-column h-100">
        <BootstrapClient />
        <main className="mb-3">{children}</main>
        <Script id="theme-script" strategy="afterInteractive">
          {`if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
              document.documentElement.setAttribute("data-bs-theme", "dark");
          }`}
        </Script>
        <Footer />
      </body>
    </html>
  );
}
