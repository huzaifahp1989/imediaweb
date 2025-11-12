import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ExternalLink } from "lucide-react";

// Landing page that shows the external site first, with a clear link to the Kids Home page
export default function Landing() {
  const EXTERNAL_URL = "https://studio--studio-653801381-47983.us-central1.hosted.app/";
  const [loaded, setLoaded] = useState(false);

  // Fallback if iframe cannot load due to X-Frame-Options or CSP
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loaded) {
        // After a short delay, if still not loaded, we will show a fallback message
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [loaded]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Top action bar */}
      <div className="w-full bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="text-sm text-gray-600">Welcome to Islam Media Central</div>
          <div className="flex items-center gap-2">
            <a
              href={EXTERNAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
            >
              Open in new tab <ExternalLink className="w-4 h-4" />
            </a>
            <Link
              to={createPageUrl("Home")}
              className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
            >
              Kids Home
            </Link>
          </div>
        </div>
      </div>

      {/* Iframe container */}
      <div className="flex-1 min-h-[60vh] bg-gray-50">
        <iframe
          src={EXTERNAL_URL}
          title="Islam Media Central"
          className="w-full h-[calc(100vh-56px)]"
          style={{ border: "none" }}
          onLoad={() => setLoaded(true)}
        />
      </div>

      {/* Fallback message if iframe fails to load */}
      {!loaded && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="bg-white/80 p-4 rounded shadow max-w-md text-center">
            <p className="text-gray-700 mb-2">Loading the landing page…</p>
            <p className="text-gray-500 text-sm">
              If this takes too long, the site may block embedding. Use the
              "Open in new tab" button above.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

