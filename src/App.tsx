import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { HtmlEditor } from './components/HtmlEditor';
import { LivePreview } from './components/LivePreview';
import { TestResults } from './components/TestResults';
import { GeminiExplainer } from './components/GeminiExplainer';
import { SAMPLES } from './utils/samples';
import { runFormTests } from './utils/formTester';
import { TestCaseResult, TestSummary, GeminiExplanation } from './types';
import { Terminal, Shield, Zap, Sparkles } from 'lucide-react';

export default function App() {
  // 1. Core State
  const [htmlInput, setHtmlInput] = useState<string>(SAMPLES[0].html);
  const [testResults, setTestResults] = useState<TestCaseResult[]>([]);
  const [testSummary, setTestSummary] = useState<TestSummary | null>(null);
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);
  const [testsRunCount, setTestsRunCount] = useState<number>(0);

  // 2. Gemini AI Explanations State
  const [explanation, setExplanation] = useState<GeminiExplanation | null>(null);
  const [isExplaining, setIsExplaining] = useState<boolean>(false);
  const [explainError, setExplainError] = useState<string | null>(null);

  // Ref to scroll to results or AI section if needed
  const resultsRef = useRef<HTMLDivElement>(null);
  const explainerRef = useRef<HTMLDivElement>(null);

  // Load sample form
  const handleLoadSample = (sampleId?: string) => {
    const chosen = sampleId ? SAMPLES.find((s) => s.id === sampleId) : SAMPLES[0];
    const target = chosen || SAMPLES[0];
    setHtmlInput(target.html);
    // Reset previous run results
    setTestResults([]);
    setTestSummary(null);
    setExplanation(null);
    setExplainError(null);
  };

  // Clear input
  const handleClear = () => {
    setHtmlInput('');
    setTestResults([]);
    setTestSummary(null);
    setExplanation(null);
    setExplainError(null);
  };

  // When user edits HTML, reset explanation
  const handleHtmlChange = (newVal: string) => {
    setHtmlInput(newVal);
    if (explanation) {
      setExplanation(null);
    }
  };

  // Execute Form Stress Tests
  const handleRunTests = () => {
    if (!htmlInput.trim()) {
      alert('Please enter or paste some HTML form markup first!');
      return;
    }

    setIsRunningTests(true);

    // Brief tactile animation timeout so user perceives the stress testing in action
    setTimeout(() => {
      try {
        const { results, summary } = runFormTests(htmlInput);
        setTestResults(results);
        setTestSummary(summary);
        setTestsRunCount((c) => c + 1);
        setExplanation(null);
        setExplainError(null);

        // Smooth scroll to results
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      } catch (err: any) {
        console.error('Error during form test execution:', err);
      } finally {
        setIsRunningTests(false);
      }
    }, 250);
  };

  // Call Gemini to explain test results
  const handleExplainResults = async () => {
    if (!testSummary || testResults.length === 0) return;

    setIsExplaining(true);
    setExplainError(null);

    const failed = testResults.filter((r) => r.status === 'failed');
    const passed = testResults.filter((r) => r.status === 'passed');

    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formHtml: htmlInput,
          summary: testSummary,
          failedTests: failed,
          passedTests: passed,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      const data: GeminiExplanation = await response.json();
      setExplanation(data);

      setTimeout(() => {
        explainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } catch (err: any) {
      console.error('Failed to get Gemini explanation:', err);
      setExplainError(err.message || 'Unable to connect to Gemini API. Please try again.');
    } finally {
      setIsExplaining(false);
    }
  };

  // Apply repaired snippet back into editor
  const handleApplyRepairedForm = (repairedSnippet: string) => {
    setHtmlInput(repairedSnippet);
    // Re-run validation automatically to show that repaired version survives!
    setTimeout(() => {
      const { results, summary } = runFormTests(repairedSnippet);
      setTestResults(results);
      setTestSummary(summary);
      setTestsRunCount((c) => c + 1);
    }, 150);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#1E232A] flex flex-col selection:bg-[#FED7AA]">
      {/* Top Header */}
      <Header testsRunCount={testsRunCount} lastVerdict={testSummary?.verdict} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Intro banner with quick hints */}
        <section className="tactile-box p-4 bg-white flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-stone-700">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#FFE4E6] border border-stone-800 flex items-center justify-center font-bold text-base text-[#FF5A43] shrink-0">
              🛠️
            </span>
            <span>
              <strong>Welcome to FlowBreak!</strong> Paste your form markup on the left, watch the sandboxed preview on the right, and click <strong className="text-[#FF5A43]">Break My Form! 💥</strong> to test real browser constraint rules.
            </span>
          </div>
          <div className="flex items-center gap-2 text-stone-500 font-mono text-xs">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            Isolated Sandbox
          </div>
        </section>

        {/* Two-Column Grid: Section A (HTML Input) and Section B (Live Preview) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Section A: HTML Input */}
          <div className="flex flex-col">
            <HtmlEditor
              value={htmlInput}
              onChange={handleHtmlChange}
              onLoadSample={handleLoadSample}
              onClear={handleClear}
            />
          </div>

          {/* Section B: Live Preview */}
          <div className="flex flex-col">
            <LivePreview html={htmlInput} />
          </div>
        </section>

        {/* Section C: Form Testing Station */}
        <section ref={resultsRef} className="space-y-6">
          <TestResults
            summary={testSummary}
            results={testResults}
            isRunning={isRunningTests}
            onRunTests={handleRunTests}
            onExplainResults={handleExplainResults}
            isExplaining={isExplaining}
            hasExplained={Boolean(explanation)}
          />
        </section>

        {/* AI Explanations & HTML Fixes Station (Section 3: Gemini) */}
        <div ref={explainerRef}>
          <GeminiExplainer
            explanation={explanation}
            isLoading={isExplaining}
            error={explainError}
            onRetry={handleExplainResults}
            onApplyRepairedForm={handleApplyRepairedForm}
          />
        </div>
      </main>

      {/* Playful Footer */}
      <footer className="mt-12 py-6 border-t-2 border-stone-800 bg-[#F4EFE6] text-stone-600 text-xs text-center px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-bold text-stone-800">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5A43]" />
            FlowBreak Playground
            <span className="text-stone-400 font-normal">· Browser-native Constraint Validation</span>
          </div>
          <div className="flex items-center gap-3 text-stone-500">
            <span>HTML5 Forms</span>
            <span>·</span>
            <span>Sandboxed Iframe</span>
            <span>·</span>
            <span>Gemini Explanation Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
