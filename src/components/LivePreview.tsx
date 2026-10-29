import React, { useState } from 'react';
import { Eye, ShieldCheck, Smartphone, Monitor, RefreshCw } from 'lucide-react';
import { sanitizeHtml } from '../utils/formTester';

interface LivePreviewProps {
  html: string;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ html }) => {
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');
  const [refreshKey, setRefreshKey] = useState(0);

  // Sanitize markup for safe rendering
  const safeContent = sanitizeHtml(html);

  // Default clean styling injected into iframe document so raw forms render attractively
  const iframeDoc = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      padding: 20px;
      background: #ffffff;
      color: #1f2937;
      line-height: 1.5;
    }
    .form-container, form {
      max-width: 100%;
      margin: 0 auto;
    }
    h1, h2, h3 {
      margin-bottom: 1rem;
      color: #111827;
      font-weight: 700;
    }
    .form-group {
      margin-bottom: 1.1rem;
    }
    label {
      display: block;
      font-weight: 600;
      font-size: 0.875rem;
      margin-bottom: 0.35rem;
      color: #374151;
    }
    input[type="text"],
    input[type="email"],
    input[type="password"],
    input[type="number"],
    input[type="tel"],
    input[type="url"],
    select,
    textarea {
      width: 100%;
      padding: 0.55rem 0.75rem;
      border: 1.5px solid #d1d5db;
      border-radius: 6px;
      font-size: 0.875rem;
      outline: none;
      transition: border-color 0.15s ease;
      background: #fafafa;
    }
    input:focus, select:focus, textarea:focus {
      border-color: #2563eb;
      background: #ffffff;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }
    input:invalid:not(:placeholder-shown) {
      border-color: #ef4444;
    }
    small {
      display: block;
      font-size: 0.75rem;
      color: #6b7280;
      margin-top: 0.25rem;
    }
    .checkbox-group label, .radio-group label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 400;
      cursor: pointer;
    }
    input[type="checkbox"], input[type="radio"] {
      width: 1rem;
      height: 1rem;
      accent-color: #2563eb;
    }
    button, input[type="submit"] {
      display: inline-block;
      background: #2563eb;
      color: #ffffff;
      padding: 0.6rem 1.25rem;
      border: none;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 0.5rem;
      transition: background 0.15s ease;
    }
    button:hover, input[type="submit"]:hover {
      background: #1d4ed8;
    }
  </style>
</head>
<body>
  ${safeContent || '<div style="color: #9ca3af; text-align: center; padding: 40px 10px; font-style: italic;">No form markup to preview yet.</div>'}
</body>
</html>
  `;

  return (
    <div className="tactile-box flex flex-col h-full overflow-hidden">
      {/* Preview Header */}
      <div className="px-4 py-3 bg-[#F4EFE6] border-b-2 border-stone-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sm uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-[#FF5A43]" />
            2. Live Preview
          </span>
          <span className="sticker-badge bg-[#DCFCE7] text-emerald-900 text-[10px] py-0.5">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            Sandboxed Iframe
          </span>
        </div>

        {/* Viewport & Refresh controls */}
        <div className="flex items-center gap-1.5">
          <div className="bg-stone-200/80 p-0.5 rounded-lg flex items-center border border-stone-400">
            <button
              type="button"
              onClick={() => setDeviceView('desktop')}
              className={`px-2 py-0.5 text-xs font-bold rounded flex items-center gap-1 transition-all ${
                deviceView === 'desktop'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Desktop viewport"
            >
              <Monitor className="w-3.5 h-3.5" />
              Desktop
            </button>
            <button
              type="button"
              onClick={() => setDeviceView('mobile')}
              className={`px-2 py-0.5 text-xs font-bold rounded flex items-center gap-1 transition-all ${
                deviceView === 'mobile'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Mobile viewport (360px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              Mobile
            </button>
          </div>

          <button
            type="button"
            onClick={() => setRefreshKey((k) => k + 1)}
            className="tactile-btn bg-white hover:bg-stone-50 text-stone-700 p-1 rounded-lg"
            title="Reload preview"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex-1 bg-stone-100/70 p-3 sm:p-4 flex items-center justify-center min-h-[300px] overflow-auto">
        <div
          className={`transition-all duration-300 w-full h-full bg-white rounded-xl border-2 border-stone-800 shadow-[2px_2px_0px_#1E232A] overflow-hidden flex flex-col ${
            deviceView === 'mobile' ? 'max-w-[360px]' : 'max-w-full'
          }`}
          style={{ minHeight: '320px' }}
        >
          {/* Mock Browser Topbar */}
          <div className="bg-stone-100 border-b border-stone-300 px-3 py-1.5 flex items-center justify-between text-[11px] text-stone-500 font-mono select-none">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-stone-300" />
              <span className="w-2 h-2 rounded-full bg-stone-300" />
              <span className="w-2 h-2 rounded-full bg-stone-300" />
            </div>
            <span className="truncate max-w-[200px] bg-white px-2 py-0.5 rounded border border-stone-200 text-stone-600 text-[10px]">
              sandbox://preview.local
            </span>
            <span className="text-[10px] text-stone-400">scripts: blocked</span>
          </div>

          {/* Sandboxed iframe */}
          <iframe
            key={refreshKey}
            srcDoc={iframeDoc}
            title="Sandboxed Form Preview"
            sandbox="allow-forms"
            className="w-full flex-1 border-0 bg-white"
            style={{ minHeight: '300px' }}
          />
        </div>
      </div>

      {/* Preview Footer */}
      <div className="px-4 py-2 bg-[#F4EFE6] border-t-2 border-stone-800 text-[11px] text-stone-600 flex items-center justify-between">
        <span className="truncate">
          🔒 Strict sandbox: scripts, inline handlers, and cookie access are disabled.
        </span>
        <span className="font-mono text-[10px] text-stone-500 hidden sm:inline">
          sandbox="allow-forms"
        </span>
      </div>
    </div>
  );
};
