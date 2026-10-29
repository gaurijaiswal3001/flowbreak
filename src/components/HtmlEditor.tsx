import React, { useState } from 'react';
import { Code2, Trash2, Wand2, Copy, Check, ChevronDown } from 'lucide-react';
import { SAMPLES } from '../utils/samples';

interface HtmlEditorProps {
  value: string;
  onChange: (val: string) => void;
  onLoadSample: (sampleId?: string) => void;
  onClear: () => void;
}

export const HtmlEditor: React.FC<HtmlEditorProps> = ({
  value,
  onChange,
  onLoadSample,
  onClear,
}) => {
  const [copied, setCopied] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  const linesCount = value ? value.split('\n').length : 0;
  const charsCount = value ? value.length : 0;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="tactile-box flex flex-col h-full overflow-hidden">
      {/* Editor Header */}
      <div className="px-4 py-3 bg-[#F4EFE6] border-b-2 border-stone-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-1">
            <span className="w-3 h-3 rounded-full bg-[#FF5A43] border border-stone-800 inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#EAB308] border border-stone-800 inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#84CC16] border border-stone-800 inline-block" />
          </div>
          <span className="font-extrabold text-sm uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-[#2563EB]" />
            1. HTML Input
          </span>
          <span className="sticker-badge bg-white text-stone-700 text-[10px] py-0.5">
            {linesCount} lines · {charsCount} chars
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Preset Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="tactile-btn bg-white hover:bg-stone-50 text-stone-800 px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1"
              title="Select a pre-built form sample"
            >
              Presets
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showPresets && (
              <div className="absolute right-0 mt-1 w-64 bg-white border-2 border-stone-800 shadow-[3px_3px_0px_#1E232A] rounded-xl z-20 py-1 overflow-hidden">
                <div className="px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-stone-500 border-b border-stone-200">
                  Select Form Preset
                </div>
                {SAMPLES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      onLoadSample(s.id);
                      setShowPresets(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-[#FAF7F0] border-b border-stone-100 last:border-b-0 flex flex-col gap-0.5"
                  >
                    <span className="font-bold text-stone-900">{s.title}</span>
                    <span className="text-[10px] text-stone-500 line-clamp-1">{s.tagline}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Try Sample Primary button */}
          <button
            type="button"
            onClick={() => onLoadSample()}
            className="tactile-btn bg-[#2563EB] hover:bg-blue-700 text-white px-3 py-1 text-xs font-black rounded-lg flex items-center gap-1.5"
          >
            <Wand2 className="w-3.5 h-3.5" />
            Try Sample
          </button>

          {/* Copy button */}
          <button
            type="button"
            onClick={handleCopy}
            disabled={!value}
            className="tactile-btn bg-white hover:bg-stone-100 text-stone-800 px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1"
            title="Copy markup"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>

          {/* Clear button */}
          <button
            type="button"
            onClick={onClear}
            disabled={!value}
            className="tactile-btn bg-[#FAF0F0] hover:bg-[#FEE2E2] text-[#B91C1C] px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1"
            title="Reset textarea"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Textarea Area */}
      <div className="relative flex-1 min-h-[300px] flex">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Paste your HTML form markup here...

e.g.:
<form action="/login" method="POST">
  <label for="email">Email</label>
  <input type="email" id="email" name="email" required />
  
  <button type="submit">Submit</button>
</form>`}
          className="w-full h-full p-4 font-mono text-xs sm:text-sm text-stone-900 bg-[#FCFBF8] focus:bg-white resize-none outline-none leading-relaxed selection:bg-[#FED7AA]"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
        />

        {!value && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6 text-center bg-[#FAF7F0]/40">
            <div className="w-12 h-12 rounded-2xl bg-[#FFE4E6] border-2 border-stone-800 shadow-[2px_2px_0px_#1E232A] flex items-center justify-center text-[#FF5A43] mb-3">
              <Code2 className="w-6 h-6" />
            </div>
            <p className="font-bold text-stone-800 text-sm">No HTML markup yet</p>
            <p className="text-xs text-stone-500 max-w-xs mt-1">
              Type or paste any HTML form snippet, or click <span className="font-bold text-[#2563EB]">Try Sample</span> to load a flawed form ready for stress testing.
            </p>
          </div>
        )}
      </div>

      {/* Editor Footer / Info */}
      <div className="px-4 py-2 bg-[#F4EFE6] border-t-2 border-stone-800 text-[11px] text-stone-600 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" />
          Ready for browser-native constraint checking
        </span>
        <span className="font-semibold text-stone-500">Supports HTML5 input types & attributes</span>
      </div>
    </div>
  );
};
