import React, { useState } from 'react';
import {
  Flame,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Filter,
  Check,
  AlertTriangle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { TestCaseResult, TestSummary } from '../types';

interface TestResultsProps {
  summary: TestSummary | null;
  results: TestCaseResult[];
  isRunning: boolean;
  onRunTests: () => void;
  onExplainResults: () => void;
  isExplaining: boolean;
  hasExplained: boolean;
}

export const TestResults: React.FC<TestResultsProps> = ({
  summary,
  results,
  isRunning,
  onRunTests,
  onExplainResults,
  isExplaining,
  hasExplained,
}) => {
  const [filter, setFilter] = useState<'all' | 'failed' | 'passed'>('all');

  const filteredResults = results.filter((r) => {
    if (filter === 'failed') return r.status === 'failed';
    if (filter === 'passed') return r.status === 'passed';
    return true;
  });

  const hasRun = summary !== null && summary.verdict !== 'empty';

  return (
    <div className="tactile-box flex flex-col overflow-hidden bg-white">
      {/* Action Command Bar */}
      <div className="px-5 py-4 bg-[#F4EFE6] border-b-2 border-stone-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
              <Flame className="w-5 h-5 text-[#FF5A43]" />
              3. Form Testing Station
            </span>
            <span className="sticker-badge bg-[#E0E7FF] text-indigo-900 text-[10px] py-0.5">
              Controlled Testing DOM
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-0.5">
            Executes real browser-native validation checks against HTML5 constraint specifications.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          {/* Primary Button: Break My Form! 💥 */}
          <button
            type="button"
            onClick={onRunTests}
            disabled={isRunning}
            className="tactile-btn bg-[#FF5A43] hover:bg-[#E04833] text-white px-5 py-2.5 rounded-xl font-black text-sm tracking-wide flex items-center gap-2 select-none"
          >
            {isRunning ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                Breaking Form...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                Break My Form! 💥
              </>
            )}
          </button>

          {/* Secondary Button: Explain Results */}
          <button
            type="button"
            onClick={onExplainResults}
            disabled={!hasRun || isRunning || isExplaining}
            title={!hasRun ? 'Run tests first to enable Gemini explanations' : 'Get Gemini AI breakdown and HTML fixes'}
            className={`tactile-btn px-4 py-2.5 rounded-xl font-bold text-sm tracking-wide flex items-center gap-2 select-none ${
              hasRun
                ? 'bg-[#72B01D] hover:bg-[#5E9417] text-white'
                : 'bg-stone-200 text-stone-400 border-stone-400 cursor-not-allowed shadow-none'
            }`}
          >
            {isExplaining ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-white" />
                Explaining...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Explain Results
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary Scoreboard (if tests ran) */}
      {hasRun && summary && (
        <div
          className={`px-5 py-4 border-b-2 border-stone-800 flex flex-wrap items-center justify-between gap-4 transition-colors ${
            summary.verdict === 'survived'
              ? 'bg-[#ECFDF5] text-emerald-950'
              : 'bg-[#FFF1F2] text-rose-950'
          }`}
        >
          {/* Feedback Verdict Badge */}
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl border-2 border-stone-800 shadow-[2px_2px_0px_#1E232A] flex items-center justify-center text-2xl font-black select-none ${
                summary.verdict === 'survived' ? 'bg-[#84CC16]' : 'bg-[#FF5A43] text-white'
              }`}
            >
              {summary.verdict === 'survived' ? '🎉' : '💥'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight">
                  {summary.verdict === 'survived' ? 'Survived! 🎉' : 'Oops, busted! 💥'}
                </span>
                <span
                  className={`sticker-badge text-[10px] ${
                    summary.verdict === 'survived'
                      ? 'bg-emerald-200 text-emerald-900'
                      : 'bg-rose-200 text-rose-900'
                  }`}
                >
                  {summary.failed === 0 ? 'All Constraints Passed' : `${summary.failed} Vulnerability Found`}
                </span>
              </div>
              <p className="text-xs font-medium text-stone-600 mt-0.5">
                {summary.verdict === 'survived'
                  ? 'Your form held up against all native stress tests! No browser constraint violations found.'
                  : `Browser testing uncovered ${summary.failed} flaw${summary.failed > 1 ? 's' : ''} in field constraints, types, or structure.`}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2.5">
            <div className="bg-white border-2 border-stone-800 shadow-[2px_2px_0px_#1E232A] rounded-xl px-3 py-1.5 text-center min-w-[70px]">
              <span className="block text-[10px] font-black uppercase text-stone-500">Total</span>
              <span className="text-base font-black text-stone-900">{summary.total}</span>
            </div>

            <div className="bg-[#ECFDF5] border-2 border-stone-800 shadow-[2px_2px_0px_#1E232A] rounded-xl px-3 py-1.5 text-center min-w-[70px]">
              <span className="block text-[10px] font-black uppercase text-emerald-700">Passed</span>
              <span className="text-base font-black text-emerald-700">{summary.passed}</span>
            </div>

            <div className="bg-[#FFF1F2] border-2 border-stone-800 shadow-[2px_2px_0px_#1E232A] rounded-xl px-3 py-1.5 text-center min-w-[70px]">
              <span className="block text-[10px] font-black uppercase text-rose-700">Failed</span>
              <span className="text-base font-black text-rose-700">{summary.failed}</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs & Controls (only if results exist) */}
      {hasRun && (
        <div className="px-5 py-2.5 bg-stone-50 border-b-2 border-stone-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-stone-500 mr-1" />
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                filter === 'all'
                  ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                  : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
              }`}
            >
              All Tests ({results.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('failed')}
              className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all flex items-center gap-1 ${
                filter === 'failed'
                  ? 'bg-[#FF5A43] text-white border-stone-900 shadow-sm'
                  : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
              }`}
            >
              💥 Busted Only ({results.filter((r) => r.status === 'failed').length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('passed')}
              className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all flex items-center gap-1 ${
                filter === 'passed'
                  ? 'bg-[#72B01D] text-white border-stone-900 shadow-sm'
                  : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
              }`}
            >
              🎉 Survived Only ({results.filter((r) => r.status === 'passed').length})
            </button>
          </div>

          <span className="text-xs text-stone-500 font-mono">
            Showing {filteredResults.length} of {results.length} checks
          </span>
        </div>
      )}

      {/* Main Results Listing / Cards */}
      <div className="p-4 sm:p-5 flex-1 overflow-auto bg-stone-50/50">
        {!hasRun ? (
          <div className="py-14 px-4 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-[#FFFBEB] border-2 border-stone-800 shadow-[3px_3px_0px_#1E232A] flex items-center justify-center text-3xl mb-4">
              💥
            </div>
            <h4 className="text-lg font-black text-stone-900">Ready to break your form?</h4>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md mt-1 mb-5">
              Click <strong className="text-[#FF5A43]">Break My Form! 💥</strong> to execute browser-native validation stress tests on your inputs, formats, boundaries, and accessibility rules.
            </p>
            <button
              type="button"
              onClick={onRunTests}
              className="tactile-btn bg-[#FF5A43] hover:bg-[#E04833] text-white px-5 py-2 rounded-xl font-extrabold text-sm flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              Break My Form! 💥
            </button>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="py-10 text-center text-stone-500 text-sm">
            No test results match the selected filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {filteredResults.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border-2 border-stone-800 shadow-[2px_2px_0px_#1E232A] transition-all bg-white flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                  item.status === 'failed' ? 'border-l-8 border-l-[#FF5A43]' : 'border-l-8 border-l-[#72B01D]'
                }`}
              >
                {/* Test details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs font-black bg-stone-100 text-stone-800 px-2 py-0.5 rounded border border-stone-300">
                      {item.field}
                    </span>

                    <span className="sticker-badge bg-stone-100 text-stone-700 text-[10px] py-0.5">
                      category: {item.category}
                    </span>

                    {item.inputTested && (
                      <span className="sticker-badge bg-amber-100 text-amber-900 text-[10px] py-0.5">
                        input: "{item.inputTested}"
                      </span>
                    )}
                  </div>

                  <h5 className="font-black text-sm text-stone-900 mb-2">{item.testCase}</h5>

                  {/* Comparison: Expected vs Actual */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                    <div>
                      <span className="font-extrabold text-stone-600 block uppercase text-[10px] mb-0.5">
                        Expected Behavior:
                      </span>
                      <p className="text-stone-800 font-mono text-[11px] leading-relaxed">
                        {item.expected}
                      </p>
                    </div>

                    <div>
                      <span className="font-extrabold text-stone-600 block uppercase text-[10px] mb-0.5">
                        Actual Browser Result:
                      </span>
                      <p
                        className={`font-mono text-[11px] leading-relaxed font-bold ${
                          item.status === 'failed' ? 'text-rose-700' : 'text-emerald-700'
                        }`}
                      >
                        {item.actual}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 mt-2 italic">{item.detail}</p>
                </div>

                {/* Status Badge */}
                <div className="sm:self-center shrink-0">
                  {item.status === 'failed' ? (
                    <div className="sticker-badge bg-[#FF5A43] text-white text-xs px-3 py-1">
                      <XCircle className="w-4 h-4" />
                      Oops, busted! 💥
                    </div>
                  ) : (
                    <div className="sticker-badge bg-[#84CC16] text-stone-950 text-xs px-3 py-1">
                      <CheckCircle2 className="w-4 h-4 text-stone-950" />
                      Survived! 🎉
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      {hasRun && (
        <div className="px-5 py-3 bg-[#F4EFE6] border-t-2 border-stone-800 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-700">
          <span>
            {summary?.failed === 0 ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> 100% of tested browser constraints held firm!
              </span>
            ) : (
              <span className="text-rose-700 font-bold flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> {summary?.failed} issue(s) detected. Click Explain Results for AI diagnoses.
              </span>
            )}
          </span>

          <button
            type="button"
            onClick={onExplainResults}
            disabled={isExplaining}
            className="font-bold text-[#2563EB] hover:underline flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {hasExplained ? 'Re-generate Explanations' : 'Get Gemini Fix Suggestions →'}
          </button>
        </div>
      )}
    </div>
  );
};
