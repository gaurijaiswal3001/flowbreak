import React, { useState } from 'react';
import {
  Sparkles,
  AlertCircle,
  Check,
  Copy,
  ArrowRight,
  Lightbulb,
  Wrench,
  Code2,
  RefreshCw,
} from 'lucide-react';
import { GeminiExplanation } from '../types';

interface GeminiExplainerProps {
  explanation: GeminiExplanation | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onApplyRepairedForm: (snippet: string) => void;
}

export const GeminiExplainer: React.FC<GeminiExplainerProps> = ({
  explanation,
  isLoading,
  error,
  onRetry,
  onApplyRepairedForm,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleCopyCode = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopySnippet = async (snippet: string) => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleApply = (snippet: string) => {
    onApplyRepairedForm(snippet);
    setApplied(true);
    setTimeout(() => setApplied(false), 2500);
  };

  if (!isLoading && !error && !explanation) {
    return null;
  }

  return (
    <div className="tactile-box bg-white overflow-hidden border-2 border-stone-800 shadow-[4px_4px_0px_#1E232A]">
      {/* AI Section Header with clear disclosure */}
      <div className="px-5 py-4 bg-[#EFF6FF] border-b-2 border-stone-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-bold border-2 border-stone-800 shadow-[1.5px_1.5px_0px_#1E232A]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-stone-900 tracking-tight">
                AI-Generated Explanations & Fixes
              </h3>
              <span className="sticker-badge bg-[#FEF08A] text-amber-950 text-[10px]">
                Powered by Gemini
              </span>
            </div>
            <p className="text-xs text-stone-600">
              Clear breakdown of why browser validation broke, plus ready-to-use HTML corrections.
            </p>
          </div>
        </div>

        {/* Status Tag */}
        <div className="sticker-badge bg-white text-stone-800 text-[11px]">
          <Code2 className="w-3.5 h-3.5 text-[#2563EB]" />
          HTML5 Standard Solutions
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {/* Loading State */}
        {isLoading && (
          <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-[#DBEAFE] border-2 border-stone-800 shadow-[2px_2px_0px_#1E232A] flex items-center justify-center text-[#2563EB] mb-4 animate-bounce">
              <Sparkles className="w-7 h-7 animate-spin" />
            </div>
            <h4 className="text-base font-black text-stone-900">
              Analyzing test results with Gemini...
            </h4>
            <p className="text-xs text-stone-600 max-w-sm mt-1">
              Synthesizing browser constraint behaviors and preparing actionable HTML repairs for your form.
            </p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="p-4 rounded-xl bg-[#FFF1F2] border-2 border-[#E11D48] text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-sm">Unable to generate AI explanation</h5>
                <p className="text-xs text-rose-800 mt-0.5">{error}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onRetry}
              className="tactile-btn bg-white hover:bg-stone-50 text-stone-900 px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </button>
          </div>
        )}

        {/* Successful Explanation */}
        {!isLoading && explanation && (
          <div className="space-y-6">
            {/* Overview Box */}
            <div className="p-4 rounded-xl bg-[#FAF7F0] border-2 border-stone-800 shadow-[2px_2px_0px_#1E232A]">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="sticker-badge bg-[#A3E635] text-stone-900 text-[10px]">
                  Summary Diagnosis
                </span>
              </div>
              <p className="text-sm font-medium text-stone-800 leading-relaxed">
                {explanation.overview}
              </p>
            </div>

            {/* List of Detected Issues and Fixes */}
            {explanation.issues && explanation.issues.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Wrench className="w-4 h-4 text-[#FF5A43]" />
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-stone-900">
                    Fixes for Detected Vulnerabilities ({explanation.issues.length})
                  </h4>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {explanation.issues.map((issue, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border-2 border-stone-800 shadow-[2px_2px_0px_#1E232A] bg-white"
                    >
                      {/* Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-stone-200">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold bg-rose-100 text-rose-900 px-2 py-0.5 rounded border border-rose-300">
                            {issue.fieldName}
                          </span>
                          <span className="text-xs font-black text-stone-800">{issue.testCase}</span>
                        </div>
                        <span className="sticker-badge bg-stone-100 text-stone-600 text-[10px]">
                          Issue #{idx + 1}
                        </span>
                      </div>

                      {/* Diagnosis & Fix */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-xs">
                        <div className="bg-[#FFF5F5] p-3 rounded-lg border border-rose-200">
                          <span className="font-extrabold text-rose-900 block text-[11px] uppercase mb-1">
                            Why it broke:
                          </span>
                          <p className="text-rose-950 leading-relaxed">{issue.diagnosis}</p>
                        </div>

                        <div className="bg-[#F0FDF4] p-3 rounded-lg border border-emerald-200">
                          <span className="font-extrabold text-emerald-900 block text-[11px] uppercase mb-1">
                            The Standard Fix:
                          </span>
                          <p className="text-emerald-950 leading-relaxed">{issue.fixExplanation}</p>
                        </div>
                      </div>

                      {/* Code fix snippet */}
                      <div className="bg-stone-900 text-stone-100 p-3 rounded-lg font-mono text-xs relative group border border-stone-800">
                        <div className="flex items-center justify-between mb-1.5 text-[10px] text-stone-400 font-sans font-bold">
                          <span>REPLACEMENT HTML</span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(issue.codeFix, idx)}
                            className="text-stone-300 hover:text-white flex items-center gap-1 bg-stone-800 px-2 py-0.5 rounded transition-colors"
                          >
                            {copiedIndex === idx ? (
                              <>
                                <Check className="w-3 h-3 text-green-400" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                Copy Code
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="overflow-x-auto whitespace-pre-wrap text-emerald-400 font-mono text-xs">
                          {issue.codeFix}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Complete Repaired Form Snippet */}
            {explanation.repairedSnippet && (
              <div className="p-4 sm:p-5 rounded-xl border-2 border-stone-800 shadow-[3px_3px_0px_#1E232A] bg-[#FAF7F0]">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <h4 className="font-extrabold text-sm text-stone-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#2563EB]" />
                      Complete Repaired Form Markup
                    </h4>
                    <p className="text-xs text-stone-600">
                      Clean version with all browser validation constraints properly resolved.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopySnippet(explanation.repairedSnippet)}
                      className="tactile-btn bg-white hover:bg-stone-100 text-stone-800 px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1"
                    >
                      {copiedSnippet ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy Repaired Form
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApply(explanation.repairedSnippet)}
                      className="tactile-btn bg-[#2563EB] hover:bg-blue-700 text-white px-3.5 py-1 text-xs font-black rounded-lg flex items-center gap-1.5"
                    >
                      {applied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Applied to Editor!
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-3.5 h-3.5" />
                          Apply to HTML Input
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-stone-900 rounded-lg p-3 text-stone-100 font-mono text-xs overflow-x-auto max-h-56">
                  <pre className="text-stone-200">{explanation.repairedSnippet}</pre>
                </div>
              </div>
            )}

            {/* Pro Tips */}
            {explanation.proTips && explanation.proTips.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-50/70 border-2 border-stone-800 shadow-[2px_2px_0px_#1E232A]">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <h4 className="font-black text-xs uppercase tracking-wider text-amber-950">
                    Pro Tips for Native HTML Form Reliability
                  </h4>
                </div>
                <ul className="space-y-1.5 text-xs text-stone-700 list-disc list-inside">
                  {explanation.proTips.map((tip, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
