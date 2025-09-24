"use client";

import { useEffect } from "react";
import logger from '../lib/logger';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    logger.error("Global app error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-zinc-900/70 border border-white/10 rounded-xl p-6">
            <h2 className="text-white text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-white/60 text-sm mb-4">We’ve logged the error. Try refreshing the page.</p>
            <div className="text-xs text-white/40 break-all mb-4">
              {error.message}
              {error.digest ? <div className="mt-2">digest: {error.digest}</div> : null}
            </div>
            <div className="flex gap-2">
              <button onClick={() => reset()} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg">Retry</button>
              <a href="/" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg">Go Home</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
