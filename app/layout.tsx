// app/layout.tsx
import './globals.css'; // You can add bootstrap and custom styles here
import Script from 'next/script';

export const metadata = {
  title: 'Asset Manager',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-100" data-bs-theme="light">
      <head>
        <link rel="icon" href="/img/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/img/favicon.png" type="image/png" />
      </head>
      <body className="d-flex flex-column h-100">
        {/* <Script src="/js/bootstrap.bundle.min.js" strategy="afterInteractive" />
        <Script src="/js/jquery.min.js" strategy="afterInteractive" /> */}
        <main className="mb-3">{children}</main>
        <Script id="theme-script" strategy="afterInteractive">
          {`if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
              document.documentElement.setAttribute("data-bs-theme", "dark");
          }`}
        </Script>
        <footer className="d-flex mt-auto flex-wrap justify-content-between align-items-center py-3 px-3 border-top">
          <div className="col-md-4 d-flex align-items-center">
            <a href="/" className="mb-3 me-2 mb-md-0 text-muted text-decoration-none lh-1">
              <i className="bi bi-pc-display"></i>
              <span className="mb-3 mb-md-0 text-muted">Asset Manager v2.0 by Jack Pendleton</span>
            </a>
          </div>
          <ul className="nav col-md-4 justify-content-end list-unstyled d-flex">
            <li className="ms-3">
              <a className="text-muted" href="https://github.com/Fanman03/AssetManager" target="_blank" rel="noopener noreferrer">
                <i className="bi bi-github"></i>
              </a>
            </li>
            <li className="ms-3">
              <a className="text-muted" href="https://www.patreon.com/fanman03" target="_blank" rel="noopener noreferrer">
                <i className="bi bi-piggy-bank-fill"></i>
              </a>
            </li>
          </ul>
        </footer>
      </body>
    </html>
  );
}
