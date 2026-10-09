import Link from "next/link";

export default function OfflinePage() {
  return (
    <>
      <style>{`
        .offline-wrap {
          position: relative;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 4rem 1.5rem;
          font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI",
            Roboto, Helvetica, Arial, sans-serif;
          color: #18181b;
        }
        .offline-bg {
          position: absolute;
          inset: 0;
          z-index: -1;
          background: radial-gradient(
            ellipse at top left,
            #f4f4f5 0%,
            #ffffff 45%,
            #fafafa 100%
          );
        }
        .offline-content {
          text-align: center;
          animation: offline-fade-up 0.5s ease both;
        }
        .offline-icon {
          width: 4rem;
          height: 4rem;
          margin: 0 auto 1.5rem;
          color: #d4d4d8;
        }
        .offline-title {
          font-size: 1.875rem;
          font-weight: 700;
          letter-spacing: -0.025em;
          margin: 0 0 0.75rem;
          background: linear-gradient(90deg, #18181b, #52525b);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .offline-text {
          font-size: 1.125rem;
          line-height: 1.75rem;
          color: #71717a;
          max-width: 28rem;
          margin: 0 auto 2rem;
        }
        .offline-link {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 1rem;
          border-radius: 0.75rem;
          background: #18181b;
          color: #ffffff;
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
          transition: background-color 0.15s ease;
        }
        .offline-link:hover {
          background: #27272a;
        }
        @keyframes offline-fade-up {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (prefers-color-scheme: dark) {
          .offline-wrap {
            color: #fafafa;
          }
          .offline-bg {
            background: radial-gradient(
              ellipse at top left,
              #18181b 0%,
              #09090b 45%,
              #000000 100%
            );
          }
          .offline-icon {
            color: #3f3f46;
          }
          .offline-title {
            background: linear-gradient(90deg, #ffffff, #a1a1aa);
            -webkit-background-clip: text;
            background-clip: text;
          }
          .offline-text {
            color: #a1a1aa;
          }
          .offline-link {
            background: #ffffff;
            color: #18181b;
          }
          .offline-link:hover {
            background: #e4e4e7;
          }
        }
      `}</style>
      <div className="offline-wrap">
        <div className="offline-bg" />
        <div className="offline-content">
          <svg
            className="offline-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="1" x2="23" y1="1" y2="23" />
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
            <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <line x1="12" x2="12.01" y1="20" y2="20" />
          </svg>
          <h1 className="offline-title">You&apos;re Offline</h1>
          <p className="offline-text">
            This page hasn&apos;t been visited yet. Once you&apos;re back
            online, visit the pages you need and they&apos;ll be available
            offline.
          </p>
          <Link href="/" className="offline-link">
            Go Home
          </Link>
        </div>
      </div>
    </>
  );
}
